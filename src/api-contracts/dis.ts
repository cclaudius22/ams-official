/**
 * DIS (Decision Intelligence System) API Contract
 *
 * Defines the TypeScript interfaces for everything the AMS receives from the
 * DIS pipeline. Covers:
 *
 * 1. The recommendation payload (callback shape, stored verbatim in
 *    recommendations.submission_payload — V5 spec Section 5)
 * 2. The detail layers read from DIS Postgres on demand:
 *    - documents + document_extractions (per-document records)
 *    - rule_results        (Drools rule outputs)
 *    - opa_results         (OPA policy outputs — incl. denial_reasons, which
 *                           the callback omits; only the table carries them)
 *    - external_checks     (6 external API results)
 * 3. The unified DISApplicationView that the reviewer page consumes — a
 *    CLIENT-SIDE composite assembled by the data provider, not a wire shape.
 *
 * Source of truth: docs/specs/2026-06-11-dis-integration-spec-v5.md (as-built
 * evidence tiers) + docs/specs/dis-api-route-audit-2026-06-11.md. V3 Section 11
 * is superseded. NOTE: the live decisions table is named `recommendations`.
 *
 * Core principle: "AI Extracts, Rules Decide" — and DIS only RECOMMENDS.
 * Drools + OPA produce a deterministic recommendation; the caseworker makes
 * the decision. "decision" in code refers only to the officer's own action.
 */

// ============================================================================
// RECOMMENDATION (the pipeline's output — never a decision)
// ============================================================================

/**
 * The values the DIS recommendation pipeline emits (confirmed 17 June 2026 —
 * supersedes the earlier APPROVE/MANUAL_REVIEW reading, which came from a stale
 * DDL snapshot). All three are LIVE — RECOMMEND_REJECT is NOT disabled. These
 * are a recommendation, never a decision: in Phase 1 every outcome goes to a
 * caseworker (human-in-the-loop). Normalize at the boundary via
 * normalizeOutcome(); the queue binds via deriveQueueState() (all three →
 * READY_FOR_REVIEW in Phase 1).
 */
export type RecommendationOutcome = 'RECOMMEND_APPROVE' | 'RECOMMEND_REJECT' | 'MANUAL_REVIEW'

/**
 * AMS-canonical 3-value union — used for OFFICER (human) decisions, which can
 * reject, and as normalizeOutcome's output. DIS wire data uses
 * RecommendationOutcome; normalizeOutcome maps APPROVE→APPROVED etc.
 */
export type DecisionOutcome = 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED'

/** Completeness verdict — also what doc-processing writes into applications.status (V5 §4) */
export type CompletenessStatus = 'COMPLETE' | 'INCOMPLETE_PENDING' | 'DOCUMENTS_REQUIRED'

/**
 * As-built applications.status values (V5 §4 — CODE evidence).
 * NOT a pipeline state machine: intake writes CREATED, doc-processing
 * overwrites with the completeness verdict, and no service updates it again.
 * Never bind UI to this — bind to QueueState.
 */
export type DISApplicationStatus = 'CREATED' | CompletenessStatus

/**
 * Derived queue state (V5 §4) — computed by the read layer from
 * applications.status + existence/outcome of the recommendations row +
 * callback_status. This is what the queue view filters on.
 */
export type QueueState =
  | 'FAILED_INTAKE'      // status CREATED, no progress past intake
  | 'AWAITING_DOCS'      // status INCOMPLETE_PENDING | DOCUMENTS_REQUIRED
  | 'IN_PIPELINE'        // status COMPLETE, no recommendations row yet
  | 'READY_FOR_REVIEW'   // recommendation present — goes to a caseworker. Phase 1:
                         // ALL outcomes (RECOMMEND_APPROVE / RECOMMEND_REJECT /
                         // MANUAL_REVIEW) land here — everything is human-in-the-loop.
  | 'AUTO_RECOMMENDED'   // PHASE 2 ONLY — programmatic fast-track (not produced in Phase 1)
  | 'CALLBACK_SENT'      // PHASE 2 ONLY — auto-decision callback delivered (not produced in Phase 1)

/** rules_summary block (V5 §5 — exact as-built keys from collate_application_data) */
export interface RulesSummary {
  rules: {
    drools_rules_evaluated: number
    drools_rules_passed: number
    drools_rules_failed: number
    drools_rules_not_applicable: number
  }
  opa_policies: {
    opa_total_evaluated: number
    opa_total_passed: number
    opa_total_failed: number
    opa_hard_evaluated: number
    opa_hard_passed: number
    opa_hard_failed: number
    opa_soft_evaluated: number
    opa_soft_passed: number
    opa_soft_failed: number
  }
  external_checks: {
    external_checks_evaluated: number
    external_checks_passed: number
    external_checks_failed: number
    external_checks_error: number
  }
}

