/**
 * E2 — recommendation core read (task 2F.3).
 *
 * Returns the recommendation slice of the DISApplicationView (no detail
 * arrays) for one AMS-facing source_application_id. The detail tables are
 * keyed by the DIS UUID (dis_application_id), so we resolve via the
 * applications row and filter on applications.source_application_id.
 *
 * Data sourcing (V5 §5, confirmed against scripts/seedReplica.ts + live psql):
 *   - recommendations.submission_payload is the FULL callback blob
 *     (DISRecommendationCallback). Its top-level fields ARE the DISRecommendation
 *     narrative fields (recommendation_reason, evaluation_breakdown,
 *     rules_summary, completeness_score/status, generated_at, note) plus the
 *     bare DroolsVersionRecord[] / OPAVersionRecord[] arrays. We read those
 *     straight from the payload.
 *       ⚠️ The recommendations.drools_version / opa_version COLUMNS are wrapped
 *          as { version: [...] }, so we deliberately take the bare arrays from
 *          the payload, which match DISRecommendation.drools_version exactly.
 *   - recommendation outcome, caseworker_summary, hard_fail_rules,
 *     soft_flag_rules, recommendation_at, recommendation_id come from the
 *     recommendations COLUMNS.
 *   - component_scores reads the RICH map at submission_payload->'component_scores'
 *     (ComponentScores: per-component status/confidence/rule_results/…), NOT the
 *     flat score-only recommendations.component_scores column.
 *   - completeness_score from applications.completeness_score; completeness_status
 *     from applications.status (a CompletenessStatus once doc-processing has run).
 *   - source_channel from applications.source_channel.
 *   - queue_state via deriveQueueState(status, outcome) — Phase 1 maps every
 *     processed app to READY_FOR_REVIEW; callback delivery is not consulted.
 *   - source_reference reuses source_application_id (no separate column).
 *   - submitted_at = applications.submitted_at, normalised to ISO 8601.
 */

import { disQuery } from '@/lib/disDb'
import type {
  ComponentScores,
  DISRecommendation,
  DISApplicationStatus,
  RecommendationOutcome,
  CompletenessStatus,
  DroolsVersionRecord,
  OPAVersionRecord,
  RulesSummary,
  SourceChannel,
} from '@/api-contracts/dis'
import type { DISRecommendationCore } from '../index'
import { deriveQueueState } from '../queueState'

/** The verbatim callback blob stored in recommendations.submission_payload. */
interface SubmissionPayload {
  recommendation_reason?: string
  evaluation_breakdown?: DISRecommendation['evaluation_breakdown']
  rules_summary?: RulesSummary
  completeness_status?: CompletenessStatus
  component_scores?: ComponentScores
  generated_at?: string
  drools_version?: DroolsVersionRecord[]
  opa_version?: OPAVersionRecord[]
  note?: string
}

interface RecommendationCoreRow {
  dis_application_id: string
  source_application_id: string
  source_channel: SourceChannel
  status: DISApplicationStatus
  completeness_score: number | null
  submitted_at: Date | string
  outcome: RecommendationOutcome
  caseworker_summary: string | null
  hard_fail_rules: string[] | null
  soft_flag_rules: string[] | null
  recommendation_at: Date | string
  recommendation_id: string
  submission_payload: SubmissionPayload | null
}

/** Zeroed fallbacks for submission_payload fields that are non-optional on the
 *  view but optional in the blob — keeps an undefined from slipping past an
 *  `as` cast and crashing a consumer (e.g. Panel 2 destructuring rules_summary). */
const EMPTY_RULES_SUMMARY: RulesSummary = {
  rules: { drools_rules_evaluated: 0, drools_rules_passed: 0, drools_rules_failed: 0, drools_rules_not_applicable: 0 },
  opa_policies: {
    opa_total_evaluated: 0, opa_total_passed: 0, opa_total_failed: 0,
    opa_hard_evaluated: 0, opa_hard_passed: 0, opa_hard_failed: 0,
    opa_soft_evaluated: 0, opa_soft_passed: 0, opa_soft_failed: 0,
  },
  external_checks: { external_checks_evaluated: 0, external_checks_passed: 0, external_checks_failed: 0, external_checks_error: 0 },
}

const EMPTY_COMPONENT_SCORES: ComponentScores = {
  passport: null, financial: null, employment: null, english_language: null,
  immigration_compliance: null, criminal_record: null, health: null,
  document_quality: null, fraud_risk: null,
}

const COMPLETENESS_STATUSES: CompletenessStatus[] = ['COMPLETE', 'INCOMPLETE_PENDING', 'DOCUMENTS_REQUIRED']

/** Normalise a pg timestamptz (Date or string) to an ISO 8601 string. */
function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

export async function queryRecommendationCore(
  sourceApplicationId: string,
): Promise<DISRecommendationCore | null> {
  const rows = await disQuery<RecommendationCoreRow>(
    `SELECT
        a.dis_application_id,
        a.source_application_id,
        a.source_channel,
        a.status,
        a.completeness_score,
        a.submitted_at,
        r.outcome,
        r.caseworker_summary,
        r.hard_fail_rules,
        r.soft_flag_rules,
        r.recommendation_at,
        r.recommendation_id,
        r.submission_payload
       FROM applications a
       JOIN recommendations r ON r.dis_application_id = a.dis_application_id
      WHERE a.source_application_id = $1
      LIMIT 1`,
    [sourceApplicationId],
  )

  const row = rows[0]
  // Rec-gated by design: a no-recommendation app (still mid-pipeline) has no
  // recommendation detail to show, so E2/view return 404. The queue + reviewer
  // page handle that (reset-to-mock + cancellation), not a silent stale view.
  if (!row) return null

  const payload = row.submission_payload ?? {}

  // completeness_status: prefer the payload's verdict, else applications.status
  // (a CompletenessStatus once doc-processing has run). status can still be
  // 'CREATED' (not a CompletenessStatus) on a not-yet-processed app, so guard.
  const rawCompleteness = payload.completeness_status ?? row.status
  const completenessStatus: CompletenessStatus = COMPLETENESS_STATUSES.includes(
    rawCompleteness as CompletenessStatus,
  )
    ? (rawCompleteness as CompletenessStatus)
    : 'INCOMPLETE_PENDING'

  const recommendation: DISRecommendation = {
    recommendation_id: row.recommendation_id,
    recommendation: row.outcome,
    recommendation_reason: payload.recommendation_reason ?? '',
    caseworker_summary: row.caseworker_summary,
    evaluation_breakdown: payload.evaluation_breakdown,
    hard_fail_rules: row.hard_fail_rules ?? [],
    soft_flag_rules: row.soft_flag_rules ?? [],
    rules_summary: payload.rules_summary ?? EMPTY_RULES_SUMMARY,
    completeness_score: row.completeness_score ?? 0,
    completeness_status: completenessStatus,
    generated_at: payload.generated_at ?? toIso(row.recommendation_at),
    recommendation_at: toIso(row.recommendation_at),
    drools_version: payload.drools_version ?? [],
    opa_version: payload.opa_version ?? [],
    note: payload.note ?? '',
  }

  const queueState = deriveQueueState({
    status: row.status,
    recommendationOutcome: row.outcome,
  })

  return {
    recommendation,
    component_scores: payload.component_scores ?? EMPTY_COMPONENT_SCORES,
    source_channel: row.source_channel,
    queue_state: queueState,
    source_application_id: row.source_application_id,
    source_reference: row.source_application_id,
    dis_application_id: row.dis_application_id,
    submitted_at: toIso(row.submitted_at),
  }
}
