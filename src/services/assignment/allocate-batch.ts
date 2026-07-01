/**
 * Capacity-aware batch allocator — distributes a batch of applications to
 * officers by specialization while respecting a per-officer capacity cap.
 *
 * GUARDRAIL: the cap bounds TOTAL load, counting existing work —
 * `officer.activeApplications + newAssignments <= cap`. Load is seeded from
 * `activeApplications` and recomputed as the batch fills (least-loaded-eligible),
 * so no officer is overloaded (this is what kills the "463 on one officer" bug).
 * Pure + unit-tested. See docs/specs/2026-06-24-multi-visa-queue-allocation-design.md §6.2.
 */
import type { ConsulateOfficial } from '@/api-contracts/users'

export interface AllocatableApp {
  id: string
  visaTypeKey: string // canonical visa key (registry)
}

export interface AllocationConfig {
  capPerOfficer: number
}

export interface AllocationResult {
  assignments: { appId: string; officerId: string | null; reason: string }[]
  /** Keyed by officer id. `count` = newly assigned this batch; `load` = total (activeApplications + new). */
  byOfficer: Record<string, { count: number; load: number; capacity: number }>
  unallocated: string[]
}

export function allocateBatch(
  apps: AllocatableApp[],
  officers: ConsulateOfficial[],
  config: AllocationConfig
): AllocationResult {
  const cap = config.capPerOfficer
  const active = officers.filter((o) => o.isActive)
  const load = new Map<string, number>(active.map((o) => [o.id, o.activeApplications ?? 0])) // seed from CURRENT load
  const fresh = new Map<string, number>(active.map((o) => [o.id, 0]))
  const result: AllocationResult = { assignments: [], byOfficer: {}, unallocated: [] }

  for (const app of apps) {
    const eligible = active
      .filter((o) => (o.specializations ?? []).includes(app.visaTypeKey) && load.get(o.id)! < cap)
      .sort((a, b) => load.get(a.id)! - load.get(b.id)! || (b.slaCompliance ?? 0) - (a.slaCompliance ?? 0))

    const chosen = eligible[0]
    if (!chosen) {
      result.unallocated.push(app.id)
      result.assignments.push({ appId: app.id, officerId: null, reason: 'No specialist under capacity — queued' })
      continue
    }

    load.set(chosen.id, load.get(chosen.id)! + 1)
    fresh.set(chosen.id, fresh.get(chosen.id)! + 1)
    result.byOfficer[chosen.id] = { count: fresh.get(chosen.id)!, load: load.get(chosen.id)!, capacity: cap }
    result.assignments.push({
      appId: app.id,
      officerId: chosen.id,
      reason: `Specialist in ${app.visaTypeKey}; load ${load.get(chosen.id)}/${cap}`,
    })
  }

  return result
}
