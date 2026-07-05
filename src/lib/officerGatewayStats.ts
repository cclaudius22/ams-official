/**
 * Officer gateway (Task 6) — SLA-position derivation for the "SLA position"
 * doorway tile on /dashboard/reviewer.
 *
 * Replaces the fake `slaWarningsCount`/"SLA Breach Alert" hero: instead of a
 * hardcoded number, this derives an honest summary from the officer's REAL
 * assigned cases (the same list already fetched for the "My Queue" tile),
 * reusing the existing `slaDaysRemaining`/`SLA_WORKING_DAYS` helpers from
 * src/lib/officerQueue.ts (read-only import — that file is not modified).
 *
 * Pure + unit-tested (src/__tests__/officer-gateway-stats.test.ts). No fs, no
 * Date.now(): callers pass `now` so the derivation is deterministic.
 */
import { slaDaysRemaining, SLA_WORKING_DAYS } from '@/lib/officerQueue'

/** Cases with a deadline inside this many working days (but not yet overdue) are "due soon". */
export const SLA_DUE_SOON_DAYS = 5

export interface SlaPosition {
  /** Days remaining on the NEAREST deadline across all dated cases (may be <= 0 if overdue). */
  nearestDays: number
  /** Cases at or past their SLA deadline (days remaining <= 0). */
  overdueCount: number
  /** Cases due within SLA_DUE_SOON_DAYS working days but not yet overdue. */
  dueSoonCount: number
  /** How many of the input cases had a usable submittedAt (the rest are ignored, not fabricated). */
  totalWithDates: number
}

/**
 * Derive the officer's SLA position from a list of case `submittedAt` values.
 * Cases without a usable date are silently excluded (never fabricated).
 * Returns `null` when no case yields a derivable date — an honest "no data"
 * signal rather than a misleading zero.
 */
export function deriveSlaPosition(
  submittedDates: ReadonlyArray<string | undefined>,
  now: Date,
  slaDays: number = SLA_WORKING_DAYS
): SlaPosition | null {
  const daysRemaining = submittedDates
    .map((submittedAt) => slaDaysRemaining(submittedAt, now, slaDays))
    .filter((d): d is number => d !== null)

  if (daysRemaining.length === 0) return null

  const nearestDays = Math.min(...daysRemaining)
  const overdueCount = daysRemaining.filter((d) => d <= 0).length
  const dueSoonCount = daysRemaining.filter((d) => d > 0 && d <= SLA_DUE_SOON_DAYS).length

  return { nearestDays, overdueCount, dueSoonCount, totalWithDates: daysRemaining.length }
}

/** Big-number headline for the SLA tile. Leads with the overdue count (not a negative day
 *  count) whenever anything is overdue — "-5 working days" reads as nonsense to an officer. */
export function slaPositionHeadline(position: SlaPosition | null): string {
  if (!position) return 'No SLA data'
  if (position.nearestDays <= 0) {
    return position.overdueCount === 1 ? '1 case overdue' : `${position.overdueCount} cases overdue`
  }
  return `${position.nearestDays} working day${position.nearestDays === 1 ? '' : 's'}`
}

/** Small supporting caption under the SLA tile headline. */
export function slaPositionSubtext(position: SlaPosition | null): string {
  if (!position) return 'No assigned cases with a submission date'
  if (position.nearestDays <= 0) return 'to the nearest SLA deadline'
  if (position.dueSoonCount > 0) {
    return `to nearest deadline · ${position.dueSoonCount} case${position.dueSoonCount === 1 ? '' : 's'} due within ${SLA_DUE_SOON_DAYS} days`
  }
  return 'to the nearest SLA deadline'
}
