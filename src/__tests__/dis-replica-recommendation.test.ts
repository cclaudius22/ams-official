// @vitest-environment node
/**
 * Integration test for E2 recommendation-core read (task 2F.3).
 *
 * Runs ONLY when DIS_REPLICA_URL is set (the local Postgres replica must be up
 * and seeded). CI without docker skips the whole suite, staying green.
 *
 *   DIS_REPLICA_URL=postgres://dis:dis@localhost:5499/openvisa_pg_db \
 *     npx vitest run src/__tests__/dis-replica-recommendation.test.ts
 *
 * Test ids are NOT hard-coded — they are resolved live from the replica so the
 * suite tracks whatever the deterministic seeder produced.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { disQuery } from '@/lib/disDb'
import { queryRecommendationCore } from '@/data/dis-providers/queries/recommendation'

const COMPONENT_KEYS = [
  'passport',
  'financial',
  'employment',
  'english_language',
  'immigration_compliance',
  'criminal_record',
  'health',
  'document_quality',
  'fraud_risk',
] as const

describe.skipIf(!process.env.DIS_REPLICA_URL)('queryRecommendationCore (replica)', () => {
  let manualReviewId: string
  let approveId: string

  beforeAll(async () => {
    const mr = await disQuery<{ source_application_id: string }>(
      `SELECT a.source_application_id
         FROM applications a
         JOIN recommendations r USING (dis_application_id)
        WHERE r.outcome = 'MANUAL_REVIEW'
        ORDER BY a.source_application_id
        LIMIT 1`,
    )
    const ap = await disQuery<{ source_application_id: string }>(
      `SELECT a.source_application_id
         FROM applications a
         JOIN recommendations r USING (dis_application_id)
        WHERE r.outcome = 'RECOMMEND_APPROVE'
        ORDER BY a.source_application_id
        LIMIT 1`,
    )
    manualReviewId = mr[0]!.source_application_id
    approveId = ap[0]!.source_application_id
  })

  it('returns null for an unknown source_application_id', async () => {
    const result = await queryRecommendationCore('does-not-exist-VK-0000')
    expect(result).toBeNull()
  })

  it('returns the recommendation core for a MANUAL_REVIEW application', async () => {
    const view = await queryRecommendationCore(manualReviewId)
    expect(view).not.toBeNull()
    const v = view!

    // Identity / metadata
    expect(v.source_application_id).toBe(manualReviewId)
    expect(v.source_reference).toBe(manualReviewId) // reuses source_application_id (no separate column)
    expect(typeof v.dis_application_id).toBe('string')
    expect(v.dis_application_id).toMatch(/^[0-9a-f-]{36}$/i)
    expect(['visakey', 'govdirect']).toContain(v.source_channel)
    // submitted_at must be ISO 8601, not a Date / raw pg string
    expect(v.submitted_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)

    // Derived queue state — MANUAL_REVIEW always sits in the caseworker queue
    expect(v.queue_state).toBe('READY_FOR_REVIEW')

    // Recommendation artifact
    const r = v.recommendation
    expect(r.recommendation).toBe('MANUAL_REVIEW')
    expect(typeof r.recommendation_reason).toBe('string')
    expect(r.recommendation_reason.length).toBeGreaterThan(0)
    expect(typeof r.note).toBe('string')
    expect(r.note.length).toBeGreaterThan(0)
    expect(typeof r.completeness_score).toBe('number')
    expect(['COMPLETE', 'INCOMPLETE_PENDING', 'DOCUMENTS_REQUIRED']).toContain(r.completeness_status)
    expect(r.generated_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    // evaluation_breakdown + rules_summary come from the callback payload
    expect(r.evaluation_breakdown).toBeTruthy()
    expect(r.rules_summary.rules.drools_rules_evaluated).toBe(20)
    expect(r.rules_summary.opa_policies.opa_total_evaluated).toBe(12)
    expect(r.rules_summary.external_checks.external_checks_evaluated).toBe(7)
    // version arrays (from the payload — bare arrays, not the wrapped column)
    expect(Array.isArray(r.drools_version)).toBe(true)
    expect(r.drools_version.length).toBeGreaterThan(0)
    expect(r.drools_version[0]).toHaveProperty('rule_version_id')
    expect(Array.isArray(r.opa_version)).toBe(true)
    expect(r.opa_version[0]).toHaveProperty('policy_version_id')
    // table-column fields
    expect(Array.isArray(r.hard_fail_rules)).toBe(true)
    expect(Array.isArray(r.soft_flag_rules)).toBe(true)
    expect(r.recommendation_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)

    // Component scores — RICH map (9 keys), not the flat score-only column
    expect(Object.keys(v.component_scores).sort()).toEqual([...COMPONENT_KEYS].sort())
    for (const key of COMPONENT_KEYS) {
      const c = v.component_scores[key]
      if (c === null) continue // NOT_APPLICABLE is legal
      expect(c).toHaveProperty('status')
      expect(c).toHaveProperty('confidence')
      // rich map carries rule_results; the flat column would not
      expect(c).toHaveProperty('rule_results')
    }
    // at least one component must be the rich object (sanity vs the flat column)
    const passport = v.component_scores.passport
    expect(passport).not.toBeNull()
    expect(Array.isArray(passport!.rule_results)).toBe(true)
  })

  it('Phase 1: a RECOMMEND_APPROVE application still goes to the caseworker (READY_FOR_REVIEW)', async () => {
    const view = await queryRecommendationCore(approveId)
    expect(view).not.toBeNull()
    expect(view!.recommendation.recommendation).toBe('RECOMMEND_APPROVE')
    // Everything is human-in-the-loop in Phase 1 — no auto-bypass.
    expect(view!.queue_state).toBe('READY_FOR_REVIEW')
  })
})
