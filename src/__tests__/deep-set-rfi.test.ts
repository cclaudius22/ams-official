import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { AmsDemoProvider } from '@/data/providers/ams-demo-provider'
import { mapRfi } from '@/data/providers/deepSetRfiAdapter'

/**
 * Slice 3b SCAFFOLD — the RFI summary surfaced to the reviewer page so the demo
 * can walk the "what happens when more information is acquired?" flow. Data-driven
 * from the corpus rfi_lifecycle + request.json + response.json (the 3 heroes).
 */
const CORPUS = 'data/demo-corpus'
const readJson = (rel: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), CORPUS, rel), 'utf-8'))

describe('mapRfi (RFI scaffold adapter)', () => {
  it('builds the full summary for hero 00012 — gap + issued request + applicant response', () => {
    const raw = readJson('deep_set/applications/HO-SW-DEEP-2026-00012.json')
    const request = readJson('deep_set/rfi_artifacts/HO-SW-DEEP-2026-00012/request.json')
    const response = readJson('deep_set/rfi_artifacts/HO-SW-DEEP-2026-00012/response.json')
    const rfi = mapRfi(raw, request, response)
    expect(rfi).not.toBeNull()
    expect(rfi!.enabled).toBe(true)
    expect(rfi!.issue).toBe('missing payslip month 2')
    expect(rfi!.missingItems).toContain('missing payslip month 2')
    expect(rfi!.request.requestedDocumentType).toBe('PAYSLIPS')
    expect(rfi!.request.caseworkerMessage).toContain('February 2026 payslip')
    // the "more information acquired" beat
    expect(rfi!.response).not.toBeNull()
    expect(rfi!.response!.suppliedDocuments[0].filename).toBe('PAYSLIPS_002.pdf')
    expect(rfi!.response!.postResponseRecommendation).toBe('MANUAL_REVIEW')
    expect(rfi!.response!.decisionOptions.length).toBeGreaterThan(0)
  })

  it('returns null for a non-RFI case (00001 — panel never renders there)', () => {
    expect(mapRfi(readJson('deep_set/applications/HO-SW-DEEP-2026-00001.json'))).toBeNull()
  })

  it('is robust when artifacts are absent — a gap-only summary, response null', () => {
    const rfi = mapRfi(readJson('deep_set/applications/HO-SW-DEEP-2026-00012.json'))
    expect(rfi).not.toBeNull()
    expect(rfi!.issue).toBe('missing payslip month 2')
    expect(rfi!.response).toBeNull()
  })
})

describe('AmsDemoProvider.getDeepSetReview attaches the RFI scaffold', () => {
  let provider: AmsDemoProvider
  beforeAll(async () => {
    provider = new AmsDemoProvider(CORPUS)
    await provider.initialize()
  })

  it('hero 00012 review carries rfi with the applicant response', async () => {
    const review = await provider.getDeepSetReview('HO-SW-DEEP-2026-00012')
    expect(review!.rfi?.enabled).toBe(true)
    expect(review!.rfi?.response?.suppliedDocuments[0].filename).toBe('PAYSLIPS_002.pdf')
  })

  it('a clean case (00001) carries rfi null', async () => {
    const review = await provider.getDeepSetReview('HO-SW-DEEP-2026-00001')
    expect(review!.rfi).toBeNull()
  })
})
