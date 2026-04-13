# AMS + DIS Full Platform Integration Spec — V2

**Date:** 6 April 2026
**Author:** Chris Claudius + Claude Code
**Status:** Draft — awaiting review
**Supersedes:** `2026-04-05-dis-integration-spec.md` (v1)
**Scope:** Align the AMS officer dashboard with the full Deloitte DIS pipeline, VisaKey 2.0 backend, and VisaKey 2.0 Expo app — designed for multi-visa scalability from day one

---

## Table of Contents

1. [Context and Vision](#1-context-and-vision)
2. [Platform Architecture](#2-platform-architecture)
3. [Data Taxonomy — The 3-Field Tuple Model](#3-data-taxonomy)
4. [DIS Processing Pipeline](#4-dis-processing-pipeline)
5. [Decision Callback Payload](#5-decision-callback-payload)
6. [Cross-System Gap Analysis](#6-cross-system-gap-analysis)
7. [AMS Data Model — Type Definitions](#7-ams-data-model)
8. [AMS UI Components](#8-ams-ui-components)
9. [Multi-Visa Scalability](#9-multi-visa-scalability)
10. [Integration Plan](#10-integration-plan)
11. [Open Items](#11-open-items)
12. [Source Documents](#12-source-documents)

---

## 1. Context and Vision

### What is AMS?

AMS (Application Management System) is the enlarged platform scaffold for OpenVisa Phases 1-3. It is NOT just an officer dashboard — it will grow to include:

- **Phase 1 (now):** Officer dashboard for reviewing DIS-processed visa applications
- **Phase 2:** RBAC with clearance-gated views, rules management UI, AI model configuration
- **Phase 3:** Decision matrix, multi-visa support (7-8 visa types), analytics dashboards, full audit trail

### What is DIS?

DIS (Document Ingestion System) is the brain. Built by Deloitte on GCP Assured Workloads, it handles:

- **Document extraction:** Document AI (Tier 1) + Gemini Vision (Tier 2)
- **Fraud detection:** Vision AI fraud scoring
- **External checks:** 6 APIs (World-Check, Interpol SLTD, Passport Verification, Border Control, Device/IP, Email/Phone Reputation)
- **Rules engine:** Drools (25+ rules for Skilled Worker) + OPA guardrails (6 hard policies)
- **Decision matrix:** Weighted scoring + LLM summary generation
- **Storage:** Postgres (processing results) + BigQuery (analytics)

### Core Principle: "AI Extracts, Rules Decide"

AI (Document AI, Gemini Vision, Vision AI) extracts and analyses data. But AI does NOT make the decision. The decision is made deterministically by the Drools rules engine and OPA policy guardrails. The LLM summary runs AFTER the decision is made and has NO decision power. Every decision is traceable to specific rules — this is non-negotiable for auditability.

### Two Input Channels

| Channel | Source | Auth | Biometric | Docs Storage |
|---------|--------|------|-----------|--------------|
| **VisaKey** | Mobile app (Expo/React Native) | Clerk JWT | Regula SDK (mobile) | GCS `visakey-documents` bucket |
| **GovDirect** | Government systems (External API) | Home Office session token | VAC in-person | Gov doc store → DIS copies to processing bucket |

DIS processes both channels identically — same extraction, same rules, same OPA, same decision logic. The `source_channel` field is for audit/routing only.

---

## 2. Platform Architecture

```
APPLICANT SIDE                           GOVERNMENT SIDE (Assured Workloads)

VisaKey App ─────┐                       ┌─── DIS API Gateway (FastAPI/Cloud Run)
(Expo/RN)        │                       │
                 ▼                       │    ┌─────────────────────────┐
Gov Systems ───> Ingestion Gateway       │    │ AI Processing Pipeline  │
(External API)   (Hono/Cloud Run)        │    │  ├─ Document AI (T1)    │
                 │                       │    │  ├─ Gemini Vision (T2)  │
                 ▼                       │    │  ├─ Fraud (Vision AI)   │
          PostgreSQL + GCS ──────────────┘    │  ├─ External Checks (6) │
          (VisaKey DB)   POST metadata        │  └─ Drools + OPA        │
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
| Synthetic Data | `openvisa-synthetic-data` | Python 3.13 | None | N/A |

---

## 3. Data Taxonomy — The 3-Field Tuple Model

Every data element in a visa application is classified as a 3-field tuple. This replaces the simple "Tier 1 / Tier 2" classification.

### 3.1 The Tuple

**A — Ingestion Type (what DIS receives)**
- `structured_payload` — JSON fields from the submission form; no file (e.g., CoS reference, IHS payment, form answers)
- `uploaded_file` — PDF/image document (e.g., passport, bank statement, employment letter)
- `external_system` — pulled/pre-populated record from an external API (e.g., Interpol SLTD, Border Control)

**B — Extraction / Parsing Path (how fields are produced)**
- `none` — structured input, no extraction needed
- `docai` — Document AI specialised processors (Tier 1)
- `vision_ocr` — Gemini Vision OCR (Tier 2)
- `deterministic_parse` — MRZ parsing, regex, checksum (also performs basic verification)

**C — Verification Primitive(s) (how confidence is built)**
A **set** — many elements use multiple primitives:
- `external_authoritative_check` — API/feed (e.g., Interpol SLTD, HMPO passport verification)
- `reference_dataset_lookup` — published list/register (e.g., sponsor register, approved TB clinics)
- `cross_document_consistency` — Drools compares across artifacts within an application
- `format_and_logic_validation` — pattern/constraints only; insufficient to prove authenticity
- `manual_review_required` — officer must assess

### 3.2 Processing Tiers (Axis 1)

**UPDATE 6 April 2026:** Gemini Vision ruled out for extraction. Ranita (Deloitte AI/ML) confirmed the architecture is Document AI across the board. Reasoning: hallucination risk, non-deterministic outputs, prompt engineering dependency — incompatible with Glass Box auditability. Both tiers now use Document AI with per-field confidence scores and full processor logging.

| Tier | Processor | Documents | Confidence |
|------|-----------|-----------|------------|
| **Tier 1** | Document AI **ID Parser** (specialised) | Passport, Bank Statement, National ID, BRP | High (0.90+) |
| **Tier 2** | Document AI **Custom Extractor** (trained per doc type) | Employment Letter, Payslips, P60, IELTS Certificate, Degree Certificate, COS Letter, TB Certificate, + 10 supporting doc types | High once trained (needs labelled samples) |
| **Structured** | None (bypass extraction) | CoS reference, IHS payment, visa fee, biometric results, form answers | N/A |

**Implication:** Custom Extractor needs labelled training data per document type. Our synthetic document corpus (63 PDFs + ground truth JSONs) directly fuels Deloitte's extraction accuracy. More samples and format variability = better extractors.

### 3.3 Criticality (Axis 2)

| Level | Meaning | Rule Impact | Confidence Threshold |
|-------|---------|-------------|---------------------|
| **Critical** | Directly evaluated by Drools/DFM for eligibility/refusal | PASS/FAIL determines outcome | >= 0.80 required (RULE-U05) |
| **Supporting** | Completeness scoring and/or officer review only | Contributes to completeness score | No minimum |

### 3.4 Why This Matters for AMS

The AMS must display:
1. **Which processor** handled each document (Tier 1/Tier 2 badge)
2. **Whether the document is Critical or Supporting** (affects how failures are treated)
3. **The verification primitives used** (set of checks, not a single method)
4. **Structured inputs vs documents** (CoS is NOT a document — no extraction, no fraud score)

---

## 4. DIS Processing Pipeline

### 4.1 DIS Postgres Tables

| Table | Content | AMS Reads |
|-------|---------|-----------|
| `document_extractions` | Per-document: `raw_extraction` (JSONB) + `normalized_fields` | Yes — extraction viewer |
| `external_checks` | 6 API results with full request/response | Yes — external checks panel |
| `rule_results` | All Drools rule outputs (PASS/FAIL + detail) | Yes — glass-box trail |
| `opa_results` | All OPA guardrail outputs (BLOCK/REVIEW_REQUIRED/PASS) | Yes — hard block indicators |

### 4.2 Document Extraction Fields

**Tier 1 (Document AI) — stored in `document_extractions.raw_extraction` (JSONB) → `normalized_fields`:**

| Document | Key Extracted Fields |
|----------|---------------------|
| Passport | document_number, surname, given_names, full_name, date_of_birth, nationality, sex, issue_date, expiry_date, issuing_country, country_code, document_type, place_of_birth, place_of_issue, mrz_line_1, mrz_line_2, photo_hash, has_signature, document_authenticity_score, fraud_flags, fraud_signals, confidence_score |
| Bank Statement | account_holder_name, account_number, sort_code, micr_code, ifsc_code, customer_id, account_currency, product_name, branch_name, statement_period, opening_balance, closing_balance, confidence_score |
| National ID | document_number, given_names, surname, full_name, date_of_birth, nationality, gender, issue_date, expiry_date, issuing_authority, has_photo, confidence_score |
| BRP | document_number, given_names, surname, full_name, date_of_birth, nationality, gender, issue_date, expiry_date, issuing_authority, has_photo, confidence_score |

**Tier 2 (Gemini Vision / TBD) — same storage pattern:**

| Document | Key Extracted Fields |
|----------|---------------------|
| Employment Letter | employer_name, job_title, start_date, salary_amount, salary_frequency, employment_type, hours_per_week, employer_address, signatory_name, signatory_position, letter_date |
| Payslips | employer_name, employee_name, pay_period_start, pay_period_end, gross_pay, net_pay, tax_deducted, ni_deducted, pay_frequency, payslip_date, employee_number |
| P60 / Tax | tax_year, employer_name, employee_name, ni_number, total_pay_in_year, total_tax_in_year, total_ni_in_year, employer_paye_reference |
| IELTS Certificate | test_type, candidate_name, date_of_birth, test_date, overall_score, listening_score, reading_score, writing_score, speaking_score, test_report_form_number, cefr_level |
| Degree Certificate | institution_name, candidate_name, qualification_title, qualification_level, subject, award_date, classification, country_of_institution, naric_reference |
| TB Certificate | patient_full_name, date_of_birth, certificate_type, issuing_clinic_or_hospital, issuing_country, examining_doctor_name, issue_date, expiry_date, certificate_number, outcome |
| COS Letter | cas_number, institution_name, institution_licence_number, student_name, date_of_birth, course_title, course_level, course_start_date, course_end_date, tuition_fee, fees_paid, cas_assigned_date, cas_expiry_date |

**Supporting documents** use flexible JSONB blob extraction:
```json
{
  "document_type": "UTILITY_BILL",
  "extraction_confidence": 0.82,
  "extracted_text_summary": "...",
  "key_value_pairs": { "account_holder": "...", "address": "...", "amount": "..." },
  "dates_found": ["2026-01-15"],
  "names_found": ["Arjun Reddy"],
  "amounts_found": [142.50]
}
```

### 4.3 External API Checks

6 checks, all stored in `external_checks` table:

| Check | Trigger | Key Response Fields | Validation |
|-------|---------|--------------------|----|
| **Reuters World-Check** | Every application | risk_level, confidence_score, categories_checked (SANCTIONS, PEP, ADVERSE_MEDIA, LAW_ENFORCEMENT), lists_checked (OFSI, UN_SC, EU_SANCTIONS, US_OFAC, INTERPOL_RED_NOTICE), matches_found | HIGH = block, MEDIUM = manual review |
| **Interpol SLTD** | When PASSPORT detected | is_stolen, is_lost, is_revoked, is_invalid, sltd_reference, database_version | Any flag true = block |
| **Passport Verification** | When PASSPORT detected | overall_match, field_matches, document_number, surname, given_names, date_of_birth, expiry_date, gender, nationality, check_digit_valid, authenticity, document_status | overall_match == false = block |
| **Border Control** | Every application | has_overstay, has_deportation, has_refusal_at_border, travel_records (Entry/Exit), current_immigration_status | deportation = reject, overstay/refusal = manual review |
| **Device & IP Risk** | VisaKey only (GovDirect auto-passes) | ip_analysis, is_vpn, is_tor, is_proxy, is_datacenter, is_known_fraud_ip, device_analysis, device_fingerprint_known, device_trust_score, geo_analysis, submission_velocity, impossible_travel | VPN+geo mismatch, impossible travel, known fraud IP = flags |
| **Email & Phone Reputation** | Every application | email_analysis (is_disposable, is_deliverable, domain_age_days, breach_count, is_known_fraud_email), phone_analysis (is_valid, line_type, carrier, is_voip, is_virtual, phone_country, is_known_fraud_phone) | Disposable email, VOIP, fraud matches = flags |

### 4.4 Drools Rules

Organised in `.drl` files by domain. The `universal/` rules apply to ALL visa types; `skilled_worker/` rules are Skilled Worker-specific.

**Universal rules (all visa types):**

| Rule | File | Description | Source | Ref Data |
|------|------|-------------|--------|----------|
| RULE-U01 | universal/passport_rules.drl | Passport validity (expiry >= 6 months from travel date) | document_extractions | — |
| RULE-U02 | universal/biometric_rules.drl | Biometric verification (face match >= 0.85, liveness = PASS, MRZ = PASS) | submission payload + document_extractions | — |
| RULE-U03 | universal/sanctions_rules.drl | Sanctions screening (World-Check HIGH = block, MEDIUM = review) | external_checks (World-Check) | — |
| RULE-U04 | universal/duplicate_rules.drl | Duplicate application detection (fuzzy: same passport+different email, same name+DOB+different passport, etc.) | DIS database lookup | — |
| RULE-U05 | universal/document_confidence_rules.drl | Extraction confidence (all Critical docs >= 0.80) | document_extractions | — |

**Skilled Worker rules:**

| Rule | File | Description | Source | Ref Data |
|------|------|-------------|--------|----------|
| RULE-W01 | skilled_worker/sponsorship_rules.drl | CoS validity (present, assigned within 3 months, not used) | submission payload | cos_register_mock.json |
| RULE-W02 | skilled_worker/sponsorship_rules.drl | Sponsor licence status (A-rated, not suspended/revoked) | submission payload | cos_register_mock.json |
| RULE-W03 | skilled_worker/salary_rules.drl | Salary threshold — General Option A (>= £41,700 AND >= 100% going rate AND hourly >= £17.13) | submission payload | soc_going_rates.json |
| RULE-W04 | skilled_worker/salary_rules.drl | Salary threshold — New Entrant (>= £33,400 AND >= 100% going rate) | submission payload + document_extractions (passport DOB) | soc_going_rates.json |
| RULE-W05 | skilled_worker/eligibility_rules.drl | SOC code eligibility (SOC 2020 in Appendix Skilled Occupations Tables 1-3, RQF 6+) | submission payload | eligible_soc_codes.json |
| RULE-W06 | skilled_worker/salary_rules.drl | Immigration Salary List check (reduced threshold if SOC on ISL) | submission payload | immigration_salary_list.json |
| RULE-W07 | skilled_worker/eligibility_rules.drl | Job skill level (RQF Level 6 / graduate level minimum) | submission payload | eligible_soc_codes.json |
| RULE-W08 | skilled_worker/eligibility_rules.drl | English language requirement (CEFR B2+ effective 8 January 2026) | document_extractions (IELTS) | — |
| RULE-W10 | skilled_worker/compliance_rules.drl | TB certificate (if nationality in Appendix T country list) | submission payload + document_extractions (TB cert) | tb_test_countries.json |
| RULE-W11 | skilled_worker/compliance_rules.drl | Criminal record disclosure (Interpol RED NOTICE = reject, YELLOW/BLUE = review, declaration inconsistency = review) | external_checks (Interpol) | — |
| RULE-W12 | skilled_worker/compliance_rules.drl | Previous immigration compliance (deportation = reject, overstay/refusal = review) | external_checks (Border Control) | — |
| RULE-W13 | skilled_worker/completeness_rules.drl | Application completeness (weighted scoring, 0-100; < 70 = manual review) | document_extractions | — |
| RULE-W14 | skilled_worker/compliance_rules.drl | Document fraud detection (Vision AI fraud_score thresholds) | document_extractions | — |
| RULE-W15 | skilled_worker/sponsorship_rules.drl | Start date validity (employment start within 3 months of submission) | submission payload | cos_register_mock.json |

**Key design decision (Q21):** Salary comes from the **submission payload** (`answers.employment.annualIncome`), NOT from the employment letter. The employment letter is for cross-verification only. DIS computes `hourly_rate_normalised` before Drools evaluates.

### 4.5 OPA Guardrails

Hard policies — fail-closed. Any BLOCK result stops the application.

| Policy | Severity | Description | Result Shape |
|--------|----------|-------------|-------------|
| OPA-H01 | Hard | Sanctions/World-Check — blocks confirmed sanctions matches or critical World-Check results | `{ policy_id, policy_name, tier: "HARD", result: "BLOCK"\|"REVIEW_REQUIRED"\|"PASS", reason, data_source, evaluated_at }` |
| OPA-H02 | Hard | Passport Stolen/Lost (Interpol SLTD) — blocks stolen, lost, revoked, or invalid passports | Same shape |
| OPA-H03 | Hard | Document Fraud (Tier 1) — blocks if any critical document has fraud_score >= 0.9 | Same shape, includes `failed_documents` array |
| OPA-H05 | Hard | Data Residency — verifies all PII stored in europe-west2 only | Same shape |
| OPA-H06 | Hard | Document Tampering — blocks on MRZ mismatch, cancelled documents, or authenticity_score < 0.50 | Same shape |

---

## 5. Decision Callback Payload

This is the JSON structure the AMS must consume. It is channel-independent — same shape for VisaKey and GovDirect.

### 5.1 Full Structure

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
    "passport":               { "score": 95, "status": "VERIFIED", "confidence": 97.1, "details": "..." },
    "financial":              { "score": 88, "status": "VERIFIED", "confidence": 92.0, "details": "..." },
    "employment":             { "score": 91, "status": "VERIFIED", "confidence": 94.5, "details": "..." },
    "english_language":       { "score": 85, "status": "VERIFIED", "confidence": 89.0, "details": "..." },
    "immigration_compliance": { "score": 100, "status": "CLEAR", "confidence": 99.0, "details": "..." },
    "criminal_record":        { "score": 100, "status": "CLEAR", "confidence": 99.0, "details": "..." },
    "health":                 { "score": 90, "status": "VERIFIED", "confidence": 88.0, "details": "..." },
    "document_quality":       { "score": 87, "status": "ACCEPTABLE", "confidence": 85.0, "details": "..." },
    "fraud_risk":             { "score": 98, "status": "LOW_RISK", "confidence": 96.0, "details": "..." }
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
    "rules": { "total_evaluated": 25, "passed": 25, "failed": 0, "skipped": 0 },
    "external_checks": { "total": 6, "successful": 6, "failed": 0, "timed_out": 0, "errors": [] },
    "processing_errors": [],
    "warnings": []
  },

  "source_channel": "visakey | home-office"
}
```

### 5.2 Component Score Semantics

Each component score has 4 fields:

| Field | Type | Meaning |
|-------|------|---------|
| `score` | 0-100 | Overall assessment of that component (does the applicant meet the requirement?) |
| `status` | string | Human-readable status (VERIFIED, CLEAR, LOW_RISK, ACCEPTABLE, etc.) |
| `confidence` | 0-100 | AI extraction confidence (how reliably was data read from documents?) |
| `details` | string | Human-readable detail string |

**Critical distinction:** A `score` of 30 on `financial` with `confidence` 98 means "we're very sure the applicant doesn't meet the financial threshold." The AI read the documents correctly — the applicant just doesn't qualify.

### 5.3 Decision Logic

| Outcome | Trigger | Action |
|---------|---------|--------|
| **REJECTED** | Any hard-fail: sanctions match, stolen passport, document fraud (>= 0.9), Interpol red notice, sanctioned country | Auto-reject. Officer can review but cannot overturn without escalation. |
| **MANUAL_REVIEW** | Any soft-flag: confidence < 70, declarations, discrepancies, completeness < 70, overstay history, fraud score 20-70, salary borderline, cross-doc inconsistencies | Officer must review and decide. |
| **APPROVED** | ALL rules pass, ALL OPA clear, ALL confidence above threshold, no flags | Auto-approve. Officer can review but application proceeds. |

### 5.4 What's NOT in the Callback

- Individual Drools rule results (stored in `rule_results` table — AMS reads directly)
- Individual OPA policy results (stored in `opa_results` table — AMS reads directly)
- Raw document extraction data (stored in `document_extractions` table — AMS reads directly)
- External check details (stored in `external_checks` table — AMS reads directly)
- LLM summary text (generated separately, stored in DIS — AMS reads directly)

The callback is the **aggregated decision**. The AMS reads the underlying detail from DIS Postgres via API.

---

## 6. Cross-System Gap Analysis

### 6.1 Decision Model — Three Vocabularies

| Concept | VK Backend | DIS/Drools | AMS Dashboard |
|---------|-----------|------------|---------------|
| Approved | `'approved'` | `'APPROVED'` | `'approved'` / `'Approved'` |
| Rejected | `'rejected'` | `'REJECTED'` | `'rejected'` / `'Rejected'` |
| Needs review | `'needs_review'` | `'MANUAL_REVIEW'` | `'escalated'` / `'Escalated'` |
| Processing states | `'incomplete'`, `'in_review'` | — | `'In Progress'`, `'Pending Assignment'`, `'Awaiting Info'` |

**Resolution:** Define canonical `DecisionOutcome` enum. Map at system boundaries via a `normalizeOutcome()` utility.

### 6.2 No Glass-Box Trail in AMS

DIS produces 4 separate result layers. AMS has only a generic `ScanIssue[]`. Need to model all 4 layers distinctly.

### 6.3 9 Component Scores Not Modelled

AMS `AIScanResult` has a single `score: number`. DIS returns 9 component scores, each with score + confidence + status + details.

### 6.4 Applicant Data Undertyped

AMS `ApplicantDetails` has 5 optional fields. DIS payload has 30+ structured fields.

### 6.5 Supporting Docs — Flexible JSONB

AMS has no handling for key-value-pair extraction results (only rigid typed interfaces).

### 6.6 Internal AMS Type Inconsistency

`ScanRecommendation.actionType` has two conflicting definitions in `src/types/aiScan.ts` vs `src/api-contracts/applications.ts`.

---

## 7. AMS Data Model — Type Definitions

### 7.1 Decision Types (`src/api-contracts/dis.ts`)

```typescript
// Canonical decision outcome
export type DecisionOutcome = 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED';
export type ProcessingPath = 'AUTOMATED' | 'ESCALATED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Decision object from DIS callback
export interface DISDecision {
  outcome: DecisionOutcome;
  confidence: number;        // 0-100
  processing_path: ProcessingPath;
  risk_level: RiskLevel;
  overall_score: number;     // 0-100 weighted composite
}

// Component score (9 of these in the callback)
export interface ComponentScore {
  score: number;             // 0-100 — does applicant meet the requirement?
  status: string;            // VERIFIED, CLEAR, LOW_RISK, ACCEPTABLE, etc.
  confidence: number;        // 0-100 — AI extraction confidence
  details: string;
}

export interface ComponentScores {
  passport: ComponentScore;
  financial: ComponentScore;
  employment: ComponentScore;
  english_language: ComponentScore;
  immigration_compliance: ComponentScore;
  criminal_record: ComponentScore;
  health: ComponentScore;
  document_quality: ComponentScore;
  fraud_risk: ComponentScore;
}
```

### 7.2 Processing Result Types

```typescript
// Drools rule result (from rule_results table)
export interface DroolsRuleResult {
  rule_id: string;           // e.g., "RULE-W03", "RULE-U01"
  rule_file: string;         // e.g., "skilled_worker/salary_rules.drl"
  result: 'PASS' | 'FAIL';
  detail: string;
  source: string;            // where input data came from
  reference_data?: string;   // which ref data file was consulted
  reference_field?: string;  // which field in the ref data
  visa_type: string;         // "universal" | "skilled_worker" | "student" | etc.
}

// OPA guardrail result (from opa_results table)
export interface OPAResult {
  policy_id: string;         // e.g., "OPA-H01", "OPA-H03"
  policy_name: string;       // e.g., "Sanctions_WorldCheck_HardBlock"
  tier: 'HARD';
  result: 'BLOCK' | 'REVIEW_REQUIRED' | 'PASS';
  reason: string;
  data_source: string;       // REUTERS_WORLDCHECK, INTERPOL_SLTD, etc.
  evaluated_at: string;
  failed_documents?: string[]; // for OPA-H03
}

// External check result (from external_checks table)
export interface ExternalCheckResult {
  request_id: string;
  dis_application_id: string;
  document_id: string | null;
  check_type: string;        // WORLDCHECK, INTERPOL_SLTD, PASSPORT_VERIFY, etc.
  check_status: string;      // CLEAR, BLOCKED, ERROR, TIMEOUT
  risk_level: string;        // NONE, LOW, MEDIUM, HIGH
  confidence_score: number;
  flags: Record<string, unknown>;
  responded_at: string;
  response_time_ms: number;
  details: Record<string, unknown>; // check-specific response fields
}
```

### 7.3 Document Extraction Types

```typescript
// Processing tier indicator (both tiers are Document AI — ID Parser vs Custom Extractor)
export type ExtractionTier = 'TIER_1_ID_PARSER' | 'TIER_2_CUSTOM_EXTRACTOR' | 'STRUCTURED_INPUT';
export type DocumentCriticality = 'CRITICAL' | 'SUPPORTING';

// Base extraction result (all documents)
export interface DocumentExtraction {
  document_id: string;
  document_type: string;     // PASSPORT, BANK_STATEMENT, etc.
  extraction_tier: ExtractionTier;
  criticality: DocumentCriticality;
  confidence_score: number;
  fraud_score?: number;      // only for AI-extracted docs
  raw_extraction: Record<string, unknown>;    // full JSONB
  normalized_fields: Record<string, unknown>; // cleaned fields
}

// Supporting document flexible extraction
export interface SupportingDocExtraction {
  document_type: string;
  extraction_confidence: number;
  extracted_text_summary: string;
  key_value_pairs: Record<string, string>;
  dates_found: string[];
  names_found: string[];
  amounts_found: number[];
}
```

### 7.4 Audit Log Types

```typescript
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
  processing_errors: ProcessingError[];
  warnings: string[];
}

export interface ProcessingError {
  stage: string;
  check: string;
  error_code: string;
  error_message: string;
  timestamp: string;
  impact: string;
}
```

### 7.5 Full DIS Application View (what AMS reads)

```typescript
export interface DISApplicationView {
  // From callback
  decision: DISDecision;
  component_scores: ComponentScores;
  audit_log: AuditLog;
  source_channel: 'visakey' | 'home-office';

  // From DIS Postgres (read via API)
  rule_results: DroolsRuleResult[];
  opa_results: OPAResult[];
  external_checks: ExternalCheckResult[];
  document_extractions: DocumentExtraction[];
  llm_summary: string;

  // From submission payload (passed through)
  source_application_id: string;
  source_reference: string;
  dis_application_id: string;
  submitted_at: string;
  applicant: ApplicantData;
  passport_data: PassportData;
  answers: ApplicationAnswers;
  documents: DocumentReference[];
}
```

---

## 8. AMS UI Components

### 8.1 Component Scores Dashboard (primary view)

9 cards showing each component score. Each card displays:
- Component name + score (0-100) with colour coding (green >= 80, amber 50-79, red < 50)
- AI confidence indicator (separate from score)
- Status badge (VERIFIED, CLEAR, LOW_RISK, etc.)
- Click to drill down into the underlying rules, extractions, and checks

This is the **top-level view** for officers. They see the "what" first.

### 8.2 Glass-Box Trail (drill-down)

Two sections — Drools Rules and OPA Guardrails — displayed distinctly:

**Drools Rules:**
- Grouped by domain file (`universal/`, `skilled_worker/`)
- Each rule: PASS (green) / FAIL (red) badge + rule ID + description + detail
- Filterable by result (all / failures / passes)
- Summary: "23/25 rules passed, 2 failed"

**OPA Guardrails:**
- Hard block indicators — visually distinct from Drools (red shield icon)
- BLOCK = immediate red banner, cannot be ignored
- REVIEW_REQUIRED = amber, officer must assess
- PASS = green, no action needed

### 8.3 Document Extraction Viewer

Two rendering modes based on criticality:

**Critical documents (structured view):**
- Typed field table: field name + extracted value + confidence per field
- Tier badge (ID Parser / Custom Extractor)
- Fraud score indicator (if applicable)
- Document thumbnail/preview link

**Supporting documents (key-value view):**
- Dynamic key-value table from flexible JSONB
- Extracted text summary
- Dates, names, amounts found
- Confidence indicator

### 8.4 External Checks Panel

6 individual check cards:
- World-Check: risk level + categories checked + lists checked + match details
- Interpol SLTD: stolen/lost/revoked flags
- Passport Verification: overall match + field-level matches + authenticity
- Border Control: overstay/deportation/refusal history + travel records
- Device & IP Risk: VPN/Tor/proxy flags + device trust score + geo analysis (N/A for GovDirect)
- Email & Phone: disposable/fraud flags + domain age + carrier details

### 8.5 Cross-Document Consistency View

Side-by-side comparison table:
- Field name (e.g., "Applicant Name", "Salary", "Employer")
- Value from each source document
- Match status (green tick / red flag)
- Which Drools rule checked this

### 8.6 LLM Summary Panel

- Collapsible panel, below component scores and rules trail
- Gemini-generated natural language case briefing
- Clearly labelled: "AI-generated summary — not a decision factor"
- Model version shown (from audit_log.models_used.llm_summary)

### 8.7 Duplicate Application Comparison (full page)

When RULE-U04 flags a potential duplicate:
- Full-page side-by-side view of both applications
- Matching fields highlighted
- Differences flagged
- Officer can link/unlink as duplicates

### 8.8 Completeness Score Widget

Visual representation of RULE-W13:
- Document checklist with weights (Passport=20, Employment Letter=15, Payslips=15, etc.)
- Present/missing status per document
- Calculated score with < 70 threshold indicator

---

## 9. Multi-Visa Scalability

### 9.1 Architecture Pattern

The Drools file structure defines the scaling pattern:

```
drools/
  universal/           ← applies to ALL visa types
    passport_rules.drl
    biometric_rules.drl
    sanctions_rules.drl
    duplicate_rules.drl
    document_confidence_rules.drl
  skilled_worker/      ← Skilled Worker only
    sponsorship_rules.drl
    salary_rules.drl
    eligibility_rules.drl
    financial_rules.drl
    compliance_rules.drl
    completeness_rules.drl
  student/             ← Future: Student visa
  global_talent/       ← Future: Global Talent
  family/              ← Future: Family visa
  ...
```

The AMS must follow the same pattern:
- **Universal types** (apply to all visa types): `DecisionOutcome`, `ComponentScores`, `DroolsRuleResult`, `OPAResult`, `ExternalCheckResult`, `DocumentExtraction`, `AuditLog`
- **Visa-specific types** (extend per visa type): completeness checklist, required documents, specific rules, reference data consulted

### 9.2 Extension Points Per Visa Type

| Visa Type | Category A (Structured Inputs) | Category B (Document Verification) | Specific Rules |
|-----------|-------------------------------|-------------------------------------|---------------|
| **Skilled Worker** | CoS reference, IHS, visa fee | IELTS/PTE TRF, ENIC degree, Employment Letter, Payslips, Bank Statements, TB Cert | W01-W15 (sponsorship, salary, eligibility, compliance) |
| **Student** | CAS number (like CoS), IHS, visa fee | IELTS/PTE TRF, ATAS certificate, ENIC statement, Bank Statements | S01-Sxx (CAS validity, course level, maintenance funds, study path) |
| **Global Talent** | Endorsement reference (Tech Nation / Arts Council / UKRI), IHS | Endorsement letter, Portfolio, Reference letters | GT01-GTxx (endorsement validity, talent category) |
| **Family** | IHS, visa fee, relationship reference | Marriage certificate, Accommodation proof, Financial evidence | F01-Fxx (relationship genuineness, financial requirement, English language) |
| **Asylum** | None (no fees or sponsorship) | Persecution evidence, Witness statements, Country condition reports (CPIN) | A01-Axx (persecution grounds, credibility assessment) |
| **Intra-Company Transfer** | CoS (same as Skilled Worker), IHS | Same as Skilled Worker + overseas employment proof | ICT01-ICTxx (minimum overseas employment, salary thresholds) |
| **Start-up / Innovator** | Endorsement reference, IHS | Endorsement letter, Business plan, Funding evidence, Market research | SU01-SUxx (endorsement body, innovation criteria, investment thresholds) |
| **Youth Mobility** | IHS, sponsoring country agreement | Maintenance funds | YM01-YMxx (age limit, sponsoring country, funds) |

### 9.3 TypeScript Pattern for Visa-Agnostic Types

```typescript
// Base rule result — visa type as discriminator
export interface DroolsRuleResult {
  rule_id: string;
  rule_file: string;
  result: 'PASS' | 'FAIL';
  detail: string;
  visa_type: 'universal' | 'skilled_worker' | 'student' | 'global_talent' | 'family' | 'asylum' | 'intra_company_transfer' | 'startup_innovator' | 'youth_mobility';
  source: string;
  reference_data?: string;
}

// Visa-specific completeness config (loaded from reference data)
export interface CompletenessConfig {
  visa_type: string;
  documents: Array<{
    type: string;
    weight: number;
    required: boolean;
    conditional_on?: string;   // e.g., "nationality in tb_test_countries"
  }>;
  threshold: number;           // e.g., 70
}

// The AMS loads the appropriate config based on visa_type
// No hard-coding of document checklists per visa type
```

---

## 10. Integration Plan

### Phase 1: Type Alignment (AMS only, no DIS dependency) — 3-4 days

| Task | Description |
|------|-------------|
| 1.1 | Create `src/api-contracts/dis.ts` with all DIS types (decision, component scores, rule results, OPA results, external checks, audit log) |
| 1.2 | Create `src/types/extraction.ts` with document extraction types (both structured and flexible JSONB) |
| 1.3 | Extend `ApplicationDetail` with DIS fields (source_channel, dis_application_id, etc.) |
| 1.4 | Create `src/lib/nationality.ts` with alpha-2/alpha-3 mapping |
| 1.5 | Standardise decision enum, reconcile `actionType` inconsistency |
| 1.6 | Define `CompletenessConfig` with visa-type-agnostic document checklist |

### Phase 2: AMS UI Components (using synthetic/mock data) — 7-10 days

| Task | Description |
|------|-------------|
| 2.1 | Component scores dashboard (9 cards with drill-down) |
| 2.2 | Glass-box trail (Drools rules + OPA guardrails, separate sections) |
| 2.3 | Document extraction viewer (structured + key-value modes) |
| 2.4 | External checks panel (6 individual check cards) |
| 2.5 | Cross-document consistency view |
| 2.6 | LLM summary panel (collapsible, secondary) |
| 2.7 | Duplicate application comparison (full page) |
| 2.8 | Completeness score widget |
| 2.9 | Update transformer to generate realistic mock DIS output from synthetic data |

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
| 4.1 | RBAC with clearance-gated views (CTC, SC, DV) |
| 4.2 | Rules management UI (CRUD for Drools rules + reference data) |
| 4.3 | AI model configuration (extraction prompts, confidence thresholds) |
| 4.4 | BigQuery analytics dashboards |
| 4.5 | Multi-visa form definitions (Student, Global Talent, Family, etc.) |

---

## 11. Open Items

### Awaiting from Deloitte

| Item | Priority | Status |
|------|----------|--------|
| Full extraction schema proposal (Q17) | High | IN PROGRESS — awaiting Deloitte's superset |
| Exact threshold values for decision logic | High | Awaiting proposal |
| Component score weighting for overall_score | High | Awaiting proposal |
| Q29.4-Q29.6 (OPA-S04 rapid submission, S05 scrutiny list, S06 CMEK rotation) | Medium | Deferred to Monday session |
| External API Check Specs doc (SCRUM-12) | Medium | Expected Monday AM |
| Error/retry contract (what happens when DIS is down) | Medium | To be aligned |

### Architecture Decisions Needed

| Decision | Options | Recommendation |
|----------|---------|----------------|
| AMS data source | DIS API vs direct DB access | DIS API — cleaner boundary |
| Callback vs polling for AMS | Webhook push vs AMS polls DIS | API — AMS reads on demand when officer opens an application |
| Duplicate comparison UI | Modal vs full page | Full page — needs space for side-by-side |

---

## 12. Source Documents

| Document | Location | Content |
|----------|----------|---------|
| Data Taxonomy & Verification Strategy | `ams-official/docs/devdocs/DIS — Application Data Taxonomy...md` | 3-field tuple, two-axis model, multi-visa scaling |
| DecisionDraft V1 (80+ pages) | `ams-official/docs/devdocs/DD-DIS - DecisionDraft- V1-050426-111034.pdf` | Ingestion payloads, extraction fields, external APIs, Drools rules, OPA Rego |
| Pipeline Architecture v3 | `ams-official/docs/devdocs/OpenVisa_Pipeline_Architecture_v3.pdf` | End-to-end flow diagram |
| Query Response Log (29 queries) | Confluence page 3571713 | Every technical decision from discovery |
| Decision Callback Payload Spec | Confluence page 4817079 | Callback JSON shape, component scores, decision logic |
| Data Extraction Strategy | Confluence page 13402113 | 4 extraction approaches compared (superseded by Data Taxonomy) |
| Integration Spec V1 | `ams-official/docs/specs/2026-04-05-dis-integration-spec.md` | Superseded by this document |

---

*This spec is version-controlled at `ams-official/docs/specs/2026-04-06-dis-integration-spec-v2.md`*
