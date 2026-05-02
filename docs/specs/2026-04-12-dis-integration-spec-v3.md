# AMS + DIS Integration Spec — V3

**Date:** 12 April 2026
**Author:** Chris Claudius + Claude Code
**Status:** Final shapes — threshold numbers pending Deloitte proposal
**Supersedes:** `2026-04-06-dis-integration-spec-v2.md` (v2)
**Scope:** AMS officer dashboard aligned with confirmed DIS pipeline, all Confluence pages reviewed 12 April 2026

---

## What changed from V2

| # | Issue | V2 said | V3 corrected to | Source |
|---|-------|---------|-----------------|--------|
| 1 | OPA policy count | 6 hard only | **12 total: 6 HARD + 6 SOFT** | Drools & OPA page 26673153 |
| 2 | Drools rule count | "25+" | **20 (5 universal + 15 skilled worker)** | Decision Map v1.1 page 22446098 |
| 3 | Missing rule | No W09 | **RULE-W09 Maintenance Funds (£1,270/28 days) added** | Drools & OPA page 26673153 |
| 4 | OPA policy IDs | H03=Doc Fraud, H05=Residency, H06=Tampering | **H02=Passport Verify, H03=Interpol, H04=Auth, H05=Fraud Score, H06=Residency** | Drools & OPA page 26673153 |
| 5 | External APIs | Border Control separate (4th) | **Merged into Passport Verification. 6th API = Sponsor Verification** | External API page 27197443 |
| 6 | Fraud thresholds | 3-level (20/70) | **5-level (0.30/0.60/0.80/0.90)** | Extraction & Classification page 27230212 |
| 7 | Fraud sub-signals | Not covered | **Image vs PDF signal matrix added** | Data Extraction Strategy page 13402113 (Apr 11) |
| 8 | Auth model | Not specified | **Opaque API keys (not JWT) in Phase 1** | Query Log Q38.1 |
| 9 | Device fingerprint | Not in headers | **X-Device-Fingerprint header for VisaKey** | Query Log Q38.2 |
| 10 | DLP | Not covered | **Built-in + 4 custom infoTypes at ingestion** | Query Log Q40 |

---

## Table of Contents

