/**
 * Per-document-type extraction field interfaces.
 *
 * Each document type has a specific `extracted_data` shape (what Doc AI returns)
 * and `normalised_fields` shape (what Drools/OPA consume). These are the typed
 * versions of the generic Record<string, unknown> fields on DocumentExtraction.
 *
 * Source of truth: docs/specs/2026-04-12-dis-integration-spec-v3.md (Section 6.2)
 * and docs/devdocs/Canonical Document Extraction Schema.md
 */

import type { DocumentExtraction } from '@/api-contracts/dis'

// ============================================================================
// TIER 1 — DOC AI ID PARSER + FORM PARSER
// ============================================================================

/**
 * PASSPORT (Tier 1, Critical, DOC_AI_ID_PARSER)
 * Consumed by RULE-U01 (validity), RULE-U02 (biometric), RULE-U04 (duplicate)
 * OPA: H03 (Interpol SLTD), H05 (fraud score)
 */
export interface PassportExtractedData {
  document_number: string
  surname: string
  given_names: string
  full_name: string
  date_of_birth: string          // ISO 8601 date
  nationality: string            // full nationality word (e.g., "INDIAN")
  sex: 'M' | 'F' | 'X'
  issue_date: string             // ISO 8601 date
  expiry_date: string            // ISO 8601 date
  issuing_country: string
  country_code: string           // ISO 3166-1 alpha-3
  document_type: string          // "P" for passport
  place_of_birth: string
  place_of_issue: string
  mrz_line_1: string
  mrz_line_2: string
  photo_hash: string             // SHA or similar
  has_signature: boolean
  document_authenticity_score: number  // 0.0-1.0
  fraud_flags: boolean
  fraud_signals: {
    mrz_valid: boolean
    photo_match: boolean
    font_consistency: 'PASS' | 'FAIL'
  }
  confidence_score: number       // 0.0-1.0
}

/**
 * BANK_STATEMENT (Tier 1, Critical, DOC_AI_FORM_PARSER)
 * Consumed by RULE-W09 (maintenance funds)
 * OPA: H05 (fraud score)
 */
export interface BankStatementExtractedData {
  account_holder_name: string
  account_number: string
  sort_code: string
  micr_code?: string
  ifsc_code?: string
  customer_id?: string
  account_currency: string       // ISO 4217 (e.g., "GBP", "INR")
  product_name: string           // e.g., "Savings Account"
  branch_name: string
  statement_period: string       // e.g., "01-Feb-2026 to 28-Feb-2026"
  opening_balance: number
  closing_balance: number
  confidence_score: number
}

/**
 * NATIONAL_ID (Tier 1, Supporting, DOC_AI_ID_PARSER)
 * No Drools consumers in Phase 1 (supporting only)
 */
export interface NationalIdExtractedData {
  document_number: string
  given_names: string
  surname: string
  full_name: string
  date_of_birth: string
  nationality: string
  gender: 'M' | 'F' | 'X'
  issue_date: string
  expiry_date: string
  issuing_authority: string
  has_photo: boolean
  confidence_score: number
}

/**
 * BRP — Biometric Residence Permit (Tier 1, Supporting, DOC_AI_ID_PARSER)
 * No Drools consumers in Phase 1 (supporting only)
 */
export interface BrpExtractedData {
  document_number: string
  given_names: string
  surname: string
  full_name: string
  date_of_birth: string
  nationality: string
  gender: 'M' | 'F' | 'X'
  issue_date: string
  expiry_date: string
  issuing_authority: string
  has_photo: boolean
  confidence_score: number
}

// ============================================================================
// TIER 2 — DOC AI CUSTOM EXTRACTOR (structured schemas)
// ============================================================================

/**
 * EMPLOYMENT_LETTER (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR)
 * Consumed by RULE-W03, W05, W09 (cross-verification with payload salary)
 * OPA: H05 (fraud score)
 */
