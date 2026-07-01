/**
 * GET /api/dis/applications/:id/trail
 * V5 §6 endpoint 3 — Glass Box trail. Reads the opa_evaluations /
 * drools_evaluations TABLES (not the recommendation callback blob), so
 * opa_results carry denial_reasons — which Panel 2 renders and the callback
 * omits.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDISProvider } from '@/data/dis-providers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const provider = await getDISProvider();

    const trail = await provider.getTrail(id);
    if (!trail) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: trail });
  } catch (error) {
    console.error('[API] GET /dis/applications/:id/trail error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rule trail' },
      { status: 500 }
    );
  }
}
