# AMS Officer Dashboard — Integration Spec V5

**Date:** 11 June 2026
**Author:** Chris Claudius + Claude Code
**Status:** Single source of truth for **data contracts and integration**. Supersedes V3 (types/contracts) and V4 Sections 2, 8, 9 (data sources). **V4 remains authoritative for dashboard UX** (3-panel layout, accordion, audit trail, admin modules, Hermes, observability/QA).
**Basis:** Unlike V1–V4 (built from Confluence intent), V5 is grounded in audited as-built evidence: Deloitte's repos (5 June snapshot, `dis-api` code on `release/dev` ref `945e9c9`) and the live dev project `prj-dev-dis-9666` (verified 11 June). See `docs/specs/dis-api-route-audit-2026-06-11.md`.

---

## 1. What changed since V4 — the one-paragraph version

The 11 June audit established: **zero officer-facing read endpoints exist** in spec, code, or deployment — the only live surfaces are intake (`POST /api/v1/applications`) and a Status API (`GET /api/v1/applications/{id}/status`, deployed 10 June, in no repo). The live decisions table is named **`recommendations`**. The `applications.status` lifecycle assumed by both V4 and the Officer UI contract doc **does not exist as-built** (Section 4). `REJECTED` is disabled in code. `/api/rules/reload` does not exist. The read layer's ownership is contested (email to Deloitte 11 June, deadline 12 June) — so V5 defines the read contracts **ownership-neutrally**: they are simultaneously our mock layer, Deloitte's build spec if they accept scope, and our own read-service spec if they don't. Phase 2A proceeds on mocks tonight either way.

## 1a. Delta — 12 June morning verification

Deloitte pushed to main on the 9:00 deadline (dis-api main populated 14:01 IST; rec-engine, rules-engine, data-pipeline mains merged same day). **Read endpoints: still zero** — dis-api main routes remain intake POST + status GET; deployed env unchanged. Schema/code changes that supersede the 11 June text below:

| Change | Detail | Supersedes |
|--------|--------|------------|
| Outcome wire vocabulary | DDL CHECK + engine constants now `APPROVE`/`REJECT`/`MANUAL_REVIEW` (imperative). REJECT still disabled (same Phase-1 comments) | §5 recommendation values |
| Callback payload keys | `rule_results`→`drools_evaluations`, `opa_results`→`opa_evaluations` | §5 payload sketch |
| Table names | `rule_results`→`drools_evaluations`, `opa_results`→`opa_evaluations` — DDL in dis-data-layer `feature/psqltable` (old definitions left commented in-file); rec-engine main reads new names with compat aliases | §3 table list |
| `recommendations` DDL confirmed in code | `recommendation_id` PK, `recommendation_at` (was decision_made_at), **new `caseworker_summary TEXT`** (currently echoes recommendation_reason — watch the OV-IP Panel 1 boundary) | §3, OPEN list |
| New table `callback_events` | Per-attempt delivery tracking: PENDING/SENT/DELIVERED/FAILED/RETRYING, attempt_number, payload_hash | §4 queue derivation (CALLBACK_SENT should read this) |
| dis-data-layer no longer empty | `feature/psqltable`: deployable DDL for all 12 tables + deploy scripts — natural read-layer home | §3 note |
| **OPEN-5 answered** | Status API response = pipeline-stage map (9 stages, PENDING/IN_PROGRESS/COMPLETED) + status PROCESSING\|PROCESSED + doc counts + recommendations row; derived from **BigQuery audit events**, not applications.status | §6 endpoint 0 |
| **OPEN-8 (new)** | Status API marks external checks complete at `ext_count == 7` — seven checks, not six. Which is the 7th? — Neeraj | OPEN list |

`applications.status` DDL has **no CHECK constraint** — the §4 lifecycle finding stands; their own Status API works around it the same way QueueState does. Types updated in `src/api-contracts/dis.ts` (Task 2.0c).

## 2. Evidence tiers

Every claim in this spec carries one of:

| Tier | Meaning |
|------|---------|
| **LIVE** | Observed in the deployed dev project (Cloud Run config, live openapi.json) |
| **CODE** | Read from as-built source with file:line evidence |
| **DOC** | From the Officer UI contract doc / Confluence — plausible, not code-verified |
| **OPEN** | Unverified — on the Deloitte question list (Section 12) |

