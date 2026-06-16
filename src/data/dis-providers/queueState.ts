/**
 * Derived queue state (V5 §4).
 *
 * `applications.status` is only a document-completeness verdict — intake writes
 * CREATED, document-processing overwrites it with the completeness verdict, and
 * no service ever updates it to reflect the decision. So the queue state the UI
 * binds to must be DERIVED from: status + the recommendations row outcome +
 * whether the callback was delivered. This module is the single source of that
 * derivation, used by both the queue list (E1) and the detail view (E2).
 *
 * Precedence:
 *   1. A present recommendation outcome wins over status-based states (a real
 *      recommendation row means the pipeline ran).
 *      - MANUAL_REVIEW → READY_FOR_REVIEW (the caseworker queue) ALWAYS, even
 *        once the informational callback is delivered. Otherwise every
 *        delivered app would fall out of the queue and the primary screen would
 *        be empty.
 *      - APPROVE → CALLBACK_SENT once delivered (auto-approved + notified, done),
 *        else AUTO_RECOMMENDED.
 *   2. No recommendation yet → fall back to the completeness status:
 *      COMPLETE → IN_PIPELINE, INCOMPLETE_PENDING|DOCUMENTS_REQUIRED →
 *      AWAITING_DOCS, CREATED → FAILED_INTAKE.
 */

import type { QueueState, RecommendationOutcome, DISApplicationStatus } from '@/api-contracts/dis'

export interface QueueStateInput {
  /** Raw applications.status — a completeness verdict, never the decision. */
  status: DISApplicationStatus
  /** recommendations.outcome, or null when no recommendations row exists yet. */
  recommendationOutcome: RecommendationOutcome | null
  /** True when a callback_events row reached DELIVERED for this application. */
  callbackDelivered: boolean
}

export function deriveQueueState(input: QueueStateInput): QueueState {
  const { status, recommendationOutcome, callbackDelivered } = input

  if (recommendationOutcome === 'MANUAL_REVIEW') {
    return 'READY_FOR_REVIEW'
  }

  if (recommendationOutcome === 'APPROVE') {
    return callbackDelivered ? 'CALLBACK_SENT' : 'AUTO_RECOMMENDED'
  }

  // No recommendation row yet — fall back to the completeness verdict.
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
