# DIS APIs the AMS frontend depends on

**Status:** canonical reference · **Last updated:** 2026-06-21
**Source of truth:** Deloitte's *Updated API Spec* (Consolidated WBS, 19 June 2026, items 78–83) reconciled against our read-layer contracts (`src/api-contracts/dis.ts`) and the V5 §6 integration spec.

This is the **complete set of DIS read APIs the officer dashboard consumes.** The frontend never calls Deloitte directly — it calls our own Next.js routes, which sit behind the `DISDataProvider` seam (`mock` | `replica` | future `deloitte`). This doc records what those routes ultimately depend on so the contract is versioned, not buried in chat.

> **We are not blocked on Deloitte.** Per WBS Assumption A7, all five endpoints are "code ready, **migration pending to OV env**," scheduled next sprint, and **excluded from the 29–30 June E2E run**. The local Postgres replica + provider seam exist precisely so the dashboard is buildable and demoable without them.

---

## The five endpoints

| # | Deloitte endpoint (`/api/v1/…`) | Our proxy route (`/api/dis/…`) | Feeds (UI) | Deloitte PG tables |
|---|---|---|---|---|
| 1 | `GET /applications/status?startDateTime={}&endDateTime={}` | `GET /applications` | **Panel 1** — review queue | `applications`, `recommendations` |
| 2 | `GET /app_decision/{id}/details` | `GET /applications/[id]` | Header + **Recommendation summary** | `recommendations`, `callback_events` |
| 3 | `GET /rules_evaluations/{id}/details` | `GET /applications/[id]/trail` | **Panel 2 — Glass Box decision trail** (demo centrepiece) | `drools_evaluations`, `opa_evaluations` |
| 4 | `GET /doc_processing/{id}/details` | `GET /applications/[id]/documents` | **Panel 3 — Evidence** | `documents`, `document_extractions` |
| 5 | `GET /external_checks/{id}/details` | `GET /applications/[id]/external-checks` | **Panel 3 — Evidence** | `external_checks` |

Plus our composite `GET /applications/[id]/view` — a **client-side** assembly of 2–5, not a Deloitte endpoint.

### Response shapes (Deloitte's spec)

1. **Queue** — `dis_application_id, visa_type, status, completeness_score, callback_url, outcome, total_processing_time_ms`
2. **Recommendation** — `dis_application_id, outcome, recommendation_at, component_scores, soft_flag_rules, callback_url, status`
3. **Glass Box trail** — `dis_application_id`, `drool_evaluation { rule_id, rule_name, rule_category, outcome, severity, reasoning, rule_version_id, evaluated_at }`, `opa_evaluation { policy_name, policy_type, outcome, denial_reasons }`
4. **Documents** — `dis_application_id, document_type, requirement_tier, processing_tier, criticality, processing_status, quality_score, dlp_classifications, normalized_fields, fraud_score, fraud_status, confidence_score`
5. **External checks** — `dis_application_id, check_type, request_payload, response_payload, check_Status, risk_level, confidence_score, created_at`

### Auth / headers (all five)
- `Authorization: Bearer <token>`
- `X-Source-Channel: <visakey | govdirect>`
- `X-Request-ID: <application_id>` (on the detail calls)

---

## Caveats that shape the frontend (read before building against these)

1. **Multi-source.** The spec hardcodes `X-Source-Channel: visakey`, but the dashboard must take applications from **both `visakey` and `govdirect`**. Each DIS deployment is single-channel and emits one source; the header selects it. Cross-source merge is **OV's** (a deferred moat) — never asked of Deloitte.

2. **Scoring-display policy — consume, don't display.** Endpoints 1, 2, 4, 5 return raw numbers (`completeness_score`, `component_scores`, `quality_score`, `fraud_score`, `confidence_score`). The **per-case officer view shows NO numeric grades** — it is status-led and qualitative (`fraud_status`, fired-rule signals, risk label), with `confidence` used only as a subtle field-level "verify if low" nudge (extraction reliability, not the reserved decision column). Numbers live in **aggregate analytics**, not the case view.

3. **Outcome vocabulary (live contract risk).** The valid values are **`RECOMMEND_APPROVE` / `RECOMMEND_REJECT` / `MANUAL_REVIEW`** — never `APPROVE`/`REJECT`. *Audit finding (20 June):* the rec-engine emits `RECOMMEND_*` on `release/dev`, but the data-layer `recommendations.outcome` `CHECK` still accepts only `APPROVE`/`APPROVED` on every branch — a confirmed contract mismatch. Until Deloitte align it, values may arrive in the wrong vocab; the read layer normalises at the boundary via `normalizeOutcome()`.

4. **Phase 1 = human-in-the-loop.** All three outcomes are advisory and route to a caseworker. The queue binds to the **derived `QueueState`** (`deriveQueueState()` → all processed land in `READY_FOR_REVIEW`), never to raw `applications.status`. `AUTO_RECOMMENDED` / `CALLBACK_SENT` are Phase-2-only.

5. **Path translation.** Deloitte uses `/api/v1/…`; the frontend only ever sees our `/api/dis/applications/…`. The provider's future `deloitte` mode does the mapping — swapping the data source is a one-line provider change, no UI churn.

6. **`denial_reasons` only on the table.** OPA denial reasons are absent from the callback payload and present only in `opa_evaluations` — the Glass Box trail reads them from endpoint 3, not from the recommendation.

---

## Where this lives in our code
- Contracts: `src/api-contracts/dis.ts`
- Provider seam: `src/data/dis-providers/` (`mock-provider.ts`, `replica-provider.ts`, future `deloitte-provider.ts`)
- Routes: `src/app/api/dis/applications/**`
- Panels: `src/components/application/` (`GlassBoxTracePanel`, `EvidencePanel`, `RecommendationSummaryPanel`, …)
- Replica DDL/seed: `db/`, `scripts/seedReplica.ts`
