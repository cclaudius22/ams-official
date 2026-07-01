/**
 * RFI lane adapter (pre-auth subset of the 2026-06-30 plan — Task 8).
 *
 * The queue-level projection of the per-case RFI scaffold (`deepSetRfiAdapter`).
 * Where that adapter builds the full per-case `RfiSummary` the reviewer walks
 * through, this one flattens it into a single lane row for the officer's
 * "My RFIs" list and DERIVES the lane state:
 *
 *   returned  — the applicant has supplied the requested doc (a response exists,
 *               received on/before `now`) → back with the officer to re-review.
 *   overdue   — the deadline (`request.dueAt`) has passed with no response.
 *   awaiting  — issued, within deadline, no response yet.
 *
 * SCAFFOLD / PRE-AUTH: state is derived from the corpus against a demo `now`;
 * there is no persistence, no SLA clock, and no real ownership model yet (the
 * provider assigns the RFI heroes to the demo officer by convention — see
 * ams-demo-provider.getRfiQueue). Auth + persisted state are the next phase.
 * Pure — no fs, no Date.now(): callers pass `nowISO` so the derivation is
 * deterministic and testable.
 */
import type { RfiSummary } from './deepSetRfiAdapter'

export type RfiLaneState = 'awaiting' | 'returned' | 'overdue'

/** One row in the officer's RFI lane. */
export interface RfiLaneItem {
  id: string
  applicantName: string
  /** Headline gap, e.g. "missing payslip month 2". */
  issue: string
  /** The document type requested from the applicant, e.g. "PAYSLIPS". */
  requestedDocumentType?: string
  /** What DIS flagged short (`completeness.missing_or_insufficient`). */
  missingItems: string[]
  /** RFI deadline (from the issued request), ISO. Absent if the corpus omits it. */
  dueAt?: string
  state: RfiLaneState
  /** Deep-link to the per-case review where the RFI panel walks the flow. */
  href: string
}

/**
 * Optional capability mixin implemented by AmsDemoProvider — lets the API route
 * serve the lane without binding the concrete provider class (mirrors
 * `DeepSetReviewCapable`).
 */
export interface RfiQueueCapable {
  getRfiQueue(officerId: string, nowISO?: string): Promise<RfiLaneItem[]>
}

export function hasRfiQueueCapability(p: unknown): p is RfiQueueCapable {
  return !!p && typeof (p as { getRfiQueue?: unknown }).getRfiQueue === 'function'
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** "Tunde", null, "Bello" → "Tunde Bello". */
function applicantNameOf(raw: unknown): string {
  const applicant = isObject(raw) && isObject(raw.applicant) ? raw.applicant : {}
  const parts = [applicant.first_name, applicant.middle_name, applicant.last_name]
    .filter((p): p is string => typeof p === 'string' && p.length > 0)
  return parts.join(' ') || 'Applicant'
}

/** returned (responded) → overdue (past deadline, no response) → awaiting. */
function deriveState(rfi: RfiSummary, nowISO: string): RfiLaneState {
  const now = Date.parse(nowISO)
  const received = rfi.response?.receivedAt ? Date.parse(rfi.response.receivedAt) : NaN
  const responded =
    rfi.response != null && (Number.isNaN(received) || Number.isNaN(now) || received <= now)
  if (responded) return 'returned'

  const due = rfi.request.dueAt ? Date.parse(rfi.request.dueAt) : NaN
  if (!Number.isNaN(due) && !Number.isNaN(now) && due < now) return 'overdue'

  return 'awaiting'
}

/**
 * Project one deep_set record + its built `RfiSummary` into a lane row. Returns
 * null when the case is not RFI-enabled (`rfi` null), so the lane never lists a
 * non-RFI case. `nowISO` anchors the state derivation.
 */
export function mapRfiQueueItem(raw: unknown, rfi: RfiSummary | null, nowISO: string): RfiLaneItem | null {
  if (!rfi) return null
  const id = isObject(raw) && typeof raw.source_application_id === 'string' ? raw.source_application_id : undefined
  if (!id) return null
  return {
    id,
    applicantName: applicantNameOf(raw),
    issue: rfi.issue,
    requestedDocumentType: rfi.request.requestedDocumentType,
    missingItems: rfi.missingItems,
    dueAt: rfi.request.dueAt,
    state: deriveState(rfi, nowISO),
    href: `/dashboard/reviewer/${id}`,
  }
}
