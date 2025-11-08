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

export async function PUT(request) {
  try {
    const body = await request.json();
    const { deal_id, documents_json } = body;

    if (!deal_id) {
      return NextResponse.json(
        { success: false, error: 'deal_id is required' },
        { status: 400 }
      );
    }

    if (documents_json === undefined) {
      return NextResponse.json(
        { success: false, error: 'documents_json is required' },
        { status: 400 }
      );
    }

    const zohoClient = new ZohoCRMClient();
    const updatedDeal = await zohoClient.updateDeal(deal_id, {
      documents_json: documents_json,
    });

    if (!updatedDeal) {
      return NextResponse.json(
        { success: false, error: 'Failed to update deal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deal: updatedDeal,
    });
  } catch (error) {
    console.error('Error updating deal in Zoho CRM:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update deal in Zoho CRM' 
      },
      { status: 500 }
    );
  }
}

