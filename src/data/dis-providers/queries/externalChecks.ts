/**
 * E5 — external_checks read for the DIS replica (task 2F.3).
 *
 * Keyed on the AMS-facing source_application_id (e.g. 'VK-2026-RK-4821' /
 * 'HO-SW-...'), NOT the DIS UUID. The external_checks table is keyed by
 * dis_application_id, so we JOIN applications and filter on
 * source_application_id.
 *
 * As-built pipeline emits 7 external_checks rows per application
 * (db/ddl/06_external_checks.sql CHECK; COS_CHECK is the 7th — Certificate of
 * Sponsorship). Returns null when no application matches the given source id (distinct
 * from an application that exists but happens to have no rows, which returns
 * []).
 */

import { disQuery } from '@/lib/disDb'
import type { ExternalCheckResult, ExternalCheckType, CheckStatus } from '@/api-contracts/dis'

/** Raw shape of a joined external_checks row as it comes back from pg. */
interface ExternalCheckRow {
  check_id: string
  dis_application_id: string
  document_id: string | null
  check_type: ExternalCheckType
  check_status: CheckStatus
  risk_level: ExternalCheckResult['risk_level'] | null
  // NUMERIC(5,4) — cast to float8 in SQL so pg yields a number, not a string.
  confidence_score: number | null
  flags: Record<string, unknown> | null
  response_payload: Record<string, unknown> | null
  response_time_ms: number | null
  created_at: Date | string
}

export async function queryExternalChecks(
  sourceApplicationId: string,
): Promise<ExternalCheckResult[] | null> {
  // Resolve the application first so a missing id returns null (a JOIN-only
  // query couldn't distinguish "no app" from "app with zero checks").
  const apps = await disQuery<{ dis_application_id: string }>(
    `SELECT dis_application_id FROM applications WHERE source_application_id = $1`,
    [sourceApplicationId],
  )
  if (apps.length === 0) return null

  const disApplicationId = apps[0].dis_application_id

  const rows = await disQuery<ExternalCheckRow>(
    `SELECT
        ec.check_id,
        ec.dis_application_id,
        ec.dis_document_id      AS document_id,
        ec.check_type,
        ec.check_status,
        ec.risk_level,
        ec.confidence_score::float8 AS confidence_score,
        ec.flags,
        ec.response_payload,
        ec.response_time_ms,
        ec.created_at
      FROM external_checks ec
      WHERE ec.dis_application_id = $1
      ORDER BY ec.check_type`,
    [disApplicationId],
  )

  return rows.map((r) => ({
    check_id: r.check_id,
    dis_application_id: r.dis_application_id,
    document_id: r.document_id,
    check_type: r.check_type,
    check_status: r.check_status,
    risk_level: r.risk_level as ExternalCheckResult['risk_level'],
    confidence_score: r.confidence_score ?? 0,
    flags: r.flags ?? {},
    response_payload: r.response_payload ?? {},
    response_time_ms: r.response_time_ms ?? 0,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : new Date(r.created_at).toISOString(),
  }))
}
