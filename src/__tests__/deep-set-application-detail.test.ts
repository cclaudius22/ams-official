import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { AmsDemoProvider } from '@/data/providers/ams-demo-provider'
import { mapDeepSetApplicationDetail } from '@/data/providers/deepSetApplicationDetailAdapter'

/**
 * Slice 3a (header/sections) — the reviewer page header + section accordion read
 * the legacy ApplicationData (via /api/applications/:id → getApplicationById).
 * For ams-demo deep_set ids this used to return null → the page fell back to the
 * hardcoded "John James Doe / High Potential Individual" mock on EVERY case.
 * getApplicationById now returns a real per-applicant ApplicationDetail so the
 * header + sections show the actual applicant being processed.
 */
const CORPUS = 'data/demo-corpus'
const loadRaw = (id: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), CORPUS, 'deep_set', 'applications', `${id}.json`), 'utf-8'))

describe('mapDeepSetApplicationDetail — real applicant, never the John Doe mock', () => {
  it('header-critical fields + passport name come from the deep_set record', () => {
    const d = mapDeepSetApplicationDetail(loadRaw('HO-SW-DEEP-2026-00001'))
    expect(d).not.toBeNull()
    expect(d!.id).toBe('HO-SW-DEEP-2026-00001')
    expect(d!.visaTypeId).toBe('skilled-worker') // header title → "Skilled Worker"
    // ApplicationHeader reads the name strictly from sections.passport.data
    const passport = d!.sections.passport.data as Record<string, unknown>
    expect(passport.givenNames).toBe('Karan')
    expect(passport.surname).toBe('Nair')
    expect(passport.documentNumber).toBe('P5094734')
    expect(d!.applicantDetails.email).toBe('karan.nair.0001@outlook.com')
    // and absolutely none of the hardcoded mock
    const json = JSON.stringify(d)
    expect(json).not.toContain('John James Doe')
    expect(json).not.toContain('high-potential-individual')
  })

  it('builds the Skilled Worker sections from the corpus answers, each with its sectionId', () => {
    const d = mapDeepSetApplicationDetail(loadRaw('HO-SW-DEEP-2026-00001'))!
    expect(Object.keys(d.sections)).toEqual(
      expect.arrayContaining(['passport', 'sponsorshipAndRole', 'financial', 'englishProficiency', 'documents'])
    )
    const cos = (d.sections.sponsorshipAndRole.data as Record<string, any>).certificateOfSponsorship
    expect(cos.cosNumber).toBe('COS-2026-7313698')
    expect((d.sections.englishProficiency.data as Record<string, unknown>).overallScore).toBe(8)
    expect(
      ((d.sections.documents.data as Record<string, any>).requiredDocumentsList as unknown[]).length
    ).toBeGreaterThan(0)
    // SectionCard routes on data.sectionId — every section must carry the matching key
    for (const [key, sec] of Object.entries(d.sections)) {
      expect((sec.data as Record<string, unknown>).sectionId).toBe(key)
    }
  })
})

describe('AmsDemoProvider.getApplicationById — deep_set serves a real ApplicationDetail', () => {
  let provider: AmsDemoProvider
  beforeAll(async () => {
    provider = new AmsDemoProvider(CORPUS)
    await provider.initialize()
  })

  it('returns the per-applicant detail for a deep_set id', async () => {
    const d = await provider.getApplicationById('HO-SW-DEEP-2026-00007')
    expect(d).not.toBeNull()
    expect(d!.visaTypeId).toBe('skilled-worker')
    expect((d!.sections.passport.data as Record<string, unknown>).surname).toBeTruthy()
    expect(d!.applicantDetails.name).toBeTruthy()
  })

  it('returns null for a non-deep_set / unknown id (bulk unaffected)', async () => {
    expect(await provider.getApplicationById('NOPE-123')).toBeNull()
  })
})
