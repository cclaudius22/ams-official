import { describe, it, expect } from 'vitest'
import { allocateBatch, type AllocatableApp } from '@/services/assignment/allocate-batch'
import type { ConsulateOfficial } from '@/api-contracts/users'

const off = (id: string, specs: string[], activeApplications = 0, sla = 95): ConsulateOfficial =>
  ({
    id,
    firstName: id,
    lastName: 'O',
    email: `${id}@x`,
    role: 'officer',
    isActive: true,
    specializations: specs,
    activeApplications,
    slaCompliance: sla,
    avgProcessingTime: 30,
    completedToday: 0,
  }) as ConsulateOfficial

const apps = (n: number, key = 'skilled_worker_visa'): AllocatableApp[] =>
  Array.from({ length: n }, (_, i) => ({ id: `A${i}`, visaTypeKey: key }))

describe('allocateBatch', () => {
  it('cap counts EXISTING load — an officer at 29/30 takes only 1', () => {
    const r = allocateBatch(apps(10), [off('ric', ['skilled_worker_visa'], 29)], { capPerOfficer: 30 })
    expect(r.byOfficer['ric'].count).toBe(1)
    expect(r.byOfficer['ric'].load).toBe(30)
    expect(r.unallocated.length).toBe(9)
  })

  it('never lets total load (activeApplications + new) exceed the cap', () => {
    const officers = [off('a', ['skilled_worker_visa'], 10), off('b', ['skilled_worker_visa'], 0)]
    const r = allocateBatch(apps(100), officers, { capPerOfficer: 30 })
    expect(Math.max(...Object.values(r.byOfficer).map((o) => o.load))).toBeLessThanOrEqual(30)
    expect(r.assignments.filter((a) => a.officerId).length).toBe(50) // (30-10) + (30-0)
    expect(r.unallocated.length).toBe(50)
  })

  it('balances by total load (lowest first)', () => {
    const officers = [
      off('a', ['skilled_worker_visa']),
      off('b', ['skilled_worker_visa']),
      off('c', ['skilled_worker_visa']),
    ]
    const r = allocateBatch(apps(30), officers, { capPerOfficer: 30 })
    const loads = Object.values(r.byOfficer).map((o) => o.load)
    expect(Math.max(...loads) - Math.min(...loads)).toBeLessThanOrEqual(1) // 10/10/10
  })

  it('respects specialization, skips inactive officers, and queues the overflow', () => {
    const officers = [{ ...off('ric', ['skilled_worker_visa']), isActive: false }, off('ken', ['spouse_partner_visa'])]
    const r = allocateBatch(apps(5), officers, { capPerOfficer: 30 })
    expect(r.unallocated.length).toBe(5)
    expect(r.assignments.every((a) => a.officerId === null)).toBe(true)
    expect(r.byOfficer['ken']).toBeUndefined()
  })
})
