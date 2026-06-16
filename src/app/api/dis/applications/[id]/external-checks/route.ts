/**
 * GET /api/dis/applications/:id/external-checks
 * V5 §6 endpoint 5 — the external API check rows (7 types incl.
 * SPONSOR_VERIFICATION), with response_payload for Panel 3 evidence cards.
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

    const checks = await provider.getExternalChecks(id);
    if (!checks) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: checks });
  } catch (error) {
    console.error('[API] GET /dis/applications/:id/external-checks error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch external checks' },
      { status: 500 }
    );
  }
}
