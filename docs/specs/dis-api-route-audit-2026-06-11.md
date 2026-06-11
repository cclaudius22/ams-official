# DIS As-Built Route Audit — 11 June 2026

**Purpose:** Ground-truth answer to "which Officer Dashboard read endpoints exist in the deployed DIS" — audited from Deloitte's local repo clones before their reply to the scope-gap email (Chris → Siddharth, 10/11 June).
**Source:** `../dis-repos-deloitte/*` (all repos last updated **5 June 2026**). The `../openvisa-dis-audit/` copies are stale (24 April) — ignore them.
**Caveat:** This audits the repos, not the deployed environment. dis-api's code lives on `release/dev`, not `main` — `main` and `dev` are empty scaffolds.

---

## Verdict — the five endpoints requested in the email

| # | Requested endpoint | Specced? | Built? | Data in Postgres? |
|---|--------------------|----------|--------|-------------------|
| 1 | Application list / review queue (GET) | ❌ | ❌ | ✅ `applications` (+ `decisions` join) |
| 2 | Application detail / recommendation (GET) | ❌ | ❌ | ✅ `decisions` (outcome, confidence, component_scores, hard_fail_rules, soft_flag_rules, drools/opa versions) |
| 3 | Glass Box trail (rule + OPA results) | ❌ | ❌ | ✅ `rule_results` (rule_id, rule_name, rule_category, outcome, severity, **reasoning**, **evidence_refs**, remediation) + `opa_results` (policy_id, policy_name, policy_type, outcome, **denial_reasons**) |
| 4 | Documents + extractions (GET) | ❌ | ❌ | ✅ `documents` + `document_extractions` (normalised_fields, extraction confidence, fraud_score, fraud_status, fraud_signals) |
| 5 | External checks (GET) | ❌ | ❌ | ✅ `external_checks` (check_type, check_status, risk_level, confidence_score, flags, response_time_ms) |

**Zero of the five read endpoints exist — in spec or in code.** Deloitte cannot answer "they already exist." The pipeline writes everything; nothing reads it back out. The only consumer of the processed data today is the recommendation engine itself (and the decision callback it pushes).

## What IS specced and built

**Formally specced (API Gateway OpenAPI v1.0.0, Swagger 2.0, dev env):** exactly one endpoint —
`POST /api/v1/applications` → Cloud Run intake service (`cldrn-dev-dis-app-intake-…europe-west2.run.app`), JWT auth. The `test-openapi.yaml` files are empty stubs.

**As-built HTTP surfaces (all repos, June 5 snapshot):**

| Repo | Endpoints | Nature |
|------|-----------|--------|
| dis-api (`release/dev`) | `POST /api/v1/applications` (FastAPI) | Intake only. Plus `dis-doc-upload-dispatcher-fn` (Pub/Sub, no HTTP API). Cloud SQL via IAM auth, private IP. |
| dis-recommendation-engine | `POST /` (Pub/Sub push, Flask) | Reads all 6 data tables → writes `decisions` + BigQuery `decision_analytics`. No query interface. |
| dis-external-checks | `POST /api/{worldcheck,interpol,passport-verify,border-control,device-ip-risk,email-phone-reputation}`, `POST /orchestrator/execute`, `GET /health` (FastAPI) | Executes checks, writes `external_checks`. No GET for results. |
| dis-document-processing | `POST /` (Pub/Sub push, Flask) | Writes `documents`/`document_extractions`, KMS-encrypts sensitive fields. |
| dis-rules-engine | `POST /execute`, `GET /health` (Flask) + policy-update Cloud Function (Eventarc) | Writes `opa_results`, manages `policy_versions`. **Note: no `/api/rules/reload` found** — policy deploy is GCS-event-driven. |
| dis-data-layer | none | Empty shell repo (README + CODEOWNERS only). |

## Deployed-environment verification (11 June, `prj-dev-dis-9666`)

To rule out "deployed but not pushed," we enumerated the live dev project directly (Cloud Run, Cloud Functions, API Gateway) as `cclaudius@openvisa.global`:

**One service exists that is in no repo:** `cldrn-dev-dis-end-api` — the **"DIS Status API" v2.0**, deployed by neejha@deloitte.com, image v3 pushed 10 June. Its entire surface (from its own `/openapi.json`):

- `GET /health`
- `GET /api/v1/applications/{id}/status` — status poll, requires `X-API-KEY` + `X-Source-Channel` headers (built for VK Backend polling, not the dashboard)

Its env vars wire it to every read table (`applications`, `applicants`, `documents`, `document_extractions`, `external_checks`, and decisions — **whose live table name is `recommendations`**, per `DB_TABLE_DECISIONS=recommendations`), via IAM-auth Cloud SQL with KMS PII decryption. So the *plumbing* for a read API exists in this service's scaffold — but only the status route is implemented.

**Everything else deployed matches the repos:** intake (`POST /api/v1/applications`, single route, confirmed via live openapi.json), external checks (POST-only execution + health, confirmed live), OPA orchestrator/service/policy-update, rules engine/orchestrator, recommendation engine (Pub/Sub push), doc-upload dispatcher, OTel collector. The `customer-api` gateway and `cr-*` services are September/October 2025 PoC leftovers. Both API Gateway configs expose **no GET over processed application data**.

**Deployed verdict: zero of the five read endpoints exist in the live environment either.** The only GET serving any application data in the entire project is the status poll. The repo audit's conclusion stands for the deployed estate.

## Implications

1. **The email's premise is correct and provable:** the pipeline is only half the loop. A caseworker has no way to retrieve a recommendation today except a direct Postgres query.
2. **The contract doc's table/field assumptions are validated** — as-built code writes exactly the fields `DIS_Officer_UI_Data_Contract.md` lists for rule_results, opa_results, external_checks, and document_extractions. Mock data built on those shapes is safe.
3. **If OV builds the read layer** (per the contract doc's ownership model), the infra asks are: an IAM DB user on the Cloud SQL instance (private IP — note dis-api commit "db user impersonated"), and GCS access for signed document-image URLs.
4. **Phase 2A is unaffected** — mock-first build proceeds regardless of who owns the read layer.