Where tiers conflict, higher wins: LIVE > CODE > DOC.

## 3. As-built ground truth — tables and naming

PostgreSQL `openvisa_pg_db` on Cloud SQL (private IP, IAM auth, KMS field-level encryption on PII). Live table set (CODE, except where noted):

| Table | Key columns (render-relevant) | Written by |
|-------|------------------------------|------------|
| `applications` | dis_application_id (uuid PK), source_application_id, source_channel, visa_type, **status** (see §4), completeness_score, **completeness_trace** (jsonb, incl. missing_documents), **cross_doc_fraud** (jsonb), payload_doc_count, expected_doc_count, processed_doc_count, submitted_at, caseworker_id, callback_url | intake (INSERT); doc-processing (UPDATE) |
| `applicants` | applicant_id, full_name, date_of_birth, nationality, passport_number_hashed, email, phone (**always NULL** — never inserted) | intake |
| `application_payload` | submission jsonb blobs: applicant, passport_data, documents, answers_* (employment carries cosReferenceNumber — **CoS is not a document**) | intake |
| `documents` | dis_document_id, document_type, requirement_tier, processing_tier, criticality, **gcs_path**, processing_status, quality_score, mime_type, file_size_bytes | intake + dispatcher + doc-processing |
| `document_extractions` | extraction_id, dis_document_id, extraction_method, **normalised_fields** (json, KMS), raw_extraction (json, KMS), confidence_score, fraud_score, fraud_status, **fraud_signals** (json) | doc-processing |
| `external_checks` | check_id, check_type, check_status, risk_level, confidence_score, flags (jsonb), response_payload (jsonb), response_time_ms, drools_consumed/opa_consumed (literal `'SCHEDULED_TO_USE'`) | external-checks (upsert) |
| `rule_results` | rule_result_id, rule_id, rule_name, rule_category, **outcome**, severity, **reasoning**, **remediation**, **evidence_refs** (text[]), rule_version_id | Drools AuditService (batch) |
| `opa_results` | policy_id, policy_name, policy_type (HARD/SOFT), outcome, **denial_reasons** (array), input_context (json), policy_version_id | OPA orchestrator |
| **`recommendations`** | dis_application_id, outcome, confidence (**always NULL** as-built), component_scores (**flat** {component: score} map), hard_fail_rules[], soft_flag_rules[], **submission_payload** (jsonb — the full callback, §5), callback_sent_at, callback_status | recommendation engine |
| `policy_versions` / `rule_versions` | file, version_id, status (ACTIVE/SUPERSEDED) | policy-update fn / Drools ledger |

**Naming (LIVE):** the decisions table's live name is `recommendations` (`DB_TABLE_DECISIONS=recommendations` on the deployed Status API). Table names are 100% env-driven with no code defaults — the live value exists only in GitHub repo vars, not in any repo. Use `recommendations` everywhere; the language rule ("DIS recommends, the human decides") now matches the schema itself.

**hard_fail_rules / soft_flag_rules entries** (CODE) mix three id vocabularies: `RULE-*` ids, `OPA-*` policy ids, and `EXT_<check_type>` markers for failed external checks.

## 4. The status lifecycle correction ⚠️ (supersedes V4 §8 AND the contract doc)

**As-built (CODE):** `applications.status` is written exactly twice:

1. Intake INSERTs `CREATED` (`application_creator.py:346`)
2. Doc-processing overwrites it with the **completeness verdict**: `COMPLETE` / `INCOMPLETE_PENDING` / `DOCUMENTS_REQUIRED` (`postgres_store.py:320-334, 410-426`)

**No other service ever updates it.** External checks, Drools, OPA, and the recommendation engine write only their own tables. An application with a stored recommendation still has status `COMPLETE`. `REJECTED`/`WITHDRAWN`/`EXPIRED`/`COMPLETED` appear only in intake's duplicate-check WHERE clause — assumed terminal states no service can produce. V4's lifecycle (PROCESSING, RULES_EVALUATING, MANUAL_REVIEW…) and the contract doc's lifecycle (INGESTED, EXTRACTING, DECIDING, DECIDED, CALLBACK_SENT…) are **both fiction against live data**. A queue filtered on `status = 'MANUAL_REVIEW'` returns zero rows, forever.

**Consequence — queue state must be DERIVED.** The read layer (whoever builds it) computes:

