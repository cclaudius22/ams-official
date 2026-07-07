import { describe, it, expect } from 'vitest'
import { workloadColor } from '@/components/dashboard/LiveQueueMetrics'
import { OFFICER_DAILY_DECISION_CAP } from '@/lib/officerQueue'
import { SEMANTIC_COLORS } from '@/components/charts'

// Locks the Officer-Workload chart to the daily-capacity model (docs/devdocs/officer-capacity-model.md):
// bands must scale off OFFICER_DAILY_DECISION_CAP (~25/day), not the legacy >100/>200 mock-era
// thresholds — at cap 25 those rendered every maxed-out officer green ("plenty of headroom").
describe('workloadColor — Officer Workload capacity bands', () => {
  it('exposes the shared daily decision cap the allocator uses', () => {
    expect(OFFICER_DAILY_DECISION_CAP).toBe(25)
  })

  it('reads "at capacity" (>= cap) as negative', () => {
    expect(workloadColor(OFFICER_DAILY_DECISION_CAP)).toBe(SEMANTIC_COLORS.negative)
    expect(workloadColor(OFFICER_DAILY_DECISION_CAP + 5)).toBe(SEMANTIC_COLORS.negative)
  })

  it('reads "approaching capacity" (>= 80% of cap) as warning', () => {
    expect(workloadColor(Math.ceil(OFFICER_DAILY_DECISION_CAP * 0.8))).toBe(SEMANTIC_COLORS.warning)
    expect(workloadColor(OFFICER_DAILY_DECISION_CAP - 1)).toBe(SEMANTIC_COLORS.warning)
  })

  it('reads headroom (< 80% of cap) as positive', () => {
    expect(workloadColor(0)).toBe(SEMANTIC_COLORS.positive)
    expect(workloadColor(Math.ceil(OFFICER_DAILY_DECISION_CAP * 0.8) - 1)).toBe(SEMANTIC_COLORS.positive)
  })

  it('treats non-finite input as headroom, not a crash', () => {
    expect(workloadColor(Number.NaN)).toBe(SEMANTIC_COLORS.positive)
  })
})
