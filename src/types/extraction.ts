/**
 * Per-document-type extraction field interfaces.
 *
 * Each document type has a specific `extracted_data` shape (what Doc AI returns).
 * This is the typed version of the generic Record<string, unknown> on
 * `DocumentExtraction.extracted_data`.
 *
 * Source of truth: docs/devdocs/Canonical Document Extraction Schema.md (V1.2, 14 April 2026)
 *
 * Only `extracted_data` shapes are typed here. `normalised_fields` shapes are kept
 * as Record<string, unknown> on the envelope — they contain pipeline-populated
 * fields (like `is_expired`, `meets_b2_minimum`, cross-doc consistency results)
 * and will be typed in a follow-up task once Phase 2 consumers are built.
 *
 * Fields REMOVED from `extracted_data` vs Canonical V1.0 are because they belong
 * at the DocumentExtraction envelope level (extraction_confidence, fraud_signals,
 * fraud_score) — see `DocumentExtraction` in @/api-contracts/dis.
 */

import type { DocumentExtraction } from '@/api-contracts/dis'

// ============================================================================
// TIER 1 — DOC AI ID PARSER + FORM PARSER
// ============================================================================

/**
 * PASSPORT (Tier 1, Critical, DOC_AI_ID_PARSER — Google pre-trained)
 *
 * Drools consumers:
 *   RULE-U01 (validity + expiry)
 *   RULE-U02 (biometrics)
 *   RULE-U04 (duplicate check)
 *   RULE-U05 (confidence)
 *   RULE-W14 (fraud)
 *
 * OPA: H02 (passport verification), H03 (Interpol SLTD), H05 (fraud score)
 *
 * Uses the full fraud weight profile including `mrz_check` — only document
 * type that has this signal.
 */
export interface PassportExtractedData {
  document_number: string        // 9 chars to match MRZ (e.g., "XK9F4A7C2")
  surname: string
  given_names: string
  full_name: string
  date_of_birth: string          // ISO 8601 date
  nationality: string            // full nationality word (e.g., "INDIAN")
  sex: 'M' | 'F' | 'X'           // ICAO 9303 standard
  issue_date: string             // ISO 8601 date
  expiry_date: string            // ISO 8601 date
  issuing_country: string        // full name (e.g., "INDIA")
  country_code: string           // ISO 3166-1 alpha-3
  document_type_code: string     // "P" for passport (renamed from `document_type` to avoid conflict with envelope)
  place_of_birth: string
  place_of_issue: string
  mrz_line_1: string
  mrz_line_2: string
  photo_hash: string
  has_signature: boolean
}

/**
 * BANK_STATEMENT (Tier 1, Critical, DOC_AI_FORM_PARSER — Google pre-trained)
 *
 * Drools consumers:
 *   RULE-W09 (maintenance funds — £1,270 for 28 days)
 *   RULE-W13 (completeness)
 *   RULE-W14 (fraud)
 *
 * Fraud weight profile: Bank Statement (separate from ID / Tier 2 Critical /
 * Supporting) — fake bank statements are the most common fraud vector in UK
 * immigration, weighted heavily on font consistency and cross-doc consistency.
 */
export interface BankStatementSalaryCredit {
  date: string                   // ISO 8601
  amount: number
  description: string            // e.g., "SALARY ORION TECH"
}

export interface BankStatementExtractedData {
  account_holder_name: string
  account_number: string
  sort_code: string
  bank_name: string              // e.g., "Barclays Bank UK PLC"
  branch_name: string            // e.g., "Canary Wharf, London"
  account_currency: string       // ISO 4217 (GBP, INR, etc.)
  statement_period_start: string // ISO 8601
  statement_period_end: string   // ISO 8601
  opening_balance: number
  closing_balance: number
  lowest_balance: number         // critical for RULE-W09 28-day maintenance check
  total_credits: number
  total_debits: number
  salary_credits: BankStatementSalaryCredit[]
}