1. [Core Principle](#1-core-principle)
2. [Platform Architecture](#2-platform-architecture)
3. [What DIS Sends the AMS](#3-what-dis-sends-the-ams)
4. [Decision Callback Payload](#4-decision-callback-payload)
5. [4 Detail Layers (AMS reads from DIS Postgres)](#5-four-detail-layers)
6. [Document Types & Extraction](#6-document-types--extraction)
7. [Drools Rules (20)](#7-drools-rules)
8. [OPA Policies (12)](#8-opa-policies)
9. [External API Checks (6)](#9-external-api-checks)
10. [Fraud Detection](#10-fraud-detection)
11. [AMS TypeScript Types](#11-ams-typescript-types)
12. [AMS UI Components](#12-ams-ui-components)
13. [Multi-Visa Scalability](#13-multi-visa-scalability)
14. [Integration Plan](#14-integration-plan)
15. [Open Items & Pending Deloitte Deliverables](#15-open-items)
16. [Source Documents](#16-source-documents)

---

## 1. Core Principle

**"AI Extracts, Rules Decide"**

AI (Document AI, Vision AI) extracts data and produces confidence scores. The **decision** is made deterministically by Drools rules + OPA guardrails. The LLM summary runs AFTER the decision and has NO decision power. Every decision is traceable to specific rules.

---

## 2. Platform Architecture

```
APPLICANT SIDE                           GOVERNMENT SIDE (Assured Workloads)

VisaKey App ─────┐                       ┌─── DIS API Gateway (FastAPI/Cloud Run)
(Expo/RN)        │                       │
                 ▼                       │    ┌─────────────────────────┐
Gov Systems ───> Ingestion Gateway       │    │ AI Processing Pipeline  │
(External API)   (Hono/Cloud Run)        │    │  ├─ Document AI (T1/T2) │
                 │                       │    │  ├─ Fraud (Vision AI)   │
                 ▼                       │    │  ├─ External Checks (6) │
          PostgreSQL + GCS ──────────────┘    │  ├─ Drools (20 rules)   │
          (VisaKey DB)   POST metadata        │  └─ OPA (12 policies)   │
                         + signed URLs        └─────────────────────────┘
                                                         │
                                              ┌──────────▼──────────┐
                                              │ Decision Matrix     │
                                              │  ├─ Weighted scoring│
                                              │  ├─ LLM summary    │
                                              │  └─ Pluggable slots │
                                              └──────────┬──────────┘
                                                         │
                              ┌───────────────┬──────────┴─────────┐
                              ▼               ▼                    ▼
                      AMS Officer       Webhook Callback     BigQuery
                      Dashboard         (→ VisaKey Backend)  (Analytics)
                      (Next.js)
```

### System Boundaries

| System | Repo | Stack | Database | Infra |
|--------|------|-------|----------|-------|
| AMS Dashboard | `ams-official` | Next.js 16, React 19, Prisma (auth), JSON provider | Neon Postgres (auth only) | Cloud Run (standard GCP) |
| VisaKey Backend | `visakey2.0-backend` | Hono 4, Bun, Drizzle ORM | Neon Postgres (apps + docs) | Cloud Run (standard GCP) |
| VisaKey App | `visakey2.0-expoapp` | Expo 55, React Native 0.83, Zustand | None (Clerk secure store) | EAS Build |
| DIS | Deloitte-managed | FastAPI, Document AI, Drools, OPA | Postgres + BigQuery | Assured Workloads (europe-west2) |

### Two Input Channels

| Aspect | VisaKey | GovDirect |
|--------|---------|-----------|
| Source | Mobile app (Expo/RN) | Government systems |
| Auth | Opaque API key (`DIS_API_KEY_VISAKEY` in Secret Manager) | Opaque API key (`DIS_API_KEY_GOVDIRECT`) |
| Auth method | `SERVICE_TOKEN` | `API_KEY` |
| Biometric | Regula SDK (mobile) | VAC in-person |
| Device fingerprint | `X-Device-Fingerprint` header | Not present |
| Submission IP | `X-Forwarded-For` | null |
| Fraud analysis | Full (image + rules) | Rules only (no image-based fraud) |

**Phase 1 auth is NOT JWT.** Opaque keys validated by lookup in Secret Manager + cross-reference with `X-Source-Channel` header. `auth_method` field in `auth_context` already designed for future JWT_OIDC migration.

DIS processes both channels identically — same extraction, same rules, same OPA, same decision logic. `source_channel` is for audit/routing only.

---

## 3. What DIS Sends the AMS

The AMS receives data from DIS at two levels:

### Level 1: Decision Callback (aggregated)
A single JSON payload with the decision outcome, 9 component scores, and audit log. This is what triggers the AMS to show a new decision.

### Level 2: Four Detail Layers (read on demand)
When an officer opens an application, the AMS reads 4 tables from DIS Postgres via API:

| Table | Content | AMS Use |
|-------|---------|---------|
| `document_extractions` | Per-document: `raw_extraction` (JSONB) + `normalised_fields` (JSONB) + `fraud_score` + `fraud_signals` | Document extraction viewer |
| `rule_results` | All 20 Drools rule outputs (PASS/FAIL + detail) | Glass-box trail — rules section |
| `opa_results` | All 12 OPA policy outputs (BLOCK/REVIEW_REQUIRED/PASS) | Glass-box trail — guardrails section |
| `external_checks` | 6 API results with full request/response | External checks panel |

Plus: `llm_summary` — Gemini-generated case briefing (read-only, no decision power).

---

## 4. Decision Callback Payload

Channel-independent — same shape for VisaKey and GovDirect.

```json
{
  "decision": {
    "outcome": "APPROVED | MANUAL_REVIEW | REJECTED",
    "confidence": 94.7,
    "processing_path": "AUTOMATED | ESCALATED",
    "risk_level": "LOW | MEDIUM | HIGH | CRITICAL",
    "overall_score": 91.3
  },

  "component_scores": {
    "passport":               { "score": 95, "status": "VERIFIED",    "confidence": 97.1, "details": "..." },
    "financial":              { "score": 88, "status": "VERIFIED",    "confidence": 92.0, "details": "..." },
    "employment":             { "score": 91, "status": "VERIFIED",    "confidence": 94.5, "details": "..." },
    "english_language":       { "score": 85, "status": "VERIFIED",    "confidence": 89.0, "details": "..." },
    "immigration_compliance": { "score": 100, "status": "CLEAR",      "confidence": 99.0, "details": "..." },
    "criminal_record":        { "score": 100, "status": "CLEAR",      "confidence": 99.0, "details": "..." },
    "health":                 { "score": 90, "status": "VERIFIED",    "confidence": 88.0, "details": "..." },
    "document_quality":       { "score": 87, "status": "ACCEPTABLE",  "confidence": 85.0, "details": "..." },
    "fraud_risk":             { "score": 98, "status": "LOW_RISK",    "confidence": 96.0, "details": "..." }
  },

  "audit_log": {
    "pipeline_version": "1.0.0",
    "models_used": {
      "document_ai": "document-ai-v2.1",
      "fraud_detection": "vision-ai-v1.3",
      "rules_engine": "drools-v1.2",
      "llm_summary": "gemini-2.0-flash"
    },
    "data_classification": "OFFICIAL-SENSITIVE",
    "processing_location": "europe-west2",
    "documents": { "total": 11, "successful": 11, "failed": 0, "errors": [] },
    "rules": { "total_evaluated": 20, "passed": 20, "failed": 0, "skipped": 0 },
    "external_checks": { "total": 6, "successful": 6, "failed": 0, "timed_out": 0, "errors": [] },
    "opa_policies": { "total_evaluated": 12, "passed": 12, "blocked": 0, "flagged": 0 },
    "processing_errors": [],
    "warnings": []
  },

  "source_channel": "visakey | home-office"
}
```

### Component Score Semantics

| Field | Type | Meaning |
|-------|------|---------|
| `score` | 0-100 | Does the applicant meet the requirement? |
| `status` | string | VERIFIED, CLEAR, LOW_RISK, ACCEPTABLE, etc. |
| `confidence` | 0-100 | AI extraction confidence (how reliably data was read) |
| `details` | string | Human-readable detail |

**Critical distinction:** `score` 30 + `confidence` 98 = "we're very sure the applicant doesn't qualify." AI read it correctly; applicant just doesn't meet the threshold.

### Decision Logic

| Outcome | Trigger |
|---------|---------|
| **REJECTED** | Any hard-fail: OPA-H01 sanctions, OPA-H03 stolen passport, OPA-H05 fraud_score >= 0.90, Interpol red notice |
| **MANUAL_REVIEW** | Any soft-flag: OPA-S01-S06, confidence < 70, discrepancies, completeness < 70, fraud 0.31-0.89, salary borderline |
| **APPROVED** | ALL 20 Drools rules pass, ALL 12 OPA policies clear, ALL confidence above threshold, no flags |

### What's NOT in the Callback

Individual rule results, OPA results, extraction data, external check details, and LLM summary are stored in DIS Postgres. The AMS reads them on demand via API when an officer opens an application.

---

## 5. Four Detail Layers

### 5.1 Document Extractions (`document_extractions` table)

Every document produces one row. Envelope is identical for all types — only `extracted_data`, `normalised_fields`, and `fraud_signals` vary.

```json
{
  "extraction_id": "uuid-v4",
  "dis_application_id": "uuid-v4",
  "document_id": "uuid-v4",
  "document_type": "PASSPORT | BANK_STATEMENT | NATIONAL_ID | BRP | EMPLOYMENT_LETTER | PAYSLIP | P60_TAX | IELTS_CERTIFICATE | DEGREE_CERTIFICATE | TB_CERTIFICATE | UTILITY_BILL | POLICE_CERTIFICATE",
  "tier": "TIER_1 | TIER_2",
  "criticality": "CRITICAL | SUPPORTING",
  "extraction_method": "DOC_AI_ID_PARSER | DOC_AI_FORM_PARSER | DOC_AI_CUSTOM_EXTRACTOR",
  "processor_id": "projects/{project}/locations/{location}/processors/{processor_id}",
  "processor_version": "pretrained-xxx | custom-xxx",
  "extraction_confidence": 0.97,
  "raw_extraction": { },
  "extracted_data": { },
  "normalised_fields": { },
  "fraud_score": 0.08,
  "fraud_status": "CLEAR | LOW_RISK | MEDIUM_RISK | HIGH_RISK | CRITICAL",
  "fraud_signals": { },
  "source_channel": "visakey | govdirect",
  "gcs_raw_path": "gs://dis-raw-uploads/{app_id}/{doc_id}.{ext}",
  "gcs_processed_path": "gs://dis-processed-docs/{app_id}/{doc_id}.json",
  "created_at": "2026-04-12T10:00:00Z",
  "updated_at": "2026-04-12T10:00:00Z"
}
```

**Downstream consumers read from `normalised_fields` ONLY**, never from `raw_extraction`.

### 5.2 Drools Rule Results (`rule_results` table)

```json
{
  "rule_id": "RULE-W03",
  "rule_file": "skilled_worker/salary_rules.drl",
  "result": "PASS | FAIL",
  "detail": "Annual salary £42,000 meets general threshold £41,700",
  "source": "submission_payload",
  "reference_data": "salary_thresholds.json",
  "reference_field": "general_threshold",
  "visa_type": "universal | skilled_worker",
  "severity": "MANDATORY | ADVISORY",
  "evaluated_at": "2026-04-12T10:00:05Z"
}
```

### 5.3 OPA Policy Results (`opa_results` table)

```json
{
  "policy_id": "OPA-H05",
  "policy_name": "Document_Fraud_Score",
  "tier": "HARD | SOFT",
  "result": "BLOCK | REVIEW_REQUIRED | PASS",
  "reason": "fraud_score 0.92 exceeds hard block threshold 0.90",
  "data_source": "document_extractions",
  "rego_file": "hard/document_tampering.rego | soft/biometric_borderline.rego",
  "evaluated_at": "2026-04-12T10:00:06Z",
  "failed_documents": ["doc-uuid-1"]
}
```

### 5.4 External Check Results (`external_checks` table)

```json
{
  "request_id": "uuid-v4",
  "dis_application_id": "uuid-v4",
  "document_id": "uuid-v4 | null",
  "check_type": "WORLDCHECK | INTERPOL_SLTD | PASSPORT_VERIFY | DEVICE_IP_RISK | EMAIL_PHONE_REPUTATION | SPONSOR_VERIFY",
  "check_status": "CLEAR | BLOCKED | FLAGGED | ERROR | TIMEOUT",
  "risk_level": "NONE | LOW | MEDIUM | HIGH",
  "confidence_score": 0.95,
  "flags": {},
  "responded_at": "2026-04-12T10:00:04Z",
  "response_time_ms": 340,
  "details": {}
}
```

---

## 6. Document Types & Extraction

### 6.1 Processing Tiers

**Architecture decision (confirmed 6 April 2026): Doc AI across the board. Gemini Vision RULED OUT (hallucination risk, non-deterministic).**

| Document Type | Tier | Criticality | Processor | Drools Rules | OPA Checks | Extraction Status |
|---------------|------|-------------|-----------|--------------|------------|-------------------|
| Passport | Tier 1 | Critical | Doc AI ID Parser | U01, U02, U04 | H03, H05 | Validated |
| Bank Statement | Tier 1 | Critical | Doc AI Form Parser | W09 | H05 | Validated |
| National ID | Tier 1 | Supporting | Doc AI ID Parser | — | — | Pending |
| BRP | Tier 1 | Supporting | Doc AI ID Parser | — | — | Pending |
| Employment Letter | Tier 2 | Critical | Doc AI Custom Extractor | W03, W05, W09 | H05 | Validated |
| Payslips (3 months) | Tier 2 | Critical | Doc AI Custom Extractor | W09 | H05 | Validated |
| P60 / Tax Document | Tier 2 | Critical | Doc AI Custom Extractor | W10 | H05 | Validated |
| IELTS Certificate | Tier 2 | Critical | Doc AI Custom Extractor | W08 | H05 | Validated |
| Degree Certificate | Tier 2 | Critical | Doc AI Custom Extractor | W07 | H05 | Validated |
| TB Certificate | Tier 2 | Supporting | Doc AI Custom Extractor | W10 | — | Pending (samples in corpus) |
| Police Certificate | Tier 2 | Supporting | Doc AI Custom Extractor | — | — | Pending |
| Utility Bill | Tier 2 | Supporting | Doc AI Custom Extractor | — | — | Pending (samples in corpus) |
| Certificate of Sponsorship | N/A | Critical | Structured Input (no AI) | W01-W08, W14, W15 | — | N/A (structured JSON) |
| Photo | N/A | Supporting | Stored only (no extraction) | — | — | N/A |

**CoS is NOT a document.** It is a reference number — structured JSON from the submission payload, bypasses Document AI entirely.

### 6.2 Per-Document Extracted Fields

**Aligned to Canonical Document Extraction Schema V1.2 (14 April 2026).** Full details: `docs/devdocs/Canonical Document Extraction Schema.md`. TypeScript interfaces: `src/types/extraction.ts`.

`extracted_data` = what Doc AI returns. `normalised_fields` = pipeline-mapped values Drools/OPA consume (ISO dates, uppercase surname-first names, computed flags like `is_expired`, cross-doc consistency results).

Envelope fields like `extraction_confidence`, `fraud_score`, `fraud_status`, `fraud_signals` are NOT inside `extracted_data` — they're top-level fields on the `document_extractions` table row.

**PASSPORT (Tier 1, Critical, DOC_AI_ID_PARSER pre-trained):**
`document_number` (9 chars, matches MRZ), `surname`, `given_names`, `full_name`, `date_of_birth`, `nationality`, `sex` (ICAO 9303), `issue_date`, `expiry_date`, `issuing_country`, `country_code` (ISO 3166-1 alpha-3), `document_type_code` (e.g., "P"), `place_of_birth`, `place_of_issue`, `mrz_line_1`, `mrz_line_2`, `photo_hash`, `has_signature`

**BANK STATEMENT (Tier 1, Critical, DOC_AI_FORM_PARSER):**
`account_holder_name`, `account_number`, `sort_code`, `bank_name`, `branch_name`, `account_currency`, `statement_period_start`, `statement_period_end`, `opening_balance`, `closing_balance`, `lowest_balance`, `total_credits`, `total_debits`, `salary_credits[]` (array of `{date, amount, description}`)

**NATIONAL_ID (Tier 1, Supporting, DOC_AI_ID_PARSER custom):**
`document_number`, `given_names`, `surname`, `full_name`, `date_of_birth`, `nationality`, `sex` (ICAO 9303), `issue_date`, `expiry_date`, `issuing_authority`, `has_photo`

**BRP (Tier 1, Supporting, DOC_AI_ID_PARSER custom):**
`document_number`, `given_names`, `surname`, `full_name`, `date_of_birth`, `nationality`, `sex`, `issue_date`, `expiry_date`, `issuing_authority`, `visa_type_on_brp`, `has_photo`

**EMPLOYMENT LETTER (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR):**
`employer_name`, `employer_address`, `job_title`, `start_date`, `salary_amount`, `salary_frequency`, `hours_per_week`, `employment_type` (FULL_TIME / PART_TIME / PERMANENT / FIXED_TERM / CONTRACT), `signatory_name`, `signatory_position`, `letter_date`, `company_registration_number`, `on_company_letterhead`

**PAYSLIP (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR):**
`employer_name`, `employee_name`, `employee_number`, `pay_period_start`, `pay_period_end`, `gross_pay`, `net_pay`, `tax_deducted`, `ni_deducted`, `pay_frequency`, `payslip_date`, `ni_number` (HASHED), `tax_code`

**P60 / TAX (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR):**
`tax_year`, `employer_name`, `employee_name`, `ni_number` (HASHED), `total_pay_in_year`, `total_tax_in_year`, `total_ni_in_year`, `employer_paye_reference`

**IELTS CERTIFICATE (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR):**
`test_type`, `candidate_name`, `date_of_birth`, `test_date`, `overall_score`, `listening_score`, `reading_score`, `writing_score`, `speaking_score`, `test_report_form_number` (HASHED), `centre_number`, `cefr_level`

**DEGREE CERTIFICATE (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR):**
`institution_name`, `candidate_name`, `qualification_title`, `qualification_level`, `subject`, `award_date`, `classification`, `country_of_institution`, `certificate_number` (HASHED)
*Note:* `naric_reference` and `rqf_level_equivalent` live in `normalised_fields` only — populated by Phase 2 ENIC API.

**TB CERTIFICATE (Tier 2, Supporting, DOC_AI_CUSTOM_EXTRACTOR):**
`patient_name`, `date_of_birth`, `clinic_name`, `clinic_address`, `issuing_country`, `test_date`, `certificate_date`, `expiry_date`, `outcome`, `certificate_number` (HASHED), `examining_doctor`
*Note:* `is_approved_clinic` lives in `normalised_fields` — populated by `approved_tb_clinics.json` lookup.

**UTILITY BILL (Tier 2, Supporting, DOC_AI_CUSTOM_EXTRACTOR — structured):**
`account_holder_name`, `service_address`, `utility_type` (COUNCIL_TAX / ELECTRICITY / GAS / WATER / INTERNET / PHONE / TV_LICENCE), `supplier_name`, `bill_date`, `billing_period_start`, `billing_period_end`, `account_number` (HASHED), `amount_due`

**POLICE CERTIFICATE (Tier 2, Supporting, DOC_AI_CUSTOM_EXTRACTOR — structured):**
`subject_full_name`, `date_of_birth`, `nationality`, `issuing_authority`, `issuing_country`, `certificate_number` (HASHED), `issue_date`, `expiry_date`, `criminal_record_disclosed`, `certificate_type`

### 6.3 Cross-Document Consistency Fields

Populated post-extraction by Drools cross-doc rules. Stored in `normalised_fields.cross_doc`:

| Check | Source Document | Target Document(s) | Comparison |
|-------|----------------|---------------------|------------|
| Name consistency | Passport | Employment Letter, Payslips, Bank Statement, IELTS, Degree | Fuzzy name match |
| DOB consistency | Passport | IELTS, TB Certificate | Exact match |
| Salary consistency | Employment Letter | Payslips (3 months), P60 | Tolerance ±5% |
| Employer consistency | Employment Letter | Payslips, P60 | Exact name match |
| NI number consistency | Payslip | P60 | Exact match |
| Address consistency | Utility Bill | Employment Letter (employer_address) | Partial match |

These checks apply to BOTH channels (VisaKey and GovDirect) — they operate on extracted field values, not images.

---

## 7. Drools Rules (20)

### 7.1 Universal Rules (all visa types) — 5 rules

| Rule | Name | DRL File | Source | Ref Data | Severity |
|------|------|----------|--------|----------|----------|
| RULE-U01 | Passport Validity | `universal/passport_rules.drl` | document_extractions | — | MANDATORY |
| RULE-U02 | Biometric Verification | `universal/biometric_rules.drl` | submission payload + document_extractions | — | MANDATORY |
| RULE-U03 | Sanctions Screening | `universal/sanctions_rules.drl` | external_checks (World-Check) | — | MANDATORY |
| RULE-U04 | Duplicate Application | `universal/duplicate_rules.drl` | DIS database lookup | — | MANDATORY |
| RULE-U05 | Extraction Confidence | `universal/document_confidence_rules.drl` | document_extractions | — | MANDATORY |

**RULE-U01:** Passport expiry >= 6 months from travel date. Interpol SLTD + HMPO verification.
**RULE-U02:** Face match >= 0.85, liveness = PASS, MRZ = PASS. Returns `NOT_APPLICABLE` for GovDirect.
**RULE-U03:** World-Check HIGH = block, MEDIUM = manual review.
**RULE-U04:** Fuzzy duplicate detection: same passport + different email, same name + DOB + different passport, etc.
**RULE-U05:** All Critical documents must have extraction confidence >= 0.80. Applies to Tier 1 + Tier 2 Critical docs.

### 7.2 Skilled Worker Rules — 15 rules

| Rule | Name | DRL File | Source | Ref Data | Severity |
|------|------|----------|--------|----------|----------|
| RULE-W01 | CoS Validity | `skilled_worker/sponsorship_rules.drl` | submission payload | `cos_register_mock.json` | MANDATORY |
| RULE-W02 | Sponsor Licence Status | `skilled_worker/sponsorship_rules.drl` | submission payload | `sponsor_register.csv` | MANDATORY |
| RULE-W03 | Salary — General | `skilled_worker/salary_rules.drl` | submission payload | `soc_going_rates.json` | MANDATORY |
| RULE-W04 | Salary — New Entrant | `skilled_worker/salary_rules.drl` | submission payload + document_extractions (DOB) | `soc_going_rates.json` | MANDATORY |
| RULE-W05 | SOC Code Eligibility | `skilled_worker/eligibility_rules.drl` | submission payload | `eligible_soc_codes.json` | MANDATORY |
| RULE-W06 | Immigration Salary List | `skilled_worker/salary_rules.drl` | submission payload | `immigration_salary_list.json` | ADVISORY |
| RULE-W07 | Job Skill Level (RQF 6+) | `skilled_worker/eligibility_rules.drl` | submission payload | `eligible_soc_codes.json` | MANDATORY |
| RULE-W08 | English Language (CEFR B2+) | `skilled_worker/eligibility_rules.drl` | document_extractions (IELTS) | — | MANDATORY |
| RULE-W09 | Maintenance Funds | `skilled_worker/financial_rules.drl` | document_extractions (Bank Statement) | — | MANDATORY |
| RULE-W10 | TB Test Certificate | `skilled_worker/compliance_rules.drl` | submission payload + document_extractions | `tb_test_countries.json` | MANDATORY (when applicable) |
| RULE-W11 | Criminal Record | `skilled_worker/compliance_rules.drl` | external_checks (Interpol) | — | MANDATORY |
| RULE-W12 | Immigration Compliance | `skilled_worker/compliance_rules.drl` | external_checks (Border Control) | — | MANDATORY |
| RULE-W13 | Completeness | `skilled_worker/completeness_rules.drl` | document_extractions | — | ADVISORY |
| RULE-W14 | Document Fraud | `skilled_worker/compliance_rules.drl` | document_extractions (fraud_score) | — | MANDATORY |
| RULE-W15 | Start Date Validity | `skilled_worker/sponsorship_rules.drl` | submission payload | `cos_register_mock.json` | MANDATORY |

**Key design decision (Q21):** Salary comes from the **submission payload** (`answers.employment.annualIncome`), NOT from the employment letter. Employment letter is for cross-verification only.

**RULE-W03:** General threshold >= £41,700 AND >= 100% going rate AND hourly >= £17.13.
**RULE-W04:** New entrant threshold >= £33,400 AND >= 100% going rate.
**RULE-W09:** Applicant's bank account must show >= £1,270 held for 28 consecutive days.
**RULE-W10:** TB cert required only if applicant nationality is in `tb_test_countries.json` (Appendix T).
**RULE-W13:** Weighted completeness scoring (0-100). < 70 = MANUAL_REVIEW. Document weights: Passport=20, Employment Letter=15, Payslips=15, Bank Statement=15, IELTS=10, Degree=10, CoS=15 (confirmed, **exact weights pending Deloitte**).

### 7.3 Reference Data Files (11)

| File | Records | Consumer Rules | Source | Update Frequency |
|------|---------|---------------|--------|------------------|
| `salary_thresholds.json` | — | W03, W04, W06 | Home Office | When thresholds change |
| `soc_going_rates.json` | — | W03, W04, W06 | ASHE data | Annual |
| `eligible_soc_codes.json` | — | W05, W07 | Appendix Skilled Occupations | When appendix changes |
| `immigration_salary_list.json` | — | W06 | ISL | ISL expires 31 Dec 2026 |
| `english_exempt_nationalities.json` | — | W08 | Appendix English Language | Rare |
| `tb_test_countries.json` | — | W10 | Appendix T | When Appendix T changes |
| `enhanced_scrutiny_nationalities.json` | — | OPA-S05 | OV-owned | CPIN review → Git → CI/CD |
| `sponsor_register.csv` | 140,909 | W02 | gov.uk | Weekly |
| `cos_register_mock.json` | 155 | W01 | Mock | Replaced at pilot with real SMS |
| `approved_tb_clinics.json` | — | W10 | gov.uk | When list changes |
| `uk_universities.json` | — | W08 | HESA / gov.uk | Annual |

**Key principle:** Reference data updates do NOT require rule redeployment. Services load reference data independently.

---

## 8. OPA Policies (12)

### 8.1 Hard Policies — BLOCK (application cannot proceed) — 6 policies

| Policy | Name | Rego File | Trigger | Data Source |
|--------|------|-----------|---------|-------------|
| OPA-H01 | Sanctions Hard Block | `hard/sanctions.rego` | World-Check HIGH risk | external_checks (World-Check) |
| OPA-H02 | Passport Verification | `hard/passport_stolen.rego` | MRZ mismatch, document cancelled, authenticity_score < 0.50 | external_checks (Passport Verify) |
| OPA-H03 | Interpol SLTD | `hard/document_fraud.rego` | Stolen/lost/revoked document | external_checks (Interpol) |
| OPA-H04 | Auth & Session | `hard/auth_session.rego` | Invalid auth, channel mismatch | applications.auth_context |
| OPA-H05 | Document Fraud Score | `hard/document_tampering.rego` | fraud_score >= 0.90 on any Critical doc | document_extractions |
| OPA-H06 | Data Residency | `hard/data_residency.rego` | Data outside europe-west2 | infrastructure metadata |

**Deloitte progress (8-10 April): OPA-H01 through H04 IMPLEMENTED.**

### 8.2 Soft Policies — FLAG_FOR_REVIEW (officer sees the flag) — 6 policies

| Policy | Name | Rego File | Trigger | Data Source |
|--------|------|-----------|---------|-------------|
| OPA-S01 | Biometric Borderline | `soft/biometric_borderline.rego` | Face match 0.75-0.85 | submission payload |
| OPA-S02 | World-Check LOW/MEDIUM | `soft/worldcheck_low_medium.rego` | PEP match, adverse media | external_checks (World-Check) |
| OPA-S03 | Completeness Low | `soft/completeness_low.rego` | completeness_score < 70 | rule_results (W13) |
| OPA-S04 | Rapid Submission / Bot | `soft/rapid_submission.rego` | Submission < 3 min, or > 3 from same passport/email in 30 days | ingestion metadata |
| OPA-S05 | Enhanced Scrutiny Nationality | `soft/enhanced_scrutiny.rego` | Nationality on scrutiny list | `enhanced_scrutiny_nationalities.json` |
| OPA-S06 | Infrastructure Alerts | `soft/cmek_rotation.rego` | CMEK rotation overdue, TLS cert expiry | infrastructure metadata |

**OPA-S04 Phase 1 scope:** Two deterministic checks at ingestion — (1) submission speed < 3 min = flag, (2) repeat submission > 3 in 30 days = flag. No ML, no device fingerprinting. See [Anti-Abuse Strategy](https://openvisa.atlassian.net/wiki/spaces/DD/pages/26312707).

### 8.3 OPA Result Shape (all policies)

```json
{
  "policy_id": "OPA-H01",
  "policy_name": "Sanctions_WorldCheck_HardBlock",
  "tier": "HARD",
  "result": "BLOCK | REVIEW_REQUIRED | PASS",
  "reason": "Confirmed match on OFSI sanctions list",
  "data_source": "REUTERS_WORLDCHECK",
  "evaluated_at": "2026-04-12T10:00:06Z"
}
```

---

## 9. External API Checks (6)

All checks run in parallel via Cloud Workflows. **Fail-closed: timeout or error = REVIEW_REQUIRED, not PASS.**

| # | API | Trigger | Drools Consumer | OPA Consumer | Phase 1 Status |
|---|-----|---------|----------------|--------------|----------------|
| 1 | Reuters World-Check | Every application | RULE-U03 | OPA-H01, OPA-S02 | Live API (sandbox pending LSEG SCRUM-12) |
| 2 | Interpol SLTD | When PASSPORT detected | RULE-U01 | OPA-H03 | Mock API |
| 3 | Passport Verification (HMPO) | When PASSPORT detected | RULE-U01 | OPA-H02 | Mock API (includes Border Control data) |
| 4 | Device & IP Risk | Every submission (VisaKey only) | — | OPA-S04 | Mock API |
| 5 | Email & Phone Reputation | Every application | — | — | Mock API |
| 6 | Sponsor Verification | When CoS present | — | — | Mock API (uses `sponsor_register.csv` + `cos_register_mock.json`) |

**Border Control (entry/exit, overstay, deportation) is merged into Passport Verification response.** RULE-W12 reads from the Passport Verification check result.

### Per-API Response Fields (what AMS displays)

**1. World-Check:** `risk_level`, `confidence_score`, `categories_checked` (SANCTIONS, PEP, ADVERSE_MEDIA, LAW_ENFORCEMENT), `lists_checked` (OFSI, UN_SC, EU_SANCTIONS, US_OFAC, INTERPOL_RED_NOTICE), `matches_found`

**2. Interpol SLTD:** `is_stolen`, `is_lost`, `is_revoked`, `is_invalid`, `sltd_reference`, `database_version`

**3. Passport Verification:** `overall_match`, `field_matches { document_number, surname, given_names, date_of_birth, expiry_date, gender, nationality }`, `check_digit_valid`, `authenticity`, `document_status`, `has_overstay`, `has_deportation`, `has_refusal_at_border`, `travel_records[]`, `current_immigration_status`

**4. Device & IP Risk:** `ip_analysis { is_vpn, is_tor, is_proxy, is_datacenter, is_known_fraud_ip }`, `device_analysis { device_fingerprint_known, device_trust_score }`, `geo_analysis`, `submission_velocity`, `impossible_travel`

**5. Email & Phone Reputation:** `email_analysis { is_disposable, is_deliverable, domain_age_days, breach_count, is_known_fraud_email }`, `phone_analysis { is_valid, line_type, carrier, is_voip, is_virtual, phone_country, is_known_fraud_phone }`

**6. Sponsor Verification:** `sponsor_licence_number`, `sponsor_name`, `licence_status`, `licence_rating`, `route`, `is_suspended`, `is_revoked`

---

## 10. Fraud Detection

### 10.1 Fraud Score Thresholds (5-level)

| Range | Status | Action | OPA |
|-------|--------|--------|-----|
| 0.00–0.30 | CLEAR | PASS | — |
| 0.31–0.60 | LOW_RISK | PASS (logged) | — |
| 0.61–0.80 | MEDIUM_RISK | REVIEW_REQUIRED | OPA-H05 soft flag |
| 0.81–0.89 | HIGH_RISK | REVIEW_REQUIRED (priority) | OPA-H05 escalated |
| 0.90–1.00 | CRITICAL | BLOCK | OPA-H05 hard block |

### 10.2 Fraud Signals by Document Type

| Signal | Description | Applies To |
|--------|-------------|------------|
| `metadata_analysis` | EXIF/PDF metadata: editing software, timestamps, camera info | All docs (VisaKey only) |
| `font_consistency` | Font variety, size variance, unknown fonts | All docs (VisaKey only) |
| `layout_anomaly` | Line angles, margin variance, row gaps | All docs (VisaKey only) |
| `document_quality` | Blur, resolution, compression artifacts | All docs (VisaKey only) |
| `cross_doc_consistency` | Field-level comparison across documents | All docs (both channels) |
| `mrz_check` | MRZ line validation and checksum | Passport only (both channels) |
| `content_plausibility` | Logical field validation (dates, amounts) | All docs (both channels) |

### 10.3 Signal Applicability by Format (Image vs PDF)

From Ranita's Data Extraction Strategy (updated 11 April 2026):

| Sub-signal | Images (JPEG/PNG) | PDFs | Notes |
|------------|-------------------|------|-------|
| `editing_software` | YES (EXIF Software tag) | YES (PDF Creator/Producer) | Works on both |
| `no_camera` | YES (needs EXIF Make/Model) | NO | PDFs have no camera EXIF |
| `timestamp_mismatch` | YES (EXIF DateTimeOriginal vs Digitized) | NO | PDFs have single creation date |
| `modified_after_creation` | NO | YES (PDF CreationDate vs ModDate) | Images lack modification timestamp |
| `unknown_fonts` | NO | YES (PDF font tables) | Images have no font identifiers |
| `height_variance` | YES (pixel glyph height) | NO | PDFs use point-size instead |
| `font_variety` | NO | YES (distinct font count in PDF) | Images lack font data |
| `h_angle_var` | YES (horizontal line angles) | NO | PDFs store structured coordinates |
| `left_margin_var` | NO | YES (left-edge X positions) | Images infer margins from pixels |
| `row_gap_var` | YES (pixel gap between text rows) | NO | PDFs use `line_gap_var` instead |
| `line_gap_var` | NO | YES (vertical gap between PDF blocks) | Images use `row_gap_var` |

**AMS impact:** The fraud detail view must show which signals were applicable (based on document format) and which were N/A. GovDirect channel: image-based signals are always N/A.

### 10.4 Fraud Signal Weights by Document Category

Per-signal weights used to compute the composite `fraud_score` on each `document_extractions` row. Weights sum to 1.0 per category.

**Source:** Canonical Document Extraction Schema V1.2, Section 1. The detailed Fraud Scoring Weight Model (with worked examples) is maintained separately as an OV-owned asset.

| Signal | Passport (MRZ) | Non-MRZ ID (National ID, BRP) | Bank Statement | Tier 2 Critical (Employment, Payslip, P60, IELTS, Degree) | Supporting (TB, Utility, Police) |
|--------|:---:|:---:|:---:|:---:|:---:|
| `metadata_analysis` | 0.10 | 0.15 | 0.15 | 0.20 | 0.30 |
| `font_consistency` | 0.10 | 0.15 | 0.20 | 0.25 | 0.20 |
| `layout_anomaly` | 0.05 | 0.05 | 0.10 | 0.05 | 0.00 |
| `document_quality` | 0.10 | 0.15 | 0.10 | 0.10 | 0.20 |
| `cross_doc_consistency` | 0.15 | 0.20 | 0.25 | 0.30 | 0.30 |
| `mrz_check` | 0.25 | N/A | N/A | N/A | N/A |
| `content_plausibility` | 0.25 | 0.30 | 0.20 | 0.10 | 0.00 |

**Formula:** `fraud_score = Σ(signal_score × signal_weight)` for all applicable signals.

**Category rationale:**
- **Passport (MRZ):** Uses the full 7-signal profile including `mrz_check` (25% weight). Only document type with MRZ.
- **Non-MRZ ID:** Passport's MRZ weight redistributed across content plausibility (+0.05), metadata (+0.05), cross-doc consistency (+0.05), font consistency (+0.05), quality (+0.05). Covers National ID and BRP.
- **Bank Statement:** Heaviest weights on `font_consistency` (0.20), `cross_doc_consistency` (0.25), and `content_plausibility` (0.20) — fake bank statements are the most common UK immigration fraud vector and salary credits must reconcile with payslips + employment letters.
- **Tier 2 Critical:** Dominant signal is `cross_doc_consistency` (0.30) because employment, payslips, P60, IELTS, and degree must all agree with each other and with CoS. Font consistency (0.25) catches template-copied documents.
- **Supporting:** `cross_doc_consistency` (0.30) and `metadata_analysis` (0.30) dominate. `layout_anomaly` and `content_plausibility` drop to 0.00 — these documents have more natural format variation and lighter fraud impact.

**AMS impact:** The Fraud Detail modal (V3 component 12.3) should display the per-signal score AND weight side by side so officers can see which signals drove the composite score. Without this context, a 0.25 signal score is meaningless — it might be negligible (weight 0.05 = 0.0125 contribution) or decisive (weight 0.30 = 0.075 contribution).

---

## 11. AMS TypeScript Types

### 11.1 Decision Types (`src/api-contracts/dis.ts`)

```typescript
// === Decision ===
export type DecisionOutcome = 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED';
export type ProcessingPath = 'AUTOMATED' | 'ESCALATED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DISDecision {
  outcome: DecisionOutcome;
  confidence: number;        // 0-100
  processing_path: ProcessingPath;
  risk_level: RiskLevel;
  overall_score: number;     // 0-100 weighted composite
}

// === Component Scores (9) ===
export interface ComponentScore {
  score: number;             // 0-100 — does applicant meet the requirement?
  status: string;            // VERIFIED, CLEAR, LOW_RISK, ACCEPTABLE, etc.
  confidence: number;        // 0-100 — AI extraction confidence
  details: string;
}

export type ComponentScoreKey =
  | 'passport'
  | 'financial'
  | 'employment'
  | 'english_language'
  | 'immigration_compliance'
  | 'criminal_record'
  | 'health'
  | 'document_quality'
  | 'fraud_risk';

export type ComponentScores = Record<ComponentScoreKey, ComponentScore>;

// === Drools Rules (20) ===
export type VisaType = 'universal' | 'skilled_worker' | 'student' | 'global_talent' | 'family' | 'asylum' | 'intra_company_transfer' | 'startup_innovator' | 'youth_mobility';
export type RuleSeverity = 'MANDATORY' | 'ADVISORY';

export interface DroolsRuleResult {
  rule_id: string;           // RULE-U01..U05, RULE-W01..W15
  rule_file: string;         // e.g., "skilled_worker/salary_rules.drl"
  result: 'PASS' | 'FAIL';
  detail: string;
  source: string;
  reference_data?: string;
  reference_field?: string;
  visa_type: VisaType;
  severity: RuleSeverity;
  evaluated_at: string;
}

// === OPA Policies (12) ===
export type OPATier = 'HARD' | 'SOFT';
export type OPAResult = 'BLOCK' | 'REVIEW_REQUIRED' | 'PASS';

export interface OPAPolicyResult {
  policy_id: string;         // OPA-H01..H06, OPA-S01..S06
  policy_name: string;
  tier: OPATier;
  result: OPAResult;
  reason: string;
  data_source: string;
  rego_file: string;
  evaluated_at: string;
  failed_documents?: string[];
}

// === External Checks (6) ===
export type ExternalCheckType =
  | 'WORLDCHECK'
  | 'INTERPOL_SLTD'
  | 'PASSPORT_VERIFY'
  | 'DEVICE_IP_RISK'
  | 'EMAIL_PHONE_REPUTATION'
  | 'SPONSOR_VERIFY';

export type CheckStatus = 'CLEAR' | 'BLOCKED' | 'FLAGGED' | 'ERROR' | 'TIMEOUT';

export interface ExternalCheckResult {
  request_id: string;
  dis_application_id: string;
  document_id: string | null;
  check_type: ExternalCheckType;
  check_status: CheckStatus;
  risk_level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  confidence_score: number;
  flags: Record<string, unknown>;
  responded_at: string;
  response_time_ms: number;
  details: Record<string, unknown>;
}

// === Document Extraction ===
export type ExtractionMethod = 'DOC_AI_ID_PARSER' | 'DOC_AI_FORM_PARSER' | 'DOC_AI_CUSTOM_EXTRACTOR';
export type ExtractionTier = 'TIER_1' | 'TIER_2';
export type DocumentCriticality = 'CRITICAL' | 'SUPPORTING';
export type FraudStatus = 'CLEAR' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL';

export type DocumentType =
  | 'PASSPORT'
  | 'BANK_STATEMENT'
  | 'NATIONAL_ID'
  | 'BRP'
  | 'EMPLOYMENT_LETTER'
  | 'PAYSLIP'
  | 'P60_TAX'
  | 'IELTS_CERTIFICATE'
  | 'DEGREE_CERTIFICATE'
  | 'TB_CERTIFICATE'
  | 'UTILITY_BILL'
  | 'POLICE_CERTIFICATE';

export interface DocumentExtraction {
  extraction_id: string;
  dis_application_id: string;
  document_id: string;
  document_type: DocumentType;
  tier: ExtractionTier;
  criticality: DocumentCriticality;
  extraction_method: ExtractionMethod;
  processor_id: string;
  processor_version: string;
  extraction_confidence: number;
  raw_extraction: Record<string, unknown>;
  extracted_data: Record<string, unknown>;
  normalised_fields: Record<string, unknown>;
  fraud_score: number | null;      // null for GovDirect non-image docs
  fraud_status: FraudStatus | null;
  fraud_signals: Record<string, unknown> | null;
  source_channel: 'visakey' | 'govdirect';
  gcs_raw_path: string;
  gcs_processed_path: string;
  created_at: string;
  updated_at: string;
}

// === Audit Log ===
export interface ProcessingError {
  stage: string;
  check: string;
  error_code: string;
  error_message: string;
  timestamp: string;
  impact: string;
}

export interface AuditLog {
  pipeline_version: string;
  models_used: {
    document_ai: string;
    fraud_detection: string;
    rules_engine: string;
    llm_summary: string;
  };
  data_classification: string;
  processing_location: string;
  documents: { total: number; successful: number; failed: number; errors: ProcessingError[] };
  rules: { total_evaluated: number; passed: number; failed: number; skipped: number };
  external_checks: { total: number; successful: number; failed: number; timed_out: number; errors: ProcessingError[] };
  opa_policies: { total_evaluated: number; passed: number; blocked: number; flagged: number };
  processing_errors: ProcessingError[];
  warnings: string[];
}

// === Full Application View (what AMS reads) ===
export interface DISApplicationView {
  // From decision callback
  decision: DISDecision;
  component_scores: ComponentScores;
  audit_log: AuditLog;
  source_channel: 'visakey' | 'home-office';

  // From DIS Postgres (read via API on demand)
  rule_results: DroolsRuleResult[];
  opa_results: OPAPolicyResult[];
  external_checks: ExternalCheckResult[];
  document_extractions: DocumentExtraction[];
  llm_summary: string;

  // From submission payload (passed through)
  source_application_id: string;
  source_reference: string;
  dis_application_id: string;
  submitted_at: string;
}
```

---

## 12. AMS UI Components

### 12.0 Design Continuity — Preserve Existing Shell

**The existing reviewer page at `/dashboard/reviewer/[applicationId]` is the baseline. We keep the shell and swap the DIS-specific parts.**

Current structure (from `src/app/dashboard/reviewer/[applicationId]/page.tsx`):

```
<ApplicationHeader />              ← KEEP
<AIScanResultsRedesigned />        ← REPLACE with Component Scores Dashboard (12.1)
                                     + Glass-Box Trail (12.2) + External Checks (12.4)
<Accordion>
  <SectionCard /> × N              ← KEEP — extend with DIS rule/extraction context
</Accordion>
<DecisionFooter />                 ← KEEP — sticky footer with actions
+ Dialogs (Note, Contact,
  Escalate, Approve, Reject)       ← KEEP all 5
```

**Components preserved as-is or minor tweaks:**

| Component | Status | Notes |
|-----------|--------|-------|
| `ApplicationHeader` | KEEP | Add `source_channel` badge (VisaKey vs GovDirect), `dis_application_id` link |
| `SectionCard` (accordion item) | KEEP | Extend `getIssuesForSection()` to filter DIS rule/OPA results per section |
| Section detail components (14+) | KEEP | `PassportSectionDetails`, `KycSectionDetails`, `FinancialSectionDetails`, `DocumentsSectionDetails`, etc. — map to DIS `normalised_fields` |
| `DecisionFooter` | KEEP | Sticky footer, existing Approve/Reject/Escalate/Contact actions |
| `NoteDialog` | KEEP | Per-section notes, officer-authored |
| `ContactApplicantDialog` | KEEP | |
| `EscalateDialog` | KEEP | |
| `ApproveDialog` | KEEP | Add DIS decision rationale capture for audit trail |
| `RejectDialog` | KEEP | Add DIS decision rationale capture for audit trail |

**Components replaced:**

| Old | New | Why |
|-----|-----|-----|
| `AIScanResultsRedesigned` (single `score`, `issues[]`, `recommendations[]`) | `ComponentScoresDashboard` (9 scores) + `GlassBoxTrail` (rules + OPA) + `ExternalChecksPanel` (6 APIs) | DIS returns structured multi-layer results, not a single score |
| `AIScanResult` type | `DISApplicationView` (see Section 11) | Proper type alignment with DIS contract |
| `mockScanResult` fallback | `mockDISApplicationView` | New mock data shape |

**Components added (new, slot into existing shell):**

- `ComponentScoresDashboard` — 9 cards, inserted where `AIScanResultsRedesigned` was
- `GlassBoxTrail` — 3-section drill-down (Drools, OPA Hard, OPA Soft), inserted below Component Scores
- `ExternalChecksPanel` — 6 API result cards, inserted below Glass-Box Trail
- `FraudDetailModal` — drill-down from document sections
- `CrossDocConsistencyView` — new component between sections and decision footer
- `LLMSummaryPanel` — collapsible, below external checks
- `AuditTrailPanel` — new (see 12.9)

This approach means:
1. **No redesign work wasted** — existing visuals, colours, spacing, interaction patterns all stay
2. **Existing section components immediately useful** — they already render applicant data, we just feed them from DIS `normalised_fields` instead of the raw submission payload
3. **New DIS components slot in above the accordion** — single top-to-bottom flow: header → decision summary → rules trail → external checks → detailed sections → audit → decision footer

### 12.1 Component Scores Dashboard (primary view)

9 cards, one per component score. Each card shows:
- Component name + score (0-100) with colour coding (green >= 80, amber 50-79, red < 50)
- AI confidence indicator (separate from score — different meaning)
- Status badge (VERIFIED, CLEAR, LOW_RISK, etc.)
- Click to drill down into underlying rules, extractions, and checks

### 12.2 Glass-Box Trail (drill-down)

**Three sections**, displayed distinctly:

**Drools Rules (20):**
- Grouped by domain: `universal/` (5) vs `skilled_worker/` (15)
- Each rule: PASS (green) / FAIL (red) badge + rule ID + description + detail
- Severity indicator: MANDATORY vs ADVISORY
- Filterable by result (all / failures / passes)
- Summary: "18/20 rules passed, 2 failed"

**OPA Hard Policies (6):**
- Red shield icon — visually distinct from Drools
- BLOCK = immediate red banner, cannot be ignored
- PASS = green
- Shows data source and reason

**OPA Soft Policies (6):**
- Amber flag icon — visually distinct from hard policies
- REVIEW_REQUIRED = amber, officer must assess
- PASS = green (no action needed)
- Shows data source and trigger reason

### 12.3 Document Extraction Viewer

Two rendering modes based on criticality:

**Critical documents (structured view):**
- Typed field table: field name + extracted value + confidence per field
- Tier badge (ID Parser / Form Parser / Custom Extractor)
- Fraud score indicator with 5-level colour coding
- Fraud signals detail: which sub-signals were applicable vs N/A (based on image/PDF format)
- Document thumbnail/preview link

**Supporting documents (key-value view):**
- Dynamic key-value table from flexible JSONB
- Extracted text summary
- Dates, names, amounts found
- Confidence indicator

### 12.4 External Checks Panel

6 individual check cards:
- **World-Check:** risk level + categories + lists + matches
- **Interpol SLTD:** stolen/lost/revoked/invalid flags
- **Passport Verification:** overall match + field matches + authenticity + immigration history (overstay/deportation/refusal)
- **Device & IP Risk:** VPN/Tor/proxy flags + device trust score + geo (N/A for GovDirect)
- **Email & Phone:** disposable/fraud flags + domain age + carrier
- **Sponsor Verification:** licence status + rating + suspension/revocation

Each card shows: status badge (CLEAR/FLAGGED/BLOCKED/ERROR/TIMEOUT), response time, and expandable details.

### 12.5 Cross-Document Consistency View

Side-by-side comparison table:
- Field name (e.g., "Applicant Name", "Salary", "Employer")
- Value from each source document
- Match status (green tick / red flag)
- Which Drools rule checked this

### 12.6 LLM Summary Panel

- Collapsible panel, below component scores and rules trail
- Gemini-generated natural language case briefing
- Clearly labelled: "AI-generated summary — not a decision factor"
- Model version shown (from `audit_log.models_used.llm_summary`)

### 12.7 Duplicate Application Comparison (full page)

When RULE-U04 flags a potential duplicate:
- Full-page side-by-side view of both applications
- Matching fields highlighted
- Differences flagged
- Officer can link/unlink as duplicates

### 12.8 Completeness Score Widget

Visual representation of RULE-W13:
- Document checklist with weights
- Present/missing status per document
- Calculated score with < 70 threshold indicator

### 12.9 Audit Trail Panel

New component. Collapsible panel above the `DecisionFooter`, always visible when an officer is reviewing a decision.

**Two distinct audit streams displayed in one panel:**

**Stream 1 — DIS Automated Audit (read-only, from `audit_log` in decision callback)**
- Pipeline version and models used (Document AI, Vision AI, Drools, OPA, Gemini)
- Processing location (europe-west2)
- Data classification (OFFICIAL-SENSITIVE)
- Document processing stats (X/Y successful, errors if any)
- Rules stats (X/20 evaluated, passed, failed, skipped)
- External checks stats (X/6 successful, timed out, errors)
- OPA policies stats (X/12 evaluated, passed, blocked, flagged)
- Processing errors and warnings
- Timestamps: when DIS received, when DIS decided

**Stream 2 — Officer Action Audit (read-write, local to AMS)**
Every action an officer takes on this application is logged, with officer ID, timestamp, and detail:

| Action | When logged | Captured fields |
|--------|-------------|----------------|
| `application.viewed` | First time officer opens the page | officer_id, opened_at |
| `section.approved` | Click "Approve" on a SectionCard | officer_id, section_id, approved_at |
| `section.referred` | Click "Refer" on a SectionCard | officer_id, section_id, reason, referred_at |
| `section.note_added` | Save a note via NoteDialog | officer_id, section_id, note_text, created_at |
| `verification.rerun` | Manual re-check via Verification Hub (task 2.21) | officer_id, system_id, passport_or_name, result, rerun_at |
| `contact.initiated` | Open ContactApplicantDialog | officer_id, method, initiated_at |
| `contact.info_requested` | Send Request Info via dialog | officer_id, message, sent_at |
| `application.escalated` | Submit EscalateDialog | officer_id, reasons[], notes, escalated_at |
| `decision.approved` | Submit ApproveDialog | officer_id, rationale, approved_at |
| `decision.rejected` | Submit RejectDialog | officer_id, rationale, rejected_at |
| `application.decision_override` | Officer approves despite DIS REJECTED, or rejects despite DIS APPROVED | officer_id, dis_outcome, officer_outcome, rationale, timestamp |

**Visual pattern:**
- Vertical timeline, most recent event at the top
- DIS automated events in blue (read-only, `audit_log` source)
- Officer actions in green (write, current session) or gray (prior sessions)
- Override events highlighted in amber — officer decision differed from DIS recommendation
- Filter toggle: "All" / "DIS only" / "Officer only" / "Overrides only"
- Export to CSV / PDF for compliance reporting

**Storage (Phase 2 mock, Phase 3 real):**
- Phase 2: `localStorage` scoped to `applicationId` — prototype only, resets per session
- Phase 3: POST to AMS backend — each action writes to `officer_audit_trail` table in Neon Postgres, cross-referenced with DIS `dis_application_id`
- Phase 4: BigQuery export for long-term compliance (7 years retention per OFFICIAL-SENSITIVE classification)

**Why this matters for the officer:**
When an officer has to justify a decision to a senior reviewer, tribunal, or legal challenge, the audit trail shows:
1. What DIS found automatically
2. What the officer did in response
3. Which manual re-checks were run
4. Any overrides of DIS recommendations with rationale
5. Complete decision timeline

This is non-negotiable for immigration case defensibility.

---

## 13. Multi-Visa Scalability

The Drools file structure defines the pattern:

```
drools/
  universal/           ← ALL visa types
  skilled_worker/      ← Phase 1
  student/             ← Future
  global_talent/       ← Future
  family/              ← Future
```

AMS follows the same pattern:
- **Universal types** (all visa types): `DISDecision`, `ComponentScores`, `DroolsRuleResult`, `OPAPolicyResult`, `ExternalCheckResult`, `DocumentExtraction`, `AuditLog`
- **Visa-specific types** (extend per type): completeness checklist, required documents, specific rule IDs, reference data

```typescript
export interface CompletenessConfig {
  visa_type: VisaType;
  documents: Array<{
    type: DocumentType;
    weight: number;
    required: boolean;
    conditional_on?: string;   // e.g., "nationality in tb_test_countries"
  }>;
  threshold: number;           // e.g., 70
}
```

---

## 14. Integration Plan

### Phase 1: Type Alignment (AMS only, no DIS dependency) — 3-4 days

| Task | Description |
|------|-------------|
| 1.1 | Create `src/api-contracts/dis.ts` with all types from Section 11 |
| 1.2 | Create `src/types/extraction.ts` with per-document-type field interfaces |
| 1.3 | Extend `ApplicationDetail` with DIS fields (source_channel, dis_application_id, etc.) |
| 1.4 | Create `src/lib/nationality.ts` with alpha-2/alpha-3 mapping |
| 1.5 | Standardise decision enum, reconcile `actionType` inconsistency |
| 1.6 | Define `CompletenessConfig` with visa-type-agnostic document checklist |

### Phase 2: AMS UI Components (using synthetic/mock data) — 10-14 days

**2A — Officer Dashboard (review what DIS produced)**

**All tasks below preserve the existing `/dashboard/reviewer/[applicationId]` shell — see Section 12.0 for the design continuity plan.**

| Task | Description |
|------|-------------|
| 2.0 | Replace `AIScanResult` type with `DISApplicationView`. Update `mockScanResult` → `mockDISApplicationView`. Existing page keeps rendering with new shape. |
| 2.1 | Component scores dashboard (9 cards with drill-down) — drops into the slot currently occupied by `AIScanResultsRedesigned` |
| 2.2 | Glass-box trail — Drools (20 rules, grouped by domain) |
| 2.3 | Glass-box trail — OPA Hard (6 policies, red shield) |
| 2.4 | Glass-box trail — OPA Soft (6 policies, amber flag) |
| 2.5 | Document extraction viewer (structured + key-value modes) |
| 2.6 | External checks panel (6 cards with corrected API list) |
| 2.7 | Fraud detail view (5-level scale, image/PDF signal applicability) |
| 2.8 | Cross-document consistency view |
| 2.9 | LLM summary panel (collapsible, secondary) |
| 2.10 | Duplicate application comparison (full page) |
| 2.11 | Completeness score widget |
| 2.12 | **Audit Trail Panel** (new) — dual-stream: DIS automated audit (from `audit_log`) + officer action audit (local events). Vertical timeline above DecisionFooter. See Section 12.9. |
| 2.13 | Extend `SectionCard.getIssuesForSection()` to filter DIS rule/OPA results per section (e.g., passport section shows U01, U02, H02, H03 results) |
| 2.14 | Add `source_channel` badge + `dis_application_id` link to `ApplicationHeader` |
| 2.15 | Extend `ApproveDialog` and `RejectDialog` to capture decision rationale and write to audit trail (critical for DIS override events) |
| 2.16 | Mock DIS data transformer (generate realistic `DISApplicationView` output from synthetic payloads) |

**2B — Rules Management UI Prototype (`/dashboard/rules-management/`)**

Non-technical officers need to view, edit, and publish Drools rules and OPA policies without touching `.drl` or `.rego` files. This is a prototype — mock data, no backend — to validate the UX before Phase 4 builds the real thing.

| Task | Description |
|------|-------------|
| 2.17 | **Rules catalogue view** — browse all 20 Drools rules + 12 OPA policies in a single table. Columns: Rule ID, Name, Type (Drools/OPA), Domain (universal/skilled_worker), Severity (MANDATORY/ADVISORY/HARD/SOFT), Status (active/draft/disabled), Last Modified. Filterable and searchable. |
| 2.18 | **Rule detail & editor** — click a rule to see: plain-English description, validation condition, input fields, reference data it consults, which document types it applies to, current threshold values. Edit mode: form-based editing of threshold values and conditions (no raw DRL). Shows a diff preview before saving. |
| 2.19 | **Reference data manager** — view and edit the 11 reference data files. Table view with search/filter. Inline editing for simple fields (e.g., salary threshold £41,700 → £43,000). CSV upload for bulk data (sponsor register). Shows which rules are affected by a change. |
| 2.20 | **Publish workflow** — draft → review → publish pipeline. Version history with diff between versions. Rollback to previous version. Publish creates a new version tag — rules go live without redeployment (hot-reload from GCS). Approval required from senior officer before publish. |
| 2.21 | **Rule test simulator** — paste or select a sample application payload, run it against a rule, see PASS/FAIL result with detail. Useful for testing threshold changes before publishing. |

**2C — Officer Verification Hub (existing — `/dashboard/tools/verification`)**

**This page already exists and MUST be preserved.** It is the officer-facing manual re-check interface — used AFTER DIS automated checks have run, when an officer reviewing a flagged application needs to re-query an external system directly.

Current state: 9 systems (Document Check, Biometric, INTERPOL I-24/7, Sanctions, Immigration History, Travel History, Education Verification, Criminal Records, Social Media Screening) backed by `lib/mockSystems.ts`. Supports passport / name+DOB / photo input modes, individual or bulk checks with checkbox selection, alert banner for serious findings.

**Alignment with the 6 DIS External APIs:**

| Verification Hub System | DIS External API | DIS Drools Rule | Notes |
|-------------------------|------------------|-----------------|-------|
| Document Check | Passport Verification (#3) | RULE-U01 | Direct map |
| Biometric Match | — (internal biometric_verification payload) | RULE-U02 | Not an external API — internal verification |
| INTERPOL I-24/7 | Interpol SLTD (#2) | RULE-U01 | Direct map |
| Sanctions | Reuters World-Check (#1) | RULE-U03 | Direct map |
| Immigration History | Passport Verification (#3) | RULE-W12 | Merged with #3 in V1.1 of Decision Map |
| Travel History | Passport Verification (#3) | RULE-W12 | Same source as Immigration History |
| Education Verification | — (no DIS API) | RULE-W07, W08 | Officer-only tool; DIS uses ref data (uk_universities.json, NARIC) |
| Criminal Records | — (no DIS API) | RULE-W11 | Officer-only tool; DIS uses external_checks (Interpol) + applicant declaration |
| Social Media Screening | — (no DIS API) | — | Officer discretion only; not part of DIS pipeline |

| Task | Description |
|------|-------------|
| 2.22 | **Align existing hub with DIS contract** — update `mockSystems.ts` so mock responses match the DIS external check result shapes from Section 5.4. The 6 DIS APIs should return data shaped like `ExternalCheckResult`. |
| 2.23 | **Add "DIS already ran this" indicator** — when the hub is opened from an application context (e.g., from the reviewer page), show for each system whether DIS already ran the equivalent check, the result, and the timestamp. Officer can see: "DIS ran Sanctions at 10:02:14 — CLEAR — [re-run manually]". |
| 2.24 | **Link Verification Hub from the reviewer page** — in the glass-box trail (task 2.3/2.4), each OPA/Drools result that's backed by an external API gets a "Re-verify" button that deep-links into the hub with the applicant's passport number / name pre-filled. |
| 2.25 | **Log manual re-checks to the Audit Trail Panel** (task 2.12) — when an officer manually re-runs a check, it's recorded as a `verification.rerun` event on the application audit trail. This becomes part of the officer's decision justification. |
| 2.26 | **Extend hub to support the 3 non-DIS systems** — Education, Criminal, Social Media are officer-only tools (DIS doesn't call these APIs). Keep them in the hub for officer discretion during manual review, but mark them clearly as "Officer-only" to distinguish from DIS-automated checks. |

**2D — API Gateway Admin Prototype (`/dashboard/api-gateway/`)**

Separate from the Verification Hub. This is the **admin/ops** view of the 6 DIS external API integrations — used by senior admins (not caseworkers) to monitor health, toggle mock vs live, and test the integrations themselves. Verification Hub = "run an API call for this applicant". API Gateway Admin = "is the API healthy and which environment are we pointing at?".

| Task | Description |
|------|-------------|
| 2.27 | **API overview dashboard** — 6 cards, one per external API. Each shows: name, provider, status (healthy/degraded/down), avg response time, success rate (last 24h), mock vs live indicator. |
| 2.28 | **API detail view** — click an API to see: endpoint URL, auth method, request/response JSON schemas, timeout config, retry policy, circuit breaker state. Recent request log (last 50 calls with status, latency, errors). |
| 2.29 | **Mock/live toggle** — switch individual APIs between mock and live mode. Shows a confirmation dialog with impact summary ("Switching World-Check to LIVE will use real LSEG credentials and incur API costs"). Requires admin permission. |
| 2.30 | **Health monitoring** — real-time status indicators per API. Timeout and error rate alerts. Shows which OPA/Drools rules are affected if an API is down (e.g., "World-Check down → RULE-U03 and OPA-H01 cannot evaluate → all applications routed to MANUAL_REVIEW"). |
| 2.31 | **API test console** — send a test request to any API with sample data, see the raw response. Useful for verifying mock APIs return expected scenarios (happy path, sanctions match, timeout). |

### Phase 3: Live DIS Integration (VK Backend + AMS) — 5-7 days

| Task | Description |
|------|-------------|
| 3.1 | VK Backend: DIS submission service (payload assembler + HTTP POST) |
| 3.2 | VK Backend: Webhook handler (`POST /api/webhooks/dis-decision`) |
| 3.3 | VK Backend + Expo: Push notifications for decision received |
| 3.4 | AMS: DIS API data provider (replace JSON file provider) |
| 3.5 | AMS: Officer decision write path (approve/reject/escalate → DIS) |

### Phase 4: Platform Features — ongoing

| Task | Description |
|------|-------------|
| 4.1 | RBAC with clearance-gated views (CTC, SC, DV) — see `docs/devdocs/ai-queue-orchestrator-roadmap.md` for officer model |
| 4.2 | **Rules management — production** (evolve Phase 2B prototype): real GCS backend for rule storage, hot-reload integration with DIS, audit trail for all rule changes, multi-visa rule sets |
| 4.3 | **API gateway — production** (evolve Phase 2C prototype): real health monitoring via Cloud Monitoring, circuit breaker integration with Cloud Workflows, cost tracking per API, SLA dashboards |
| 4.4 | AI model configuration (extraction prompts, confidence thresholds, Custom Extractor retraining trigger) |
| 4.5 | BigQuery analytics dashboards (processing volumes, decision distributions, API latency, rule pass/fail rates) |
| 4.6 | Multi-visa form definitions (Student, Global Talent, Family — extend visa-builder) |

---

## 15. Open Items & Pending Deloitte Deliverables

### What's FINAL (build against now)

| Item | Status |
|------|--------|
| 20 Drools rule IDs, names, files, sources, ref data | LOCKED |
| 12 OPA policy IDs, tiers, triggers, rego files | LOCKED |
| 6 External API list, triggers, consumers | LOCKED |
| 14 Document types, tiers, criticality, processors | LOCKED |
| 9 Component score structure (score/status/confidence/details) | LOCKED |
| Decision callback JSON shape | LOCKED |
| Audit log structure | LOCKED |
| Fraud score 5-level thresholds | LOCKED |
| Auth model (opaque API keys Phase 1) | LOCKED |
| 11 reference data files | DELIVERED |
| Extraction architecture (Doc AI, no Gemini) | LOCKED |
| Channel independence | LOCKED |

### What's PENDING from Deloitte

| Item | Raised | Impact on AMS |
|------|--------|---------------|
| Exact threshold values (hard-fail, soft-flag, auto-approve) | 23 March | Low — AMS reads what DIS sends, doesn't enforce thresholds |
| Component score weighting for `overall_score` | 23 March | Low — AMS displays the score, doesn't compute it |
| 7 extraction schema corrections | 1 April | Medium — using our Canonical Schema instead |
| DecisionDraft V2 | 6 April | Low — V1 content already incorporated |
| OpenAPI 3.0 spec for DIS API (SCRUM-17) | 26 March | Medium — we're building mock-first, will align when spec arrives |
| PostgreSQL + BigQuery schemas (Q32) | open | Medium — we know the JSON shapes, need DDL for integration |
| Error/retry contract (DIS down, timeout handling) | open | Medium — affects AMS error states |
| Fraud sample timeline | 6 April | Low — corpus fraud variants already built |
| RULE-W13 completeness weights | open | Low — weights are configurable |

### Assessment

**The AMS frontend can be built NOW.** All shapes are locked. The pending items are either:
- Numbers the AMS doesn't enforce (thresholds, weights — DIS computes, AMS displays)
- Database DDL we can infer from the JSON shapes
- An OpenAPI spec we're building mock-first anyway

The only real blocker would be if Deloitte changes the callback JSON shape or rule/policy IDs — and those are now stable across all Confluence pages.

---

## 16. Source Documents

| Document | Location | Last Updated |
|----------|----------|-------------|
| Query Response Log (Q1-Q40) | Confluence page 3571713 | Apr 10 |
| Decision Callback Payload Spec | Confluence page 4817079 | Mar 23 |
| Decision Map v1.1 (7 tabs, 32 decision points) | Confluence page 22446098 | Apr 7 |
| Canonical Document Extraction Schema | `docs/devdocs/Canonical Document Extraction Schema.md` (local draft) + Confluence page 27328513 (placeholder) | Apr 12 (local) |
| Data Extraction Strategy (Ranita) | Confluence page 13402113 | Apr 11 |
| Preety's Extraction Schema | Confluence page 15630341 | Apr 1 (HAS ERRORS) |
| Application Data Taxonomy | Confluence page 15663108 | Apr 1 |
| CoS Pipeline README | Confluence page 16809998 | Apr 2 |
| External API Checks & Integrations | Confluence page 27197443 | Apr 10 |
| Drools & OPA Rules Engine | Confluence page 26673153 | Apr 10 |
| Document Extraction & Classification | Confluence page 27230212 | Apr 10 |
| Anti-Abuse & Submission Integrity Strategy | Confluence page 26312707 | Apr 10 |
| DevOps & Infrastructure | Confluence page 26640432 | Apr 10 |
| Technical Reference (hub) | Confluence page 26640385 | Apr 10 |
| DecisionDraft V1 (80+ pages) | `docs/devdocs/DD-DIS - DecisionDraft- V1-050426-111034.pdf` | Apr 3 |
| Data Extraction Strategy PDF | `docs/devdocs/DD-DIS - Data Extraction Strategy-050426-194246.pdf` | Apr 5 |
| Pipeline Architecture v3 | `docs/devdocs/OpenVisa_Pipeline_Architecture_v3.pdf` | — |
| Integration Spec V1 | `docs/specs/2026-04-05-dis-integration-spec.md` | Superseded |
| Integration Spec V2 | `docs/specs/2026-04-06-dis-integration-spec-v2.md` | Superseded by this document |

---

*This spec is version-controlled at `ams-official/docs/specs/2026-04-12-dis-integration-spec-v3.md`*
