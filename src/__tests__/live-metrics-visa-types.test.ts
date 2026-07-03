import { describe, it, expect } from 'vitest'
import { generateRawProcessingTimeData } from '@/components/dashboard/LiveMetricsSection'
import { VISA_TYPES } from '@/config/visaTypes'

// Locks the Overview tab's "Processing Time by Visa Type" mock to the canonical
// registry (Chris, 3 Jul: "on the first tab the visa types are wrong") — no more
// Business/Tourist/Diplomatic.
describe('LiveMetricsSection — canonical visa taxonomy', () => {
  it('generates processing-time rows for exactly the 6 registry types', () => {
    expect(generateRawProcessingTimeData().map((d) => d.name)).toEqual(VISA_TYPES.map((v) => v.label))
  })
})
