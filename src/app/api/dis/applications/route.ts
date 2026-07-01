/**
 * GET /api/dis/applications
 * V5 §6 endpoint 1 — the officer queue list. Filters on the DERIVED queue_state
 * (never raw applications.status, per V5 §4) and visa_type; paginated.
 * Data source flips via DIS_DATA_PROVIDER (mock | replica | later deloitte).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDISProvider } from '@/data/dis-providers';
import type { DISQueueFilters } from '@/data/dis-providers';
import type { QueueState, VisaType } from '@/api-contracts/dis';

export async function GET(request: NextRequest) {
  try {
    const provider = await getDISProvider();
    const searchParams = request.nextUrl.searchParams;

    const filters: DISQueueFilters = {};
    const queueState = searchParams.get('queue_state');
    if (queueState) filters.queue_state = queueState as QueueState;
    const visaType = searchParams.get('visa_type');
    if (visaType) filters.visa_type = visaType as VisaType;

    const pagination = {
      page: parseInt(searchParams.get('page') || '1', 10),
      pageSize: parseInt(searchParams.get('page_size') || '20', 10),
    };

    const result = await provider.getApplications(filters, pagination);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[API] GET /dis/applications error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch DIS applications' },
      { status: 500 }
    );
  }
}
