/**
 * GET /api/assignments/suggest
 * Get officer suggestion for an application based on specialization and workload
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataProvider } from '@/data/providers';
import { suggestOfficerForApplication } from '@/services/assignment/auto-assign';

export async function GET(request: NextRequest) {
  try {
    const provider = await getDataProvider();
    const searchParams = request.nextUrl.searchParams;

    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'applicationId is required' },
        { status: 400 }
      );
    }

    const suggestion = await suggestOfficerForApplication(applicationId, provider);

    return NextResponse.json({
      success: true,
      data: suggestion,
    });
  } catch (error) {
    console.error('[API] GET /assignments/suggest error:', error);

    const message = error instanceof Error ? error.message : 'Failed to suggest officer';

    return NextResponse.json(
      { success: false, error: message },
      { status: error instanceof Error && error.message === 'Application not found' ? 404 : 500 }
    );
  }
}
