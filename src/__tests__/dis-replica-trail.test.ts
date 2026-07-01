// @vitest-environment node
/**
 * Integration test for queryTrail (DIS read layer, task 2F.3 — module E3).
 *
 * Reads the Glass Box trail (drools_evaluations + opa_evaluations) from the
 * local Postgres replica, keyed by the AMS-facing source_application_id.
 *
 * Panel 2 renders opa_results[].denial_reasons, which exist ONLY in the
 * opa_evaluations table (the callback omits them) — so this asserts the read
 * comes from the table and carries denial_reasons + input_context.
 *
 * Gated on DIS_REPLICA_URL so CI without docker stays green. Run with:
 *   DIS_REPLICA_URL=postgres://dis:dis@localhost:5499/openvisa_pg_db \
 *     npx vitest run src/__tests__/dis-replica-trail.test.ts
 */

import { describe, it, expect, afterAll } from 'vitest'
import { queryTrail } from '@/data/dis-providers/queries/trail'
import { disPool } from '@/lib/disDb'

// A seeded MANUAL_REVIEW application that carries an OPA soft-flag with
// non-empty denial_reasons (confirmed live: OPA-S03 FLAG on this id).
const MANUAL_REVIEW_ID = 'HO-SW-2026-76281096'

describe.skipIf(!process.env.DIS_REPLICA_URL)('queryTrail (replica)', () => {
  afterAll(async () => {
    await disPool.end()
  })

  it('returns null for an unknown source_application_id', async () => {
    const result = await queryTrail('VK-DOES-NOT-EXIST-000')
    expect(result).toBeNull()
  })

  it('returns the full Glass Box trail for a known MANUAL_REVIEW id', async () => {
    const trail = await queryTrail(MANUAL_REVIEW_ID)
    expect(trail).not.toBeNull()
    if (!trail) return

    // 20 drools rules + 12 opa policies per the deterministic seed.
    expect(trail.rule_results).toHaveLength(20)
    expect(trail.opa_results).toHaveLength(12)
  })

  it('maps drools_evaluations rows 1:1 onto DroolsRuleResult', async () => {
    const trail = await queryTrail(MANUAL_REVIEW_ID)
    expect(trail).not.toBeNull()
    if (!trail) return

    for (const r of trail.rule_results) {
      expect(typeof r.rule_id).toBe('string')
      expect(typeof r.rule_name).toBe('string')
      expect(typeof r.rule_category).toBe('string')
      expect(typeof r.outcome).toBe('string')
      expect(typeof r.severity).toBe('string')
      expect(typeof r.reasoning).toBe('string')
      // TEXT[] arrays come back as JS arrays via pg (empty -> []).
      expect(Array.isArray(r.evidence_refs)).toBe(true)
    }

    // The seeded REVIEW_REQUIRED rule (RULE-U05) carries evidence_refs +
    // remediation; confirm a populated rule maps faithfully.
    const flaggedRule = trail.rule_results.find((r) => r.evidence_refs.length > 0)
    expect(flaggedRule).toBeDefined()
    expect(flaggedRule?.remediation).toBeTruthy()
    expect(flaggedRule?.evidence_refs[0]).toContain('document_extractions:')
  })

  it('reads denial_reasons + input_context from the opa TABLE (Panel 2)', async () => {
    const trail = await queryTrail(MANUAL_REVIEW_ID)
    expect(trail).not.toBeNull()
    if (!trail) return

    for (const o of trail.opa_results) {
      expect(typeof o.policy_id).toBe('string')
      expect(typeof o.policy_name).toBe('string')
      expect(['HARD', 'SOFT']).toContain(o.policy_type)
      expect(typeof o.outcome).toBe('string')
      expect(Array.isArray(o.denial_reasons)).toBe(true)
    }

    // At least one policy was flagged with denial_reasons — this is the whole
    // point of reading from the table rather than the callback blob.
    const flagged = trail.opa_results.filter((o) => o.denial_reasons.length > 0)
    expect(flagged.length).toBeGreaterThan(0)
    expect(flagged[0].denial_reasons.every((d) => typeof d === 'string')).toBe(true)
    // input_context is seeded as { application: <srcId> }.
    expect(flagged[0].input_context).toMatchObject({ application: MANUAL_REVIEW_ID })
  })
})
