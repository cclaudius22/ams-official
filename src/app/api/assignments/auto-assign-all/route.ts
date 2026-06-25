/**
 * POST /api/assignments/auto-assign-all
 *
 * Capacity-aware allocation of the DECISION workload. Operates ONLY on
 * `Processed` + unassigned apps (apps must be processed first via
 * /api/assignments/process-intake). Uses the pure `allocateBatch` allocator so
 * the cap counts each officer's current load (activeApplications + new <= cap)
 * — no officer is overloaded. Returns assigned + the visible backlog
 * (unallocated) + per-officer load/cap so the board can show capacity.
 * See docs/specs/2026-06-24-multi-visa-queue-allocation-design.md §6.2.
 */
import { NextResponse } from 'next/server'
import { getDataProvider } from '@/data/providers'
import { allocateBatch, type AllocatableApp } from '@/services/assignment/allocate-batch'
import { normalizeVisaType } from '@/config/visaTypes'

const CAP_PER_OFFICER = 30

export interface AutoAssignResult {
  assigned: number
  unallocated: number
  capPerOfficer: number
  byOfficer: Record<string, { name: string; count: number; load: number; capacity: number }>
}

export async function POST() {
  try {
    const provider = await getDataProvider()
    const { data: apps } = await provider.getApplications({}, { page: 1, pageSize: 100000 })
    const officers = await provider.getOfficers()

    // GUARDRAIL: assign only Processed + unassigned apps.
    const pending = apps.filter((a) => a.status === 'Processed' && !a.assignedTo)
    const allocatable: AllocatableApp[] = pending.map((a) => ({
      id: a.id,
      visaTypeKey: a.visaTypeId ?? normalizeVisaType(a.visaType) ?? 'unknown',
    }))

    const result = allocateBatch(allocatable, officers, { capPerOfficer: CAP_PER_OFFICER })

    // Persist the assignments.
    for (const assignment of result.assignments) {
      if (assignment.officerId) {
        await provider.assignApplication(assignment.appId, assignment.officerId, 'auto')
      }
    }

    // Enrich the per-officer breakdown with names for the board.
    const byOfficer: AutoAssignResult['byOfficer'] = {}
    for (const [id, info] of Object.entries(result.byOfficer)) {
      const officer = officers.find((o) => o.id === id)
      byOfficer[id] = { name: officer ? `${officer.firstName} ${officer.lastName}` : id, ...info }
    }

    const data: AutoAssignResult = {
      assigned: result.assignments.filter((a) => a.officerId).length,
      unallocated: result.unallocated.length,
      capPerOfficer: CAP_PER_OFFICER,
      byOfficer,
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[API] POST /assignments/auto-assign-all error:', error)
    return NextResponse.json({ success: false, error: 'Failed to auto-assign applications' }, { status: 500 })
  }
}
