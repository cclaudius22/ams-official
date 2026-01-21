/**
 * GET /api/applications
 * Fetch paginated list of applications with optional filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataProvider } from '@/data/providers';
import type { ApplicationFilters, ApplicationStatus } from '@/api-contracts/applications';

export async function GET(request: NextRequest) {
  try {
    const provider = await getDataProvider();
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query params
    const filters: ApplicationFilters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.getAll('status') as ApplicationStatus[],
      visaType: searchParams.getAll('visaType'),
      country: searchParams.getAll('country'),
      assignedTo: searchParams.getAll('assignedTo'),
    };

    // Remove empty arrays
    if (filters.status?.length === 0) delete filters.status;
    if (filters.visaType?.length === 0) delete filters.visaType;
    if (filters.country?.length === 0) delete filters.country;
    if (filters.assignedTo?.length === 0) delete filters.assignedTo;

    const pagination = {
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('pageSize') || '10', 10),
    };

    const result = await provider.getApplications(filters, pagination);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('[API] GET /applications error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
