// @vitest-environment node
/**
 * Integration test for queryQueue (DIS read layer, task 2F.3 — module E1).
 *
 * Builds the officer queue list from the local Postgres replica: JOINs
 * applications + applicants + recommendations, determines callbackDelivered
 * from callback_events, derives queue_state via deriveQueueState (the single
 * source of that derivation), then filters/paginates in JS.
 *
 * Live ground truth (seeded, deterministic):
 *   - 100 applications total (42 APPROVE / 58 MANUAL_REVIEW recommendations)
 *   - all 100 callbacks DELIVERED, so every APPROVE app derives CALLBACK_SENT
 *     and every MANUAL_REVIEW app derives READY_FOR_REVIEW (the caseworker
 *     queue) -> 58 READY_FOR_REVIEW, 42 CALLBACK_SENT, 0 AUTO_RECOMMENDED.
 *   - visa_type stored as 'skilled-worker' (hyphen); the DISQueueRow contract
 *     uses the VisaType union 'skilled_worker' (underscore) — normalized at the
 *     boundary, asserted below.
 *
 * Gated on DIS_REPLICA_URL so CI without docker stays green. Run with:
 *   DIS_REPLICA_URL=postgres://dis:dis@localhost:5499/openvisa_pg_db \
 *     npx vitest run src/__tests__/dis-replica-queue.test.ts
 */

import { describe, it, expect, afterAll } from 'vitest'
import { queryQueue } from '@/data/dis-providers/queries/queue'
import type { DISQueueRow } from '@/api-contracts/dis'
import { disPool } from '@/lib/disDb'

const ALL_PAGE = { page: 1, pageSize: 1000 }

describe.skipIf(!process.env.DIS_REPLICA_URL)('queryQueue (replica)', () => {
  afterAll(async () => {
    await disPool.end()
  })

  it('returns all 100 seeded applications with no filters', async () => {
    const result = await queryQueue({}, ALL_PAGE)
    expect(result.total).toBe(100)
    expect(result.data).toHaveLength(100)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(1000)
    expect(result.totalPages).toBe(1)
  })

  it('every returned row carries a derived queue_state and contract-shaped fields', async () => {
    const { data } = await queryQueue({}, ALL_PAGE)
    const validStates = new Set([
      'FAILED_INTAKE',
      'AWAITING_DOCS',
      'IN_PIPELINE',
      'READY_FOR_REVIEW',
      'AUTO_RECOMMENDED',
      'CALLBACK_SENT',
    ])
    for (const row of data) {
      expect(typeof row.dis_application_id).toBe('string')
      expect(typeof row.source_application_id).toBe('string')
      expect(['visakey', 'govdirect']).toContain(row.source_channel)
      // visa_type normalized to the VisaType union (underscore, not the stored hyphen).
      expect(row.visa_type).toBe('skilled_worker')
      expect(typeof row.applicant_name).toBe('string')
      expect(row.applicant_name.length).toBeGreaterThan(0)
      expect(validStates.has(row.queue_state)).toBe(true)
      // recommendation is the wire value or null.
      expect([null, 'APPROVE', 'MANUAL_REVIEW']).toContain(row.recommendation)
      expect(typeof row.completeness_score === 'number' || row.completeness_score === null).toBe(true)
      // submitted_at is a real ISO-8601 string.
      expect(row.submitted_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      expect(Number.isNaN(Date.parse(row.submitted_at))).toBe(false)
    }
  })

  it('filters to the caseworker queue: READY_FOR_REVIEW === 58 (the MANUAL_REVIEW apps)', async () => {
    const result = await queryQueue({ queue_state: 'READY_FOR_REVIEW' }, ALL_PAGE)
    expect(result.total).toBe(58)
    expect(result.data).toHaveLength(58)
    expect(result.data.every((r: DISQueueRow) => r.queue_state === 'READY_FOR_REVIEW')).toBe(true)
    expect(result.data.every((r: DISQueueRow) => r.recommendation === 'MANUAL_REVIEW')).toBe(true)
  })

  it('the APPROVE apps derive CALLBACK_SENT === 42 (all callbacks DELIVERED)', async () => {
    const callbackSent = await queryQueue({ queue_state: 'CALLBACK_SENT' }, ALL_PAGE)
    expect(callbackSent.total).toBe(42)
    expect(callbackSent.data.every((r: DISQueueRow) => r.recommendation === 'APPROVE')).toBe(true)

    // none remain AUTO_RECOMMENDED because every callback was delivered.
    const autoRecommended = await queryQueue({ queue_state: 'AUTO_RECOMMENDED' }, ALL_PAGE)
    expect(autoRecommended.total).toBe(0)
    expect(autoRecommended.data).toHaveLength(0)
  })

  it('paginates: page 1, pageSize 10 returns 10 rows but total stays 100', async () => {
    const result = await queryQueue({}, { page: 1, pageSize: 10 })
    expect(result.total).toBe(100)
    expect(result.data).toHaveLength(10)
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(10)
    expect(result.totalPages).toBe(10)
  })

  it('pagination is stable and non-overlapping across pages (1-based)', async () => {
    const page1 = await queryQueue({}, { page: 1, pageSize: 10 })
    const page2 = await queryQueue({}, { page: 2, pageSize: 10 })
    expect(page2.data).toHaveLength(10)
    const ids1 = new Set(page1.data.map((r) => r.dis_application_id))
    const overlap = page2.data.filter((r) => ids1.has(r.dis_application_id))
    expect(overlap).toHaveLength(0)
  })

  it('a page past the end is empty but total is unchanged', async () => {
    const result = await queryQueue({}, { page: 99, pageSize: 10 })
    expect(result.total).toBe(100)
    expect(result.data).toHaveLength(0)
    expect(result.totalPages).toBe(10)
  })

  it('visa_type filter matches the normalized union value', async () => {
    const matching = await queryQueue({ visa_type: 'skilled_worker' }, ALL_PAGE)
    expect(matching.total).toBe(100)

    // a visa_type with no seeded rows yields an empty, well-formed page.
    const none = await queryQueue({ visa_type: 'student' }, ALL_PAGE)
    expect(none.total).toBe(0)
    expect(none.data).toHaveLength(0)
  })
})
