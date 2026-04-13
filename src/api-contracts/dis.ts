/**
 * DIS (Document Ingestion System) API Contract
 *
 * Defines the TypeScript interfaces for everything the AMS receives from the
 * Deloitte-built DIS pipeline. Covers:
 *
 * 1. The decision callback payload (aggregated decision + 9 component scores + audit log)
 * 2. The 4 detail layers read from DIS Postgres on demand:
 *    - document_extractions (per-document extraction results)
 *    - rule_results        (Drools rule outputs, 20 rules)
 *    - opa_results         (OPA policy outputs, 12 policies)
 *    - external_checks     (6 external API results)
 * 3. The unified DISApplicationView that the reviewer page consumes
 *
 * Source of truth: docs/specs/2026-04-12-dis-integration-spec-v3.md (Section 11)
 *
 * Core principle: "AI Extracts, Rules Decide"
 * AI (Doc AI, Vision AI) extracts and analyses. Drools + OPA make the decision
 * deterministically. LLM summaries run AFTER the decision and have NO decision power.
 */

// ============================================================================
// DECISION
// ============================================================================

export type DecisionOutcome = 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED'
export type ProcessingPath = 'AUTOMATED' | 'ESCALATED'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface DISDecision {
  outcome: DecisionOutcome
  confidence: number          // 0-100 — pipeline's confidence in this decision
  processing_path: ProcessingPath
  risk_level: RiskLevel
  overall_score: number       // 0-100 — weighted composite (Deloitte-defined weights pending)
}

// ============================================================================
// COMPONENT SCORES (9)
// ============================================================================

/**
 * Each component score has 4 fields. Critical distinction:
 *   score       = does the applicant meet the requirement? (0-100)
 *   confidence  = how reliably was the underlying data extracted? (0-100)
 *
 * A score of 30 with confidence 98 means: "We read the documents correctly,
 * and the applicant clearly does not qualify" — not "we're uncertain".
 */
