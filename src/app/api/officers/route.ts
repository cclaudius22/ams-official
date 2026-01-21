/**
 * GET /api/officers
 * Fetch list of officers with their specializations and workload
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataProvider } from '@/data/providers';

export async function GET(request: NextRequest) {
  try {
    const provider = await getDataProvider();
    const searchParams = request.nextUrl.searchParams;

    // Optional filter by visa type specialization
    const visaType = searchParams.get('visaType');

    let officers;
    if (visaType) {
      officers = await provider.getOfficersBySpecialization(visaType);
    } else {
      officers = await provider.getOfficers();
    }

    return NextResponse.json({
      success: true,
      data: officers,
    });
  } catch (error) {
    console.error('[API] GET /officers error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch officers' },
      { status: 500 }
    );
  }
}