/** Engine versions arrive as ARRAYS of active version records, not "1.2.0" strings */
export interface DroolsVersionRecord {
  rule_file: string
  rule_version_id: string
  created_at: string
}

export interface OPAVersionRecord {
  policy_file: string
  policy_version_id: string
  created_at: string
}

/**
 * The recommendation artifact (V5 §5). Top-level callback fields minus the
 * detail arrays (which DISApplicationView carries separately).
 *
 * Quirks (as-built): recommendations.confidence is always NULL — there is no
 * confidence on the recommendation itself, only per-component. There is no
 * overall_score, processing_path, or risk_level; derive display scores from
 * component_scores (null-safe).
 */
export interface DISRecommendation {
  recommendation_id?: string     // uuid PK (12 June DDL)
  recommendation: RecommendationOutcome
  recommendation_reason: string
  /** NEW column (12 June) — currently just echoes recommendation_reason.
   *  ⚠️ IP boundary: the Panel 1 narrative (Gemma 4/Praxia) is OV-IP and is
   *  NOT this field. Do not let this column become the reasoning letter. */
  caseworker_summary?: string | null
  /** Per-engine narrative, nullable per engine */
  evaluation_breakdown?: {
    drools_evaluation: string | null
    external_checks_evaluation: string | null
    opa_evaluation: string | null
  }
  /** Table columns (hard_fail_rules/soft_flag_rules), not in the callback.
   *  Entries mix RULE-* ids, OPA-* ids, and EXT_<check_type> markers. */
  hard_fail_rules?: string[]
  soft_flag_rules?: string[]
  rules_summary: RulesSummary
  completeness_score: number
  completeness_status: CompletenessStatus
  generated_at: string           // ISO 8601
  recommendation_at?: string     // table timestamp (12 June DDL, was decision_made_at)
  drools_version: DroolsVersionRecord[]
  opa_version: OPAVersionRecord[]
  /** "This is a system recommendation… Final determination rests with the
   *  authorised decision-maker." — render verbatim near the badge */
  note: string
}

// ============================================================================
// COMPONENT SCORES (9)
// ============================================================================

/**
 * Critical distinction:
 *   score       = does the applicant meet the requirement? (0-100, capped at
 *                 30 when a component rule FAILs)
 *   confidence  = extraction reliability, 0.0-1.0 (NOT 0-100)
 *
 * A score of 30 with confidence 0.98 means: "We read the documents correctly,
 * and the applicant clearly does not qualify" — not "we're uncertain".
 *
 * null component (or null score) = NOT_APPLICABLE — render greyed "N/A",
 * never 0/red, and exclude from any "component below threshold" flag logic.
 */

/** Rule results as embedded per-component (scorer.py maps to PASS/FAIL here —
 *  distinct from the rule_results table's RuleOutcome vocabulary) */
export interface ComponentRuleResult {
  rule_id: string
  rule_name: string
  result: 'PASS' | 'FAIL'
  severity: RuleSeverity
  details: string                // = rule_results.reasoning
  remediation?: string           // omitted on the fraud_risk component
}

export interface ComponentOPAResult {
  policy_id: string
  policy_name: string
  policy_type: OPATier
  outcome: 'PASS' | 'FAIL'
}

