import axios from 'axios';

class ZohoCRMClient {
  constructor() {
    // Configure datacenter (defaults to com.au for Australia)
    const datacenter = process.env.ZOHO_DATACENTER || 'com.au';
    this.baseURL = `https://www.zohoapis.${datacenter}/crm/v7`;
    this.accessToken = null;
    this.tokenExpiry = null;
    this.tokenCacheDuration = 50 * 60 * 1000; // 50 minutes cache
    
    console.log(`🌍 Zoho CRM configured: ${this.baseURL} (datacenter: ${datacenter})`);
  }

  async getAccessToken(forceRefresh = false) {
    try {
      // Return cached token if still valid
      if (!forceRefresh && this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        console.log('🔑 Using cached Zoho access token');
        return this.accessToken;
      }

      // Get token URL from environment
      const tokenUrl = process.env.ACCESSTOKEN_URL || process.env.ZOHO_ACCESS_TOKEN_URL;
      if (!tokenUrl) {
        console.warn('⚠️ ACCESSTOKEN_URL not set - Zoho CRM features will be disabled');
        return null; // Don't throw - allow app to continue
      }

      console.log('🔑 Fetching fresh Zoho access token from:', tokenUrl);
      const response = await axios.get(tokenUrl, {
        timeout: 30000, // 30 second timeout
        validateStatus: (status) => status < 500, // Don't throw on 4xx/5xx
      });
      
      // Handle different response formats
      let token = null;
      
      if (response.data.access_token) {
        token = response.data.access_token;
      } else if (response.data.details?.output) {
        token = response.data.details.output;
      } else if (response.data.output) {
        token = response.data.output;
      } else if (typeof response.data === 'string') {
        token = response.data;
      }
      
      // Strip "Zoho-oauthtoken" prefix if present
      if (token && typeof token === 'string') {
        token = token.replace(/^Zoho-oauthtoken\s+/, '');
      }
      
      if (!token) {
        throw new Error('Access token not found in response');
      }
      
      // Cache token
      this.accessToken = token;
      this.tokenExpiry = Date.now() + this.tokenCacheDuration;
      console.log('✅ Zoho access token cached until:', new Date(this.tokenExpiry).toISOString());
      
      return this.accessToken;
    } catch (error) {
      console.error('⚠️ Failed to get Zoho access token:', error.message);
      // Return null instead of throwing to prevent app breaking
      return null;
    }
  }

  async makeRequest(method, endpoint, data = null, params = null, retryCount = 0) {
    const token = await this.getAccessToken();
    
    // If token is null, return empty result instead of making request
    if (!token) {
      console.warn('⚠️ No Zoho access token available - skipping API request');
      return { data: [] };
    }
    
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
    };

    if (params) {
      config.params = params;
    }

    if (data && (method === 'post' || method === 'put')) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      // Retry once with fresh token if we get 401 Unauthorized
      if (error.response?.status === 401 && retryCount === 0) {
        console.log('⚠️ Got 401 from Zoho, refreshing token and retrying...');
        const freshToken = await this.getAccessToken(true); // Force refresh
        if (!freshToken) {
          throw error;
        }
        config.headers.Authorization = `Zoho-oauthtoken ${freshToken}`;
        
        try {
          const retryResponse = await axios(config);
          return retryResponse.data;
        } catch (retryError) {
          console.error('Zoho API Error after retry:', retryError.response?.data || retryError.message);
          throw retryError;
        }
      }
      
      // Extract and log detailed error information
      const zohoError = error.response?.data;
      const statusCode = error.response?.status;
      
      console.error('Zoho API Error:', {
        status: statusCode,
        code: zohoError?.code,
        message: zohoError?.message || error.message,
        details: zohoError?.details || zohoError,
      });
      
      // Create enhanced error
      if (zohoError) {
        const errorMessage = zohoError.message || `Zoho API error: ${zohoError.code || statusCode}`;
        const enhancedError = new Error(errorMessage);
        enhancedError.code = zohoError.code;
        enhancedError.status = statusCode;
        enhancedError.details = zohoError.details || zohoError;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  async getRecord(moduleName, recordId) {
    try {
      const response = await this.makeRequest('get', `/${moduleName}/${recordId}`);
      
      // v7 API returns { data: [{...}] } - get first element
      const record = response.data?.[0] || null;
      
      if (!record) {
        console.warn(`⚠️ No record found for ${moduleName}/${recordId}`);
      }
      
      return record;
    } catch (error) {
      console.error(`Error fetching ${moduleName} record ${recordId}:`, error.message);
      return null; // Return null instead of throwing
    }
  }

  async getDeal(dealId) {
    return this.getRecord('Deals', dealId);
  }

  async updateRecord(moduleName, recordId, updateData) {
    try {
      const response = await this.makeRequest('put', `/${moduleName}`, {
        data: [{
          id: recordId,
          ...updateData,
        }],
      });
      
      // v7 API returns { data: [{...}] } - get first element
      return response.data?.[0] || null;
    } catch (error) {
      console.error(`Error updating ${moduleName} record ${recordId}:`, error.message);
      throw error;
    }
  }

  async updateDeal(dealId, updateData) {
    return this.updateRecord('Deals', dealId, updateData);
  }
}

export { ZohoCRMClient };
export default new ZohoCRMClient();

