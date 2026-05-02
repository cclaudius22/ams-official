# DIS — Canonical Document Extraction Schema

**Version:** 1.2 | **Date:** 14 April 2026 | **Owner:** C Claudius (Open Visa) | **Status:** PUBLISHED — All teams build against this schema

**Scope:** Skilled Worker visa — Phase 1 (12 document types + CoS structured input bypass)

**Purpose:** This is the single source of truth for document extraction output structure. All teams build against this schema:

* **Ranita** — Custom Extractor field labels must match `extracted_data` field names exactly
* **Preety** — `document_extractions` PostgreSQL table and `normalised_fields` JSONB column must conform to this structure
* **Drools/OPA** — downstream consumers read from `normalised_fields` only

**Related pages:** [Field Structure](https://openvisa.atlassian.net/wiki/spaces/DD/pages/14876676) | [Preety's Extraction Schema](https://openvisa.atlassian.net/wiki/spaces/DD/pages/15630341) | [Data Extraction Strategy](https://openvisa.atlassian.net/wiki/spaces/DD/pages/13402113) | [Application Data Taxonomy](https://openvisa.atlassian.net/wiki/spaces/DD/pages/15663108) | [CoS Pipeline README](https://openvisa.atlassian.net/wiki/spaces/DD/pages/16809998)

---

## 1. Extraction Record Envelope

Every document extraction produces one row in the `document_extractions` PostgreSQL table. The envelope is identical for all document types — only the contents of `extracted_data`, `normalised_fields`, and `fraud_signals` vary by type.

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
  "created_at": "2026-04-09T10:00:00Z",
  "updated_at": "2026-04-09T10:00:00Z"
}
```

**Column notes:**

| Column | Type | Purpose |
| --- | --- | --- |
| `extraction_id` | UUID v4 PK | Unique per extraction attempt |
| `dis_application_id` | UUID v4 FK | Links to `applications` table |
| `document_id` | UUID v4 FK | Links to `documents` table |
| `document_type` | ENUM | Canonical type from taxonomy |
| `tier` | ENUM | Processing tier (TIER_1 / TIER_2) |
| `criticality` | ENUM | Decision importance (CRITICAL / SUPPORTING) |
| `extraction_method` | ENUM | Which Doc AI processor type was used |
| `processor_id` | STRING | Full GCP resource path of the processor |
| `processor_version` | STRING | Processor version identifier |
| `extraction_confidence` | FLOAT | Overall extraction confidence (0.0–1.0) |
| `raw_extraction` | JSONB | Complete Doc AI output — untouched |
| `extracted_data` | JSONB | Structured fields parsed from raw output |
| `normalised_fields` | JSONB | Schema-mapped, normalised values for downstream |
| `fraud_score` | FLOAT | Weighted fraud score (0.0–1.0) — NULL for GovDirect non-image docs |
| `fraud_status` | ENUM | Threshold-derived status |
| `fraud_signals` | JSONB | Per-signal scores and flags |
| `source_channel` | ENUM | visakey / govdirect |
| `gcs_raw_path` | STRING | Source document location |
| `gcs_processed_path` | STRING | Extraction JSON output location |
| `created_at` | TIMESTAMP | Extraction timestamp |
| `updated_at` | TIMESTAMP | Last update (re-extraction, correction) |

**Fraud status thresholds (from fraud_weights.json):**

| Range | Status | Action |
| --- | --- | --- |
| 0.00–0.30 | CLEAR | PASS |
| 0.31–0.60 | LOW_RISK | PASS (logged) |
| 0.61–0.80 | MEDIUM_RISK | REVIEW_REQUIRED — OPA-H05 soft flag |
| 0.81–0.89 | HIGH_RISK | REVIEW_REQUIRED (priority) — OPA-H05 soft flag (escalated) |
| 0.90–1.00 | CRITICAL | BLOCK — OPA-H05 hard block |

**Fraud score calculation:** `fraud_score` is a weighted sum of per-signal scores. Weights vary by document category:

| Signal | Passport (MRZ) | Non-MRZ ID (National ID, BRP) | Bank Statement | Tier 2 Critical (Employment, Payslip, P60, IELTS, Degree) | Supporting (TB, Utility, Police) |
| --- | --- | --- | --- | --- | --- |
| `metadata_analysis` | 0.10 | 0.15 | 0.15 | 0.20 | 0.30 |
| `font_consistency` | 0.10 | 0.15 | 0.20 | 0.25 | 0.20 |
| `layout_anomaly` | 0.05 | 0.05 | 0.10 | 0.05 | 0.00 |
| `document_quality` | 0.10 | 0.15 | 0.10 | 0.10 | 0.20 |
| `cross_doc_consistency` | 0.15 | 0.20 | 0.25 | 0.30 | 0.30 |
| `mrz_check` | 0.25 | N/A | N/A | N/A | N/A |
| `content_plausibility` | 0.25 | 0.30 | 0.20 | 0.10 | 0.00 |

Formula: `fraud_score = Σ(signal_score × signal_weight)` for all applicable signals. Weights must sum to 1.0 per category. **Non-MRZ ID** redistributes Passport's MRZ weight across content plausibility, cross-document consistency, and metadata/font/quality signals. **Bank Statement** weights font consistency and cross-document consistency high because fake bank statements are the most common fraud vector in UK immigration, and salary credits must reconcile with payslips and employment letters. The detailed Fraud Scoring Weight Model (with worked examples and configurability notes) is maintained separately as an OV-owned asset.

**What is NOT in this table:**

* Certificate of Sponsorship — structured input, bypasses extraction entirely. See [CoS Pipeline README](https://openvisa.atlassian.net/wiki/spaces/DD/pages/16809998).
* Driver's Licence — not Phase 1 scope (included in Ranita's field structure for forward planning only).

---

## 2. Per-Document Schemas

For each document type below:

* `extracted_data` = what Doc AI returns (structured, typed)
* `normalised_fields` = what Drools/OPA reads (standardised formats, uppercase names, ISO dates)
* **Protection** = ENCRYPT (at rest via CMEK), HASH (one-way, for lookups), MASK (display only), PLAIN
* **Drools consumer** = which rules read this field

---

### 2.1 PASSPORT

**Tier:** 1 | **Criticality:** CRITICAL | **Method:** DOC_AI_ID_PARSER

**Drools consumers:** RULE-U01 (validity + expiry), RULE-U02 (biometrics), RULE-U04 (duplicate check), RULE-U05 (confidence), RULE-W14 (fraud)

```json
{
  "extracted_data": {
    "document_number": "XK9F4A7C2",
    "surname": "KUMARI",
    "given_names": "RANI",
    "full_name": "RANI KUMARI",
    "date_of_birth": "1993-08-14",
    "nationality": "INDIAN",
    "sex": "F",
    "issue_date": "2018-06-20",
    "expiry_date": "2028-06-19",
    "issuing_country": "INDIA",
    "country_code": "IND",
    "document_type_code": "P",
    "place_of_birth": "Delhi, India",
    "place_of_issue": "Ghaziabad, Uttar Pradesh, India",
    "mrz_line_1": "P<INDKUMARI<<RANI<<<<<<<<<<<<<<<<<<<",
    "mrz_line_2": "XK9F4A7C2IND9308146F2806199<<<<<<<<<<<<<",
    "photo_hash": "b1946ac92492d2347c6235b4d2611184",
    "has_signature": true
  },
  "normalised_fields": {
    "document_number": "XK9F4A7C2",
    "surname": "KUMARI",
    "given_names": "RANI",
    "full_name": "KUMARI, RANI",
    "date_of_birth": "1993-08-14",
    "nationality_code": "IND",
    "sex": "F",
    "issue_date": "2018-06-20",
    "expiry_date": "2028-06-19",
    "issuing_country_code": "IND",
    "mrz_valid": true,
    "mrz_checksum_passed": true,
    "months_to_expiry": 26,
    "is_expired": false
  },
  "fraud_signals": {
    "metadata_analysis": { "score": 0.05, "flags": [] },
    "font_consistency": { "score": 0.02, "flags": [] },
    "layout_anomaly": { "score": 0.03, "flags": [] },
    "document_quality": { "score": 0.04, "flags": [] },
    "cross_doc_consistency": { "score": 0.10, "flags": [] },
    "mrz_check": { "score": 0.00, "flags": [] },
    "content_plausibility": { "score": 0.05, "flags": [] }
  }
}
```

**Field protection:**

| Field | Protection | Notes |
| --- | --- | --- |
| document_number | HASH | Lookup key for duplicate checks |
| surname, given_names, full_name | ENCRYPT | PII |
| date_of_birth | ENCRYPT | PII |
| nationality, sex | PLAIN | Non-sensitive |
| issue_date, expiry_date, issuing_country | PLAIN | Non-sensitive |
| country_code | PLAIN | ISO 3166-1 alpha-3 |
| mrz_line_1, mrz_line_2 | ENCRYPT | Contains PII |
| photo_hash | HASH | Biometric reference |

---

### 2.2 BANK_STATEMENT

**Tier:** 1 | **Criticality:** CRITICAL | **Method:** DOC_AI_FORM_PARSER

**Drools consumers:** RULE-W09 (maintenance funds), RULE-W13 (completeness), RULE-W14 (fraud)

```json
{
  "extracted_data": {
    "account_holder_name": "RANI KUMARI",
    "account_number": "45678912",
    "sort_code": "12-34-56",
    "bank_name": "Barclays Bank UK PLC",
    "branch_name": "Canary Wharf, London",
    "account_currency": "GBP",
    "statement_period_start": "2026-01-01",
    "statement_period_end": "2026-01-31",
    "opening_balance": 125000.50,
    "closing_balance": 138420.75,
    "lowest_balance": 118500.00,
    "total_credits": 45000.00,
    "total_debits": 31579.75,
    "salary_credits": [
      { "date": "2026-01-28", "amount": 3500.00, "description": "SALARY ORION TECH" }
    ]
  },
  "normalised_fields": {
    "account_holder_name": "KUMARI, RANI",
    "account_number_last4": "8912",
    "sort_code": "12-34-56",
    "bank_name": "BARCLAYS BANK UK PLC",
    "currency": "GBP",
    "period_start": "2026-01-01",
    "period_end": "2026-01-31",
    "period_days": 31,
    "opening_balance_gbp": 125000.50,
    "closing_balance_gbp": 138420.75,
    "lowest_balance_gbp": 118500.00,
    "meets_maintenance_threshold": true,
    "salary_credit_detected": true,
    "monthly_salary_amount_gbp": 3500.00
  },
  "fraud_signals": {
    "metadata_analysis": { "score": 0.10, "flags": [] },
    "font_consistency": { "score": 0.05, "flags": [] },
    "layout_anomaly": { "score": 0.08, "flags": [] },
    "document_quality": { "score": 0.03, "flags": [] },
    "cross_doc_consistency": { "score": 0.12, "flags": [] },
    "content_plausibility": { "score": 0.06, "flags": [] }
  }
}
```

**Field protection:** ENCRYPT account_holder_name and all balances/amounts. MASK account_number (last 4 only). PLAIN sort_code.

---

### 2.3 NATIONAL_ID

**Tier:** 1 | **Criticality:** SUPPORTING | **Method:** DOC_AI_ID_PARSER (Custom)

**Drools consumers:** RULE-U04 (duplicate — secondary ID), RULE-U05 (confidence), RULE-W14 (fraud)

```json
{
  "extracted_data": {
    "document_number": "ID-9823741",
    "given_names": "RANI",
    "surname": "KUMARI",
    "full_name": "RANI KUMARI",
    "date_of_birth": "1993-08-14",
    "nationality": "INDIAN",
    "sex": "F",
    "issue_date": "2020-03-15",
    "expiry_date": "2030-03-14",
    "issuing_authority": "Government of India",
    "has_photo": true
  },
  "normalised_fields": {
    "document_number": "ID-9823741",
    "full_name": "KUMARI, RANI",
    "date_of_birth": "1993-08-14",
    "nationality_code": "IND",
    "sex": "F",
    "issue_date": "2020-03-15",
    "expiry_date": "2030-03-14",
    "is_expired": false
  },
  "fraud_signals": {
    "metadata_analysis": { "score": 0.05, "flags": [] },
    "font_consistency": { "score": 0.03, "flags": [] },
    "layout_anomaly": { "score": 0.04, "flags": [] },
    "document_quality": { "score": 0.02, "flags": [] },
    "cross_doc_consistency": { "score": 0.08, "flags": [] },
    "content_plausibility": { "score": 0.03, "flags": [] }
  }
}
```

**Field protection:** Same pattern as Passport (HASH document_number, ENCRYPT names/DOB, PLAIN the rest).

**Note:** National ID uses the **Non-MRZ ID** fraud weight profile. No `mrz_check` signal.

---

### 2.4 BRP (Biometric Residence Permit)

**Tier:** 1 | **Criticality:** SUPPORTING | **Method:** DOC_AI_ID_PARSER (Custom)

**Drools consumers:** RULE-U04 (duplicate — secondary ID), RULE-U05 (confidence), RULE-W12 (immigration compliance — BRP expiry cross-ref), RULE-W14 (fraud)

```json
{
  "extracted_data": {
    "document_number": "ZW1234567",
    "given_names": "RANI",
    "surname": "KUMARI",
    "full_name": "RANI KUMARI",
    "date_of_birth": "1993-08-14",
    "nationality": "INDIAN",
    "sex": "F",
    "issue_date": "2024-01-10",
    "expiry_date": "2026-12-31",
    "issuing_authority": "UK Home Office",
    "visa_type_on_brp": "SKILLED WORKER",
    "has_photo": true
  },
  "normalised_fields": {
    "document_number": "ZW1234567",
    "full_name": "KUMARI, RANI",
    "date_of_birth": "1993-08-14",
    "nationality_code": "IND",
    "sex": "F",
    "issue_date": "2024-01-10",
    "expiry_date": "2026-12-31",
    "is_expired": false,
    "visa_type_on_brp": "SKILLED_WORKER"
  },
  "fraud_signals": {
    "metadata_analysis": { "score": 0.04, "flags": [] },
    "font_consistency": { "score": 0.02, "flags": [] },
    "layout_anomaly": { "score": 0.03, "flags": [] },
    "document_quality": { "score": 0.02, "flags": [] },
    "cross_doc_consistency": { "score": 0.06, "flags": [] },
    "content_plausibility": { "score": 0.03, "flags": [] }
  }
}
```

**Field protection:** Same as National ID.

**Note:** BRP uses the **Non-MRZ ID** fraud weight profile. No `mrz_check` signal.

---

### 2.5 EMPLOYMENT_LETTER

**Tier:** 2 | **Criticality:** CRITICAL | **Method:** DOC_AI_CUSTOM_EXTRACTOR

**Drools consumers:** RULE-W03/W04/W06 (salary thresholds — cross-ref with payslip and CoS), RULE-W05 (SOC code), RULE-W07 (job skill level), RULE-W15 (start date), RULE-W13 (completeness), RULE-W14 (fraud)

```
{
  "extracted_data": {
    "employer_name": "Orion Tech Solutions Ltd",
    "employer_address": "3rd Floor, Orion Tech Park, Whitechapel, London, E1 7QA",
    "job_title": "IT Business Analyst",
    "start_date": "2026-05-01",
    "salary_amount": 50253.00,
    "salary_frequency": "ANNUAL",
    "hours_per_week": 38.5,
    "employment_type": "FULL_TIME",
    "signatory_name": "Amit Sharma",
    "signatory_position": "Human Resources Manager",
    "letter_date": "2026-04-01",
    "company_registration_number": "12345678",
    "on_company_letterhead": true
  },
  "normalised_fields": {
    "employer_name": "ORION TECH SOLUTIONS LTD",
    "job_title": "IT BUSINESS ANALYST",
    "start_date": "2026-05-01",
    "annual_salary_gbp": 50253.00,
    "hourly_rate_gbp": 25.10,
    "hours_per_week": 38.5,
    "employment_type": "FULL_TIME",
    "letter_date": "2026-04-01",
    "salary_matches_cos": null,
    "employer_matches_cos": null
  },
  "fraud_signals": {
    "metadata_analysis": { "score": 0.10, "flags": [] },
    "font_consistency": { "score": 0.15, "flags": ["FONT_INCONSISTENCY_DETECTED"] },
    "layout_anomaly": { "score": 0.05, "flags": [] },
    "document_quality": { "score": 0.03, "flags": [] },
    "cross_doc_consistency": { "score": 0.12, "flags": [] },
    "content_plausibility": { "score": 0.08, "flags": [] }
  }
}
```

**Field protection:**

| Field | Protection | Notes |
| --- | --- | --- |
| employer_name, employer_address | PLAIN | Non-sensitive |
| job_title, start_date | PLAIN | Non-sensitive |
| salary_amount | ENCRYPT | Financial |
| signatory_name | PLAIN | Non-sensitive (company representative) |
| company_registration_number | PLAIN | Public record |

**Cross-document consistency notes:** `salary_matches_cos` and `employer_matches_cos` are populated by the pipeline AFTER CoS lookup — comparing employment letter values against the CoS register. These are not extracted from the document itself.

---

### 2.6 PAYSLIP

**Tier:** 2 | **Criticality:** CRITICAL | **Method:** DOC_AI_CUSTOM_EXTRACTOR

**Drools consumers:** RULE-W03/W04/W06 (salary — cross-ref with employment letter and CoS), RULE-W09 (maintenance evidence), RULE-W13 (completeness), RULE-W14 (fraud)

```
{
  "extracted_data": {
    "employer_name": "Orion Tech Solutions Ltd",
    "employee_name": "RANI KUMARI",
    "employee_number": "EMP-4821",
    "pay_period_start": "2026-02-01",
    "pay_period_end": "2026-02-28",
    "gross_pay": 4187.75,
    "net_pay": 3250.00,
    "tax_deducted": 637.75,
    "ni_deducted": 300.00,
    "pay_frequency": "MONTHLY",
    "payslip_date": "2026-03-05",
    "ni_number": "QQ123456C",
    "tax_code": "1257L"
  },
  "normalised_fields": {
    "employer_name": "ORION TECH SOLUTIONS LTD",
    "employee_name": "KUMARI, RANI",
    "period_start": "2026-02-01",
    "period_end": "2026-02-28",
    "gross_pay_gbp": 4187.75,
    "net_pay_gbp": 3250.00,
    "tax_deducted_gbp": 637.75,
    "ni_deducted_gbp": 300.00,
    "pay_frequency": "MONTHLY",
    "annualised_gross_gbp": 50253.00,
    "employer_matches_employment_letter": null,
    "salary_consistent_with_employment_letter": null
  },
  "fraud_signals": {
    "metadata_analysis": { "score": 0.08, "flags": [] },
    "font_consistency": { "score": 0.05, "flags": [] },
    "layout_anomaly": { "score": 0.06, "flags": [] },
    "document_quality": { "score": 0.03, "flags": [] },
    "cross_doc_consistency": { "score": 0.10, "flags": [] },
    "content_plausibility": { "score": 0.04, "flags": [] }
  }
}
```

**Field protection:**

| Field | Protection | Notes |
| --- | --- | --- |
| employee_name | ENCRYPT | PII |
| employee_number | HASH | Identifier |
| ni_number | HASH | Sensitive — never store plain |
| All pay amounts | ENCRYPT | Financial PII |
| tax_code | PLAIN | Non-sensitive |

**Content plausibility checks:** `gross_pay - tax_deducted - ni_deducted ≈ net_pay` (arithmetic validation). `annualised_gross_gbp` is computed: `gross_pay × 12` for MONTHLY, `× 52` for WEEKLY, etc.

---

### 2.7 P60_TAX

**Tier:** 2 | **Criticality:** CRITICAL | **Method:** DOC_AI_CUSTOM_EXTRACTOR

**Drools consumers:** RULE-W03/W04 (salary cross-reference — annual total vs employment letter), RULE-W13 (completeness), RULE-W14 (fraud)

```
{
  "extracted_data": {
    "tax_year": "2025-2026",
    "employer_name": "Orion Tech Solutions Ltd",
    "employee_name": "RANI KUMARI",
    "ni_number": "QQ123456C",
    "total_pay_in_year": 50253.00,
    "total_tax_in_year": 7650.00,
    "total_ni_in_year": 3600.00,
    "employer_paye_reference": "123/AB45678"
  },
  "normalised_fields": {
    "tax_year": "2025-2026",
    "employer_name": "ORION TECH SOLUTIONS LTD",
    "employee_name": "KUMARI, RANI",
    "total_pay_gbp": 50253.00,
    "total_tax_gbp": 7650.00,
    "total_ni_gbp": 3600.00,
    "effective_tax_rate": 0.1522,
    "pay_consistent_with_payslips": null,
    "employer_matches_payslips": null
  },
  "fraud_signals": {
    "metadata_analysis": { "score": 0.06, "flags": [] },
    "font_consistency": { "score": 0.04, "flags": [] },
    "layout_anomaly": { "score": 0.05, "flags": [] },
    "document_quality": { "score": 0.03, "flags": [] },
    "cross_doc_consistency": { "score": 0.15, "flags": [] },
    "content_plausibility": { "score": 0.05, "flags": [] }
  }
}
```

**Field protection:** Same pattern as Payslip (ENCRYPT names and amounts, HASH ni_number).

**Content plausibility checks:** `total_pay_in_year ≈ sum(monthly_payslip_gross × months)`, `effective_tax_rate` within plausible UK range for income band.

---

### 2.8 IELTS_CERTIFICATE

**Tier:** 2 | **Criticality:** CRITICAL | **Method:** DOC_AI_CUSTOM_EXTRACTOR

**Drools consumers:** RULE-W08 (English language — CEFR B2+ required, effective 8 Jan 2026), RULE-W13 (completeness), RULE-W14 (fraud)

```
{
  "extracted_data": {
    "test_type": "IELTS Academic",
    "candidate_name": "RANI KUMARI",
    "date_of_birth": "1993-08-14",
    "test_date": "2024-10-12",
    "overall_score": 7.5,
    "listening_score": 8.0,
    "reading_score": 7.5,
    "writing_score": 7.0,
    "speaking_score": 7.5,
    "test_report_form_number": "24GB012345",
    "centre_number": "GB001",
    "cefr_level": "C1"
  },
  "normalised_fields": {
    "test_type": "IELTS_ACADEMIC",
    "candidate_name": "KUMARI, RANI",
    "test_date": "2024-10-12",
    "overall_score": 7.5,
    "listening_score": 8.0,
    "reading_score": 7.5,
    "writing_score": 7.0,
    "speaking_score": 7.5,
    "cefr_level": "C1",
    "meets_b2_minimum": true,
    "component_scores_valid": true,
    "test_within_2_years": true,
    "trf_number": "24GB012345"
  },
  "fraud_signals": {
    "metadata_analysis": { "score": 0.04, "flags": [] },
    "font_consistency": { "score": 0.03, "flags": [] },
    "layout_anomaly": { "score": 0.02, "flags": [] },
    "document_quality": { "score": 0.02, "flags": [] },
    "cross_doc_consistency": { "score": 0.08, "flags": [] },
    "content_plausibility": { "score": 0.03, "flags": [] }
  }
}
```

**Field protection:**

| Field | Protection | Notes |
| --- | --- | --- |
| candidate_name | ENCRYPT | PII |
| date_of_birth | ENCRYPT | PII |
| test_report_form_number | HASH | Unique identifier — Phase 2 TRF verification |
| All scores | PLAIN | Non-sensitive |

**Content plausibility checks:** `overall_score ≈ average(component_scores)` (IELTS rounds to nearest 0.5), all component scores between 0.0–9.0, `cefr_level` consistent with `overall_score`.

---

### 2.9 DEGREE_CERTIFICATE

**Tier:** 2 | **Criticality:** CRITICAL | **Method:** DOC_AI_CUSTOM_EXTRACTOR

**Drools consumers:** RULE-W07 (job skill level — RQF 6+ / graduate minimum), RULE-W08 (English exemption — UK degree), RULE-W13 (completeness), RULE-W14 (fraud)

```
{
  "extracted_data": {
    "institution_name": "University of Birmingham",
    "candidate_name": "RANI KUMARI",
    "qualification_title": "Bachelor of Science",
    "qualification_level": "Undergraduate",
    "subject": "Computer Science",
    "award_date": "2015-07-20",
    "classification": "First Class Honours",
    "country_of_institution": "United Kingdom",
    "certificate_number": "UOB-BSC-2015-4821"
  },
  "normalised_fields": {
    "institution_name": "UNIVERSITY OF BIRMINGHAM",
    "candidate_name": "KUMARI, RANI",
    "qualification_title": "BACHELOR OF SCIENCE",
    "subject": "COMPUTER SCIENCE",
    "award_date": "2015-07-20",
    "classification": "FIRST_CLASS_HONOURS",
    "country_code": "GBR",
    "is_uk_institution": true,
    "naric_reference": null,
    "rqf_level_equivalent": 6
  },
  "fraud_signals": {
    "metadata_analysis": { "score": 0.06, "flags": [] },
    "font_consistency": { "score": 0.04, "flags": [] },
    "layout_anomaly": { "score": 0.05, "flags": [] },
    "document_quality": { "score": 0.03, "flags": [] },
    "cross_doc_consistency": { "score": 0.10, "flags": [] },
    "content_plausibility": { "score": 0.04, "flags": [] }
  }
}
```

**Field protection:**

| Field | Protection | Notes |
| --- | --- | --- |
| candidate_name | ENCRYPT | PII |
| certificate_number | HASH | Unique identifier |
| naric_reference | HASH | Phase 2 ENIC verification |
| All other fields | PLAIN | Non-sensitive |

**Notes:** Since `is_uk_institution` is `true`, this degree automatically satisfies the English language requirement (RULE-W08 exemption) and the RQF level is known without ENIC lookup (`rqf_level_equivalent: 6` for a BSc). `naric_reference` is only needed for non-UK institutions in Phase 2 when the ENIC verification API is integrated.

---

### 2.10 TB_CERTIFICATE

**Tier:** 2 | **Criticality:** SUPPORTING | **Method:** DOC_AI_CUSTOM_EXTRACTOR

**Drools consumers:** RULE-W10 (TB test — required if nationality in Appendix T country list), RULE-W13 (completeness), RULE-W14 (fraud — supporting doc lighter weight)

```
{
  "extracted_data": {
    "patient_name": "RANI KUMARI",
    "date_of_birth": "1993-08-14",
    "clinic_name": "Apollo TB Screening Centre",
    "clinic_address": "21 Greams Road, Thousand Lights, Chennai, India",
    "issuing_country": "India",
    "test_date": "2026-02-15",
    "certificate_date": "2026-02-15",
    "expiry_date": "2026-08-15",
    "outcome": "CLEAR",
    "certificate_number": "TB-IN-2026-004821",
    "examining_doctor": "Dr. S. Venkatesh"
  },
  "normalised_fields": {
    "patient_name": "KUMARI, RANI",
    "clinic_name": "APOLLO TB SCREENING CENTRE",
    "clinic_country_code": "IND",
    "test_date": "2026-02-15",
    "expiry_date": "2026-08-15",
    "outcome": "CLEAR",
    "is_expired": false,
    "is_approved_clinic": null,
    "months_to_expiry": 4
  },
  "fraud_signals": {
    "metadata_analysis": { "score": 0.05, "flags": [] },
    "font_consistency": { "score": 0.04, "flags": [] },
    "layout_anomaly": { "score": 0.03, "flags": [] },
    "document_quality": { "score": 0.05, "flags": [] },
    "cross_doc_consistency": { "score": 0.08, "flags": [] },
    "content_plausibility": { "score": 0.03, "flags": [] }
  }
}
```

**Field protection:** ENCRYPT patient_name and DOB, HASH certificate_number, PLAIN everything else.

**Notes:** `is_approved_clinic` is populated by pipeline lookup against `approved_tb_clinics.json` reference data. Not extracted from the document itself.

---

### 2.11 UTILITY_BILL (Proof of Address)

**Tier:** 2 | **Criticality:** SUPPORTING | **Method:** DOC_AI_CUSTOM_EXTRACTOR

**Drools consumers:** RULE-W13 (completeness), RULE-W14 (fraud — supporting doc lighter weight), cross-document address consistency

```
{
  "extracted_data": {
    "account_holder_name": "RANI KUMARI",
    "service_address": "Flat 4B, 12 Whitechapel Road, London, E1 7QA",
    "utility_type": "COUNCIL_TAX",
    "supplier_name": "Tower Hamlets London Borough Council",
    "bill_date": "2026-03-01",
    "billing_period_start": "2026-04-01",
    "billing_period_end": "2027-03-31",
    "account_number": "CT-4821-9876",
    "amount_due": 1850.00
  },
  "normalised_fields": {
    "account_holder_name": "KUMARI, RANI",
    "service_address_line1": "FLAT 4B, 12 WHITECHAPEL ROAD",
    "service_address_city": "LONDON",
    "service_address_postcode": "E1 7QA",
    "utility_type": "COUNCIL_TAX",
    "supplier_name": "TOWER HAMLETS LONDON BOROUGH COUNCIL",
    "bill_date": "2026-03-01",
    "is_within_3_months": true,
    "address_matches_application": null
  },
  "fraud_signals": {
    "metadata_analysis": { "score": 0.06, "flags": [] },
    "font_consistency": { "score": 0.04, "flags": [] },
    "layout_anomaly": { "score": 0.05, "flags": [] },
    "document_quality": { "score": 0.03, "flags": [] },
    "cross_doc_consistency": { "score": 0.10, "flags": [] },
    "content_plausibility": { "score": 0.04, "flags": [] }
  }
}
```

**Field protection:** ENCRYPT account_holder_name, PLAIN address (needed for cross-doc checks), PLAIN amounts.

---

### 2.12 POLICE_CERTIFICATE

**Tier:** 2 | **Criticality:** SUPPORTING | **Method:** DOC_AI_CUSTOM_EXTRACTOR

**Drools consumers:** RULE-W11 (criminal record disclosure), RULE-W13 (completeness), RULE-W14 (fraud — supporting doc lighter weight)

```
{
  "extracted_data": {
    "subject_full_name": "RANI KUMARI",
    "date_of_birth": "1993-08-14",
    "nationality": "INDIAN",
    "issuing_authority": "Delhi Police",
    "issuing_country": "India",
    "certificate_number": "PC-IN-2026-12345",
    "issue_date": "2026-01-20",
    "expiry_date": "2026-07-20",
    "criminal_record_disclosed": false,
    "certificate_type": "Police Clearance Certificate"
  },
  "normalised_fields": {
    "subject_name": "KUMARI, RANI",
    "nationality_code": "IND",
    "issuing_country_code": "IND",
    "issue_date": "2026-01-20",
    "expiry_date": "2026-07-20",
    "is_expired": false,
    "criminal_record_disclosed": false,
    "months_to_expiry": 3
  },
  "fraud_signals": {
    "metadata_analysis": { "score": 0.05, "flags": [] },
    "font_consistency": { "score": 0.03, "flags": [] },
    "layout_anomaly": { "score": 0.04, "flags": [] },
    "document_quality": { "score": 0.03, "flags": [] },
    "cross_doc_consistency": { "score": 0.08, "flags": [] },
    "content_plausibility": { "score": 0.03, "flags": [] }
  }
}
```

**Field protection:** ENCRYPT subject_full_name and DOB, HASH certificate_number, PLAIN everything else.

---

## 3. Certificate of Sponsorship — NOT IN THIS SCHEMA

CoS is a structured reference number, not a document. It does **not** go through Document AI extraction and does **not** appear in the `document_extractions` table.

CoS data enters via `answers.employment.cosReferenceNumber` in the submission payload and is resolved via the CoS mock register lookup. See:

* [CoS Pipeline README](https://openvisa.atlassian.net/wiki/spaces/DD/pages/16809998)
* [Application Data Taxonomy](https://openvisa.atlassian.net/wiki/spaces/DD/pages/15663108)

**Do not add CoS to this schema. Do not create a Custom Extractor for CoS. Do not include CoS in fraud signal tables.**

---

## 4. Cross-Document Consistency Fields

Several `normalised_fields` contain `null` values that are populated **after** extraction by the pipeline's cross-document consistency checks:

| Field | Populated By | Logic |
| --- | --- | --- |
| `salary_matches_cos` | CoS lookup pipeline | Compare employment letter `annual_salary_gbp` with CoS `annualIncome` |
| `employer_matches_cos` | CoS lookup pipeline | Compare employment letter `employer_name` with CoS sponsor name |
| `employer_matches_employment_letter` | Cross-doc pipeline | Compare payslip `employer_name` with employment letter `employer_name` |
| `salary_consistent_with_employment_letter` | Cross-doc pipeline | Compare payslip `annualised_gross_gbp` with employment letter `annual_salary_gbp` (±5% tolerance) |
| `pay_consistent_with_payslips` | Cross-doc pipeline | Compare P60 `total_pay_gbp` with sum of payslip gross (±2% tolerance) |
| `employer_matches_payslips` | Cross-doc pipeline | Compare P60 `employer_name` with payslip `employer_name` |
| `is_approved_clinic` | Reference data lookup | TB clinic name against `approved_tb_clinics.json` |
| `address_matches_application` | Cross-doc pipeline | Utility bill address vs application declared address |

These fields are **critical for** `cross_doc_consistency` fraud signal scoring (weight 0.30 for non-ID documents).

---

## 5. Extraction Method Reference

| Method | Used For | Notes |
| --- | --- | --- |
| `DOC_AI_ID_PARSER` | Passport | Google pre-trained ID document parser |
| `DOC_AI_ID_PARSER` (Custom) | National ID, BRP | Custom-trained variant of ID Parser — required due to format variation across issuing countries. Needs labelled samples per nationality. |
| `DOC_AI_FORM_PARSER` | Bank Statement | Google pre-trained form/table parser |
| `DOC_AI_CUSTOM_EXTRACTOR` | Employment Letter, Payslip, P60, IELTS, Degree, TB Cert, Utility Bill, Police Cert | Custom-trained on SCRUM-21 corpus |
| ~~GEMINI_VISION~~ | ~~RULED OUT~~ | Non-deterministic outputs, hallucination risk. Not used anywhere in DIS. |

---

## 6. Normalisation Rules (Applied to All Types)

| Rule | Example |
| --- | --- |
| Names → UPPERCASE | "Rani Kumari" → "KUMARI, RANI" (surname-first) |
| Dates → ISO 8601 | "14 Aug 1993" → "1993-08-14" |
| Country → ISO 3166-1 alpha-3 | "India" → "IND", "Nigeria" → "NGA" |
| Currency amounts → GBP with 2dp | 50253 → 50253.00 |
| Rounding → half-up to 2dp | £50,253 ÷ 52 ÷ 38.5 = 25.0965… → 25.10 |
| Sex field → ICAO standard | All identity documents use `sex` (not `gender`) per ICAO 9303 |
| Boolean flags computed | `is_expired`, `meets_b2_minimum`, `test_within_2_years` |
| Months-to-expiry computed | Relative to `NOW()` at extraction time |

---

## 7. Version History

| Version | Date | Author | Changes |
| --- | --- | --- | --- |
| 1.0 | 9 April 2026 | C Claudius (OV) | Initial canonical schema — Skilled Worker Phase 1 |
| 1.1 | 14 April 2026 | C Claudius (OV) | Published to Confluence. Fixed: sex field standardised to ICAO 9303 across all identity docs (was gender on National ID and BRP). Passport document_number corrected to match MRZ (9 chars). RULE-W14 added to TB Certificate, Utility Bill, Police Certificate consumers. Bank Statement branch_name corrected to UK. Fraud weight formula added. Rounding convention documented. |
| 1.2 | 14 April 2026 | C Claudius (OV) | Fixed: Bank Statement added as separate fraud weight category (was missing from all three profiles). Fixed: National ID and BRP split into "Non-MRZ ID" weight profile (previous ID Documents weights summed to 0.75 without mrz_check). Fixed: BRP Drools consumers now includes RULE-W14 (fraud). Clarified: ID Parser (Custom) distinguished from pre-trained for National ID and BRP in extraction method reference. |

---

_This schema supersedes individual extraction schema proposals on pages_ [_15630341_](https://openvisa.atlassian.net/wiki/spaces/DD/pages/15630341) _and_ [_14876676_](https://openvisa.atlassian.net/wiki/spaces/DD/pages/14876676)_. Both Ranita and Preety should validate their implementations against this document and flag any discrepancies._