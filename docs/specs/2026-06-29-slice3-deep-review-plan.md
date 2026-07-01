# Slice 3 — Deep Review (per-case, corpus-backed) — agreed plan

**Date:** 2026-06-29 · **Owners:** Sam (Agent 1, app wiring) + Lenny (corpus). **Status:** agreed, logged; implementation after the pit stop.

## Goal / UX target (Chris, 29 Jun)
`/dashboard/reviewer/<deep_set_id>` opens **the same 4-panel reviewer experience** as the `VK-2024-1835` demo page — **Recommendation Summary · Glass Box Trace · Evidence · OV Intelligence** — but **populated from the enriched deep_set case, not the generic mock.** The demo becomes: *click a real queued application → same reviewer UI → applicant-specific rules, docs, external checks, OV reasoning, and the RFI/decision flow.*

## Decision: **B — enrich the corpus** (locked)
Enrich the **18 deep_set cases** (NOT the 1,000 bulk) up to full `DISApplicationView` level + rich `OVAssessment`, so the panels render real per-case data with a **trivial adapter**. **Not C** (reusing a generic mock weakens the first-time trust beat — users spot non-applicant-specific detail). **A (synthesize)** is a *temporary fallback only* if the corpus update can't be done quickly — treat as a throwaway adapter, not the clean design.

## Phases
- **3.0 — Lenny: enrich + validate the deep_set contract** (the brief below). *Runs first, in parallel with the pit stop.*
- **3a — Sam: map deep_set → `DISApplicationView` + open cases.** `AmsDemoProvider.getApplicationById(<deep_set_id>)` returns the enriched view; the reviewer page loads it for ams-demo deep_set ids → all 4 panels render per-case. (Today it returns `null` → dead-ends.)
- **3b — RFI lifecycle hero flow.** The 3 RFI heroes (e.g. `HO-SW-DEEP-2026-00012`, "missing payslip month 2"): officer reviews → flags the gap → issues RFI → case parks (`Awaiting Info`/`AWAITING_INFO`) → applicant responds (response artifact) → re-review → decide. The human-in-control trust beat.
- **3c — OV-panel polish.** The 4 notes: score↔risk polarity, generic-donut hero redesign, attention-routing (supporting-vs-tempering factor chips), sticky-action-bar overlaps the panel footer; + the scenario-consistent OV now real per-case.

---

## 3.0 — deep_set enrichment contract (the brief for Lenny)
For **each of the 18** `data/demo-corpus/deep_set/applications/*.json`, add two objects, scenario-consistent with the case's existing `anomaly_type` / `recommendation` / `anomaly_details` / `ground_truth`:

1. **`dis_view`** — a complete **`DISApplicationView`**. Contract: `src/api-contracts/dis.ts:644`. **Complete worked example to match field-for-field: `src/lib/mockDISData.ts`.** Must include:
   - `recommendation` (`DISRecommendation`): `recommendation` outcome, `rules_summary` (drools/opa/external_checks counts + completeness), `evaluation_breakdown` (per-engine prose), `hard_fail_rules`/`soft_flag_rules`, `note`, versions, `generated_at`.
   - **`rule_results: DroolsRuleResult[]`** — the **per-rule Glass Box trace** (each: `rule_id`, `rule_name`, `rule_category`, `outcome` SATISFIED/FAILED/REVIEW_REQUIRED/NOT_APPLICABLE, `severity`, `reasoning` (applicant-specific!), `evidence_refs`).
   - `opa_results: OPAPolicyResult[]` (incl. `denial_reasons` where denied/flagged).
   - `external_checks: ExternalCheckResult[]` (the 7 checks incl. CoS + PNC where relevant; `response_payload`, `risk_level`).
   - `document_extractions: DocumentExtraction[]` (per-doc extracted fields + `fraud_signals` + extraction confidence) and `documents`.
   - `llm_summary` (the post-decision narrative), `source_application_id`/`source_reference`/`dis_application_id`/`submitted_at`, `queue_state`.

2. **`ov_assessment`** — upgrade the current bands-only object to a rich **`OVAssessment`**. Contract: `src/api-contracts/ov.ts`. Must include: `model_version`, `overall` {`risk_band`, `score` 0–100, `summary` (applicant-specific narrative)}, `recommendation`, and **`dimensions[3]`** = rootedness / intent / credibility, each {`key`, `label`, `score`, `status`, `reasoning` (applicant-specific), `factors[]`}.