/**
 * NATIONAL_ID (Tier 1, Supporting, DOC_AI_ID_PARSER — CUSTOM variant)
 *
 * Drools consumers:
 *   RULE-U04 (duplicate — secondary ID)
 *   RULE-U05 (confidence)
 *   RULE-W14 (fraud)
 *
 * Fraud weight profile: Non-MRZ ID (Passport's MRZ weight redistributed
 * across content plausibility + cross-doc consistency + metadata/font/quality).
 *
 * Note: Uses a custom-trained variant of DOC_AI_ID_PARSER (not the pre-trained
 * one Passport uses) due to format variation across issuing countries.
 * `extraction_method` on the envelope is still `DOC_AI_ID_PARSER` —
 * `processor_version` on the envelope distinguishes custom from pre-trained.
 */
export interface NationalIdExtractedData {
  document_number: string
  given_names: string
  surname: string
  full_name: string
  date_of_birth: string
  nationality: string
  sex: 'M' | 'F' | 'X'           // ICAO 9303 standard (was `gender` in V1.0 — corrected in V1.1)
  issue_date: string
  expiry_date: string
  issuing_authority: string
  has_photo: boolean
}

/**
 * BRP — Biometric Residence Permit (Tier 1, Supporting, DOC_AI_ID_PARSER — CUSTOM variant)
 *
 * Drools consumers:
 *   RULE-U04 (duplicate — secondary ID)
 *   RULE-U05 (confidence)
 *   RULE-W12 (immigration compliance — BRP expiry cross-ref)
 *   RULE-W14 (fraud)  [added in V1.2]
 *
 * Fraud weight profile: Non-MRZ ID (same as National ID).
 */
export interface BrpExtractedData {
  document_number: string
  given_names: string
  surname: string
  full_name: string
  date_of_birth: string
  nationality: string
  sex: 'M' | 'F' | 'X'           // ICAO 9303 standard
  issue_date: string
  expiry_date: string
  issuing_authority: string      // typically "UK Home Office"
  visa_type_on_brp: string       // e.g., "SKILLED WORKER" — feeds RULE-W12
  has_photo: boolean
}

// ============================================================================
// TIER 2 — DOC AI CUSTOM EXTRACTOR (structured schemas)
// ============================================================================

/**
 * EMPLOYMENT_LETTER (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR)
 *
 * Drools consumers:
 *   RULE-W03/W04/W06 (salary thresholds — cross-ref with payslip and CoS)
 *   RULE-W05 (SOC code)
 *   RULE-W07 (job skill level)
 *   RULE-W15 (start date)
 *   RULE-W13 (completeness)
 *   RULE-W14 (fraud)
 */
export interface EmploymentLetterExtractedData {
  employer_name: string
  employer_address: string
  job_title: string
  start_date: string             // ISO 8601
  salary_amount: number
  salary_frequency: 'ANNUAL' | 'MONTHLY' | 'WEEKLY' | 'HOURLY'
  hours_per_week: number
  /**
   * Employment type — V1.2 canonical uses `FULL_TIME` / `PART_TIME`.
   * Wider union supported for legacy/future compatibility.
   */
  employment_type: 'FULL_TIME' | 'PART_TIME' | 'PERMANENT' | 'FIXED_TERM' | 'CONTRACT'
  signatory_name: string
  signatory_position: string
  letter_date: string            // ISO 8601
  company_registration_number: string  // e.g., "12345678" — public Companies House record
  on_company_letterhead: boolean       // visual verification flag
}

/**
 * PAYSLIP (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR)
 *
 * Drools consumers:
 *   RULE-W03/W04/W06 (salary — cross-ref with employment letter and CoS)
 *   RULE-W09 (maintenance evidence)
 *   RULE-W13 (completeness)
 *   RULE-W14 (fraud)
 *
 * Content plausibility: `gross_pay - tax_deducted - ni_deducted ≈ net_pay`.
 * `annualised_gross_gbp` (on normalised_fields) = gross × 12 / 52 / 26 / 1
 * depending on pay_frequency.
 */
export interface PayslipExtractedData {
  employer_name: string
  employee_name: string
  employee_number: string
  pay_period_start: string       // ISO 8601
  pay_period_end: string         // ISO 8601
  gross_pay: number
  net_pay: number
  tax_deducted: number
  ni_deducted: number
  pay_frequency: 'MONTHLY' | 'WEEKLY' | 'FORTNIGHTLY' | 'FOUR_WEEKLY'
  payslip_date: string           // ISO 8601
  ni_number: string              // e.g., "QQ123456C" — HASHED at protection layer
  tax_code: string               // e.g., "1257L"
}

