/**
 * POST /api/assignments/reset
 * Reset all assignments (for demo purposes only)
 */

import { NextResponse } from 'next/server';
import { getDataProvider, resetProvider } from '@/data/providers';

export async function POST() {
  try {
    // Reset the provider to clear all in-memory assignments
    resetProvider();

    // Re-initialize to reload fresh data
    const provider = await getDataProvider();

    // Get count of applications
    const { total } = await provider.getApplications({}, { page: 1, pageSize: 1 });

    return NextResponse.json({
      success: true,
      data: {
        message: 'All assignments have been reset',
        applicationsReset: total,
      },
    });
  } catch (error) {
    console.error('[API] POST /assignments/reset error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset assignments' },
      { status: 500 }
    );
  }
}