```
queue_state :=
  FAILED_INTAKE      if status = CREATED and no progress past intake          (edge)
  AWAITING_DOCS      if status IN (INCOMPLETE_PENDING, DOCUMENTS_REQUIRED)
  IN_PIPELINE        if status = COMPLETE and no recommendations row
  READY_FOR_REVIEW   if recommendations.outcome = 'MANUAL_REVIEW'
  AUTO_RECOMMENDED   if recommendations.outcome = 'APPROVED'
  CALLBACK_SENT      additionally, if recommendations.callback_status LIKE 'SUCCESS%'
```

The caseworker queue = `READY_FOR_REVIEW`. Document-level progress (for in-flight detail) comes from `documents.processing_status`: `AWAITING_UPLOAD → UPLOADED → EXTRACTED | NOT_EXTRACTED | MANUAL_REVIEW`, plus intake failure values `'NOT UPLOADED'` (note the space), `SCHEDULING_FAILED`, `PAYLOAD_MISSING_SIGNED_URL` (CODE).

**OPEN-1:** Is doc-processing writing completeness into `applications.status` intended design or a defect vs the canonical schema? Asked of Deloitte; if they later implement the canonical lifecycle, only the `queue_state` derivation changes — the UI binds to `queue_state`, never to raw `status`.

## 5. The recommendation payload — the authoritative detail shape (CODE)

The callback POSTed to `callback_url` — stored verbatim as `recommendations.submission_payload` — is the **single richest artifact in the system** and the natural payload for the detail endpoint:

```jsonc
{
  "dis_application_id": "...",
  "recommendation": "APPROVED" | "MANUAL_REVIEW",   // REJECTED disabled in code (see quirks)
  "recommendation_reason": "...",
  "evaluation_breakdown": { "drools_evaluation": "...", "external_checks_evaluation": "...", "opa_evaluation": "..." },
  "component_scores": { /* 9 keys, FULL per-component objects — below */ },
  "rule_results":    [ { "rule_result_id", "rule_id", "rule_name", "rule_category", "outcome", "severity", "reasoning", "evidence_refs", "remediation", "created_at" } ],
  "opa_results":     [ { "policy_id", "policy_name", "policy_type", "outcome", "created_at" } ],   // ⚠️ denial_reasons NOT included — only in the opa_results table
  "external_checks": [ { "check_id", "document_id", "check_type", "check_status", "risk_level", "confidence_score", "flags", "response_time_ms", "created_at" } ],
  "rules_summary": {
    "rules":           { "drools_rules_evaluated", "drools_rules_passed", "drools_rules_failed", "drools_rules_not_applicable" },
    "opa_policies":    { "opa_total_evaluated", "opa_total_passed", "opa_total_failed", "opa_hard_evaluated", "opa_hard_passed", "opa_hard_failed", "opa_soft_evaluated", "opa_soft_passed", "opa_soft_failed" },
    "external_checks": { "external_checks_evaluated", "external_checks_passed", "external_checks_failed", "external_checks_error" }
  },
  "completeness_score": 100,
  "completeness_status": "COMPLETE" | "INCOMPLETE_PENDING" | "DOCUMENTS_REQUIRED",
  "generated_at": "ISO8601Z",
  "drools_version": [ { "rule_file", "rule_version_id", "created_at" } ],   // ARRAYS of active versions,
  "opa_version":    [ { "policy_file", "policy_version_id", "created_at" } ], // not "1.2.0" strings
  "note": "This is a system recommendation to assist caseworker decision-making. Final determination rests with the authorised decision-maker."
}
```

**Per-component shape** (scorer.py — far richer than the contract doc showed):

```jsonc
"passport": {
  "component": "passport",
  "score": 95,                  // int 0-100 | null = NOT_APPLICABLE; capped at 30 on rule FAIL
  "status": "VALID",            // config-driven labels per component + NOT_APPLICABLE / MISSING
  "status_description": "...",
  "confidence": 0.95,           // 0–1, 2dp — NOT 0–100
  "rule_results":  [ { "rule_id", "rule_name", "result": "PASS"|"FAIL", "severity", "details", "remediation" } ],
  "opa_results":   [ { "policy_id", "policy_name", "policy_type", "outcome": "PASS"|"FAIL" } ],
  "extraction_sources": ["PASSPORT"],
  "external_check_types": ["PASSPORT_VERIFY"]
}
// fraud_risk additionally: "raw_fraud_score": 0.05 (render score, NEVER raw); confidence = 1 − composite; external_check_types always []
```