/**
 * P60_TAX (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR)
 *
 * Drools consumers:
 *   RULE-W03/W04 (salary cross-reference — annual total vs employment letter)
 *   RULE-W13 (completeness)
 *   RULE-W14 (fraud)
 *
 * Content plausibility: `total_pay_in_year ≈ sum(monthly_payslip_gross × months)`.
 */
export interface P60TaxExtractedData {
  tax_year: string               // e.g., "2025-2026"
  employer_name: string
  employee_name: string
  ni_number: string              // HASHED at protection layer
  total_pay_in_year: number
  total_tax_in_year: number
  total_ni_in_year: number
  employer_paye_reference: string // e.g., "123/AB45678"
}

/**
 * IELTS_CERTIFICATE (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR)
 *
 * Drools consumers:
 *   RULE-W08 (English language — CEFR B2+ required, effective 8 Jan 2026)
 *   RULE-W13 (completeness)
 *   RULE-W14 (fraud)
 *
 * Content plausibility: `overall_score ≈ average(component_scores)` rounded
 * to nearest 0.5; all component scores in [0.0, 9.0]; cefr_level consistent
 * with overall_score.
 */
export interface IeltsCertificateExtractedData {
  test_type: 'IELTS Academic' | 'IELTS General' | 'IELTS for UKVI'
  candidate_name: string
  date_of_birth: string          // ISO 8601
  test_date: string              // ISO 8601
  overall_score: number          // e.g., 7.5
  listening_score: number
  reading_score: number
  writing_score: number
  speaking_score: number
  test_report_form_number: string // HASHED — Phase 2 TRF verification API
  centre_number: string          // e.g., "GB001"
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}

/**
 * DEGREE_CERTIFICATE (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR)
 *
 * Drools consumers:
 *   RULE-W07 (job skill level — RQF 6+ / graduate minimum)
 *   RULE-W08 (English exemption — UK degree)
 *   RULE-W13 (completeness)
 *   RULE-W14 (fraud)
 *
 * Note: `naric_reference` is NOT extracted from the document. It's populated
 * in `normalised_fields` only, in Phase 2 when the ENIC verification API is
 * integrated. Phase 1 = officer makes RQF assessment.
 */
export interface DegreeCertificateExtractedData {
  institution_name: string
  candidate_name: string
  qualification_title: string    // e.g., "Bachelor of Science"
  qualification_level: string    // e.g., "Undergraduate", "Postgraduate"
  subject: string
  award_date: string             // ISO 8601
  classification: string         // e.g., "First Class Honours", "2:1"
  country_of_institution: string
  certificate_number: string     // HASHED at protection layer
}

/**
 * TB_CERTIFICATE (Tier 2, Supporting, DOC_AI_CUSTOM_EXTRACTOR)
 *
 * Drools consumers:
 *   RULE-W10 (TB test — required if nationality in Appendix T country list)
 *   RULE-W13 (completeness)
 *   RULE-W14 (fraud — supporting doc lighter weight)
 *
 * Note: `is_approved_clinic` on normalised_fields is populated by reference
 * data lookup (`approved_tb_clinics.json`), not extracted from the document.
 */
export interface TbCertificateExtractedData {
  patient_name: string           // was `patient_full_name` in V1.0
  date_of_birth: string
  clinic_name: string            // was `issuing_clinic_or_hospital` in V1.0
  clinic_address: string         // new in V1.2
  issuing_country: string
  test_date: string              // ISO 8601 — when the TB test was performed
  certificate_date: string       // ISO 8601 — when the certificate was issued
  expiry_date: string            // ISO 8601 — typically 6 months after test_date
  outcome: 'CLEAR' | 'REFERRED' | 'FURTHER_TESTS_REQUIRED'
  certificate_number: string     // HASHED at protection layer
  examining_doctor: string       // was `examining_doctor_name` in V1.0
}

