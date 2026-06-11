/**
 * Mock DIS Application View — realistic MANUAL_REVIEW scenario.
 *
 * Shapes follow V5 spec (docs/specs/2026-06-11-dis-integration-spec-v5.md):
 * as-built vocabularies (rule outcome SATISFIED/NOT_SATISFIED/…, OPA
 * ALLOW/DENY/FLAG, denial_reasons arrays), confidence on 0-1, nullable
 * component scores, BORDER_CONTROL as the 6th external check.
 *
 * Scenario: Skilled Worker applicant Rani Kumari (in-country switch from
 * Student route, BRP holder). DIS recommends MANUAL_REVIEW due to:
 * - World-Check LOW match (PEP relative) → OPA-S02 REVIEW_REQUIRED
 * - Font inconsistency on employment letter (fraud signal, below threshold)
 *
 * Exercises the N/A path: health component is null (in-country applicant,
 * UK resident > 6 months — TB test not required) and W04/W10 are
 * NOT_APPLICABLE, matching rules_summary (18 satisfied, 0 failed, 2 N/A).
 */

import type { DISApplicationView } from '@/api-contracts/dis'

export const mockDISApplicationView: DISApplicationView = {
  // === Recommendation artifact (V5 §5) ===
  recommendation: {
    recommendation: 'MANUAL_REVIEW',
    recommendation_reason:
      'All eligibility and compliance criteria met. Manual review required: World-Check returned a LOW-risk PEP relative match (OPA-S02).',
    evaluation_breakdown: {
      drools_evaluation: '18 of 20 rules satisfied; 2 not applicable (new entrant salary, TB certificate). No mandatory failures.',
      external_checks_evaluation: '5 of 6 checks clear. WORLDCHECK flagged: LOW-risk PEP relative match — officer assessment required.',
      opa_evaluation: 'All 6 hard policies allow. 5 of 6 soft policies pass; OPA-S02 requires review.',
    },
    hard_fail_rules: [],
    soft_flag_rules: ['OPA-S02', 'EXT_WORLDCHECK'],
    rules_summary: {
      rules: { drools_rules_evaluated: 20, drools_rules_passed: 18, drools_rules_failed: 0, drools_rules_not_applicable: 2 },
      opa_policies: {
        opa_total_evaluated: 12, opa_total_passed: 11, opa_total_failed: 1,
        opa_hard_evaluated: 6, opa_hard_passed: 6, opa_hard_failed: 0,
        opa_soft_evaluated: 6, opa_soft_passed: 5, opa_soft_failed: 1,
      },
      external_checks: { external_checks_evaluated: 6, external_checks_passed: 5, external_checks_failed: 1, external_checks_error: 0 },
    },
    completeness_score: 93,
    completeness_status: 'COMPLETE',
    generated_at: '2026-04-10T10:00:11Z',
    drools_version: [
      { rule_file: 'universal/universal_rules.drl', rule_version_id: 'rv-7d1a2b3c', created_at: '2026-04-01T08:00:00Z' },
      { rule_file: 'skilled_worker/skilled_worker_rules.drl', rule_version_id: 'rv-9e4f5a6b', created_at: '2026-04-01T08:00:00Z' },
    ],
    opa_version: [
      { policy_file: 'hard/hard_policies.rego', policy_version_id: 'pv-1c2d3e4f', created_at: '2026-04-08T09:00:00Z' },
      { policy_file: 'soft/soft_policies.rego', policy_version_id: 'pv-5a6b7c8d', created_at: '2026-04-08T09:00:00Z' },
    ],
    note: 'This is a system recommendation to assist caseworker decision-making. Final determination rests with the authorised decision-maker.',
  },

  // === Component scores (9; confidence 0-1; health null = NOT_APPLICABLE) ===
  component_scores: {
    passport: {
      component: 'passport', score: 95, status: 'VALID', confidence: 0.97,
      status_description: 'Passport valid, MRZ checksum passed, expiry 26 months',
      rule_results: [{ rule_id: 'RULE-U01', rule_name: 'Passport Validity', result: 'PASS', severity: 'MANDATORY', details: 'Passport XK9F4A7C2 valid; 26 months to expiry (≥ 6 required); MRZ checksum passed.' }],
      opa_results: [
        { policy_id: 'OPA-H02', policy_name: 'Passport_Verification', policy_type: 'HARD', outcome: 'PASS' },
        { policy_id: 'OPA-H03', policy_name: 'Interpol_SLTD', policy_type: 'HARD', outcome: 'PASS' },
      ],
      extraction_sources: ['PASSPORT'],
      external_check_types: ['PASSPORT_VERIFY', 'INTERPOL', 'BORDER_CONTROL'],
    },
    financial: {
      component: 'financial', score: 92, status: 'SUFFICIENT', confidence: 0.92,
      status_description: 'Lowest balance £118,500 over 31 days — well above £1,270/28-day requirement. Salary credits detected.',
      rule_results: [{ rule_id: 'RULE-W09', rule_name: 'Maintenance Funds', result: 'PASS', severity: 'MANDATORY', details: 'Lowest balance £118,500 held 31 days (≥ £1,270 / 28 days).' }],
      extraction_sources: ['BANK_STATEMENT'],
      external_check_types: [],
    },
    employment: {
      component: 'employment', score: 74, status: 'REVIEW_REQUIRED', confidence: 0.95,
      status_description: 'Salary £50,253 meets threshold £41,700. Font inconsistency detected on employment letter — review alongside original.',
      rule_results: [
        { rule_id: 'RULE-W03', rule_name: 'Salary Threshold — General', result: 'PASS', severity: 'MANDATORY', details: 'Annual salary £50,253 ≥ £41,700; exceeds SOC 2135 going rate £41,100.' },
        { rule_id: 'RULE-W01', rule_name: 'CoS Validity', result: 'PASS', severity: 'MANDATORY', details: 'CoS COS-2026-7247410 valid, assigned within 3 months, unused.' },
      ],
      extraction_sources: ['EMPLOYMENT_LETTER'],
      external_check_types: [],
    },
    english_language: {
      component: 'english_language', score: 91, status: 'MET', confidence: 0.89,
      status_description: 'IELTS Academic 7.5 (CEFR C1), within 2 years. UK degree provides additional exemption.',
      rule_results: [{ rule_id: 'RULE-W08', rule_name: 'English Language (CEFR B2+)', result: 'PASS', severity: 'MANDATORY', details: 'IELTS 7.5 (C1) ≥ B2 minimum; test 2024-10-12 within 2 years.' }],
      extraction_sources: ['IELTS_CERTIFICATE', 'DEGREE_CERTIFICATE'],
      external_check_types: [],
    },
    immigration_compliance: {
      component: 'immigration_compliance', score: 100, status: 'COMPLIANT', confidence: 1.0,
      status_description: 'No overstay, no deportation, no refusal at border. BRP valid.',
      rule_results: [{ rule_id: 'RULE-W12', rule_name: 'Previous Immigration Compliance', result: 'PASS', severity: 'MANDATORY', details: 'No adverse immigration history. BRP ZW1234567 valid until 2026-12-31.' }],
      extraction_sources: ['BRP'],
      external_check_types: ['BORDER_CONTROL'],
    },
    criminal_record: {
      component: 'criminal_record', score: 95, status: 'CLEAR', confidence: 0.99,
      status_description: 'No Interpol notice; no criminal record disclosed. World-Check LOW PEP-relative match flagged for review.',
      rule_results: [{ rule_id: 'RULE-W11', rule_name: 'Criminal Record Disclosure', result: 'PASS', severity: 'MANDATORY', details: 'No red notice; criminal_record_disclosed: false; World-Check LOW match is PEP relative (not criminal).' }],
      extraction_sources: [],
      external_check_types: ['WORLDCHECK', 'INTERPOL'],
    },
    health: null, // NOT_APPLICABLE — in-country applicant (UK resident > 6 months), TB test not required. Render N/A, never 0/red.
    document_quality: {
      component: 'document_quality', score: 78, status: 'ACCEPTABLE', confidence: 0.85,
      status_description: 'All documents legible. Employment letter shows minor font inconsistency (signal score 0.15).',
      rule_results: [{ rule_id: 'RULE-U05', rule_name: 'Document Extraction Confidence', result: 'PASS', severity: 'MANDATORY', details: 'All Critical documents ≥ 0.80 extraction confidence. Lowest: Employment Letter at 0.91.' }],
      extraction_sources: ['PASSPORT', 'BANK_STATEMENT', 'EMPLOYMENT_LETTER', 'IELTS_CERTIFICATE', 'DEGREE_CERTIFICATE'],
      external_check_types: [],
    },
    fraud_risk: {
      component: 'fraud_risk', score: 82, status: 'LOW_RISK', confidence: 0.82, raw_fraud_score: 0.18,
      status_description: 'Composite raw fraud score 0.18 — all documents below the 0.30 CLEAR threshold. Employment letter font inconsistency is the highest signal (0.15).',
      rule_results: [{ rule_id: 'RULE-W14', rule_name: 'Document Fraud Detection', result: 'PASS', severity: 'MANDATORY', details: 'No document fraud_score ≥ 0.90. Highest: Employment Letter 0.18.' }],
      extraction_sources: ['EMPLOYMENT_LETTER'],
      external_check_types: [], // always [] on fraud_risk as-built
    },
  },

  source_channel: 'visakey',

  // === Drools rule results (20 — as-built columns; V5 §3) ===
  rule_results: [
    // Universal (5)
    { rule_id: 'RULE-U01', rule_name: 'Passport Validity', rule_category: 'UNIVERSAL', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'Passport XK9F4A7C2 valid. Expiry 2028-06-19 (26 months remaining, ≥ 6 months required). MRZ checksum passed. HMPO verification clear.', evidence_refs: ['document_extractions:extr-001', 'external_checks:chk-003'] },
    { rule_id: 'RULE-U02', rule_name: 'Biometric Verification', rule_category: 'UNIVERSAL', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'Face match score 0.94 (≥ 0.85 required). Liveness PASS. MRZ PASS.', evidence_refs: ['submission_payload:biometric_verification'] },
    { rule_id: 'RULE-U03', rule_name: 'Sanctions Screening', rule_category: 'UNIVERSAL', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'World-Check result: LOW risk. PEP relative match — does not meet HIGH threshold for block. Flagged for officer review (OPA-S02).', evidence_refs: ['external_checks:chk-001'] },
    { rule_id: 'RULE-U04', rule_name: 'Duplicate Application Check', rule_category: 'UNIVERSAL', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'No duplicate applications found. Passport number, name+DOB, and email all unique in DIS database.', evidence_refs: [] },
    { rule_id: 'RULE-U05', rule_name: 'Document Extraction Confidence', rule_category: 'UNIVERSAL', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'All Critical documents have extraction confidence ≥ 0.80. Lowest: Employment Letter at 0.91.', evidence_refs: ['document_extractions:extr-001', 'document_extractions:extr-002', 'document_extractions:extr-003', 'document_extractions:extr-004', 'document_extractions:extr-005'] },
    // Skilled Worker (15)
    { rule_id: 'RULE-W01', rule_name: 'CoS Validity', rule_category: 'SKILLED_WORKER', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'CoS COS-2026-7247410 is valid, assigned within 3 months, not previously used.', evidence_refs: ['submission_payload:answers_employment.cosReferenceNumber'] },
    { rule_id: 'RULE-W02', rule_name: 'Sponsor Licence Status', rule_category: 'SKILLED_WORKER', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'Sponsor licence MER-2024-7891 (Orion Tech Solutions Ltd) is A-rated, not suspended or revoked.', evidence_refs: ['submission_payload:answers_employment'] },
    { rule_id: 'RULE-W03', rule_name: 'Salary Threshold — General', rule_category: 'SKILLED_WORKER', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'Annual salary £50,253 meets general threshold £41,700 (Option A). Hourly rate £25.10 meets minimum £17.13. Going rate for SOC 2135 (IT Business Analyst): £41,100 — salary exceeds 100%.', evidence_refs: ['document_extractions:extr-003', 'submission_payload:answers_employment'] },
    { rule_id: 'RULE-W04', rule_name: 'Salary Threshold — New Entrant', rule_category: 'SKILLED_WORKER', outcome: 'NOT_APPLICABLE', severity: 'MANDATORY', reasoning: 'Applicant DOB 1993-08-14, age 32 — not a new entrant. General threshold (RULE-W03) applied instead.', evidence_refs: [] },
    { rule_id: 'RULE-W05', rule_name: 'SOC Code Eligibility', rule_category: 'SKILLED_WORKER', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'SOC code 2135 (IT Business Analyst) is in Appendix Skilled Occupations Table 1. RQF level 6.', evidence_refs: ['submission_payload:answers_employment'] },
    { rule_id: 'RULE-W06', rule_name: 'Immigration Salary List Check', rule_category: 'SKILLED_WORKER', outcome: 'SATISFIED', severity: 'ADVISORY', reasoning: 'SOC 2135 is not on the Immigration Salary List. Standard threshold applies.', evidence_refs: [] },
    { rule_id: 'RULE-W07', rule_name: 'Job Skill Level (RQF 6+)', rule_category: 'SKILLED_WORKER', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'SOC 2135 requires RQF Level 6. Applicant holds BSc Computer Science from University of Birmingham — RQF Level 6 confirmed (UK institution, no ENIC lookup needed).', evidence_refs: ['document_extractions:extr-005'] },
    { rule_id: 'RULE-W08', rule_name: 'English Language (CEFR B2+)', rule_category: 'SKILLED_WORKER', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'IELTS Academic overall 7.5 (CEFR C1). Meets B2 minimum requirement. Test date 2024-10-12, within 2 years. UK degree also provides exemption.', evidence_refs: ['document_extractions:extr-004', 'document_extractions:extr-005'] },
    { rule_id: 'RULE-W09', rule_name: 'Maintenance Funds', rule_category: 'SKILLED_WORKER', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'Bank statement shows lowest balance £118,500 held for 31 days (statement period 2026-01-01 to 2026-01-31). Well above £1,270 for 28 days requirement.', evidence_refs: ['document_extractions:extr-002'] },
    { rule_id: 'RULE-W10', rule_name: 'TB Test Certificate', rule_category: 'SKILLED_WORKER', outcome: 'NOT_APPLICABLE', severity: 'MANDATORY', reasoning: 'TB test not required — applicant is an in-country switcher resident in the UK for more than 6 months (BRP ZW1234567).', evidence_refs: [] },
    { rule_id: 'RULE-W11', rule_name: 'Criminal Record Disclosure', rule_category: 'SKILLED_WORKER', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'No Interpol red notice. No criminal record disclosed on application. World-Check LOW match is PEP relative (not criminal).', evidence_refs: ['external_checks:chk-001', 'external_checks:chk-002', 'submission_payload:answers_criminalrecord'] },
    { rule_id: 'RULE-W12', rule_name: 'Previous Immigration Compliance', rule_category: 'SKILLED_WORKER', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'No overstay history, no deportation, no refusal at border. BRP ZW1234567 valid until 2026-12-31.', evidence_refs: ['external_checks:chk-006'] },
    { rule_id: 'RULE-W13', rule_name: 'Application Completeness', rule_category: 'SKILLED_WORKER', outcome: 'SATISFIED', severity: 'ADVISORY', reasoning: 'Completeness score 93/100 (threshold 70). All required documents present and extracted: Passport, Bank Statement, Employment Letter, IELTS Certificate, Degree Certificate.', evidence_refs: [] },
    { rule_id: 'RULE-W14', rule_name: 'Document Fraud Detection', rule_category: 'SKILLED_WORKER', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'No document has fraud_score ≥ 0.90 (CRITICAL threshold). Highest: Employment Letter at 0.18 (CLEAR). Font inconsistency signal (0.15) noted but below threshold.', evidence_refs: ['document_extractions:extr-003'], remediation: 'Review employment letter original alongside extracted fields.' },
    { rule_id: 'RULE-W15', rule_name: 'Start Date Validity', rule_category: 'SKILLED_WORKER', outcome: 'SATISFIED', severity: 'MANDATORY', reasoning: 'Employment start date 2026-05-01 is within 3 months of submission date 2026-04-10.', evidence_refs: ['submission_payload:answers_employment'] },
  ],

  // === OPA policy results (12 — as-built columns incl. denial_reasons; V5 §3) ===
  opa_results: [
    // Hard (6)
    { policy_id: 'OPA-H01', policy_name: 'Sanctions_WorldCheck_HardBlock', policy_type: 'HARD', outcome: 'ALLOW', denial_reasons: [] },
    { policy_id: 'OPA-H02', policy_name: 'Passport_Verification', policy_type: 'HARD', outcome: 'ALLOW', denial_reasons: [] },
    { policy_id: 'OPA-H03', policy_name: 'Interpol_SLTD', policy_type: 'HARD', outcome: 'ALLOW', denial_reasons: [] },
    { policy_id: 'OPA-H04', policy_name: 'Auth_Session_Validation', policy_type: 'HARD', outcome: 'ALLOW', denial_reasons: [] },
    { policy_id: 'OPA-H05', policy_name: 'Document_Fraud_Score', policy_type: 'HARD', outcome: 'ALLOW', denial_reasons: [] },
    { policy_id: 'OPA-H06', policy_name: 'Data_Residency', policy_type: 'HARD', outcome: 'ALLOW', denial_reasons: [] },
    // Soft (6)
    { policy_id: 'OPA-S01', policy_name: 'Biometric_Borderline', policy_type: 'SOFT', outcome: 'PASS', denial_reasons: [] },
    { policy_id: 'OPA-S02', policy_name: 'WorldCheck_Low_Medium', policy_type: 'SOFT', outcome: 'REVIEW_REQUIRED', denial_reasons: ['World-Check returned LOW risk with PEP relative match (category: POLITICALLY_EXPOSED_PERSON).', 'Officer must review the PEP connection and assess relevance to the application.'] },
    { policy_id: 'OPA-S03', policy_name: 'Completeness_Low', policy_type: 'SOFT', outcome: 'PASS', denial_reasons: [] },
    { policy_id: 'OPA-S04', policy_name: 'Rapid_Submission_Bot', policy_type: 'SOFT', outcome: 'PASS', denial_reasons: [] },
    { policy_id: 'OPA-S05', policy_name: 'Enhanced_Scrutiny_Nationality', policy_type: 'SOFT', outcome: 'PASS', denial_reasons: [] },
    { policy_id: 'OPA-S06', policy_name: 'Infrastructure_Alerts', policy_type: 'SOFT', outcome: 'PASS', denial_reasons: [] },
  ],

  // === External check results (6 — INTERPOL + BORDER_CONTROL per as-built; V5 §5) ===
  external_checks: [
    { check_id: 'chk-001', dis_application_id: 'dis-app-001', document_id: null, check_type: 'WORLDCHECK', check_status: 'FLAGGED', risk_level: 'LOW', confidence_score: 0.72, flags: { pep_relative_match: true, categories: ['POLITICALLY_EXPOSED_PERSON'] }, response_payload: { risk_level: 'LOW', categories_checked: ['SANCTIONS', 'PEP', 'ADVERSE_MEDIA', 'LAW_ENFORCEMENT'], lists_checked: ['OFSI', 'UN_SC', 'EU_SANCTIONS', 'US_OFAC', 'INTERPOL_RED_NOTICE'], matches_found: [{ type: 'PEP_RELATIVE', name: 'Kumar, Rajesh', relationship: 'Father-in-law', list: 'PEP_INDIA_STATE_LEVEL' }] }, response_time_ms: 1240, created_at: '2026-04-10T10:00:02Z' },
    { check_id: 'chk-002', dis_application_id: 'dis-app-001', document_id: 'doc-passport-001', check_type: 'INTERPOL', check_status: 'CLEAR', risk_level: 'NONE', confidence_score: 0.99, flags: {}, response_payload: { is_stolen: false, is_lost: false, is_revoked: false, is_invalid: false, database_version: '2026-04-10' }, response_time_ms: 890, created_at: '2026-04-10T10:00:02Z' },
    { check_id: 'chk-003', dis_application_id: 'dis-app-001', document_id: 'doc-passport-001', check_type: 'PASSPORT_VERIFY', check_status: 'CLEAR', risk_level: 'NONE', confidence_score: 0.98, flags: {}, response_payload: { overall_match: true, check_digit_valid: true, authenticity: 0.97, document_status: 'VALID' }, response_time_ms: 1100, created_at: '2026-04-10T10:00:03Z' },
    { check_id: 'chk-004', dis_application_id: 'dis-app-001', document_id: null, check_type: 'DEVICE_IP_RISK', check_status: 'CLEAR', risk_level: 'NONE', confidence_score: 0.95, flags: {}, response_payload: { ip_analysis: { is_vpn: false, is_tor: false, is_proxy: false, is_datacenter: false, is_known_fraud_ip: false }, device_analysis: { device_fingerprint_known: true, device_trust_score: 0.92 }, submission_velocity: 'NORMAL', impossible_travel: false }, response_time_ms: 340, created_at: '2026-04-10T10:00:01Z' },
    { check_id: 'chk-005', dis_application_id: 'dis-app-001', document_id: null, check_type: 'EMAIL_PHONE_REPUTATION', check_status: 'CLEAR', risk_level: 'NONE', confidence_score: 0.93, flags: {}, response_payload: { email_analysis: { is_disposable: false, is_deliverable: true, domain_age_days: 4380, breach_count: 0, is_known_fraud_email: false }, phone_analysis: { is_valid: true, line_type: 'MOBILE', carrier: 'Vodafone UK', is_voip: false, is_virtual: false, phone_country: 'GBR', is_known_fraud_phone: false } }, response_time_ms: 520, created_at: '2026-04-10T10:00:01Z' },
    { check_id: 'chk-006', dis_application_id: 'dis-app-001', document_id: 'doc-passport-001', check_type: 'BORDER_CONTROL', check_status: 'CLEAR', risk_level: 'NONE', confidence_score: 0.97, flags: {}, response_payload: { has_overstay: false, has_deportation: false, has_refusal_at_border: false, current_immigration_status: 'LEAVE_TO_REMAIN', last_entry_date: '2024-09-12', entries_last_5_years: 3 }, response_time_ms: 410, created_at: '2026-04-10T10:00:03Z' },
  ],

  // === Document extractions (5 documents — shapes unchanged, V1.2 aligned) ===
  document_extractions: [
    { extraction_id: 'extr-001', dis_application_id: 'dis-app-001', document_id: 'doc-passport-001', document_type: 'PASSPORT', tier: 'TIER_1', criticality: 'CRITICAL', extraction_method: 'DOC_AI_ID_PARSER', processor_id: 'projects/prj-dev-dis-9666/locations/europe-west2/processors/passport-id-parser', processor_version: 'pretrained-v2.1', extraction_confidence: 0.97, raw_extraction: {}, extracted_data: { document_number: 'XK9F4A7C2', surname: 'KUMARI', given_names: 'RANI', full_name: 'RANI KUMARI', date_of_birth: '1993-08-14', nationality: 'INDIAN', sex: 'F', issue_date: '2018-06-20', expiry_date: '2028-06-19', issuing_country: 'INDIA', country_code: 'IND', document_type_code: 'P', place_of_birth: 'Delhi, India', place_of_issue: 'Ghaziabad, Uttar Pradesh, India', mrz_line_1: 'P<INDKUMARI<<RANI<<<<<<<<<<<<<<<<<<<', mrz_line_2: 'XK9F4A7C2IND9308146F2806199<<<<<<<<<<<<<', photo_hash: 'b1946ac92492d2347c6235b4d2611184', has_signature: true }, normalised_fields: { document_number: 'XK9F4A7C2', surname: 'KUMARI', given_names: 'RANI', full_name: 'KUMARI, RANI', date_of_birth: '1993-08-14', nationality_code: 'IND', sex: 'F', issue_date: '2018-06-20', expiry_date: '2028-06-19', issuing_country_code: 'IND', mrz_valid: true, mrz_checksum_passed: true, months_to_expiry: 26, is_expired: false }, fraud_score: 0.08, fraud_status: 'CLEAR', fraud_signals: { metadata_analysis: { score: 0.05, flags: [] }, font_consistency: { score: 0.02, flags: [] }, layout_anomaly: { score: 0.03, flags: [] }, document_quality: { score: 0.04, flags: [] }, cross_doc_consistency: { score: 0.10, flags: [] }, mrz_check: { score: 0.00, flags: [] }, content_plausibility: { score: 0.05, flags: [] } }, source_channel: 'visakey', gcs_raw_path: 'gs://dis-raw-uploads/dis-app-001/doc-passport-001.jpg', gcs_processed_path: 'gs://dis-processed-docs/dis-app-001/doc-passport-001.json', created_at: '2026-04-10T10:00:00Z', updated_at: '2026-04-10T10:00:01Z' },
    { extraction_id: 'extr-002', dis_application_id: 'dis-app-001', document_id: 'doc-bank-001', document_type: 'BANK_STATEMENT', tier: 'TIER_1', criticality: 'CRITICAL', extraction_method: 'DOC_AI_FORM_PARSER', processor_id: 'projects/prj-dev-dis-9666/locations/europe-west2/processors/form-parser', processor_version: 'pretrained-v1.0', extraction_confidence: 0.94, raw_extraction: {}, extracted_data: {}, normalised_fields: { account_holder_name: 'KUMARI, RANI', account_number_last4: '8912', sort_code: '12-34-56', bank_name: 'BARCLAYS BANK UK PLC', currency: 'GBP', period_start: '2026-01-01', period_end: '2026-01-31', period_days: 31, opening_balance_gbp: 125000.50, closing_balance_gbp: 138420.75, lowest_balance_gbp: 118500.00, meets_maintenance_threshold: true, salary_credit_detected: true, monthly_salary_amount_gbp: 3500.00 }, fraud_score: 0.12, fraud_status: 'CLEAR', fraud_signals: { metadata_analysis: { score: 0.10, flags: [] }, font_consistency: { score: 0.05, flags: [] }, layout_anomaly: { score: 0.08, flags: [] }, document_quality: { score: 0.03, flags: [] }, cross_doc_consistency: { score: 0.12, flags: [] }, content_plausibility: { score: 0.06, flags: [] } }, source_channel: 'visakey', gcs_raw_path: 'gs://dis-raw-uploads/dis-app-001/doc-bank-001.pdf', gcs_processed_path: 'gs://dis-processed-docs/dis-app-001/doc-bank-001.json', created_at: '2026-04-10T10:00:00Z', updated_at: '2026-04-10T10:00:01Z' },
    { extraction_id: 'extr-003', dis_application_id: 'dis-app-001', document_id: 'doc-emp-001', document_type: 'EMPLOYMENT_LETTER', tier: 'TIER_2', criticality: 'CRITICAL', extraction_method: 'DOC_AI_CUSTOM_EXTRACTOR', processor_id: 'projects/prj-dev-dis-9666/locations/europe-west2/processors/employment-letter-extractor', processor_version: 'custom-v1.0-scrum21', extraction_confidence: 0.91, raw_extraction: {}, extracted_data: {}, normalised_fields: { employer_name: 'ORION TECH SOLUTIONS LTD', job_title: 'IT BUSINESS ANALYST', start_date: '2026-05-01', annual_salary_gbp: 50253.00, hourly_rate_gbp: 25.10, hours_per_week: 38.5, employment_type: 'FULL_TIME', letter_date: '2026-04-01', salary_matches_cos: true, employer_matches_cos: true }, fraud_score: 0.18, fraud_status: 'CLEAR', fraud_signals: { metadata_analysis: { score: 0.10, flags: [] }, font_consistency: { score: 0.15, flags: ['FONT_INCONSISTENCY_DETECTED'] }, layout_anomaly: { score: 0.05, flags: [] }, document_quality: { score: 0.03, flags: [] }, cross_doc_consistency: { score: 0.12, flags: [] }, content_plausibility: { score: 0.08, flags: [] } }, source_channel: 'visakey', gcs_raw_path: 'gs://dis-raw-uploads/dis-app-001/doc-emp-001.pdf', gcs_processed_path: 'gs://dis-processed-docs/dis-app-001/doc-emp-001.json', created_at: '2026-04-10T10:00:00Z', updated_at: '2026-04-10T10:00:02Z' },
    { extraction_id: 'extr-004', dis_application_id: 'dis-app-001', document_id: 'doc-ielts-001', document_type: 'IELTS_CERTIFICATE', tier: 'TIER_2', criticality: 'CRITICAL', extraction_method: 'DOC_AI_CUSTOM_EXTRACTOR', processor_id: 'projects/prj-dev-dis-9666/locations/europe-west2/processors/ielts-extractor', processor_version: 'custom-v1.0-scrum21', extraction_confidence: 0.95, raw_extraction: {}, extracted_data: {}, normalised_fields: { test_type: 'IELTS_ACADEMIC', candidate_name: 'KUMARI, RANI', test_date: '2024-10-12', overall_score: 7.5, listening_score: 8.0, reading_score: 7.5, writing_score: 7.0, speaking_score: 7.5, cefr_level: 'C1', meets_b2_minimum: true, component_scores_valid: true, test_within_2_years: true, trf_number: '24GB012345' }, fraud_score: 0.05, fraud_status: 'CLEAR', fraud_signals: { metadata_analysis: { score: 0.04, flags: [] }, font_consistency: { score: 0.03, flags: [] }, layout_anomaly: { score: 0.02, flags: [] }, document_quality: { score: 0.02, flags: [] }, cross_doc_consistency: { score: 0.08, flags: [] }, content_plausibility: { score: 0.03, flags: [] } }, source_channel: 'visakey', gcs_raw_path: 'gs://dis-raw-uploads/dis-app-001/doc-ielts-001.jpg', gcs_processed_path: 'gs://dis-processed-docs/dis-app-001/doc-ielts-001.json', created_at: '2026-04-10T10:00:00Z', updated_at: '2026-04-10T10:00:02Z' },
    { extraction_id: 'extr-005', dis_application_id: 'dis-app-001', document_id: 'doc-degree-001', document_type: 'DEGREE_CERTIFICATE', tier: 'TIER_2', criticality: 'CRITICAL', extraction_method: 'DOC_AI_CUSTOM_EXTRACTOR', processor_id: 'projects/prj-dev-dis-9666/locations/europe-west2/processors/degree-extractor', processor_version: 'custom-v1.0-scrum21', extraction_confidence: 0.93, raw_extraction: {}, extracted_data: {}, normalised_fields: { institution_name: 'UNIVERSITY OF BIRMINGHAM', candidate_name: 'KUMARI, RANI', qualification_title: 'BACHELOR OF SCIENCE', subject: 'COMPUTER SCIENCE', award_date: '2015-07-20', classification: 'FIRST_CLASS_HONOURS', country_code: 'GBR', is_uk_institution: true, naric_reference: null, rqf_level_equivalent: 6 }, fraud_score: 0.07, fraud_status: 'CLEAR', fraud_signals: { metadata_analysis: { score: 0.06, flags: [] }, font_consistency: { score: 0.04, flags: [] }, layout_anomaly: { score: 0.05, flags: [] }, document_quality: { score: 0.03, flags: [] }, cross_doc_consistency: { score: 0.10, flags: [] }, content_plausibility: { score: 0.04, flags: [] } }, source_channel: 'visakey', gcs_raw_path: 'gs://dis-raw-uploads/dis-app-001/doc-degree-001.jpg', gcs_processed_path: 'gs://dis-processed-docs/dis-app-001/doc-degree-001.json', created_at: '2026-04-10T10:00:00Z', updated_at: '2026-04-10T10:00:02Z' },
  ],

  // === LLM summary (Panel 1 — OV-IP narrative, mock until Azure endpoint wired) ===
  llm_summary: 'Rani Kumari is a 32-year-old Indian national applying in-country to switch to a Skilled Worker visa, sponsored by Orion Tech Solutions Ltd (A-rated, licence MER-2024-7891) for the role of IT Business Analyst (SOC 2135, RQF Level 6). Annual salary of £50,253 comfortably exceeds both the general threshold (£41,700) and the going rate for this occupation (£41,100). 18 of 20 rules are satisfied; the remaining two are not applicable (new-entrant salary — applicant is 32; TB certificate — UK resident over 6 months, so no test required). The applicant holds a BSc in Computer Science from the University of Birmingham (First Class Honours) which satisfies the RQF 6+ requirement and provides an English language exemption, further reinforced by an IELTS Academic score of 7.5 (CEFR C1). Financial requirements are met with a lowest balance of £118,500 over the statement period. Two items require officer attention: (1) Reuters World-Check returned a LOW-risk PEP relative match — the applicant\'s father-in-law appears on the India state-level PEP list. This is a soft flag (OPA-S02) for officer assessment, not a sanctions block. (2) The employment letter exhibits a minor font inconsistency (fraud signal score 0.15 on font_consistency) which, while well below the CRITICAL threshold, should be reviewed alongside the original document. All hard OPA policies allow. No immigration compliance issues.',

  // === Lifecycle (derived — V5 §4) ===
  queue_state: 'READY_FOR_REVIEW',

  // === Submission metadata ===
  source_application_id: 'VK-2026-RK-4821',
  source_reference: 'VK-2026-RK-4821',
  dis_application_id: 'dis-app-001',
  submitted_at: '2026-04-10T09:59:00Z',
}
