import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { AmsDemoProvider } from '@/data/providers/ams-demo-provider'
import { mapRfi, type RfiSummary } from '@/data/providers/deepSetRfiAdapter'
import {
  mapRfiQueueItem,
  hasRfiQueueCapability,
  type RfiLaneItem,
} from '@/data/providers/rfiQueueAdapter'

/**
 * RFI lane (pre-auth subset of the 2026-06-30 plan, Task 8).
 *
 * The queue-level projection of the per-case RFI scaffold: the officer's
 * RFI-enabled deep_set cases, grouped Awaiting / Returned / Overdue. State is
 * DERIVED from the corpus (response artifact + `due_at`) against a demo `now` —
 * no persistence, no auth. All 3 heroes in the corpus have already responded
 * (received 2026-06-27), so at demo-today they derive as `returned`.
 */
const CORPUS = 'data/demo-corpus'
const readJson = (rel: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), CORPUS, rel), 'utf-8'))

const heroRfi = (id: string): RfiSummary => {
  const raw = readJson(`deep_set/applications/${id}.json`)
  const request = readJson(`deep_set/rfi_artifacts/${id}/request.json`)
  const response = readJson(`deep_set/rfi_artifacts/${id}/response.json`)
  const rfi = mapRfi(raw, request, response)
  if (!rfi) throw new Error(`${id} is not RFI-enabled`)
  return rfi
}

describe('mapRfiQueueItem (pure lane projection)', () => {
  const raw12 = readJson('deep_set/applications/HO-SW-DEEP-2026-00012.json')

  it('projects hero 00012 → applicant, issue, due date; responded case is "returned"', () => {
    const item = mapRfiQueueItem(raw12, heroRfi('HO-SW-DEEP-2026-00012'), '2026-06-30')
    expect(item).not.toBeNull()
    expect(item!.id).toBe('HO-SW-DEEP-2026-00012')
    expect(item!.applicantName).toBe('Tunde Bello')
    expect(item!.issue).toBe('missing payslip month 2')
    expect(item!.dueAt).toBe('2026-07-08T11:15:00Z')
    expect(item!.state).toBe('returned') // applicant responded 2026-06-27, before demo-now
    expect(item!.requestedDocumentType).toBe('PAYSLIPS')
    expect(item!.missingItems).toContain('missing payslip month 2')
    expect(item!.href).toBe('/dashboard/reviewer/HO-SW-DEEP-2026-00012')
  })

  it('is "awaiting" when demo-now precedes the applicant response and the deadline', () => {
    const item = mapRfiQueueItem(raw12, heroRfi('HO-SW-DEEP-2026-00012'), '2026-06-25')
    expect(item!.state).toBe('awaiting')
  })

  it('is "overdue" when the deadline has passed with no response', () => {
    const overdue: RfiSummary = {
      enabled: true,
      issue: 'missing payslip month 2',
      missingItems: ['missing payslip month 2'],
      request: { dueAt: '2026-06-01T00:00:00Z' },
      response: null,
    }
    const item = mapRfiQueueItem(raw12, overdue, '2026-06-30')
    expect(item!.state).toBe('overdue')
  })

  it('returns null when the case is not RFI-enabled (rfi summary null)', () => {
    expect(mapRfiQueueItem(raw12, null, '2026-06-30')).toBeNull()
  })
})

describe('AmsDemoProvider.getRfiQueue', () => {
  let provider: AmsDemoProvider
  beforeAll(async () => {
    provider = new AmsDemoProvider(CORPUS)
    await provider.initialize()
  })

  it('is exposed as a provider capability', () => {
    expect(hasRfiQueueCapability(provider)).toBe(true)
  })

  it("returns Rachel Johnson's (officer-demo) two skilled-worker RFI heroes", async () => {
    const items = await provider.getRfiQueue('officer-demo', '2026-06-30')
    const ids = items.map((i: RfiLaneItem) => i.id).sort()
    expect(ids).toEqual(['HO-SW-DEEP-2026-00012', 'HO-SW-DEEP-2026-00013'])
    const twelve = items.find((i) => i.id === 'HO-SW-DEEP-2026-00012')!
    expect(twelve.applicantName).toBe('Tunde Bello')
    expect(twelve.issue).toBe('missing payslip month 2')
    expect(twelve.state).toBe('returned')
  })

  it("returns Ricardo Martinez's (officer-2) skilled-worker RFI hero", async () => {
    const items = await provider.getRfiQueue('officer-2', '2026-06-30')
    expect(items.map((i) => i.id)).toEqual(['HO-SW-DEEP-2026-00014'])
    expect(items[0].applicantName).toBe('Jun Ming Wang')
    expect(items[0].state).toBe('returned')
    expect(items[0].requestedDocumentType).toBe('EMPLOYMENT_LETTER')
    expect(items[0].href).toBe('/dashboard/reviewer/HO-SW-DEEP-2026-00014')
  })

  it('returns nothing for an officer with no assigned RFI cases', async () => {
    expect(await provider.getRfiQueue('officer-1', '2026-06-30')).toEqual([])
  })
})
