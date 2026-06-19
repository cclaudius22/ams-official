/**
 * E1 — officer queue list for the DIS replica (task 2F.3, V5 §6 endpoint 1).
 *
 * JOINs applications + applicants + (LEFT) recommendations, then derives
 * queue_state in JS via deriveQueueState — keeping that derivation in ONE place
 * (shared with the E2 detail view). Filtering on queue_state / visa_type and
 * pagination also happen in JS, with page/page_size clamped to safe bounds.
 *
 * KEYING: rows are keyed by the DIS UUID internally, but the queue is exposed
 * by the AMS-facing source_application_id (applications.source_application_id);
 * recommendations/callback_events are keyed by dis_application_id, so we JOIN
 * on a.dis_application_id.
 *
 * SCALE NOTE: we fetch all rows then derive/filter/paginate in JS. That is fine
 * at the 100-row replica, and keeps the derived queue_state authoritative (it
 * cannot be expressed cleanly in SQL without duplicating deriveQueueState).
 * Deloitte's real endpoint should push the filter + LIMIT/OFFSET into SQL.
 *
 * SHAPE NOTES (replica vs the DISQueueRow contract):
 *   - visa_type is stored as 'skilled-worker' (hyphen); the VisaType union uses
 *     'skilled_worker' (underscore). Normalized at the boundary (hyphen->underscore).
 *   - submitted_at is TIMESTAMPTZ; converted to a true ISO-8601 string.
 *   - completeness_score is INTEGER (pg yields a number) and may be NULL.
 */

import type { DISQueueFilters, DISPagination, DISPaginated } from '../index'
import type { DISQueueRow } from '@/api-contracts/dis'
import type { RecommendationOutcome, SourceChannel, VisaType, DISApplicationStatus } from '@/api-contracts/dis'
import { deriveQueueState } from '../queueState'
import { disQuery } from '@/lib/disDb'

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 200

/** Raw joined row as it comes back from pg (one per application). */
interface QueueQueryRow {
  dis_application_id: string
  source_application_id: string
  source_channel: SourceChannel
  visa_type: string
  applicant_name: string
  status: DISApplicationStatus
  recommendation_outcome: RecommendationOutcome | null
  completeness_score: number | null
  submitted_at: Date | string
}

/** Normalize the stored visa_type ('skilled-worker') to the VisaType union ('skilled_worker'). */
function normalizeVisaType(raw: string): VisaType {
  return raw.replace(/-/g, '_') as VisaType
}

function toIso(v: Date | string): string {
  return v instanceof Date ? v.toISOString() : new Date(v).toISOString()
}

export async function queryQueue(
  filters: DISQueueFilters,
  pagination: DISPagination,
): Promise<DISPaginated<DISQueueRow>> {
  // One row per application.
  const rows = await disQuery<QueueQueryRow>(
    `SELECT
        a.dis_application_id,
        a.source_application_id,
        a.source_channel,
        a.visa_type,
        ap.full_name              AS applicant_name,
        a.status,
        r.outcome                 AS recommendation_outcome,
        a.completeness_score,
        a.submitted_at
      FROM applications a
      JOIN applicants ap ON ap.applicant_id = a.applicant_id
      LEFT JOIN recommendations r ON r.dis_application_id = a.dis_application_id
      ORDER BY a.submitted_at DESC, a.source_application_id ASC`,
  )

  // Build a contract row per application, deriving queue_state in ONE place.
  const allRows: DISQueueRow[] = rows.map((r) => ({
    dis_application_id: r.dis_application_id,
    source_application_id: r.source_application_id,
    source_channel: r.source_channel,
    visa_type: normalizeVisaType(r.visa_type),
    applicant_name: r.applicant_name,
    queue_state: deriveQueueState({
      status: r.status,
      recommendationOutcome: r.recommendation_outcome ?? null,
    }),
    recommendation: r.recommendation_outcome ?? null,
    completeness_score: r.completeness_score ?? null,
    submitted_at: toIso(r.submitted_at),
  }))

  // Filter on the derived queue_state + the normalized visa_type (in JS so the
  // derivation stays authoritative).
  const filtered = allRows.filter((row) => {
    if (filters.queue_state && row.queue_state !== filters.queue_state) return false
    if (filters.visa_type && row.visa_type !== filters.visa_type) return false
    return true
  })

  // Clamp to safe bounds so malformed input (NaN / 0 / negative / huge) can
  // never reach Array.slice with a negative index — which would return a tail
  // window of real rows instead of an empty/clamped page.
  const total = filtered.length
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pagination.pageSize) || DEFAULT_PAGE_SIZE))
  const page = Math.max(1, Math.floor(pagination.page) || 1)
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  const data = filtered.slice(start, start + pageSize)

  return { data, total, page, pageSize, totalPages }
}
