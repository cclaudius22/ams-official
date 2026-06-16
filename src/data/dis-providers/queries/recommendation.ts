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
 *   - queue_state via deriveQueueState(status, outcome, callbackDelivered) where
 *     callbackDelivered = EXISTS a DELIVERED callback_events row.
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
  callback_delivered: boolean
}

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
        r.submission_payload,
        EXISTS (
          SELECT 1 FROM callback_events c
           WHERE c.dis_application_id = a.dis_application_id
             AND c.status = 'DELIVERED'
        ) AS callback_delivered
       FROM applications a
       JOIN applicants ap ON ap.applicant_id = a.applicant_id
       JOIN recommendations r ON r.dis_application_id = a.dis_application_id
      WHERE a.source_application_id = $1
      LIMIT 1`,
    [sourceApplicationId],
  )

  const row = rows[0]
  if (!row) return null

  const payload = row.submission_payload ?? {}

  // completeness_status: prefer the application's status verdict (a
  // CompletenessStatus once doc-processing has run); fall back to the payload.
  const completenessStatus: CompletenessStatus =
    (payload.completeness_status as CompletenessStatus | undefined) ??
    (row.status as CompletenessStatus)

  const recommendation: DISRecommendation = {
    recommendation_id: row.recommendation_id,
    recommendation: row.outcome,
    recommendation_reason: payload.recommendation_reason ?? '',
    caseworker_summary: row.caseworker_summary,
    evaluation_breakdown: payload.evaluation_breakdown,
    hard_fail_rules: row.hard_fail_rules ?? [],
    soft_flag_rules: row.soft_flag_rules ?? [],
    rules_summary: payload.rules_summary as RulesSummary,
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
    callbackDelivered: row.callback_delivered,
  })

  return {
    recommendation,
    component_scores: (payload.component_scores ?? {}) as ComponentScores,
    source_channel: row.source_channel,
    queue_state: queueState,
    source_application_id: row.source_application_id,
    source_reference: row.source_application_id,
    dis_application_id: row.dis_application_id,
    submitted_at: toIso(row.submitted_at),
  }
}
