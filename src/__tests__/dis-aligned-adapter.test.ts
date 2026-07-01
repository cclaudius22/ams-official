import { describe, it, expect } from 'vitest'
import { mapDisAlignedApp, deriveRecommendation } from '@/data/providers/disAlignedAdapter'

const raw = {
  source_application_id: 'HO-SW-2026-00000001',
  source_reference: 'GV-REF-1',
  visa_type: 'skilled-worker',
  country_code: 'IN',
  submitted_at: '2026-06-16T10:00:00Z',
  anomaly_type: 'clean',
  applicant: { first_name: 'Karan', last_name: 'Nair' },
}

describe('disAlignedAdapter', () => {
  it('derives recommendation from anomaly_type (explicit field wins)', () => {
    expect(deriveRecommendation({ anomaly_type: 'clean' })).toBe('RECOMMEND_APPROVE')
    expect(deriveRecommendation({ anomaly_type: 'fail_rules' })).toBe('RECOMMEND_REJECT')
    expect(deriveRecommendation({ anomaly_type: 'suspicious' })).toBe('MANUAL_REVIEW')
    expect(deriveRecommendation({ anomaly_type: 'edge_case' })).toBe('MANUAL_REVIEW')
    expect(deriveRecommendation({ anomaly_type: 'clean', recommendation: 'MANUAL_REVIEW' })).toBe('MANUAL_REVIEW')
  })

  it('maps DIS-aligned app → queue shape (canonical visa, Received, demo fields)', () => {
    const m = mapDisAlignedApp(raw)
    expect(m.id).toBe('HO-SW-2026-00000001')
    expect(m.applicantName).toBe('Karan Nair')
    expect(m.visaType).toBe('Skilled Worker')
    expect(m.visaTypeId).toBe('skilled_worker_visa')
    expect(m.recommendation).toBe('RECOMMEND_APPROVE')
    expect(m.anomalyType).toBe('clean')
    expect(m.sourceReference).toBe('GV-REF-1')
    expect(m.country).toBe('IN')
    expect(m.status).toBe('Received')
  })
})
