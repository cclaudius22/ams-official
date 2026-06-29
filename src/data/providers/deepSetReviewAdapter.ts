/**
 * Deep-set review adapter (Slice 3a).
 *
 * Maps a raw enriched `deep_set` corpus record → the per-case payload the
 * reviewer page renders across its four panels:
 *   Panels 1–3 (Recommendation · Glass Box · Evidence) ← `DISApplicationView`
 *   Panel 4    (OV Intelligence)                       ← `OVAssessment`
 *
 * Lenny's 3.0 enrichment writes a complete `dis_application_view`
 * (a DISApplicationView, field-for-field per src/api-contracts/dis.ts:644 /
 * the src/lib/mockDISData.ts worked example) and a rich top-level
 * `ov_assessment` (an OVAssessment per src/api-contracts/ov.ts) onto each of the
 * 18 deep_set cases. So this is a VALIDATE-AND-PASS-THROUGH, not a synthesis:
 * we hand the panels exactly what the pipeline produced, applicant-specific.
 *
 * Degradation: returns null when a record is not deep-reviewable (no usable
 * `dis_application_view`) so the provider/page fall back to the existing path
 * instead of crashing a panel on a half-written or unenriched file.
 */
import type { DISApplicationView } from '@/api-contracts/dis'
import type { OVAssessment } from '@/api-contracts/ov'

/** The per-case reviewer payload for one ams-demo deep_set application. */
export interface DeepSetReview {
  disView: DISApplicationView
  /**
   * null only when the corpus record carries no valid `ov_assessment` — then the
   * page falls back to the synthetic OV. Always present for the enriched 18.
   */
  ovAssessment: OVAssessment | null
}

/**
 * Optional capability mixin implemented by AmsDemoProvider. Lets the API route
 * serve the deep review without importing/binding the concrete provider class
 * (the active provider is env-selected via getDataProvider()).
 */
export interface DeepSetReviewCapable {
  getDeepSetReview(id: string): Promise<DeepSetReview | null>
}

export function hasDeepSetReviewCapability(p: unknown): p is DeepSetReviewCapable {
  return !!p && typeof (p as { getDeepSetReview?: unknown }).getDeepSetReview === 'function'
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * A `dis_application_view` is usable only if it carries the fields the four
 * panels read WITHOUT null guards — `recommendation` (+ `rules_summary`) and the
 * `rule_results` / `opa_results` / `external_checks` / `component_scores` blocks
 * (see the per-panel field audit). A record missing any of these would crash a
 * panel, so we treat it as not-deep-reviewable rather than render a broken page.
 */
function isUsableDisView(v: unknown): v is DISApplicationView {
  if (!isObject(v)) return false
  const rec = v.recommendation
  return (
    isObject(rec) &&
    isObject((rec as Record<string, unknown>).rules_summary) &&
    Array.isArray(v.rule_results) &&
    Array.isArray(v.opa_results) &&
    Array.isArray(v.external_checks) &&
    isObject(v.component_scores)
  )
}

/** A usable OVAssessment carries the overall ring (band + score) and dimensions. */
function isUsableOv(v: unknown): v is OVAssessment {
  if (!isObject(v)) return false
  const overall = v.overall
  return (
    isObject(overall) &&
    typeof (overall as Record<string, unknown>).risk_band === 'string' &&
    typeof (overall as Record<string, unknown>).score === 'number' &&
    typeof v.recommendation === 'string' &&
    Array.isArray(v.dimensions)
  )
}

export function mapDeepSetReview(raw: unknown): DeepSetReview | null {
  if (!isObject(raw)) return null
  const disView = raw.dis_application_view
  if (!isUsableDisView(disView)) return null
  const ov = raw.ov_assessment
  return {
    disView,
    ovAssessment: isUsableOv(ov) ? ov : null,
  }
}
