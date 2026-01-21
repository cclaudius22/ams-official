/**
 * GET /api/applications/:id - Get application detail
 * PATCH /api/applications/:id - Update application status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataProvider } from '@/data/providers';
import type { ApplicationStatus } from '@/api-contracts/applications';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const provider = await getDataProvider();

    const application = await provider.getApplicationById(id);

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Also get the scan result
    const scanResult = await provider.getScanResult(id);

    return NextResponse.json({
      success: true,
      data: {
        ...application,
        scanResult,
      },
    });
  } catch (error) {
    console.error('[API] GET /applications/:id error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const provider = await getDataProvider();
    const body = await request.json();

    if (body.status) {
      const updated = await provider.updateApplicationStatus(
        id,
        body.status as ApplicationStatus
      );

      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: { updated: true },
    });
  } catch (error) {
    console.error('[API] PATCH /applications/:id error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
