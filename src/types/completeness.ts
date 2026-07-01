/**
 * Visa-type-agnostic completeness configuration.
 *
 * RULE-W13 (skilled_worker/completeness_rules.drl) computes a weighted
 * completeness score 0-100 per application. Threshold < 70 = MANUAL_REVIEW.
 *
 * This module defines:
 * - The CompletenessConfig type — the shape of a config for any visa type
 * - SKILLED_WORKER_COMPLETENESS — the Phase 1 config (weights pending Deloitte final)
 * - getCompletenessConfig(visaType) — lookup helper, returns the right config
 *
 * Designed so Student / Global Talent / Family configs can be added later
 * without touching the AMS Completeness Widget (Section 12.8 of V3 spec).
 *
 * V3 spec: Phase 1 Task 1.6 + Section 13 (Multi-Visa Scalability)
 */

import type { DocumentType, VisaType } from '@/api-contracts/dis'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Single document slot in a completeness checklist.
 */
export interface CompletenessDocument {
  /** Canonical DIS document type */
  type: DocumentType
  /** Weight contributed to the 0-100 completeness score when present */
  weight: number
  /** Whether this document is mandatory for the visa type */
  required: boolean
  /**
   * Optional condition that determines whether this document is required.
   * Evaluated by the Drools completeness rule — AMS just displays it.
   * Example: "nationality in tb_test_countries"
   */
  conditional_on?: string
  /** Human-readable label for the UI */
  label: string
  /** Optional longer description for tooltips */
  description?: string
}

/**
 * Full completeness configuration for a visa type.
 * Consumed by the Completeness Widget (V3 Section 12.8) and by the Drools
 * completeness rule (RULE-W13 for Skilled Worker).
 */
export interface CompletenessConfig {
  visa_type: VisaType
  documents: CompletenessDocument[]
  /**
   * Score threshold below which the application goes to MANUAL_REVIEW.
   * Skilled Worker Phase 1 default: 70.
   */
  threshold: number
  /** Optional display name for the config (e.g., "Skilled Worker Phase 1") */
  display_name?: string
}

// ============================================================================
// SKILLED WORKER PHASE 1 CONFIG
// ============================================================================

/**
 * Document weights for Skilled Worker Phase 1.
 *
 * NOTE: Exact weights are still PENDING DELOITTE FINAL. The values below
 * come from V3 spec Section 7.2 ("Document weights: Passport=20, Employment
 * Letter=15, Payslips=15, Bank Statement=15, IELTS=10, Degree=10, CoS=15
 * — confirmed, exact weights pending Deloitte") and sum to 100 when all
 * required documents are present.
 *
 * When Deloitte publishes the final weights, update this array. The
 * Completeness Widget reads from here — no UI changes needed.
 *
 * CoS is NOT listed as a document because it's structured payload, not
 * an uploaded document. CoS presence is checked via RULE-W01 (sponsorship)
 * not the completeness rule.
 */
export const SKILLED_WORKER_COMPLETENESS: CompletenessConfig = {
  visa_type: 'skilled_worker',
  display_name: 'Skilled Worker — Phase 1',
  threshold: 70,
  documents: [
    {
      type: 'PASSPORT',
      weight: 20,
      required: true,
      label: 'Passport',
      description: 'Valid passport with at least 6 months remaining',
    },
    {
      type: 'EMPLOYMENT_LETTER',
      weight: 15,
      required: true,
      label: 'Employment Letter',
      description: 'Letter from UK employer confirming job offer',
    },
    {
      type: 'PAYSLIP',
      weight: 15,
      required: true,
      label: 'Payslips (3 months)',
      description: 'Most recent 3 months of payslips',
    },
    {
      type: 'BANK_STATEMENT',
      weight: 15,
      required: true,
      label: 'Bank Statement',
      description: 'Statement showing £1,270 held for 28 consecutive days',
    },
    {
      type: 'IELTS_CERTIFICATE',
      weight: 10,
      required: true,
      label: 'English Language Certificate',
      description: 'IELTS, PTE, or equivalent at CEFR B2+',
    },
    {
      type: 'DEGREE_CERTIFICATE',
      weight: 10,
      required: true,
      label: 'Degree Certificate',
      description: 'Academic qualification at RQF 6+ (or ENIC comparability)',
    },
    {
      type: 'P60_TAX',
      weight: 5,
      required: false,
      label: 'P60 / Tax Document',
      description: 'Most recent tax year P60 (supports payslip verification)',
    },
    {
      type: 'TB_CERTIFICATE',
      weight: 5,
      required: false,
      conditional_on: 'nationality in tb_test_countries',
      label: 'TB Certificate',
      description: 'Required only for nationals of countries in Appendix T',
    },
    {
      type: 'UTILITY_BILL',
      weight: 3,
      required: false,
      label: 'Utility Bill / Proof of Address',
      description: 'Recent utility bill for address verification',
    },
    {
      type: 'POLICE_CERTIFICATE',
      weight: 2,
      required: false,
      label: 'Police Certificate',
      description: 'Criminal record certificate (where required by role)',
    },
  ],
}

// ============================================================================
// REGISTRY
// ============================================================================

/**
 * Registry of completeness configs per visa type. Populated incrementally —
 * only Skilled Worker is defined in Phase 1.
 */
const CONFIG_REGISTRY: Partial<Record<VisaType, CompletenessConfig>> = {
  skilled_worker: SKILLED_WORKER_COMPLETENESS,
  // student: STUDENT_COMPLETENESS,            // future
  // global_talent: GLOBAL_TALENT_COMPLETENESS, // future
  // family: FAMILY_COMPLETENESS,              // future
}

/**
 * Look up the completeness config for a visa type.
 * Returns undefined if no config exists yet for that visa type.
 */
export function getCompletenessConfig(visaType: VisaType): CompletenessConfig | undefined {
  return CONFIG_REGISTRY[visaType]
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Compute the completeness score for a given set of present documents.
 * Mirrors what RULE-W13 does in Drools — useful for client-side preview
 * before DIS responses arrive (e.g., showing progress while applicant uploads).
 *
 * @param config The completeness config for the visa type
 * @param presentDocumentTypes Set/array of document types that have been uploaded & extracted
 * @returns Score 0-100
 */
export function calculateCompletenessScore(
  config: CompletenessConfig,
  presentDocumentTypes: Iterable<DocumentType>,
): number {
  const present = new Set(presentDocumentTypes)
  let score = 0
  for (const doc of config.documents) {
    if (present.has(doc.type)) {
      score += doc.weight
    }
  }
  // Clamp to [0, 100] in case weights ever sum > 100
  return Math.min(100, Math.max(0, score))
}

/**
 * Returns the list of required documents that are missing from the given
 * set. Useful for the "Missing Documents" display in the Completeness Widget.
 */
export function getMissingRequiredDocuments(
  config: CompletenessConfig,
  presentDocumentTypes: Iterable<DocumentType>,
): CompletenessDocument[] {
  const present = new Set(presentDocumentTypes)
  return config.documents.filter((d) => d.required && !present.has(d.type))
}

/**
 * Returns true if the application passes the completeness threshold.
 * Equivalent to RULE-W13 output: score >= threshold means PASS, else FAIL.
 */
export function isCompletenessPassing(
  config: CompletenessConfig,
  presentDocumentTypes: Iterable<DocumentType>,
): boolean {
  return calculateCompletenessScore(config, presentDocumentTypes) >= config.threshold
}
