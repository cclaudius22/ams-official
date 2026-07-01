import type { ExternalCheckResult } from '@/api-contracts/dis'

/**
 * PNC (Police National Computer) — OV Phase-1 MOCK external check.
 *
 * DIS does NOT emit a PNC check (it produces the 7 external checks in the
 * external_checks CHECK constraint; PNC is not one of them). The AMS read layer
 * synthesises a CLEAR PNC result so the criminal-record evidence is complete for
 * Phase-1 demos — the UK police-records check a caseworker expects to see.
 *
 * It is deliberately NOT counted in the Glass Box "external checks evaluated"
 * total (rules_summary), which reflects only what DIS actually ran — so the
 * trace stays an honest record of the pipeline while the evidence view shows
 * the full intended product.
 *
 * ⚠️ PRODUCTION BLOCKER: replace with a real PNC integration, or remove — a
 * synthesised "CLEAR" must never be shown on a live applicant. Tracked in
 * docs/LAUNCH_BLOCKERS.md (LB-1).
 */
export function syntheticPncCheck(disApplicationId: string): ExternalCheckResult {
  return {
    check_id: `pnc-${disApplicationId}`,
    dis_application_id: disApplicationId,
    document_id: null,
    check_type: 'PNC_CHECK',
    check_status: 'CLEAR',
    risk_level: 'NONE',
    confidence_score: 1.0,
    flags: {},
    response_payload: {
      pnc_searched: true,
      convictions: [],
      cautions: [],
      pending_prosecutions: [],
      warning_markers: [],
      data_source: 'Police National Computer',
    },
    response_time_ms: 700,
    created_at: '2026-04-10T10:00:03Z',
  }
}
