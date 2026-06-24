import { describe, it, expect } from 'vitest'
import { normalizeVisaType, visaTypeLabel, visaTypePhase, VISA_TYPES } from '@/config/visaTypes'

describe('visaTypes registry', () => {
  it('normalizes all 6 wire vocabs to canonical keys', () => {
    expect(normalizeVisaType('skilled-worker')).toBe('skilled_worker_visa')
    expect(normalizeVisaType('student')).toBe('student_visa')
    expect(normalizeVisaType('senior-specialist-worker')).toBe('senior_specialist_worker_visa')
    expect(normalizeVisaType('spouse-partner')).toBe('spouse_partner_visa')
    expect(normalizeVisaType('global-talent')).toBe('global_talent_visa')
    expect(normalizeVisaType('innovator-founder')).toBe('innovator_founder_visa')
  })
  it('is hyphen/underscore/case-insensitive and identity-stable', () => {
    expect(normalizeVisaType('SKILLED_WORKER')).toBe('skilled_worker_visa')
    expect(normalizeVisaType('skilled_worker_visa')).toBe('skilled_worker_visa')
  })
  it('returns null for unknown/empty', () => {
    expect(normalizeVisaType('tourist')).toBeNull()
    expect(normalizeVisaType('')).toBeNull()
  })
  it('labels + phase: skilled-worker is the only phase-1 route', () => {
    expect(visaTypeLabel('skilled_worker_visa')).toBe('Skilled Worker')
    expect(visaTypePhase('skilled_worker_visa')).toBe(1)
    expect(visaTypePhase('student_visa')).toBe(2)
    expect(VISA_TYPES.filter((v) => v.phase === 1).map((v) => v.key)).toEqual(['skilled_worker_visa'])
  })
})
