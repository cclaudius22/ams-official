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
