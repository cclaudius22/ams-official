import { describe, it, expect, beforeAll } from 'vitest'
import { AmsDemoProvider } from '@/data/providers/ams-demo-provider'

/**
 * Task 4c — Rachel Johnson (officer-demo) is the single demo officer for
 * enriched deep review: at provider init ALL 18 deep_set cases are assigned to
 * her (including HO-SW-DEEP-2026-00014, moved off Ricardo/officer-2 per Chris's
 * directive), and her reviewer queue contains ONLY those 18 — she must never
 * receive bulk-allocated work, so Ricardo's (officer-2) bulk queue stays
 * untouched.
 */
const CORPUS = 'data/demo-corpus'

describe('AmsDemoProvider — Rachel Johnson (officer-demo) dedicated deep-review officer', () => {
  let provider: AmsDemoProvider
  beforeAll(async () => {
    provider = new AmsDemoProvider(CORPUS)
    await provider.initialize()
  })

  it('assigns exactly the 18 deep_set cases to officer-demo at init', async () => {
    const { data, total } = await provider.getApplications({ assignedTo: ['officer-demo'] }, { page: 1, pageSize: 50 })
    expect(total).toBe(18)
    expect(data).toHaveLength(18)
    expect(data.every((a) => a.id.startsWith('HO-SW-DEEP-2026-'))).toBe(true)
    expect(data.every((a) => a.assignedTo?.id === 'officer-demo')).toBe(true)
    const ids = data.map((a) => a.id).sort()
    expect(ids[0]).toBe('HO-SW-DEEP-2026-00001')
    expect(ids[17]).toBe('HO-SW-DEEP-2026-00018')
  })

  it('00014 (formerly officer-2) is now assigned to officer-demo', async () => {
    const { data } = await provider.getApplications({}, { page: 1, pageSize: 2000 })
    const app = data.find((a) => a.id === 'HO-SW-DEEP-2026-00014')
    expect(app?.assignedTo?.id).toBe('officer-demo')
  })

  it('officer-2 has none of the 18 deep_set cases assigned at init', async () => {
    const { data, total } = await provider.getApplications({ assignedTo: ['officer-2'] }, { page: 1, pageSize: 50 })
    expect(total).toBe(0)
    expect(data.find((a) => a.id.startsWith('HO-SW-DEEP-2026-'))).toBeUndefined()
  })
})
