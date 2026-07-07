import { describe, it, expect } from 'vitest'
import {
  dailyDecisionCapacity,
  daysToClear,
  clearanceTrajectory,
  annualDecisionCapacity,
} from '@/lib/capacityProjection'
import { OFFICER_DAILY_DECISION_CAP } from '@/lib/officerQueue'

// The Predictions what-if slider must compute from the SAME cap the allocator uses —
// the whole point of hoisting OFFICER_DAILY_DECISION_CAP is that the demo numbers
// (152/848, ~7 days, 25/day) and the projection maths can't drift apart.
describe('capacityProjection — what-if maths on the shared cap', () => {
  it('daily capacity = officers × the shared cap', () => {
    expect(dailyDecisionCapacity(8)).toBe(8 * OFFICER_DAILY_DECISION_CAP) // 200/day demo pod
    expect(dailyDecisionCapacity(1)).toBe(OFFICER_DAILY_DECISION_CAP)
  })

  it('clears the demo backlog of 848 in 5 working days with the 8-officer pod', () => {
    expect(daysToClear(848, 8)).toBe(5)
    expect(daysToClear(0, 8)).toBe(0)
  })

  it('zero officers never clears — Infinity, and the trajectory stays bounded', () => {
    expect(daysToClear(848, 0)).toBe(Infinity)
    const t = clearanceTrajectory(848, 0)
    expect(t.length).toBeLessThanOrEqual(31) // bounded for charting even when it can't clear
  })

  it('trajectory walks the backlog to exactly zero, day by day', () => {
    const t = clearanceTrajectory(848, 8)
    expect(t[0]).toEqual({ day: 0, backlog: 848 })
    expect(t[t.length - 1].backlog).toBe(0)
    expect(t[t.length - 1].day).toBe(5)
    // strictly decreasing until zero
    for (let i = 1; i < t.length; i++) expect(t[i].backlog).toBeLessThan(t[i - 1].backlog)
  })

  it('annual capacity scales to the national story (160 officers ≈ 1M decisions/year)', () => {
    expect(annualDecisionCapacity(160)).toBe(1_000_000) // 160 × 25 × 250 working days
  })
})