export interface ComponentScore {
  component?: ComponentScoreKey
  score: number | null           // null = NOT_APPLICABLE
  status: string                 // config-driven labels + NOT_APPLICABLE / MISSING
  status_description?: string
  confidence: number             // 0.0-1.0, 2dp
  /** Per-component evidence — supports Panel 2 grouping out of the box */
  rule_results?: ComponentRuleResult[]
  opa_results?: ComponentOPAResult[]
  extraction_sources?: string[]      // document types consumed
  external_check_types?: string[]    // check types consumed (always [] on fraud_risk)
  /** fraud_risk only. 0=clean → 1=suspicious. The component `score` is already
   *  flipped ((1−raw)×100, higher=better). RENDER score, NEVER this. */
  raw_fraud_score?: number
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

/** Values nullable: a whole component can be NOT_APPLICABLE (e.g. health for
 *  in-country applicants). All consumers must null-check. */
export type ComponentScores = Record<ComponentScoreKey, ComponentScore | null>

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

/** as-built rule_results.outcome vocabulary (Drools AuditService — CODE).
 *  NOT_APPLICABLE inferred from rules_summary.drools_rules_not_applicable;
 *  full union pending confirmation (V5 OPEN-3). */
export type RuleOutcome =
  | 'SATISFIED'
  | 'NOT_SATISFIED'
  | 'BLOCKED'
  | 'REVIEW_REQUIRED'
  | 'NOT_APPLICABLE'

export type RuleCategory = 'UNIVERSAL' | 'SKILLED_WORKER' | 'FRAUD'

/**
 * Universal rule IDs (apply to all visa types)
 * U01 — Passport Validity            U02 — Biometric Verification
 * U03 — Sanctions Screening          U04 — Duplicate Application Check
 * U05 — Document Extraction Confidence
 */
export type UniversalRuleId = 'RULE-U01' | 'RULE-U02' | 'RULE-U03' | 'RULE-U04' | 'RULE-U05'

/**
 * Skilled Worker rule IDs
 * W01 CoS Validity · W02 Sponsor Licence Status · W03 Salary General (≥£41,700)
 * W04 Salary New Entrant (≥£33,400) · W05 SOC Eligibility · W06 Immigration Salary List
 * W07 Job Skill Level (RQF 6+) · W08 English (CEFR B2+) · W09 Maintenance Funds
 * W10 TB Certificate · W11 Criminal Disclosure · W12 Immigration Compliance
 * W13 Completeness · W14 Document Fraud · W15 Start Date Validity
 */
export type SkilledWorkerRuleId =
  | 'RULE-W01' | 'RULE-W02' | 'RULE-W03' | 'RULE-W04' | 'RULE-W05'
  | 'RULE-W06' | 'RULE-W07' | 'RULE-W08' | 'RULE-W09' | 'RULE-W10'
  | 'RULE-W11' | 'RULE-W12' | 'RULE-W13' | 'RULE-W14' | 'RULE-W15'

export type DroolsRuleId = UniversalRuleId | SkilledWorkerRuleId

/** Maps 1:1 to as-built table columns (V5 §3). Live table name:
 *  `drools_evaluations` (renamed from rule_results, 12 June DDL — same columns). */
export interface DroolsRuleResult {
  rule_result_id?: string        // uuid
  rule_id: DroolsRuleId
  rule_name: string              // display label
  rule_category: RuleCategory
  outcome: RuleOutcome
  severity: RuleSeverity
  /** The Glass Box explanation string — render this in Panel 2 */
  reasoning: string
  remediation?: string
  /** Links into documents/extractions/checks — Panel 3 clickthrough */
  evidence_refs: string[]
  rule_version_id?: string
  created_at?: string            // ISO 8601
}

// ============================================================================
// OPA POLICIES (12 total: 6 HARD + 6 SOFT)
// ============================================================================

export type OPATier = 'HARD' | 'SOFT'

/** Storable values per the as-built DDL: opa_evaluations.outcome is
 *  VARCHAR(10), so 'REVIEW_REQUIRED' (15 chars) physically cannot exist in
 *  the live table — the soft-flag value is 'FLAG' (V5 OPEN-4, resolved by
 *  constraint 12 June). 'REVIEW_REQUIRED' is kept in the union defensively
 *  for non-table sources only. There is NO 'BLOCK' value — DENY is the
 *  hard stop. */
export type OPAOutcome = 'ALLOW' | 'DENY' | 'FLAG' | 'PASS' | 'REVIEW_REQUIRED'

/**
 * Hard policy IDs — DENY means the application cannot proceed
 * OPA-H01 Sanctions Hard Block · OPA-H02 Passport Verification · OPA-H03 Interpol SLTD
 * OPA-H04 Auth & Session · OPA-H05 Document Fraud Score (≥0.90) · OPA-H06 Data Residency
 */
export type HardOPAPolicyId = 'OPA-H01' | 'OPA-H02' | 'OPA-H03' | 'OPA-H04' | 'OPA-H05' | 'OPA-H06'

/**
 * Soft policy IDs — FLAG/REVIEW_REQUIRED means officer must assess
 * OPA-S01 Biometric Borderline · OPA-S02 World-Check LOW/MEDIUM · OPA-S03 Completeness Low
 * OPA-S04 Rapid Submission/Bot · OPA-S05 Enhanced Scrutiny Nationality · OPA-S06 Infra Alerts
 */
export type SoftOPAPolicyId = 'OPA-S01' | 'OPA-S02' | 'OPA-S03' | 'OPA-S04' | 'OPA-S05' | 'OPA-S06'

export type OPAPolicyId = HardOPAPolicyId | SoftOPAPolicyId

/** Maps 1:1 to as-built table columns (V5 §3). Live table name:
 *  `opa_evaluations` (renamed from opa_results, 12 June DDL — same columns).
 *  ⚠️ denial_reasons exists only in the table — the callback omits it. The
 *  trail read (endpoint 3) must come from the table for Panel 2 to render these. */
export interface OPAPolicyResult {
  policy_id: OPAPolicyId
  policy_name: string            // e.g., "Sanctions_WorldCheck_HardBlock"
  policy_type: OPATier
  outcome: OPAOutcome
  denial_reasons: string[]       // render under a DENY/FLAG; [] when clean
  input_context?: Record<string, unknown>
  policy_version_id?: string
  created_at?: string            // ISO 8601
}

// ============================================================================
// EXTERNAL API CHECKS (7)
// ============================================================================

/**
 * The 7 external checks — reconciled 16 June against the as-built DDL
 * (db/ddl/06_external_checks.sql CHECK constraint) and the seeded replica
 * (700 rows / 100 apps = 7 per application):
 *
 * 1. WORLDCHECK             — Reuters World-Check (LSEG) — live API
 * 2. INTERPOL               — Stolen/Lost Travel Documents — mock
 * 3. PASSPORT_VERIFY        — HMPO passport verification — mock
 * 4. BORDER_CONTROL         — border crossing / immigration history — mock
 *                             (separate as-built endpoint; NOT merged into
 *                             PASSPORT_VERIFY)
 * 5. DEVICE_IP_RISK         — VPN/Tor/proxy/fraud IP (VisaKey only) — mock
 * 6. EMAIL_PHONE_REPUTATION — disposable email, VOIP, fraud signals — mock
 * 7. SPONSOR_VERIFICATION   — sponsor / CoS register check — mock
 *
 * ⚠️ OPEN-8 (resolved 12 June): the as-built pipeline DOES emit a 7th
 * external_checks row, SPONSOR_VERIFICATION. An earlier note here claimed
 * sponsor validation was rules-layer only — that was superseded by the DDL.
 * RULE-W02 (Sponsor Licence Status) still exists in the Drools layer; the
 * external check is the API-evidence counterpart, not a replacement.
 */
export type ExternalCheckType =
  | 'WORLDCHECK'
  | 'INTERPOL'
  | 'PASSPORT_VERIFY'
  | 'BORDER_CONTROL'
  | 'DEVICE_IP_RISK'
  | 'EMAIL_PHONE_REPUTATION'
  | 'SPONSOR_VERIFICATION'

export type CheckStatus = 'CLEAR' | 'BLOCKED' | 'FLAGGED' | 'ERROR' | 'TIMEOUT'

/** Maps to as-built external_checks columns (V5 §3). Confirmed columns are
 *  required; the rest are optional and may be absent from live rows. */
export interface ExternalCheckResult {
  check_id?: string              // DB-generated
  dis_application_id?: string
  document_id?: string | null
  check_type: ExternalCheckType
  check_status: CheckStatus
  /** CRITICAL added 16 June — the as-built DDL CHECK allows it
   *  (db/ddl/06_external_checks.sql); the narrower union would reject a
   *  legal CRITICAL row. */
  risk_level: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  confidence_score: number
  flags: Record<string, unknown>
  /** Full raw response (as-built response_payload jsonb) — Panel 3 evidence cards */
  response_payload?: Record<string, unknown>
  response_time_ms: number
  created_at?: string            // ISO 8601
}

// ============================================================================
// DOCUMENTS + EXTRACTION
// ============================================================================

/**
 * Extraction methods. Gemini Vision was RULED OUT (hallucination risk,
 * non-deterministic). Doc AI is used across both tiers.
 */
export type ExtractionMethod =
  | 'DOC_AI_ID_PARSER'
  | 'DOC_AI_FORM_PARSER'
  | 'DOC_AI_CUSTOM_EXTRACTOR'

export type ExtractionTier = 'TIER_1' | 'TIER_2'
export type DocumentCriticality = 'CRITICAL' | 'SUPPORTING'

/**
 * 5-level fraud status
 * CLEAR 0.00-0.30 · LOW_RISK 0.31-0.60 · MEDIUM_RISK 0.61-0.80 (review)
 * HIGH_RISK 0.81-0.89 (priority review) · CRITICAL 0.90-1.00 (OPA-H05 hard block)
 */
export type FraudStatus = 'CLEAR' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL'

export interface FraudSignal {
  score: number                  // 0.0-1.0
  flags: string[]
}

/** Keyed by signal name (metadata_analysis, font_consistency, layout_anomaly,
 *  document_quality, cross_doc_consistency, mrz_check, content_plausibility).
 *  Not all documents have all signals. */
export type FraudSignals = Record<string, FraudSignal>

/**
 * The 12 document types in scope for Skilled Worker Phase 1.
 * CoS is NOT a document — it lives in application_payload JSONB, resolved via
 * register lookup. Never render it in the document viewer.
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
  | 'PHOTO'                  // applicant photo — persisted by the pipeline (added 18 Jun); not a scored doc / not in the viewer

export type SourceChannel = 'visakey' | 'govdirect'

/** as-built documents.processing_status values (V5 §4 — note 'NOT UPLOADED'
 *  genuinely contains a space) */
export type DocumentProcessingStatus =
  | 'AWAITING_UPLOAD'
  | 'UPLOADED'
  | 'EXTRACTED'
  | 'NOT_EXTRACTED'
  | 'MANUAL_REVIEW'
  | 'NOT UPLOADED'
  | 'SCHEDULING_FAILED'
  | 'PAYLOAD_MISSING_SIGNED_URL'

/** documents-table record (V5 §6 endpoint 4) — Panel 3 document viewer.
 *  gcs_path is exchanged for a signed URL by the read layer. */
export interface DISDocument {
  dis_document_id: string
  document_type: DocumentType
  requirement_tier?: string
  processing_tier?: ExtractionTier
  criticality: DocumentCriticality
  gcs_path: string
  /** Signed URL minted by the read layer — what the viewer actually loads */
  image_url?: string
  processing_status: DocumentProcessingStatus
  quality_score?: number
  mime_type?: string
  file_size_bytes?: number
}

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
  raw_extraction: Record<string, unknown>      // complete Doc AI output (KMS-protected at rest)
  extracted_data: Record<string, unknown>      // structured fields parsed from raw output
  normalised_fields: Record<string, unknown>   // schema-mapped (V5 OPEN-7: JSONB shape sign-off pending)
  fraud_score: number | null                   // null for GovDirect non-image docs
  fraud_status: FraudStatus | null
  fraud_signals: FraudSignals | null
  source_channel: SourceChannel
  gcs_raw_path: string
  gcs_processed_path: string
  created_at: string             // ISO 8601
  updated_at: string             // ISO 8601
}

