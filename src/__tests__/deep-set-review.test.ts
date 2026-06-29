import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { AmsDemoProvider } from '@/data/providers/ams-demo-provider'
import { mapDeepSetReview, hasDeepSetReviewCapability } from '@/data/providers/deepSetReviewAdapter'

/**
 * Slice 3a — the per-case deep review. The reviewer page opens an ams-demo
 * deep_set application and renders the same 4 panels (Recommendation · Glass Box
 * · Evidence · OV Intelligence) from Lenny's 3.0 corpus enrichment
 * (`dis_application_view` = a full DISApplicationView, top-level `ov_assessment`
 * = a rich OVAssessment) — NO fallback to the Rani mock / synthetic OV.
 */

const CORPUS = 'data/demo-corpus'

function loadRaw(id: string): Record<string, unknown> {
  const p = path.join(process.cwd(), CORPUS, 'deep_set', 'applications', `${id}.json`)
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

describe('mapDeepSetReview (pure adapter — validate & pass through)', () => {
  it('maps a fully enriched record → per-case disView + ovAssessment', () => {
    const review = mapDeepSetReview(loadRaw('HO-SW-DEEP-2026-00001'))
    expect(review).not.toBeNull()
    expect(review!.disView.recommendation.recommendation).toBe('RECOMMEND_APPROVE')
    expect(review!.disView.rule_results.length).toBe(20)
    expect(review!.disView.opa_results.length).toBe(12)
    expect(review!.disView.external_checks.length).toBe(7)
    expect(Object.keys(review!.disView.component_scores).length).toBe(9)
    // Panel 4 — OV: 3 dimensions, applicant-specific
    expect(review!.ovAssessment).not.toBeNull()
    expect(review!.ovAssessment!.dimensions.map((d) => d.key).sort()).toEqual([
      'credibility',
      'intent',
      'rootedness',
    ])
    expect(review!.ovAssessment!.overall.risk_band).toBe('LOW')
  })

  it('returns null when the record carries no usable dis_application_view', () => {
    expect(mapDeepSetReview({ ov_assessment: { overall_risk: 'LOW' } })).toBeNull() // old bands-only shape
    expect(mapDeepSetReview({})).toBeNull()
    expect(mapDeepSetReview(null)).toBeNull()
    // present but missing the panel-critical arrays → would crash a panel → reject
    expect(mapDeepSetReview({ dis_application_view: { recommendation: { rules_summary: {} } } })).toBeNull()
  })

  it('returns disView with null ovAssessment when ov_assessment is absent/invalid', () => {
    const raw = loadRaw('HO-SW-DEEP-2026-00001')
    delete (raw as Record<string, unknown>).ov_assessment
    const review = mapDeepSetReview(raw)
    expect(review).not.toBeNull()
    expect(review!.ovAssessment).toBeNull()
    expect(review!.disView.recommendation.recommendation).toBe('RECOMMEND_APPROVE')
  })
})

describe('AmsDemoProvider.getDeepSetReview (real enriched corpus, scenario-consistent)', () => {
  let provider: AmsDemoProvider
  beforeAll(async () => {
    provider = new AmsDemoProvider(CORPUS)
    await provider.initialize()
  })

  it('advertises the deep-review capability (for the API route to narrow on)', () => {
    expect(hasDeepSetReviewCapability(provider)).toBe(true)
  })

  it('APPROVE case 00001 → clean per-case view, LOW OV, applicant-specific (not the Rani mock)', async () => {
    const review = await provider.getDeepSetReview('HO-SW-DEEP-2026-00001')
    expect(review).not.toBeNull()
    expect(review!.disView.recommendation.recommendation).toBe('RECOMMEND_APPROVE')
    expect(review!.disView.recommendation.hard_fail_rules ?? []).toEqual([])
    expect(
      review!.disView.rule_results.every((r) => r.outcome === 'SATISFIED' || r.outcome === 'NOT_APPLICABLE')
    ).toBe(true)
    expect(review!.ovAssessment!.overall.risk_band).toBe('LOW')
    expect((review!.disView.llm_summary ?? '').toLowerCase()).not.toContain('rani kumari')
  })

  it('REJECT case 00007 → hard fail rule present + HIGH OV', async () => {
    const review = await provider.getDeepSetReview('HO-SW-DEEP-2026-00007')
    expect(review!.disView.recommendation.recommendation).toBe('RECOMMEND_REJECT')
    expect((review!.disView.recommendation.hard_fail_rules ?? []).length).toBeGreaterThan(0)
    expect(review!.disView.rule_results.some((r) => r.outcome === 'NOT_SATISFIED')).toBe(true)
    expect(review!.ovAssessment!.overall.risk_band).toBe('HIGH')
  })

  it('MANUAL_REVIEW / RFI hero 00012 → soft flags + MEDIUM OV', async () => {
    const review = await provider.getDeepSetReview('HO-SW-DEEP-2026-00012')
    expect(review!.disView.recommendation.recommendation).toBe('MANUAL_REVIEW')
    expect((review!.disView.recommendation.soft_flag_rules ?? []).length).toBeGreaterThan(0)
    expect(review!.ovAssessment!.overall.risk_band).toBe('MEDIUM')
  })

  it('returns null for an unknown id (degrades gracefully, never crashes a panel)', async () => {
    expect(await provider.getDeepSetReview('NOPE-DOES-NOT-EXIST')).toBeNull()
  })
})
