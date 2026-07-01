/**
 * GET /api/dis/applications/:id
 * V5 §6 endpoint 2 — the recommendation detail (recommendation + component
 * scores + derived queue_state + lifecycle ids). The :id is the AMS-facing
 * source_application_id, not the DIS UUID. The full composite (with trail,
 * documents, checks) is the sibling /view route.
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

    // Project the recommendation core (DISRecommendationCore) — the granular E2
    // read is intentionally narrower than the /view composite.
    const {
      recommendation,
      component_scores,
      source_channel,
      queue_state,
      source_application_id,
      source_reference,
      dis_application_id,
      submitted_at,
    } = view;

    return NextResponse.json({
      success: true,
      data: {
        recommendation,
        component_scores,
        source_channel,
        queue_state,
        source_application_id,
        source_reference,
        dis_application_id,
        submitted_at,
      },
    });
  } catch (error) {
    console.error('[API] GET /dis/applications/:id error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendation' },
      { status: 500 }
    );
  }
}
