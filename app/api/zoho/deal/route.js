import { NextResponse } from 'next/server';
import { ZohoCRMClient } from '../../../../lib/zohoClient';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('deal_id');

    if (!dealId) {
      return NextResponse.json(
        { success: false, error: 'deal_id parameter is required' },
        { status: 400 }
      );
    }

    const zohoClient = new ZohoCRMClient();
    const deal = await zohoClient.getDeal(dealId);

    if (!deal) {
      return NextResponse.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deal: deal,
    });
  } catch (error) {
    console.error('Error fetching deal from Zoho CRM:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch deal from Zoho CRM' 
      },
      { status: 500 }
    );
  }
}