**Scenario-consistency rules:**
- `clean` → all rules SATISFIED, recommendation RECOMMEND_APPROVE, OV LOW risk / high score, all checks CLEAR, completeness COMPLETE.
- `fail_rules` → ≥1 rule FAILED (with the real failing reason in `reasoning` + `denial_reasons`), RECOMMEND_REJECT, OV elevated risk, `hard_fail_rules` populated.
- `suspicious` / `edge_case` → MANUAL_REVIEW, soft flags (REVIEW_REQUIRED / OPA flag), OV MEDIUM with tempering factors.
- **RFI heroes** (3): MANUAL_REVIEW + a **completeness gap** reflecting `rfi_lifecycle.removed_initial_document` (the missing doc shows as missing/insufficient in `completeness.missing_or_insufficient` + the `document_extractions`), so the officer can genuinely flag → RFI → resolve on the response artifact.

**Output:** keep the existing keys; add `dis_view` + the upgraded `ov_assessment`. Validate every `dis_view` against the `DISApplicationView` type (it should drop into the reviewer panels with no shape errors) and emit an updated `integrity_report.json`.

**Scope guard:** only the 18 `deep_set/` cases. The 1,000 `bulk/` set stays as-is (queue/allocation only).

---

## 3.0 — AUTHORITATIVE (Lenny's refined brief, 29 Jun — supersedes the draft above)

**Source of truth:** `src/api-contracts/dis.ts:637` (`DISApplicationView`) · `src/api-contracts/ov.ts:27` (`OVAssessment`) · `src/lib/mockDISData.ts:22` (complete worked example).
**Blocker this unblocks (for 3a):** the reviewer page passes `syntheticOvAssessment()` directly at `src/app/dashboard/reviewer/[applicationId]/page.tsx:358` (and uses `mockDISApplicationView`) — **3a swaps both for the per-case enriched data.**

Enrich **each of the 18** `data/demo-corpus/deep_set/applications/*.json` with a top-level **`dis_application_view`** object + an `ov_assessment` object — **applicant-specific** (do NOT clone the mock's Rani Kumari detail).

**`dis_application_view`** (match `DISApplicationView`):
- **`recommendation`** (full `DISRecommendation`): canonical `RECOMMEND_APPROVE` / `RECOMMEND_REJECT` / `MANUAL_REVIEW` + `recommendation_reason`, `evaluation_breakdown`, `hard_fail_rules`, `soft_flag_rules`, `rules_summary`, `completeness_score`, `completeness_status`, `generated_at`, `drools_version`, `opa_version`, `note`.
- **`component_scores`** — all **9** keys: `passport`, `financial`, `employment`, `english_language`, `immigration_compliance`, `criminal_record`, `health`, `document_quality`, `fraud_risk` (null only when genuinely N/A).
- **`rule_results`** — full per-rule Drools trace (not counts): `rule_id`, `rule_name`, `rule_category`, `outcome`, `severity`, `reasoning`, `evidence_refs`, optional `remediation`.
- **`opa_results`** — full 12-policy trace where possible: `policy_id`, `policy_name`, `policy_type`, `outcome`, `denial_reasons`.
- **`external_checks`** — canonical **7**: `WORLDCHECK`, `INTERPOL`, `PASSPORT_VERIFY`, `BORDER_CONTROL`, `DEVICE_IP_RISK`, `EMAIL_PHONE_REPUTATION`, `COS_CHECK`.
- **`documents`** + **`document_extractions`** (linked by `document_id`).
- **metadata:** `queue_state`, `source_application_id`, `source_reference`, `source_channel`, `dis_application_id`, `submitted_at`.

**`ov_assessment`** (match `OVAssessment` exactly): `overall.risk_band` (LOW|MEDIUM|HIGH), `overall.score` (0–100, **higher = stronger / lower-risk**), `overall.summary`, `recommendation`, and **exactly 3 dimensions** — `rootedness`, `intent`, `credibility` — each with `label`, `score`, `status`, `reasoning`, `factors[]`.

**Gotchas:**
- Source corpus uses `visa_type: "skilled-worker"`; AMS normalises it — **do NOT rename the source corpus globally.**
- Corpus docs use `PAYSLIPS`; the DIS contract expects **`PAYSLIP`** — use `PAYSLIP` in `dis_application_view`.
- **Counts must reconcile:** `rules_summary` must match the actual `rule_results` / `opa_results` / `external_checks`; flag arrays (`hard_fail_rules` / `soft_flag_rules`) must correspond to the actual failed/review/flag rows.
- **Applicant-specific per case** (scenario-consistent with `anomaly_type` / `recommendation` / `ground_truth`).

**ACCEPTANCE BAR:** Sam can map one deep-set ID → `DISApplicationView` + `OVAssessment`, open `/dashboard/reviewer/<id>`, and render **all four panels without falling back to `mockDISApplicationView` or `syntheticOvAssessment()`.**
