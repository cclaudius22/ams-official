/**
 * POST /api/assignments
 * Bulk assign applications to an officer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataProvider } from '@/data/providers';

export async function POST(request: NextRequest) {
  try {
    const provider = await getDataProvider();
    const body = await request.json();

    const { applicationIds, officerId } = body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'applicationIds array is required' },
        { status: 400 }
      );
    }

    if (!officerId) {
      return NextResponse.json(
        { success: false, error: 'officerId is required' },
        { status: 400 }
      );
    }

    const result = await provider.bulkAssign(applicationIds, officerId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API] POST /assignments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign applications' },
      { status: 500 }
    );
  }
}