// ============================================================================
// AUDIT LOG (legacy V3 shape — no as-built source; rules_summary is the
// evidenced equivalent. Kept optional for the audit-trail panel mock until
// Stream 1 is re-pointed at rules_summary + version arrays.)
// ============================================================================

export interface ProcessingError {
  stage: string
  check: string
  error_code: string
  error_message: string
  timestamp: string
  impact: string
}

export interface AuditLog {
  pipeline_version: string
  models_used: {
    document_ai: string
    fraud_detection: string
    rules_engine: string
    llm_summary: string
  }
  data_classification: string
  processing_location: string
  documents: { total: number; successful: number; failed: number; errors: ProcessingError[] }
  rules: { total_evaluated: number; passed: number; failed: number; skipped: number }
  external_checks: { total: number; successful: number; failed: number; timed_out: number; errors: ProcessingError[] }
  opa_policies: { total_evaluated: number; passed: number; blocked: number; flagged: number }
  processing_errors: ProcessingError[]
  warnings: string[]
}

// ============================================================================
// RECOMMENDATION CALLBACK PAYLOAD (V5 §5 — as-built, CODE-verified)
// ============================================================================

/**
 * The JSON DIS POSTs to `callback_url` — also stored verbatim as
 * recommendations.submission_payload. Channel-independent.
 *
 * Wire keys renamed 12 June: `drools_evaluations` / `opa_evaluations`
 * (were rule_results / opa_results). DISApplicationView keeps the
 * rule_results/opa_results field names client-side — the data provider maps
 * at the boundary.
 *
 * ⚠️ opa_evaluations entries here OMIT denial_reasons (the engine doesn't
 * SELECT them) — full OPA rows come from the trail read, not the callback.
 */
