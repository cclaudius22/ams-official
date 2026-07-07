/**
 * Capacity what-if maths for the Predictions tab. Pure functions over the SHARED
 * officer cap (docs/devdocs/officer-capacity-model.md) so the slider, the allocator
 * and the queue banners all tell one story. Spec: capacity-projection.test.ts.
 */
import { OFFICER_DAILY_DECISION_CAP } from '@/lib/officerQueue'

/** UK working days per year — the national-scale denominator (1M/yr ÷ 250 ÷ cap). */
export const WORKING_DAYS_PER_YEAR = 250

/** Longest trajectory we chart — beyond this the verdict tile carries the message. */
const MAX_PROJECTION_DAYS = 30

export function dailyDecisionCapacity(officers: number, capPerOfficer = OFFICER_DAILY_DECISION_CAP): number {
  return Math.max(0, officers) * capPerOfficer
}

export function daysToClear(backlog: number, officers: number, capPerOfficer = OFFICER_DAILY_DECISION_CAP): number {
  if (backlog <= 0) return 0
  const capacity = dailyDecisionCapacity(officers, capPerOfficer)
  if (capacity <= 0) return Infinity
  return Math.ceil(backlog / capacity)
}

/** Day-by-day backlog walk to zero, bounded at MAX_PROJECTION_DAYS for charting. */
export function clearanceTrajectory(
  backlog: number,
  officers: number,
  capPerOfficer = OFFICER_DAILY_DECISION_CAP,
): Array<{ day: number; backlog: number }> {
  const capacity = dailyDecisionCapacity(officers, capPerOfficer)
  const points = [{ day: 0, backlog: Math.max(0, backlog) }]
  let remaining = Math.max(0, backlog)
  for (let day = 1; day <= MAX_PROJECTION_DAYS && remaining > 0; day++) {
    remaining = Math.max(0, remaining - capacity)
    points.push({ day, backlog: remaining })
    if (capacity <= 0) break // can't clear — one flat step is enough to draw
  }
  return points
}

export function annualDecisionCapacity(
  officers: number,
  workingDays = WORKING_DAYS_PER_YEAR,
  capPerOfficer = OFFICER_DAILY_DECISION_CAP,
): number {
  return dailyDecisionCapacity(officers, capPerOfficer) * workingDays
}