export interface ComponentScore {
  score: number              // 0-100 — does applicant meet the requirement?
  status: string             // VERIFIED, CLEAR, LOW_RISK, ACCEPTABLE, etc.
  confidence: number         // 0-100 — AI extraction confidence
  details: string            // human-readable detail
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
  | 'fraud_risk'

export type ComponentScores = Record<ComponentScoreKey, ComponentScore>

// ============================================================================
// DROOLS RULES (20 total: 5 universal + 15 skilled worker)
// ============================================================================

export type VisaType =
  | 'universal'
  | 'skilled_worker'
  | 'student'
  | 'global_talent'
  | 'family'
  | 'asylum'
  | 'intra_company_transfer'
  | 'startup_innovator'
  | 'youth_mobility'

export type RuleSeverity = 'MANDATORY' | 'ADVISORY'
export type RuleResult = 'PASS' | 'FAIL'

/**
 * Universal rule IDs (apply to all visa types)
 * U01 — Passport Validity            (universal/passport_rules.drl)
 * U02 — Biometric Verification       (universal/biometric_rules.drl)
 * U03 — Sanctions Screening          (universal/sanctions_rules.drl)
 * U04 — Duplicate Application Check  (universal/duplicate_rules.drl)
 * U05 — Document Extraction Confidence (universal/document_confidence_rules.drl)
 */
export type UniversalRuleId = 'RULE-U01' | 'RULE-U02' | 'RULE-U03' | 'RULE-U04' | 'RULE-U05'

/**
 * Skilled Worker rule IDs
 * W01 — CoS Validity                              (skilled_worker/sponsorship_rules.drl)
 * W02 — Sponsor Licence Status                    (skilled_worker/sponsorship_rules.drl)
 * W03 — Salary Threshold General (>= £41,700)     (skilled_worker/salary_rules.drl)
 * W04 — Salary Threshold New Entrant (>= £33,400) (skilled_worker/salary_rules.drl)
 * W05 — SOC Code Eligibility                      (skilled_worker/eligibility_rules.drl)
 * W06 — Immigration Salary List Check             (skilled_worker/salary_rules.drl)
 * W07 — Job Skill Level (RQF 6+)                  (skilled_worker/eligibility_rules.drl)
 * W08 — English Language (CEFR B2+)               (skilled_worker/eligibility_rules.drl)
 * W09 — Maintenance Funds (£1,270 / 28 days)      (skilled_worker/financial_rules.drl)
 * W10 — TB Test Certificate                       (skilled_worker/compliance_rules.drl)
 * W11 — Criminal Record Disclosure                (skilled_worker/compliance_rules.drl)
 * W12 — Previous Immigration Compliance           (skilled_worker/compliance_rules.drl)
 * W13 — Application Completeness                  (skilled_worker/completeness_rules.drl)
 * W14 — Document Fraud Detection                  (skilled_worker/compliance_rules.drl)
 * W15 — Start Date Validity                       (skilled_worker/sponsorship_rules.drl)
 */
export type SkilledWorkerRuleId =
  | 'RULE-W01' | 'RULE-W02' | 'RULE-W03' | 'RULE-W04' | 'RULE-W05'
  | 'RULE-W06' | 'RULE-W07' | 'RULE-W08' | 'RULE-W09' | 'RULE-W10'
  | 'RULE-W11' | 'RULE-W12' | 'RULE-W13' | 'RULE-W14' | 'RULE-W15'

export type DroolsRuleId = UniversalRuleId | SkilledWorkerRuleId

export interface DroolsRuleResult {
  rule_id: DroolsRuleId
  rule_file: string          // e.g., "skilled_worker/salary_rules.drl"
  result: RuleResult
  detail: string             // human-readable PASS/FAIL explanation
  source: string             // where input data came from (submission_payload, document_extractions, external_checks, ...)
  reference_data?: string    // which ref data file was consulted (salary_thresholds.json, etc.)
  reference_field?: string   // which field in the ref data
  visa_type: VisaType
  severity: RuleSeverity
  evaluated_at: string       // ISO 8601 timestamp
}

// ============================================================================
// OPA POLICIES (12 total: 6 HARD + 6 SOFT)
// ============================================================================

export type OPATier = 'HARD' | 'SOFT'
export type OPAResult = 'BLOCK' | 'REVIEW_REQUIRED' | 'PASS'

/**
 * Hard policy IDs — BLOCK means the application cannot proceed
 * OPA-H01 — Sanctions Hard Block       (hard/sanctions.rego)           [IMPLEMENTED 8-10 Apr]
 * OPA-H02 — Passport Verification      (hard/passport_stolen.rego)     [IMPLEMENTED 8-10 Apr]
 * OPA-H03 — Interpol SLTD              (hard/document_fraud.rego)      [IMPLEMENTED 8-10 Apr]
 * OPA-H04 — Auth & Session Validation  (hard/auth_session.rego)        [IMPLEMENTED 8-10 Apr]
 * OPA-H05 — Document Fraud Score       (hard/document_tampering.rego)  — fraud_score >= 0.90
 * OPA-H06 — Data Residency             (hard/data_residency.rego)      — europe-west2 only
 */
export type HardOPAPolicyId = 'OPA-H01' | 'OPA-H02' | 'OPA-H03' | 'OPA-H04' | 'OPA-H05' | 'OPA-H06'

/**
 * Soft policy IDs — FLAG_FOR_REVIEW means officer must assess
 * OPA-S01 — Biometric Borderline           (soft/biometric_borderline.rego)  — face match 0.75-0.85
 * OPA-S02 — World-Check LOW/MEDIUM         (soft/worldcheck_low_medium.rego) — PEP, adverse media
 * OPA-S03 — Completeness Score Low         (soft/completeness_low.rego)      — score < 70
 * OPA-S04 — Rapid Submission / Bot         (soft/rapid_submission.rego)      — < 3 min submission, or > 3 in 30d
 * OPA-S05 — Enhanced Scrutiny Nationality  (soft/enhanced_scrutiny.rego)     — nationality on scrutiny list
 * OPA-S06 — Infrastructure Alerts          (soft/cmek_rotation.rego)         — CMEK rotation, TLS expiry
 */
export type SoftOPAPolicyId = 'OPA-S01' | 'OPA-S02' | 'OPA-S03' | 'OPA-S04' | 'OPA-S05' | 'OPA-S06'

export type OPAPolicyId = HardOPAPolicyId | SoftOPAPolicyId

export interface OPAPolicyResult {
  policy_id: OPAPolicyId
  policy_name: string        // e.g., "Sanctions_WorldCheck_HardBlock"
  tier: OPATier
  result: OPAResult
  reason: string             // human-readable explanation
  data_source: string        // REUTERS_WORLDCHECK, INTERPOL_SLTD, document_extractions, etc.
  rego_file: string          // e.g., "hard/sanctions.rego"
  evaluated_at: string       // ISO 8601 timestamp
  failed_documents?: string[] // for OPA-H05 — list of document IDs that failed fraud check
}

// ============================================================================
// EXTERNAL API CHECKS (6)
// ============================================================================

/**
 * The 6 external API checks. Border Control was originally separate but has been
 * merged into Passport Verification as of Decision Map v1.1 (7 Apr 2026).
 *
 * 1. WORLDCHECK             — Reuters World-Check (LSEG) — live API, sandbox pending SCRUM-12
 * 2. INTERPOL_SLTD          — Stolen/Lost Travel Documents — mock API
 * 3. PASSPORT_VERIFY        — HMPO passport verification + border control history — mock API
 * 4. DEVICE_IP_RISK         — VPN/Tor/proxy/fraud IP detection (VisaKey only) — mock API
 * 5. EMAIL_PHONE_REPUTATION — Disposable email, VOIP, fraud signals — mock API
 * 6. SPONSOR_VERIFY         — Sponsor licence verification (uses sponsor_register.csv + cos_register_mock.json) — mock API
 */
export type ExternalCheckType =
  | 'WORLDCHECK'
  | 'INTERPOL_SLTD'
  | 'PASSPORT_VERIFY'
  | 'DEVICE_IP_RISK'
  | 'EMAIL_PHONE_REPUTATION'
  | 'SPONSOR_VERIFY'

export type CheckStatus = 'CLEAR' | 'BLOCKED' | 'FLAGGED' | 'ERROR' | 'TIMEOUT'

export interface ExternalCheckResult {
  request_id: string
  dis_application_id: string
  document_id: string | null
  check_type: ExternalCheckType
  check_status: CheckStatus
  risk_level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'
  confidence_score: number
  flags: Record<string, unknown>
  responded_at: string       // ISO 8601 timestamp
  response_time_ms: number
  details: Record<string, unknown>  // check-specific response fields (see V3 spec Section 9)
}

// ============================================================================
// DOCUMENT EXTRACTION
// ============================================================================

/**
 * Extraction methods. Gemini Vision was RULED OUT (hallucination risk,
 * non-deterministic). Doc AI is used across both tiers.
 *
 * DOC_AI_ID_PARSER        — Tier 1 specialised processor for Passport, National ID, BRP
 * DOC_AI_FORM_PARSER      — Tier 1 general processor for Bank Statement
 * DOC_AI_CUSTOM_EXTRACTOR — Tier 2 trained processor for all other docs (Employment Letter, Payslip, P60, IELTS, Degree, TB Cert, Utility Bill, Police Cert)
 */
export type ExtractionMethod =
  | 'DOC_AI_ID_PARSER'
  | 'DOC_AI_FORM_PARSER'
  | 'DOC_AI_CUSTOM_EXTRACTOR'

export type ExtractionTier = 'TIER_1' | 'TIER_2'
export type DocumentCriticality = 'CRITICAL' | 'SUPPORTING'

/**
 * 5-level fraud status (from Extraction & Classification page, 10 Apr 2026)
 * CLEAR        0.00-0.30  — PASS
 * LOW_RISK     0.31-0.60  — PASS (logged)
 * MEDIUM_RISK  0.61-0.80  — REVIEW_REQUIRED (OPA-H05 soft flag)
 * HIGH_RISK    0.81-0.89  — REVIEW_REQUIRED priority (OPA-H05 escalated)
 * CRITICAL     0.90-1.00  — BLOCK (OPA-H05 hard block)
 */
export type FraudStatus = 'CLEAR' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL'

/**
 * The 12 document types in scope for Skilled Worker Phase 1.
 * CoS is NOT a document — it's structured JSON from the submission payload, bypasses extraction entirely.
 */
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
  | 'POLICE_CERTIFICATE'

export type SourceChannel = 'visakey' | 'govdirect'

export interface DocumentExtraction {
  extraction_id: string
  dis_application_id: string
  document_id: string
  document_type: DocumentType
  tier: ExtractionTier
  criticality: DocumentCriticality
  extraction_method: ExtractionMethod
  processor_id: string           // full GCP resource path
  processor_version: string
  extraction_confidence: number  // 0.0-1.0
  raw_extraction: Record<string, unknown>      // complete Doc AI output, untouched
  extracted_data: Record<string, unknown>      // structured fields parsed from raw output
  normalised_fields: Record<string, unknown>   // schema-mapped, normalised (downstream consumers read this)
  fraud_score: number | null                   // null for GovDirect non-image docs
  fraud_status: FraudStatus | null
  fraud_signals: Record<string, unknown> | null
  source_channel: SourceChannel
  gcs_raw_path: string           // gs://dis-raw-uploads/{app_id}/{doc_id}.{ext}
  gcs_processed_path: string     // gs://dis-processed-docs/{app_id}/{doc_id}.json
  created_at: string             // ISO 8601
  updated_at: string             // ISO 8601
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export interface ProcessingError {
  stage: string
  check: string
  error_code: string
  error_message: string
  timestamp: string              // ISO 8601
  impact: string                 // e.g., "Check result unavailable — flagged for manual review"
}

export interface AuditLog {
  pipeline_version: string
  models_used: {
    document_ai: string
    fraud_detection: string
    rules_engine: string
    llm_summary: string
  }
  data_classification: string    // "OFFICIAL-SENSITIVE"
  processing_location: string    // "europe-west2"
  documents: {
    total: number
    successful: number
    failed: number
    errors: ProcessingError[]
  }
  rules: {
    total_evaluated: number      // should be 20 for a fully-processed Skilled Worker app
    passed: number
    failed: number
    skipped: number
  }
  external_checks: {
    total: number                // up to 6
    successful: number
    failed: number
    timed_out: number
    errors: ProcessingError[]
  }
  opa_policies: {
    total_evaluated: number      // should be 12 for a fully-processed app
    passed: number
    blocked: number
    flagged: number
  }
  processing_errors: ProcessingError[]
  warnings: string[]
}

// ============================================================================
// DECISION CALLBACK PAYLOAD
// ============================================================================

/**
 * The JSON payload DIS POSTs to the `callback_url` provided in the original submission.
 * Channel-independent — same shape for VisaKey and GovDirect.
 *
 * This is the AGGREGATED decision. The individual rule results, OPA results, external
 * check details, and document extractions are stored in DIS Postgres and read on demand
 * via API when an officer opens an application.
 */
export interface DISDecisionCallback {
  decision: DISDecision
  component_scores: ComponentScores
  audit_log: AuditLog
  source_channel: 'visakey' | 'home-office'
  dis_application_id: string
  source_application_id: string
  source_reference: string
  submitted_at: string           // ISO 8601
  processed_at: string           // ISO 8601
}

// ============================================================================
// FULL APPLICATION VIEW (what the AMS reviewer page consumes)
// ============================================================================

/**
 * Combines the decision callback with the 4 detail layers read from DIS Postgres.
 * This is the unified type the reviewer page binds to — replaces the old AIScanResult.
 */
export interface DISApplicationView {
  // From the decision callback
  decision: DISDecision
  component_scores: ComponentScores
  audit_log: AuditLog
  source_channel: 'visakey' | 'home-office'

  // From DIS Postgres (read via API on demand)
  rule_results: DroolsRuleResult[]
  opa_results: OPAPolicyResult[]
  external_checks: ExternalCheckResult[]
  document_extractions: DocumentExtraction[]
  llm_summary: string            // Gemini-generated case briefing — NO decision power, AFTER the fact

  // From the submission payload (passed through)
  source_application_id: string
  source_reference: string
  dis_application_id: string
  submitted_at: string           // ISO 8601
}
