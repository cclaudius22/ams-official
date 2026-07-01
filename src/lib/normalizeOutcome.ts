/**
 * Outcome normalisation.
 *
 * Four systems speak four different vocabularies for the same concept:
 *
 *   VK Backend:      'approved'   'rejected'   'needs_review'
 *   DIS pipeline:    'RECOMMEND_APPROVE' 'RECOMMEND_REJECT' 'MANUAL_REVIEW'  (17 Jun — supersedes the earlier APPROVE/REJECT reading)
 *   AMS canonical:   'APPROVED'   'REJECTED'   'MANUAL_REVIEW'   (DecisionOutcome)
 *   AMS (legacy):    'approved'   'rejected'   'escalated'
 *
 * This module is the single conversion boundary. Always normalise at the
 * edge (webhook receive, UI hydration, API response) and internally use the
 * AMS canonical `DecisionOutcome` everywhere. The DIS wire vocabulary changed
 * APPROVED→APPROVE / REJECTED→REJECT on 12 June — both eras normalise here.
 *
 * V3 spec: Phase 1 Task 1.5 · V5 spec: 12 June delta
 */

import type { DecisionOutcome } from '@/api-contracts/dis'

// ============================================================================
// VOCABULARY TYPES
// ============================================================================

/** VisaKey Backend outcome vocabulary */
export type VKBackendOutcome = 'approved' | 'rejected' | 'needs_review'

/** Legacy AMS officer outcome vocabulary */
export type AMSLegacyOutcome = 'approved' | 'rejected' | 'escalated'

/**
 * Unified input type — accepts any of the three vocabularies plus common
 * casing variants. `normalizeOutcome` turns any of these into a canonical
 * DIS `DecisionOutcome`.
 */
export type AnyOutcomeInput =
  | DecisionOutcome
  | VKBackendOutcome
  | AMSLegacyOutcome
  | 'Approved' | 'Rejected' | 'Escalated'   // legacy title-case variants
  | 'MANUAL REVIEW' | 'Manual Review'
  | string                                  // fallback — runtime check

// ============================================================================
// CANONICAL CONVERSION
// ============================================================================

/**
 * Normalise any known outcome string into the DIS canonical `DecisionOutcome`.
 * Returns `undefined` for unknown strings (caller decides fallback behaviour).
 *
 * Case-insensitive. Trims whitespace.
 */
export function normalizeOutcome(input: string | null | undefined): DecisionOutcome | undefined {
  if (!input) return undefined
  const key = input.trim().toLowerCase().replace(/[_ ]+/g, '_')

  switch (key) {
    // APPROVED family
    case 'approved':
    case 'approve':
    case 'recommend_approve':
      return 'APPROVED'

    // REJECTED family
    case 'rejected':
    case 'reject':
    case 'refused':
    case 'recommend_reject':
      return 'REJECTED'

    // MANUAL_REVIEW family (the gnarly one — 5+ variants in the wild)
    case 'manual_review':
    case 'manualreview':
    case 'needs_review':
    case 'needsreview':
    case 'escalated':
    case 'escalate':
    case 'referred':
    case 'refer':
    case 'review':
    case 'review_required':
      return 'MANUAL_REVIEW'

    default:
      return undefined
  }
}

/**
 * Like `normalizeOutcome`, but throws if the input is unknown.
 * Use this at system boundaries where an unknown value is a genuine bug.
 */
export function normalizeOutcomeStrict(input: string): DecisionOutcome {
  const result = normalizeOutcome(input)
  if (!result) {
    throw new Error(`normalizeOutcomeStrict: unknown outcome "${input}"`)
  }
  return result
}

// ============================================================================
// REVERSE CONVERSION (canonical → system-specific)
// ============================================================================

/**
 * Convert a canonical DIS outcome to the VisaKey Backend vocabulary.
 * Use this when sending data BACK to VisaKey (e.g., webhook acknowledgements).
 */
export function toVKBackendOutcome(outcome: DecisionOutcome): VKBackendOutcome {
  switch (outcome) {
    case 'APPROVED': return 'approved'
    case 'REJECTED': return 'rejected'
    case 'MANUAL_REVIEW': return 'needs_review'
  }
}

/**
 * Convert a canonical DIS outcome to the legacy AMS vocabulary.
 * Use this when rendering in UI components that haven't been migrated yet.
 */
export function toAMSLegacyOutcome(outcome: DecisionOutcome): AMSLegacyOutcome {
  switch (outcome) {
    case 'APPROVED': return 'approved'
    case 'REJECTED': return 'rejected'
    case 'MANUAL_REVIEW': return 'escalated'
  }
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Human-readable label for a decision outcome. Used in badges, tooltips,
 * and status indicators throughout the officer dashboard.
 */
export function outcomeLabel(outcome: DecisionOutcome): string {
  switch (outcome) {
    case 'APPROVED': return 'Approved'
    case 'REJECTED': return 'Rejected'
    case 'MANUAL_REVIEW': return 'Manual Review'
  }
}

/**
 * Semantic colour for a decision outcome. Matches Tailwind's colour scale
 * so callers can `className={`bg-${outcomeColor(outcome)}-100`}`.
 */
export function outcomeColor(outcome: DecisionOutcome): 'green' | 'red' | 'amber' {
  switch (outcome) {
    case 'APPROVED': return 'green'
    case 'REJECTED': return 'red'
    case 'MANUAL_REVIEW': return 'amber'
  }
}
