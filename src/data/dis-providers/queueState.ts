/**
 * Derived queue state (V5 §4) — corrected 17 June 2026 to the Phase-1
 * human-in-the-loop model.
 *
 * applications.status is only a document-completeness verdict (it never becomes
 * the decision), so the queue state the UI binds to is DERIVED from status +
 * whether a recommendation has been produced. This is the single source of that
 * derivation, used by both the queue list (E1) and the detail view.
 *
 * Phase 1: EVERY processed application goes to a caseworker. A present
 * recommendation — RECOMMEND_APPROVE, RECOMMEND_REJECT, or MANUAL_REVIEW — maps
 * to READY_FOR_REVIEW regardless of which outcome it is; the recommendation is
 * advisory (shown alongside), never a gate that bypasses the officer. With no
 * recommendation yet, fall back to the completeness verdict.
 *
 * AUTO_RECOMMENDED / CALLBACK_SENT (programmatic fast-track) are Phase-2 only
 * and are intentionally NOT produced here.
 */

import type { QueueState, RecommendationOutcome, DISApplicationStatus } from '@/api-contracts/dis'

export interface QueueStateInput {
  /** Raw applications.status — a completeness verdict, never the decision. */
  status: DISApplicationStatus
  /** recommendations.outcome, or null when no recommendations row exists yet. */
  recommendationOutcome: RecommendationOutcome | null
  /**
   * Whether a callback_events row reached DELIVERED. Unused in Phase 1 (kept
   * optional); reserved for the Phase-2 CALLBACK_SENT state.
   */
  callbackDelivered?: boolean
}

export function deriveQueueState(input: QueueStateInput): QueueState {
  const { status, recommendationOutcome } = input

  // Phase 1 — any recommendation outcome means the pipeline produced a result,
  // and every result is reviewed by a caseworker.
  if (recommendationOutcome) {
    return 'READY_FOR_REVIEW'
  }

  // No recommendation yet — fall back to the completeness verdict.
  switch (status) {
    case 'COMPLETE':
      return 'IN_PIPELINE'
    case 'INCOMPLETE_PENDING':
    case 'DOCUMENTS_REQUIRED':
      return 'AWAITING_DOCS'
    case 'CREATED':
    default:
      return 'FAILED_INTAKE'
  }
}