export interface DISRecommendationCallback extends DISRecommendation {
  dis_application_id: string
  component_scores: ComponentScores
  drools_evaluations: DroolsRuleResult[]
  opa_evaluations: Omit<OPAPolicyResult, 'denial_reasons'>[]
  external_checks: ExternalCheckResult[]
}

// ============================================================================
// CALLBACK EVENTS (12 June DDL — delivery tracking table)
// ============================================================================

export type CallbackEventStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'RETRYING'

/** callback_events table — per-attempt delivery record. Better queue-state
 *  signal than recommendations.callback_status. */
export interface CallbackEvent {
  callback_event_id: string
  dis_application_id: string
  recommendation_id: string
  callback_url: string
  attempt_number: number
  status: CallbackEventStatus
  http_status_code?: number | null
  error_message?: string | null
  payload_hash?: string | null
  initiated_at: string
  completed_at?: string | null
  response_time_ms?: number | null
  source_channel: SourceChannel
}

// ============================================================================
// STATUS API (endpoint 0 — LIVE; contract CODE-verified 12 June, V5 OPEN-5 ✓)
// ============================================================================

export type DISPipelineStageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

/**
 * GET /api/v1/applications/{id}/status response (dis-end-api).
 * Headers: Authorization: Bearer {DIS_API_KEY}, X-Source-Channel: visakey.
 * Pipeline state is derived from BigQuery audit events, NOT
 * applications.status — DIS's own version of our QueueState derivation.
 */