This means **Panel 2 can group the trace per-component out of the box** (each component carries its own rule/policy results plus links to its extraction sources and external checks — V4's evidence-linking design is directly supported by as-built data).

**Quirks register (CODE):**
1. `recommendations.confidence` is hardcoded `None` — always NULL.
2. **REJECTED is unreachable**: all three evaluators have the reject path commented out ("Phase1 — Treating MANDATORY + NOT_SATISFIED as MANUAL_REVIEW"). Live outcomes: APPROVED, MANUAL_REVIEW only.
3. The callback omits `opa_results.denial_reasons` — the trail endpoint must read the **table**, not the callback blob, to render them.
4. The flat `recommendations.component_scores` column is only `{component: score|null}` — the rich shapes live in `submission_payload`.
5. The 9 component definitions + status labels load at runtime from a GCS config (`component_scoring.json`); in-repo evidence is the test fixture. **OPEN-2:** confirm deployed bucket copy matches.
6. BigQuery `decision_analytics.outcome` is lowercased (`approved`) unlike Postgres (`APPROVED`).

**Vocabulary corrections (CODE beats DOC):**
- `rule_results.outcome` ∈ **SATISFIED / NOT_SATISFIED / BLOCKED / REVIEW_REQUIRED** (Drools AuditService) — *not* the contract doc's PASS/FAIL/SKIP/SOFT_FLAG/HARD_FAIL. (Inside `component_scores[].rule_results`, scorer.py maps to PASS/FAIL.) **OPEN-3:** confirm full Drools outcome union with Preety.
- `opa_results.outcome`: contract doc says ALLOW/DENY/FLAG/REVIEW_REQUIRED/PASS; code didn't pin the union. **OPEN-4:** confirm with Vidhyotha. (No `BLOCK` value exists anywhere.)
- The 6 external checks (LIVE, from the deployed service): WORLDCHECK, INTERPOL, PASSPORT_VERIFY, **BORDER_CONTROL**, DEVICE_IP_RISK, EMAIL_PHONE_REPUTATION. There is **no Sponsor Verification check** — sponsor/CoS validation happens in the rules layer via register lookup.

## 6. The read API — six endpoint contracts (ownership-neutral)

Whoever builds these (Deloitte per our 11 June ask, or OV per the contract doc's ownership model), the contracts are fixed by the as-built data. Our mock layer implements exactly these shapes; mock→live is a base-URL flip.

| # | Endpoint | Serves | Source |
|---|----------|--------|--------|
| 0 | `GET /api/v1/applications/{id}/status` | **EXISTS (LIVE)** — Status API, deployed 10 June. Headers: `X-API-KEY`, `X-Source-Channel`. Response schema undocumented (**OPEN-5**) | live service |
| 1 | `GET /applications?queue_state=&visa_type=&page=&page_size=&sort=` | Queue rows: dis_application_id, source_application_id, source_channel, visa_type, applicant_name, **queue_state (derived, §4)**, recommendation (nullable), completeness_score, submitted_at | `applications` ⋈ `applicants` ⋈ `recommendations` |
| 2 | `GET /applications/{id}` | The full recommendation payload (§5) + queue_state + lifecycle facts (completeness_trace, counts) | `recommendations.submission_payload` + `applications` |
| 3 | `GET /applications/{id}/trail` | Glass Box: full `rule_results` rows + full `opa_results` rows **including denial_reasons + input_context** | the two tables (not the callback blob) |
| 4 | `GET /applications/{id}/documents` | Per doc: documents row + its extraction (normalised_fields, confidence, fraud_score/status/signals) + **signed GCS URL** for the original image + application-level `cross_doc_fraud` | `documents` ⋈ `document_extractions` ⋈ `applications.cross_doc_fraud` |
| 5 | `GET /applications/{id}/external-checks` | external_checks rows incl. response_payload for the evidence cards | `external_checks` |

**Panel 1 endpoint (OV-IP, separate system):** Gemma 4/Praxia narrative on OV's Azure — `{ dis_application_id, summary, recommendation_rationale, model_version, generated_at }`. Never part of any Deloitte contract. Mock now; wire when the Azure job lands.

**Officer decision write (OV-owned):** approve / reject / request-more-info with mandatory reason, `triggered_by` context, audit-trail linkage. Persists to AMS's own store (V4 §6 untouched); the eventual DIS/VK notification path is Phase 3.

**Infrastructure prerequisites if OV builds 1–5 (OPEN-6):** IAM DB user on the private-IP Cloud SQL instance, KMS decrypt permission for the PII-protected json columns (`normalised_fields`, `raw_extraction`), GCS read for signed URLs. Natural host: the Status API service scaffold — its env is already wired to every table above (LIVE).

## 7. Panel data sources (V4 §9 remap)

| Panel | V4 said | V5 (as-built) |
|-------|---------|----------------|
| 1 — Recommendation Summary | `DISApplicationView.llm_summary` from DIS | OV-IP Azure endpoint. Interim: render `recommendation_reason` + `evaluation_breakdown` from endpoint 2 |
| 2 — Glass Box Trace | `rule_results[]/opa_results[]` from DIS view | Endpoint 3 (tables, for denial_reasons) + per-component grouping from endpoint 2's rich `component_scores` |
| 3 — Evidence | `external_checks[]/document_extractions[]` | Endpoints 4 + 5; image viewer via signed gcs_path; CoS excluded (lives in application_payload) |
| Accordion | unchanged | unchanged (V4 authority) |
| Audit Trail | Stream 1 from DIS | Stream 1 from endpoint 2's rules_summary + versions arrays; Stream 2 OV-owned, unchanged |

`DISApplicationView` survives **only as a client-side composite** assembled by our data provider from endpoints 1–5 — it is not a wire contract.

## 8. Type alignment patch — Phase 2A Task 2.0b (do before Task 2.1)

Breaking (must fix before panels consume mocks):
- `DroolsRuleResult`: `result`→`outcome` (union: SATISFIED/NOT_SATISFIED/BLOCKED/REVIEW_REQUIRED), `detail`→`reasoning`; add `rule_name`, `rule_category`, `evidence_refs[]`, `remediation`; drop/optionalise unevidenced `rule_file`, `source`, `reference_data`, `visa_type`, `evaluated_at`
- `OPAPolicyResult`: `tier`→`policy_type`; `result`→`outcome` (no BLOCK; DENY is the hard stop); `reason: string`→`denial_reasons: string[]`; drop/optionalise `data_source`, `rego_file`, `failed_documents`
- `ComponentScores`: values nullable (`ComponentScore | null` — null = N/A, never 0/red); `confidence` 0–1 not 0–100; drop required `details`; add `raw_fraud_score?`, `status_description?`, per-component `rule_results`/`opa_results`/`extraction_sources`/`external_check_types`
- `DISDecision` → recommendation-payload shape (§5); `overall_score`/`processing_path`/`risk_level` have no as-built source — `disViewAdapter` must derive score null-safely from component_scores
- `ExternalCheckType`: `INTERPOL_SLTD`→`INTERPOL`; remove `SPONSOR_VERIFY`; add `BORDER_CONTROL`
- `DISApplicationView.audit_log` → optional; add `rules_summary` (nested, §5)
- `source_channel`: `'home-office'`→`'govdirect'`
- `mockDISData.ts` + `disViewAdapter.ts`: rebuild rows on the above; include ≥1 null component to exercise the N/A path; OPA handling branches on DENY/FLAG; adapter reads `reasoning` and joins `denial_reasons`
- New: `QueueState` (derived, §4), `DISDocument` (documents-table record for Panel 3), `RecommendationOutcome = 'APPROVED' | 'MANUAL_REVIEW'` (DIS-sourced) — keep the 3-value union for officer decisions only

Confirmed safe as-is: `ComponentScoreKey` (all 9), `FraudStatus`, `FraudSignals` (7 keys), `DocumentType` (12, CoS excluded), `CheckStatus`, rule/policy ID formats, all 12 `extraction.ts` per-doc interfaces, `completeness.ts`, `normalizeOutcome.ts`, `ApplicationData` wiring.

## 9. Corrections register (what prior docs got wrong)

| Claim | Where | Reality |
|-------|-------|---------|
| 9-state lifecycle (either version) | V4 §8, contract doc | §4 — neither exists; queue state is derived |
| `decisions` table | V3, V4, audit habit | Live name `recommendations` |
| `/api/rules/reload` + reload JSON contract | V4 §10.1 | No such route; policy deploy is GCS/Eventarc-driven. Rules Manager publish workflow = GCS write + `policy_versions`/`rule_versions` tracking |
| Sponsor Verification as 6th external check | V4 §4A | BORDER_CONTROL is the 6th; sponsor is a rules-layer register lookup |
| Border Control "merged into PASSPORT_VERIFY" | `dis.ts` comment | Separate live endpoint |
| `llm_summary` served by DIS | V4 §2 | Panel 1 is OV-IP on Azure; no DIS field exists |
| `drools_version: "1.2.0"` strings | contract doc | Arrays of `{file, version_id, created_at}` |
| denial_reasons in detail payload | contract doc §Panel 2 | Only in the `opa_results` table; callback omits them |
| Phase 1 emits REJECT | V4 Panel 1 badge | Disabled in code; APPROVED/MANUAL_REVIEW only |
| `confidence` 0–100 | V3 types/mocks | 0–1 |

## 10. Contingency — Deloitte response (deadline 12 June EOD)

| Their answer | Our move |
|--------------|----------|
| Code pushed to main by 9:00 | Re-audit the push (§11); diff against §5/§6; adopt any real contracts found |
| "We'll build the 5 endpoints" + date | Hold them to §6 contracts; mocks already match; Phase 3 task 3.4 unblocks on their date |
| "Read layer is OV scope" | Trigger OPEN-6 access asks same-day; stand up OV read service (likely FastAPI beside the Status API pattern); §6 unchanged |
| No reply | Escalate with the audit doc + this spec; weekend build proceeds on mocks regardless |

## 11. Revised plan

**Tonight:** Task **2.0b** type patch (§8) → Task **2.1** RecommendationSummaryPanel (V4 UX, V5 data: badge APPROVED/MANUAL_REVIEW only, recommendation_reason + evaluation_breakdown interim, OV-IP shape behind a provider interface) → 2.2 Glass Box on as-built vocab.

**Morning verification protocol (12 June, before standup):** re-run `git fetch` + branch/tree audit on all dis-* repos; re-enumerate Cloud Run + API Gateway in `prj-dev-dis-9666`; re-pull the Status API `/openapi.json`; report deltas against the audit doc.

**Renames flowing from the language rule:** Task 2.1's component is `RecommendationSummaryPanel` (V4 called it DecisionSummaryPanel); "decision" survives only on the officer's own action (footer, dialogs, decision write endpoint).

**Parked unchanged:** 2.P1–P4 (await `normalised_fields`/`fraud_signals` JSONB sign-off — Ranita/Satyarth), Phase 2B–2E, Phase 3 (gated on §10 outcome), Phase 4.

## 12. Open questions (numbered, owners)

1. `applications.status` completeness-overwrite: intended or defect? Will the canonical lifecycle ever be implemented? — Preety/Siddharth
2. Deployed `component_scoring.json` (GCS) vs test fixture — Preety
3. Full `rule_results.outcome` union — Preety
4. Full `opa_results.outcome` union — Vidhyotha
5. Status API response contract + purpose of its all-tables env wiring — Neeraj
6. If OV owns reads: IAM DB user, KMS decrypt grant, GCS signed-URL access — Siddharth
7. `normalised_fields`/`fraud_signals` JSONB shapes (standing ask) — Ranita/Satyarth

## 13. Source documents

| Document | Authority |
|----------|-----------|
| **This spec (V5)** | Data contracts + integration |
| V4 (`2026-05-02-dis-integration-spec-v4.md`) | Dashboard UX, admin modules, Hermes, observability |
| Route audit (`dis-api-route-audit-2026-06-11.md`) | As-built endpoint evidence (repos + live env) |
| Officer UI contract (`docs/devdocs/DIS-alignment-docs/DIS_Officer_UI_Data_Contract.md`) | Companion; superseded where §9 corrects it |
| V3 spec | Historical; types superseded by §8 |
| Deloitte repos (`../dis-repos-deloitte`, 5 June; dis-api code on `release/dev` `945e9c9`) | CODE evidence. `../openvisa-dis-audit` copies are stale (24 Apr) — do not use |

---

*V5 wins on data contracts; V4 wins on UX; as-built evidence wins over both. Re-verify against the live environment after any Deloitte push.*
