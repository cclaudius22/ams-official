import { describe, it, expect } from 'vitest'
import { simulateProcessingMetrics } from '@/hooks/useProcessingMetrics'
import { VISA_TYPES } from '@/config/visaTypes'

// Locks the Processing Metrics tab to the DIS domain (Chris, 3 Jul): canonical visa
// taxonomy from the registry, decision-lane framing (two clocks, 85/15 triage,
// effort-by-outcome), real external-check vocabulary. All still mock data — the
// real-data wiring is the separate deferred track.
describe('simulateProcessingMetrics — DIS-domain mock', () => {
  const m = simulateProcessingMetrics()

  it('SLA by visa type uses exactly the 6 canonical registry labels', () => {
    expect(m.slaByVisaType.map((d) => d.name)).toEqual(VISA_TYPES.map((v) => v.label))
  })

  it('decision effort by outcome reflects the capacity model (approve < reject < manual+RFI)', () => {
    expect(m.decisionEffortByOutcome.map((d) => d.name)).toEqual(['Clear approve', 'Clear reject', 'Manual + RFI'])
    const [a, r, man] = m.decisionEffortByOutcome.map((d) => d.avgMinutes)
    expect(a).toBeLessThan(r)
    expect(r).toBeLessThan(man)
  })

  it('external checks cover the 7 real DIS checks with first-pass clear rates', () => {
    expect(m.externalChecksClearRate).toHaveLength(7)
    const names = m.externalChecksClearRate.map((d) => d.name)
    expect(names).toContain('Certificate of Sponsorship')
    expect(names).toContain('PNC (criminal record)')
    for (const d of m.externalChecksClearRate) {
      expect(d.value).toBeGreaterThanOrEqual(0)
      expect(d.value).toBeLessThanOrEqual(100)
    }
  })

  it('triage split is clear-vs-manual and sums to 100 with clear >= 80 (the ~85/15 claim)', () => {
    expect(m.triageSplit.map((d) => d.name)).toEqual(['Clear recommendation', 'Manual review'])
    expect(m.triageSplit[0].value + m.triageSplit[1].value).toBe(100)
    expect(m.triageSplit[0].value).toBeGreaterThanOrEqual(80)
  })

  it('SLA-miss reasons and queue/active stages speak the decision-lane vocabulary', () => {
    expect(m.slaMissReasons.map((d) => d.name)).toEqual(['Officer capacity', 'Complex case', 'RFI round-trip', 'Escalation'])
    expect(m.queueVsActiveTime.map((d) => d.name)).toEqual(['Machine pipeline', 'Awaiting allocation', 'Officer review', 'RFI round-trip'])
  })

  it('keeps Top Escalation Reasons untouched (Chris, 3 Jul)', () => {
    expect(m.escalationReasons.map((d) => d.name)).toEqual(['Complex Nationality', 'Sanctions Hit', 'Missing Docs', 'Fraud Flags', 'Policy Edge Case'])
  })
})
