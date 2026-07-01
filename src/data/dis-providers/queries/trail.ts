/**
 * E3 — Glass Box trail read (DIS read layer, task 2F.3).
 *
 * Reads the full per-application rule + policy trail straight from the
 * drools_evaluations and opa_evaluations TABLES (NOT the callback blob), keyed
 * by the AMS-facing source_application_id. Reading from the tables is what
 * makes opa_results[].denial_reasons + input_context available — the callback
 * omits denial_reasons, and Panel 2 renders them (api-contracts/dis.ts §320).
 *
 * Keying: input is source_application_id (e.g. 'HO-SW-...' / 'VK-...'); the
 * detail tables are keyed by dis_application_id (UUID), so we JOIN through
 * applications and filter on source_application_id. Returns null when no
 * application matches that id.
 */

import { disQuery } from '@/lib/disDb'
import type { DroolsRuleResult, OPAPolicyResult } from '@/api-contracts/dis'
import type { DISTrail } from '../index'

/** Raw drools_evaluations shape as `pg` returns it (TEXT[] -> string[],
 *  TIMESTAMPTZ -> Date, nullable TEXT -> string | null). */
interface DroolsRow {
  rule_result_id: string
  rule_id: DroolsRuleResult['rule_id']
  rule_name: string
  rule_category: DroolsRuleResult['rule_category']
  outcome: DroolsRuleResult['outcome']
  severity: DroolsRuleResult['severity']
  reasoning: string | null
  remediation: string | null
  evidence_refs: string[] | null
  rule_version_id: string
  created_at: Date
}

/** Raw opa_evaluations shape as `pg` returns it (TEXT[] -> string[],
 *  JSONB -> object, TIMESTAMPTZ -> Date). */
interface OpaRow {
  policy_id: OPAPolicyResult['policy_id']
  policy_name: string
  policy_type: OPAPolicyResult['policy_type']
  outcome: OPAPolicyResult['outcome']
  denial_reasons: string[] | null
  input_context: Record<string, unknown> | null
  policy_version_id: string | null
  created_at: Date
}

/** Postgres returns TIMESTAMPTZ as a JS Date; the contract wants ISO 8601. */
function toIso(value: Date | string | null): string | undefined {
  if (value == null) return undefined
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

export async function queryTrail(sourceApplicationId: string): Promise<DISTrail | null> {
  // Resolve the application first so an unknown id returns null (rather than
  // an empty-but-non-null trail).
  const appRows = await disQuery<{ dis_application_id: string }>(
    `SELECT dis_application_id FROM applications WHERE source_application_id = $1 LIMIT 1`,
    [sourceApplicationId],
  )
  if (appRows.length === 0) return null
  const disApplicationId = appRows[0].dis_application_id

  const [ruleRows, opaRows] = await Promise.all([
    disQuery<DroolsRow>(
      `SELECT rule_result_id, rule_id, rule_name, rule_category, outcome, severity,
              reasoning, remediation, evidence_refs, rule_version_id, created_at
         FROM drools_evaluations
        WHERE dis_application_id = $1
        ORDER BY rule_id`,
      [disApplicationId],
    ),
    disQuery<OpaRow>(
      `SELECT policy_id, policy_name, policy_type, outcome,
              denial_reasons, input_context, policy_version_id, created_at
         FROM opa_evaluations
        WHERE dis_application_id = $1
        ORDER BY policy_id`,
      [disApplicationId],
    ),
  ])

  const rule_results: DroolsRuleResult[] = ruleRows.map((r) => ({
    rule_result_id: r.rule_result_id,
    rule_id: r.rule_id,
    rule_name: r.rule_name,
    rule_category: r.rule_category,
    outcome: r.outcome,
    severity: r.severity,
    reasoning: r.reasoning ?? '',
    ...(r.remediation != null ? { remediation: r.remediation } : {}),
    evidence_refs: r.evidence_refs ?? [],
    rule_version_id: r.rule_version_id,
    created_at: toIso(r.created_at),
  }))

  const opa_results: OPAPolicyResult[] = opaRows.map((o) => ({
    policy_id: o.policy_id,
    policy_name: o.policy_name,
    policy_type: o.policy_type,
    outcome: o.outcome,
    denial_reasons: o.denial_reasons ?? [],
    ...(o.input_context != null ? { input_context: o.input_context } : {}),
    ...(o.policy_version_id != null ? { policy_version_id: o.policy_version_id } : {}),
    created_at: toIso(o.created_at),
  }))

  return { rule_results, opa_results }
}
