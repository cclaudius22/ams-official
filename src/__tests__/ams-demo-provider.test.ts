import { describe, it, expect, beforeAll } from 'vitest'
import { AmsDemoProvider } from '@/data/providers/ams-demo-provider'

describe('AmsDemoProvider', () => {
  let provider: AmsDemoProvider
  beforeAll(async () => {
    provider = new AmsDemoProvider('src/__tests__/fixtures/ams-demo')
    await provider.initialize()
  })

  it('loads DIS-aligned apps as Received with canonical visa + recommendation', async () => {
    const { data, total } = await provider.getApplications({}, { page: 1, pageSize: 100 })
    expect(total).toBe(3)
    expect(data.every((a) => a.status === 'Received')).toBe(true)
    expect(data.map((a) => a.recommendation).sort()).toEqual([
      'MANUAL_REVIEW',
      'RECOMMEND_APPROVE',
      'RECOMMEND_REJECT',
    ])
    expect(data.map((a) => a.visaType).sort()).toEqual(['Global Talent', 'Skilled Worker', 'Student'])
    expect(data.map((a) => a.visaTypeId).sort()).toEqual([
      'global_talent_visa',
      'skilled_worker_visa',
      'student_visa',
    ])
  })

  it('does not throw when bulk/documents is absent (fixture has none)', () => {
    expect(provider.isInitialized()).toBe(true)
  })

  it('assigns + reflects the officer, and exposes seed officers', async () => {
    const officers = await provider.getOfficers()
    expect(officers.length).toBeGreaterThan(0)
    const ok = await provider.assignApplication('HO-SW-2026-F0001', officers[0].id, 'auto')
    expect(ok).toBe(true)
    const { data } = await provider.getApplications({}, { page: 1, pageSize: 100 })
    const assigned = data.find((a) => a.id === 'HO-SW-2026-F0001')
    expect(assigned?.assignedTo?.id).toBe(officers[0].id)
  })
})
