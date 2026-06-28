import { describe, it, expect } from 'vitest'
import { toVisaKey } from '@/components/dashboard/LiveQueueMetrics'

// Locks gate finding #7: the "Applications by Visa Type" chart must resolve every type to a
// canonical registry key (so colour/label come from the registry and can't drift to gray/unknown).
describe('toVisaKey — LiveQueueMetrics visa-type resolution', () => {
  it('prefers the canonical visaTypeId when present', () => {
    expect(toVisaKey('skilled_worker_visa', 'literally anything')).toBe('skilled_worker_visa')
  })

  it('maps the display-label form of all 6 canonical types through the registry', () => {
    expect(toVisaKey(undefined, 'Skilled Worker Visa')).toBe('skilled_worker_visa')
    expect(toVisaKey(undefined, 'Student Visa')).toBe('student_visa')
    expect(toVisaKey(undefined, 'Senior Specialist Worker Visa')).toBe('senior_specialist_worker_visa')
    expect(toVisaKey(undefined, 'Spouse/Partner Visa')).toBe('spouse_partner_visa')
    expect(toVisaKey(undefined, 'Global Talent Visa')).toBe('global_talent_visa')
    expect(toVisaKey(undefined, 'Innovator Founder Visa')).toBe('innovator_founder_visa')
  })

  it('handles wire vocab and falls back to "unknown" for the genuinely unrecognised', () => {
    expect(toVisaKey(undefined, 'skilled-worker')).toBe('skilled_worker_visa')
    expect(toVisaKey(undefined, 'Tourist Visa')).toBe('unknown')
  })
})