export interface DISStatusResponse {
  dis_application_id: string
  source_application_id: string
  source_channel: SourceChannel
  status: 'PROCESSING' | 'PROCESSED'
  created_at: string | null
  updated_at: string | null
  pipeline_progress: {
    ingestion: DISPipelineStageStatus
    document_classification: DISPipelineStageStatus
    document_extraction: DISPipelineStageStatus
    dlp_scan: DISPipelineStageStatus
    fraud_detection: DISPipelineStageStatus
    /** as-built expects SEVEN check rows, not six (V5 OPEN-8) */
    external_api_checks: DISPipelineStageStatus
    rules_evaluation: DISPipelineStageStatus
    opa_compliance: DISPipelineStageStatus
    decision: DISPipelineStageStatus
  }
  documents: {
    expected_count: number | null
    received_count: number | null
    processed_count: number | null
    failed_count: number | null
  }
  completeness_score: number | null
  /** The recommendations row, shape not formally typed by the service */
  decision: Record<string, unknown> | null
  callback_url: string | null
  estimated_completion: string
}

// ============================================================================
// FULL APPLICATION VIEW (what the AMS reviewer page consumes)
// ============================================================================

/**
 * CLIENT-SIDE composite assembled by the data provider from the read
 * endpoints (V5 §6) — not a wire contract. Replaces the old AIScanResult.
 */
export interface DISApplicationView {
  // The recommendation artifact (V5 §5)
  recommendation: DISRecommendation
  component_scores: ComponentScores
  source_channel: SourceChannel

  // Detail layers (endpoints 3-5; trail rows carry denial_reasons)
  rule_results: DroolsRuleResult[]
  opa_results: OPAPolicyResult[]
  external_checks: ExternalCheckResult[]
  documents?: DISDocument[]
  document_extractions: DocumentExtraction[]

  // Panel 1 — OV-IP narrative (Azure/Gemma 4 endpoint; mock until wired).
  // NO decision power, generated AFTER the recommendation.
  llm_summary: string

  // Legacy audit block (optional — superseded by recommendation.rules_summary)
  audit_log?: AuditLog

  // Lifecycle (V5 §4 — derived, never raw applications.status)
  queue_state?: QueueState

  // Submission metadata
  source_application_id: string
  source_reference: string
  dis_application_id: string
  submitted_at: string           // ISO 8601
}

// ============================================================================
// QUEUE LIST ROW (V5 §6 endpoint 1 — the officer queue / list screen)
// ============================================================================

/**
 * One row of the queue list (E1: GET /api/dis/applications). Deliberately a
 * DIS-native shape, NOT the legacy LiveApplication (which binds to a raw
 * ApplicationStatus display union). The UI binds to the DERIVED queue_state
 * (V5 §4), never applications.status. recommendation is null until the
 * pipeline writes a recommendations row.
 */
export interface DISQueueRow {
  dis_application_id: string
  source_application_id: string
  source_channel: SourceChannel
  visa_type: VisaType
  applicant_name: string
  /** Derived (deriveQueueState) — what the queue filters on. */
  queue_state: QueueState
  recommendation: RecommendationOutcome | null
  completeness_score: number | null
  submitted_at: string           // ISO 8601
}