export interface EmploymentLetterExtractedData {
  employer_name: string
  job_title: string
  start_date: string             // ISO 8601
  salary_amount: number
  salary_frequency: 'ANNUAL' | 'MONTHLY' | 'WEEKLY' | 'HOURLY'
  employment_type?: 'PERMANENT' | 'FIXED_TERM' | 'CONTRACT'
  hours_per_week: number
  employer_address: string
  signatory_name: string
  signatory_position: string
  letter_date: string            // ISO 8601
}

/**
 * PAYSLIP (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR)
 * Consumed by RULE-W09
 * OPA: H05 (fraud score)
 */
export interface PayslipExtractedData {
  employer_name: string
  employee_name: string
  pay_period_start: string       // ISO 8601
  pay_period_end: string         // ISO 8601
  gross_pay: number
  net_pay: number
  tax_deducted: number
  ni_deducted: number
  pay_frequency: 'MONTHLY' | 'WEEKLY' | 'FORTNIGHTLY'
  payslip_date: string           // ISO 8601
  employee_number: string
}

/**
 * P60_TAX (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR)
 * Consumed by RULE-W10
 * OPA: H05 (fraud score)
 */
export interface P60TaxExtractedData {
  tax_year: string               // e.g., "2025-2026"
  employer_name: string
  employee_name: string
  ni_number: string
  total_pay_in_year: number
  total_tax_in_year: number
  total_ni_in_year: number
  employer_paye_reference: string
}

/**
 * IELTS_CERTIFICATE (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR)
 * Consumed by RULE-W08 (English language CEFR B2+)
 * OPA: H05 (fraud score)
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
  test_report_form_number: string
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}

/**
 * DEGREE_CERTIFICATE (Tier 2, Critical, DOC_AI_CUSTOM_EXTRACTOR)
 * Consumed by RULE-W07 (RQF 6+)
 * OPA: H05 (fraud score)
 */
export interface DegreeCertificateExtractedData {
  institution_name: string
  candidate_name: string
  qualification_title: string
  qualification_level: string    // e.g., "Bachelor's Degree", "Master's Degree"
  subject: string
  award_date: string             // ISO 8601
  classification: string         // e.g., "First Class Honours", "2:1"
  country_of_institution: string
  naric_reference?: string       // ENIC/NARIC comparability reference
}

/**
 * TB_CERTIFICATE (Tier 2, Supporting, DOC_AI_CUSTOM_EXTRACTOR)
 * Consumed by RULE-W10 (TB test — only when nationality in tb_test_countries.json)
 */
export interface TbCertificateExtractedData {
  patient_full_name: string
  date_of_birth: string
  certificate_type: string       // e.g., "TB Screening Certificate"
  issuing_clinic_or_hospital: string
  issuing_country: string
  examining_doctor_name: string
  issue_date: string             // ISO 8601
  expiry_date: string            // ISO 8601 (typically 6 months)
  certificate_number: string
  outcome: 'CLEAR' | 'REFERRED' | 'FURTHER_TESTS_REQUIRED'
}

// ============================================================================
// TIER 2 — SUPPORTING DOCS (flexible JSONB schemas)
// ============================================================================

/**
 * Flexible extraction schema for Supporting documents where the content varies.
 * Used for Utility Bills, Police Certificates, and any doc without a fixed schema.
 */
export interface FlexibleExtractedData {
  document_type: string
  extraction_confidence: number
  extracted_text_summary: string
  key_value_pairs: Record<string, string>
  dates_found: string[]          // ISO 8601 dates
  names_found: string[]
  amounts_found: number[]
}

export type UtilityBillExtractedData = FlexibleExtractedData
export type PoliceCertificateExtractedData = FlexibleExtractedData

// ============================================================================
// DISCRIMINATED UNION — TYPE-SAFE DOCUMENT EXTRACTION
// ============================================================================

/**
 * Discriminated union over document type, so TypeScript knows the exact
 * shape of extracted_data based on document_type. Use this when you need
 * type-safe access to fields.
 *
 * Example:
 *   function showPassportNumber(ext: TypedDocumentExtraction) {
 *     if (ext.document_type === 'PASSPORT') {
 *       // TypeScript knows ext.extracted_data is PassportExtractedData
 *       return ext.extracted_data.document_number
 *     }
 *   }
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
