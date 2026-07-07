import { describe, it, expect } from 'vitest'
import { mapDisAlignedApp, deriveRecommendation } from '@/data/providers/disAlignedAdapter'

const raw = {
  source_application_id: 'HO-SW-2026-00000001',
  source_reference: 'GV-REF-1',
  visa_type: 'skilled-worker',
  // country_code is the UK/destination context in this corpus — must NOT leak into m.country.
  country_code: 'GB',
  submitted_at: '2026-06-16T10:00:00Z',
  anomaly_type: 'clean',
  applicant: { first_name: 'Karan', last_name: 'Nair', nationality_code: 'IN' },
  passport_data: { nationality: 'IN', issuing_country: 'IN' },
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
    // Applicant nationality (IN), not destination country_code (GB).
    expect(m.country).toBe('IN')
    expect(m.status).toBe('Received')
  })

  describe('country source order (applicant nationality, not destination country_code)', () => {
    const base = {
      source_application_id: 'HO-SW-2026-00000002',
      visa_type: 'skilled-worker',
      country_code: 'GB',
      submitted_at: '2026-06-16T10:00:00Z',
      anomaly_type: 'clean',
      applicant: { first_name: 'Test', last_name: 'Case' },
    }

    it('prefers passport_data.nationality when present', () => {
      const m = mapDisAlignedApp({
        ...base,
        applicant: { ...base.applicant, nationality_code: 'ZZ' },
        passport_data: { nationality: 'PK', issuing_country: 'NG' },
      })
      expect(m.country).toBe('PK')
    })

    it('falls back to passport_data.issuing_country when nationality is missing', () => {
      const m = mapDisAlignedApp({
        ...base,
        applicant: { ...base.applicant, nationality_code: 'ZZ' },
        passport_data: { issuing_country: 'NG' },
      })
      expect(m.country).toBe('NG')
    })

    it('falls back to applicant.nationality_code when passport_data is entirely missing', () => {
      const m = mapDisAlignedApp({
        ...base,
        applicant: { ...base.applicant, nationality_code: 'NG' },
      })
      expect(m.country).toBe('NG')
    })

    it('falls back to "Unknown" when no nationality source is present', () => {
      const m = mapDisAlignedApp({ ...base })
      expect(m.country).toBe('Unknown')
    })

    it('never returns the destination country_code', () => {
      const m = mapDisAlignedApp({
        ...base,
        applicant: { ...base.applicant, nationality_code: 'NG' },
      })
      expect(m.country).not.toBe('GB')
    })

    // DIS data-contract canon is ISO 3166-1 alpha-3 (passport-MRZ style); the demo
    // corpus currently ships alpha-2 in these JSON fields. The adapter is a pure
    // pass-through either way — pin that alpha-3 values survive unconverted.
    it('passes ISO 3166-1 alpha-3 codes through unconverted (no alpha-3→alpha-2 mapping)', () => {
      const m = mapDisAlignedApp({
        ...base,
        country_code: 'GBR',
        applicant: { ...base.applicant, nationality_code: 'IND' },
        passport_data: { nationality: 'IND', issuing_country: 'IND' },
      })
      expect(m.country).toBe('IND')
    })
  })
})
