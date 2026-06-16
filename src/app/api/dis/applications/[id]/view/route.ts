/**
 * GET /api/dis/applications/:id/view
 * Composite — the fully assembled DISApplicationView (recommendation +
 * component scores + rule/opa trail + external checks + documents + llm_summary
 * + derived queue_state). Not one of the five V5 §6 granular reads; it's the
 * one server round-trip the reviewer page fetches so Panels 1 & 2 render from a
 * single object (and denial_reasons, sourced from the trail tables, are
 * present). The granular reads remain for Panel 3 / future consumers.
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

    const view = await provider.getApplicationView(id);
    if (!view) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: view });
  } catch (error) {
    console.error('[API] GET /dis/applications/:id/view error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application view' },
      { status: 500 }
    );
  }
}
