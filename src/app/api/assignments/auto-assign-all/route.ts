/**
 * POST /api/assignments/auto-assign-all
 * Automatically assign all unassigned applications to officers based on specialization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDataProvider } from '@/data/providers';
import { suggestOfficerForApplication } from '@/services/assignment/auto-assign';

export interface AutoAssignResult {
  totalProcessed: number;
  assigned: number;
  failed: number;
  byOfficer: Record<string, { name: string; count: number; visaTypes: string[] }>;
  byVisaType: Record<string, { count: number; officer: string }>;
  errors: string[];
}

export async function POST(request: NextRequest) {
  try {
    console.log(`[Auto-Assign] Starting auto-assign-all...`);

    const provider = await getDataProvider();
    console.log(`[Auto-Assign] Provider initialized: ${provider.isInitialized()}`);

    // Get all unassigned applications
    const { data: applications, total } = await provider.getApplications(
      {},
      { page: 1, pageSize: 10000 }
    );
    console.log(`[Auto-Assign] Fetched ${applications.length} applications (total: ${total})`);

    const unassigned = applications.filter(
      app => app.status === 'Pending Assignment' && !app.assignedTo
    );

    console.log(`[Auto-Assign] Processing ${unassigned.length} unassigned applications`);

    // Log first few unassigned apps for debugging
    if (unassigned.length > 0) {
      console.log(`[Auto-Assign] First unassigned app:`, {
        id: unassigned[0].id,
        visaType: unassigned[0].visaType,
        status: unassigned[0].status,
      });
    }

    const result: AutoAssignResult = {
      totalProcessed: unassigned.length,
      assigned: 0,
      failed: 0,
      byOfficer: {},
      byVisaType: {},
      errors: [],
    };

    // Process each application
    for (const app of unassigned) {
      try {
        console.log(`[Auto-Assign] Processing: ${app.id} (${app.visaType})`);

        // Get suggestion for this application
        const suggestion = await suggestOfficerForApplication(app.id, provider);
        const officer = suggestion.suggestedOfficer;

        console.log(`[Auto-Assign] Assigning ${app.id} to ${officer.firstName} ${officer.lastName}`);

        // Assign to suggested officer
        const success = await provider.assignApplication(app.id, officer.id, 'auto');

        if (success) {
          result.assigned++;

          // Track by officer
          const officerName = `${officer.firstName} ${officer.lastName}`;
          if (!result.byOfficer[officer.id]) {
            result.byOfficer[officer.id] = {
              name: officerName,
              count: 0,
              visaTypes: [],
            };
          }
          result.byOfficer[officer.id].count++;

          // Track visa types per officer
          const visaType = app.visaType.split(',')[0].trim();
          if (!result.byOfficer[officer.id].visaTypes.includes(visaType)) {
            result.byOfficer[officer.id].visaTypes.push(visaType);
          }

          // Track by visa type
          if (!result.byVisaType[visaType]) {
            result.byVisaType[visaType] = { count: 0, officer: officerName };
          }
          result.byVisaType[visaType].count++;
        } else {
          result.failed++;
          result.errors.push(`Failed to assign ${app.id}`);
        }
      } catch (err) {
        result.failed++;
        const errorMsg = err instanceof Error ? err.message : 'Unknown';
        console.error(`[Auto-Assign] Failed to process ${app.id}:`, err);
        result.errors.push(`Error processing ${app.id}: ${errorMsg}`);
      }
    }

    console.log(`[Auto-Assign] Complete: ${result.assigned} assigned, ${result.failed} failed`);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API] POST /assignments/auto-assign-all error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to auto-assign applications' },
      { status: 500 }
    );
  }
}