/**
 * UTILITY_BILL / Proof of Address (Tier 2, Supporting, DOC_AI_CUSTOM_EXTRACTOR)
 *
 * Drools consumers:
 *   RULE-W13 (completeness)
 *   RULE-W14 (fraud — supporting doc lighter weight)
 *   Cross-document address consistency (populates `address_matches_application`)
 *
 * Note: V1.2 defines this as a structured schema (was flexible JSONB in earlier
 * drafts). Council tax bills are the most common utility proof in UK immigration.
 */
export interface UtilityBillExtractedData {
  account_holder_name: string
  service_address: string
  utility_type: 'COUNCIL_TAX' | 'ELECTRICITY' | 'GAS' | 'WATER' | 'INTERNET' | 'PHONE' | 'TV_LICENCE'
  supplier_name: string          // e.g., "Tower Hamlets London Borough Council"
  bill_date: string              // ISO 8601 — when the bill was issued
  billing_period_start: string   // ISO 8601
  billing_period_end: string     // ISO 8601
  account_number: string         // HASHED at protection layer
  amount_due: number             // in the account_currency (typically GBP)
}

/**
 * POLICE_CERTIFICATE (Tier 2, Supporting, DOC_AI_CUSTOM_EXTRACTOR)
 *
 * Drools consumers:
 *   RULE-W11 (criminal record disclosure)
 *   RULE-W13 (completeness)
 *   RULE-W14 (fraud — supporting doc lighter weight)
 *
 * Note: V1.2 defines this as a structured schema (was flexible JSONB in earlier
 * drafts).
 */
export interface PoliceCertificateExtractedData {
  subject_full_name: string
  date_of_birth: string
  nationality: string
  issuing_authority: string      // e.g., "Delhi Police", "Nigeria Police Force"
  issuing_country: string
  certificate_number: string     // HASHED at protection layer
  issue_date: string             // ISO 8601
  expiry_date: string            // ISO 8601 — typically 6 months after issue
  criminal_record_disclosed: boolean
  certificate_type: string       // e.g., "Police Clearance Certificate"
}

// ============================================================================
// DISCRIMINATED UNION — TYPE-SAFE DOCUMENT EXTRACTION
// ============================================================================

/**
 * Discriminated union over document type, so TypeScript knows the exact
 * shape of `extracted_data` based on `document_type`. Use this when you
 * need type-safe access to per-document fields.
 *
 * Example:
 *   function showPassportNumber(ext: TypedDocumentExtraction) {
 *     if (ext.document_type === 'PASSPORT') {
 *       // TypeScript narrows ext.extracted_data to PassportExtractedData
 *       return ext.extracted_data.document_number
 *     }
 *   }
 *
 * All 12 Skilled Worker Phase 1 document types covered.
 */
export type TypedDocumentExtraction =
  | (DocumentExtraction & { document_type: 'PASSPORT';            extracted_data: PassportExtractedData })
  | (DocumentExtraction & { document_type: 'BANK_STATEMENT';      extracted_data: BankStatementExtractedData })
  | (DocumentExtraction & { document_type: 'NATIONAL_ID';         extracted_data: NationalIdExtractedData })
  | (DocumentExtraction & { document_type: 'BRP';                 extracted_data: BrpExtractedData })
  | (DocumentExtraction & { document_type: 'EMPLOYMENT_LETTER';   extracted_data: EmploymentLetterExtractedData })
  | (DocumentExtraction & { document_type: 'PAYSLIP';             extracted_data: PayslipExtractedData })
  | (DocumentExtraction & { document_type: 'P60_TAX';             extracted_data: P60TaxExtractedData })
  | (DocumentExtraction & { document_type: 'IELTS_CERTIFICATE';   extracted_data: IeltsCertificateExtractedData })
  | (DocumentExtraction & { document_type: 'DEGREE_CERTIFICATE';  extracted_data: DegreeCertificateExtractedData })
  | (DocumentExtraction & { document_type: 'TB_CERTIFICATE';      extracted_data: TbCertificateExtractedData })
  | (DocumentExtraction & { document_type: 'UTILITY_BILL';        extracted_data: UtilityBillExtractedData })
  | (DocumentExtraction & { document_type: 'POLICE_CERTIFICATE';  extracted_data: PoliceCertificateExtractedData })
