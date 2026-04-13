# DIS — Application Data Taxonomy & Verification Strategy

## 1. Purpose

This document classifies every data element in a Skilled Worker visa application along two dimensions: how it enters the DIS pipeline (input method), and how it gets verified (verification method). This replaces the simple Tier 1/Tier 2 classification with a more complete model that accounts for the fact that not everything in a visa application is a scannable document.

---

## 2. Canonical Classification (for Engineering + Data Science)

For implementation, every data element should be classified as a 3-field tuple that maps directly to pipeline branching, feature generation, and rule triggers.

### 2.1 Required 3-field tuple

**A — Ingestion Type (what DIS receives)**

- `structured_payload` (JSON fields; no file)
- `uploaded_file` (PDF/image)
- `external_system` (pulled / pre-populated record; now or later)

**B — Extraction / Parsing Path (how fields are produced)**

- `none`
- `docai` (specialised processors)
- `vision_ocr` (Gemini Vision)
- `deterministic_parse` (MRZ parsing, regex, checksum, etc.) — note: some deterministic parsing steps also perform *basic verification* (e.g. MRZ checksums validate internal consistency), so treat this as both “field production” and an input to verification.

**C — Verification Primitive(s) (how confidence is built)**

Use a **set** (many elements use multiple primitives):

- `external_authoritative_check` (API/feed; e.g. Interpol SLTD, Home Office systems)
- `reference_dataset_lookup` (published list/register; e.g. sponsor register, approved TB clinics)
- `cross_document_consistency` (Drools compares across artifacts within an application)
- `format_and_logic_validation` (pattern/constraints only; insufficient to prove authenticity)
- `manual_review_required`

### 2.2 High-level groupings (derived labels)

These groupings are **derived from the tuple** (primarily ingestion type). They are fine to use in design docs, but they are not a substitute for the tuple itself.

- **Non-document inputs**: anything with ingestion type `structured_payload` or `external_system`
- **Document inputs**: anything with ingestion type `uploaded_file`

Optionally add domain sub-buckets (identity / financial / employment / education / address) as labels — these are not verification labels.

---

## 3. Operational Axes (retained)

These axes still matter, but should be interpreted as *implementable fields* derived from (or aligned with) the tuple above.

**Axis 1 — Processing / Extraction Tier**

- Tier 1 = Document AI specialised processors (Passport, Bank Statements, National ID, Driver's Licence, BRP)
- Tier 2 = Gemini Vision OCR (Employment Letter, Payslips, P60, IELTS, Degree Cert, TB Cert, most supporting docs)
- Structured input = bypass extraction (CoS, IHS, visa fee, some biometric results)

**Axis 2 — Criticality**

- Critical = directly evaluated by Drools/DFM for eligibility/refusal logic
- Supporting = completeness scoring and/or officer review

**Axis 3 — Verification Method (as primitives)**

Prefer the primitives list above over ambiguous terms like “digital verification”. For example:

- TB Certificate = `reference_dataset_lookup` (approved clinic list) + optional `cross_document_consistency`
- Passport = `external_authoritative_check` (SLTD, passport verification) + `deterministic_parse` (MRZ)

---

## 4. Impact on OPA-H03 (Fraud Detection)

OPA-H03 should check fraud scores on all **Critical** data elements that go through AI extraction (Tier 1 + Tier 2 Critical documents). Category A items (structured inputs like CoS) don't have fraud scores from AI extraction — their fraud detection is handled via reference data lookups and Drools cross-referencing.

Updated `critical_document_types` for OPA-H03:

`critical_document_types := {
    "PASSPORT",
    "BANK_STATEMENT",
    "EMPLOYMENT_LETTER",
    "PAYSLIP",
    "P60_TAX",
    "IELTS_CERTIFICATE",
    "DEGREE_CERTIFICATE"
}`

Note: CoS is NOT in this list because it doesn't go through AI extraction — no fraud score to check. CoS fraud detection is handled by RULE-W01 and RULE-W02 via sponsor verification reference data.

---

## 5. Impact on External APIs

**No change to the 6-API spec for Phase 1.** The existing external APIs cover Category B passport verification and Category A previous immigration status (Border Control). The new items identified (IELTS TRF verification, ENIC degree verification, IHS payment verification) are all deferred to Phase 2/pilot or handled via reference data lookups.

**Reference data files to add or update:**

| Reference Data | Source | Refresh Frequency | Purpose |
| --- | --- | --- | --- |
| `sponsor_register.csv` | gov.uk published register | Weekly | Validate sponsor licence exists and is active (Category A — CoS) |
| `cos_register_mock.json` | Internal mock data | N/A (mock) | Mock CoS-level verification for MVP |
| `approved_tb_clinics.json` | gov.uk published list | Monthly | Validate TB certificate clinic is Home Office approved (Category B — TB cert) |
| `uk_universities.json` | HESA / gov.uk | Annual | Cross-reference UK degree certificate institution names (Category B — Degree cert) |

All existing reference data files (`eligible_soc_codes.json`, `soc_going_rates.json`, `immigration_salary_list.json`, `tb_test_countries.json`, `enhanced_scrutiny_nationalities.json`, `english_exempt_nationalities.json`) remain unchanged.

---

## 6. What's Missing From Current Spec (Flagged for Sprint 2+ Discussion)

| Item | Category | Priority | Notes |
| --- | --- | --- | --- |
| IHS payment reference validation | A (Structured Input) | Medium | Format validation only for MVP. Real payment verification requires Home Office API. |
| Visa fee payment reference | A (Structured Input) | Low | Same as IHS. |
| IELTS TRF digital verification | B (Document + Verification) | Medium | British Council has a verification service. Could be 7th external check or batch process. |
| ENIC degree verification | B (Document + Verification) | Low | Only applies to non-UK qualifications. Could be reference data or API. |
| Approved TB clinic verification | B (Document + Verification) | Low | Reference data from gov.uk — can implement now. |
| UK university list | B (Document + Verification) | Low | Reference data — can implement now. |
| Real SMS integration (CoS) | A (Structured Input) | HIGH at pilot | Critical for pilot. Three options: API, data feed, or database access. See Sponsor Verification Architecture Note.  |

---

## 7. Scaling to Other Visa Types

Each visa type introduces its own Category A structured inputs:

| Visa Type | Category A Items (not documents) | Category B Items (digital verification available) |
| --- | --- | --- |
| **Student** | CAS number (like CoS — digital record in SMS), IHS, visa fee | IELTS/PTE TRF, ATAS certificate (verifiable), ENIC statement |
| **Global Talent** | Endorsement reference (Tech Nation / Arts Council / UKRI), IHS | Endorsement body verification |
| **Family** | IHS, visa fee, relationship reference (if any) | Marriage certificate (registry verification in some countries) |
| **Asylum** | None (asylum applicants don't pay fees or have sponsorship) | Country condition reports (CPIN — Home Office published) |
| **Intra-Company Transfer** | CoS (same as Skilled Worker), IHS | Same as Skilled Worker |
| **Start-up / Innovator** | Endorsement reference, IHS | Endorsement body verification |

The three-category model (A/B/C) and three-axis classification (Processing Tier / Criticality / Verification Method) apply identically to all visa types. The specific documents and structured inputs change, but the framework is consistent.

---

**END OF DRAFT — Do not publish until Chris has reviewed and approved.**