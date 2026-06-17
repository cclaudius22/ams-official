/**
 * Phase 2F.2 — Seed the DIS schema replica from the synthetic corpus.
 *
 * Sources (openvisa-synthetic-data):
 *   output/json_payloads/{visakey,govdirect}/*.json   100 submission payloads
 *   output/json_payloads/expected_outcomes.json        per-slot ground truth
 *                                                      (decision + rules_triggered
 *                                                       with FAIL detail strings)
 *
 * Targets: the 12 tables of Deloitte's DDL (db/ddl, commit ecd23b9) running
 * in the local replica (db/docker-compose.yml).
 *
 * DETERMINISTIC: every id, score, and timestamp derives from sha256 of the
 * application's source id — reruns produce identical rows. No Date.now().
 *
 * Outcome mapping (17 Jun — pipeline vocab RECOMMEND_*; all three are live):
 *   expected APPROVED      → recommendations.outcome 'RECOMMEND_APPROVE'
 *   expected REJECTED      → 'RECOMMEND_REJECT' + hard_fail_rules populated
 *   expected MANUAL_REVIEW → 'MANUAL_REVIEW'    + soft_flag_rules populated
 *
 * Usage:
 *   npx tsx scripts/seedReplica.ts [--limit N] [--reset]
 *   DATABASE_URL=postgres://dis:dis@localhost:5499/openvisa_pg_db (default)
 */

import { createHash } from 'node:crypto'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { Client } from 'pg'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://dis:dis@localhost:5499/openvisa_pg_db'
const CORPUS = process.env.CORPUS_DIR
  ?? join(__dirname, '../../openvisa-synthetic-data/output/json_payloads')

const args = process.argv.slice(2)
const LIMIT = args.includes('--limit') ? Number(args[args.indexOf('--limit') + 1]) : Infinity
const RESET = args.includes('--reset')

// ---------------------------------------------------------------------------
// Deterministic helpers
// ---------------------------------------------------------------------------

const sha = (s: string) => createHash('sha256').update(s).digest()

/** Deterministic UUID (v4-shaped) from input parts */
function detUuid(...parts: string[]): string {
  const h = sha(parts.join('|')).toString('hex')
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    '4' + h.slice(13, 16),
    ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16) + h.slice(17, 20),
    h.slice(20, 32),
  ].join('-')
}

/** Deterministic float in [min, max) from input parts */
function detFloat(min: number, max: number, ...parts: string[]): number {
  const n = sha(parts.join('|')).readUInt32BE(0) / 0xffffffff
  return min + n * (max - min)
}

const round2 = (n: number) => Math.round(n * 100) / 100

// ---------------------------------------------------------------------------
// Rule & policy catalogues (V5 §5 vocab; names per V3 catalogue narrative)
// ---------------------------------------------------------------------------

interface CatalogueRule { rule_id: string; rule_name: string; rule_category: string; severity: string }

const RULES: CatalogueRule[] = [
  { rule_id: 'RULE-U01', rule_name: 'Passport Validity', rule_category: 'UNIVERSAL', severity: 'MANDATORY' },
  { rule_id: 'RULE-U02', rule_name: 'Biometric Verification', rule_category: 'UNIVERSAL', severity: 'MANDATORY' },
  { rule_id: 'RULE-U03', rule_name: 'Sanctions Screening', rule_category: 'UNIVERSAL', severity: 'MANDATORY' },
  { rule_id: 'RULE-U04', rule_name: 'Duplicate Application Check', rule_category: 'UNIVERSAL', severity: 'MANDATORY' },
  { rule_id: 'RULE-U05', rule_name: 'Document Extraction Confidence', rule_category: 'UNIVERSAL', severity: 'MANDATORY' },
  { rule_id: 'RULE-W01', rule_name: 'CoS Validity', rule_category: 'SKILLED_WORKER', severity: 'MANDATORY' },
  { rule_id: 'RULE-W02', rule_name: 'Sponsor Licence Status', rule_category: 'SKILLED_WORKER', severity: 'MANDATORY' },
  { rule_id: 'RULE-W03', rule_name: 'Salary Threshold — General', rule_category: 'SKILLED_WORKER', severity: 'MANDATORY' },
  { rule_id: 'RULE-W04', rule_name: 'Salary Threshold — New Entrant', rule_category: 'SKILLED_WORKER', severity: 'MANDATORY' },
  { rule_id: 'RULE-W05', rule_name: 'SOC Code Eligibility', rule_category: 'SKILLED_WORKER', severity: 'MANDATORY' },
  { rule_id: 'RULE-W06', rule_name: 'Immigration Salary List Check', rule_category: 'SKILLED_WORKER', severity: 'ADVISORY' },
  { rule_id: 'RULE-W07', rule_name: 'Job Skill Level (RQF 6+)', rule_category: 'SKILLED_WORKER', severity: 'MANDATORY' },
  { rule_id: 'RULE-W08', rule_name: 'English Language (CEFR B2+)', rule_category: 'SKILLED_WORKER', severity: 'MANDATORY' },
  { rule_id: 'RULE-W09', rule_name: 'Maintenance Funds', rule_category: 'SKILLED_WORKER', severity: 'MANDATORY' },
  { rule_id: 'RULE-W10', rule_name: 'TB Test Certificate', rule_category: 'SKILLED_WORKER', severity: 'MANDATORY' },
  { rule_id: 'RULE-W11', rule_name: 'Criminal Record Disclosure', rule_category: 'SKILLED_WORKER', severity: 'MANDATORY' },
  { rule_id: 'RULE-W12', rule_name: 'Previous Immigration Compliance', rule_category: 'SKILLED_WORKER', severity: 'MANDATORY' },
  { rule_id: 'RULE-W13', rule_name: 'Application Completeness', rule_category: 'SKILLED_WORKER', severity: 'ADVISORY' },
  { rule_id: 'RULE-W14', rule_name: 'Document Fraud Detection', rule_category: 'SKILLED_WORKER', severity: 'MANDATORY' },
  { rule_id: 'RULE-W15', rule_name: 'Start Date Validity', rule_category: 'SKILLED_WORKER', severity: 'MANDATORY' },
]

const POLICIES = [
  { policy_id: 'OPA-H01', policy_name: 'Sanctions_WorldCheck_HardBlock', policy_type: 'HARD' },
  { policy_id: 'OPA-H02', policy_name: 'Passport_Verification', policy_type: 'HARD' },
  { policy_id: 'OPA-H03', policy_name: 'Interpol_SLTD', policy_type: 'HARD' },
  { policy_id: 'OPA-H04', policy_name: 'Auth_Session_Validation', policy_type: 'HARD' },
  { policy_id: 'OPA-H05', policy_name: 'Document_Fraud_Score', policy_type: 'HARD' },
  { policy_id: 'OPA-H06', policy_name: 'Data_Residency', policy_type: 'HARD' },
  { policy_id: 'OPA-S01', policy_name: 'Biometric_Borderline', policy_type: 'SOFT' },
  { policy_id: 'OPA-S02', policy_name: 'WorldCheck_Low_Medium', policy_type: 'SOFT' },
  { policy_id: 'OPA-S03', policy_name: 'Completeness_Low', policy_type: 'SOFT' },
  { policy_id: 'OPA-S04', policy_name: 'Rapid_Submission_Bot', policy_type: 'SOFT' },
  { policy_id: 'OPA-S05', policy_name: 'Enhanced_Scrutiny_Nationality', policy_type: 'SOFT' },
  { policy_id: 'OPA-S06', policy_name: 'Infrastructure_Alerts', policy_type: 'SOFT' },
]

/** Corpus ground-truth rule ids → DIS rule catalogue */
const CORPUS_RULE_MAP: Record<string, string> = {
  GOING_RATE: 'RULE-W03',
  SALARY_FLOOR: 'RULE-W03',
  SALARY_CONSISTENCY: 'RULE-W14',
  NAME_CONSISTENCY: 'RULE-W14',
  DECLARATION_CONSISTENCY: 'RULE-W14',
  TB_CERT_VALIDITY: 'RULE-W10',
  TB_CERT_PROVIDER: 'RULE-W10',
  DBS_REQUIRED: 'RULE-W11',
  PASSPORT_VALIDITY: 'RULE-U01',
  COS_VALIDITY_WINDOW: 'RULE-W01',
  QUALIFICATION_EQUIVALENCY: 'RULE-W07',
  RQF_LEVEL_CHECK: 'RULE-W07',
  IMMIGRATION_STATUS: 'RULE-W12',
  ENGLISH_LEVEL: 'RULE-W08',
  ENGLISH_VALIDITY: 'RULE-W08',
  ENGLISH_PROVIDER: 'RULE-W08',
  MAINTENANCE_FUNDS: 'RULE-W09',
  CURRENCY_CONVERSION: 'RULE-W09',
  DOCUMENT_CLASSIFICATION: 'RULE-U05',
  DOCUMENT_QUALITY: 'RULE-U05',
  TRANSLATION_REQUIRED: 'RULE-U05',
  SOC_CODE_MATCH: 'RULE-W05',
  AGE_ELIGIBILITY: 'RULE-W04',
}

/** Which rules/policies feed each component score (mirrors scorer behaviour) */
const COMPONENT_RULES: Record<string, string[]> = {
  passport: ['RULE-U01', 'RULE-U02'],
  financial: ['RULE-W09', 'RULE-W06'],
  employment: ['RULE-W01', 'RULE-W02', 'RULE-W03', 'RULE-W04', 'RULE-W05', 'RULE-W07', 'RULE-W15'],
  english_language: ['RULE-W08'],
  immigration_compliance: ['RULE-W12', 'RULE-U04'],
  criminal_record: ['RULE-W11', 'RULE-U03'],
  health: ['RULE-W10'],
  document_quality: ['RULE-U05', 'RULE-W13'],
  fraud_risk: ['RULE-W14'],
}

const COMPONENT_STATUS: Record<string, [string, string, string]> = {
  passport: ['VALID', 'REVIEW_REQUIRED', 'INVALID'],
  financial: ['SUFFICIENT', 'REVIEW_REQUIRED', 'INSUFFICIENT'],
  employment: ['VERIFIED', 'REVIEW_REQUIRED', 'UNVERIFIED'],
  english_language: ['MET', 'REVIEW_REQUIRED', 'NOT_MET'],
  immigration_compliance: ['COMPLIANT', 'REVIEW_REQUIRED', 'NON_COMPLIANT'],
  criminal_record: ['CLEAR', 'REVIEW_REQUIRED', 'FLAGGED'],
  health: ['MET', 'REVIEW_REQUIRED', 'NOT_MET'],
  document_quality: ['HIGH_QUALITY', 'ACCEPTABLE', 'LOW_QUALITY'],
  fraud_risk: ['LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'],
}

// Per V5 §3 DDL: 7 check types (SPONSOR_VERIFICATION is the 7th — OPEN-8 resolved)
const CHECK_TYPES = [
  'WORLDCHECK', 'INTERPOL', 'PASSPORT_VERIFY', 'BORDER_CONTROL',
  'DEVICE_IP_RISK', 'EMAIL_PHONE_REPUTATION', 'SPONSOR_VERIFICATION',
]

// Doc-type mapping: corpus payload `type` → DIS document_type + handling
const DOC_TYPE_MAP: Record<string, { type: string; critical: boolean; extract: boolean }> = {
  PASSPORT: { type: 'PASSPORT', critical: true, extract: true },
  EMPLOYMENT_LETTER: { type: 'EMPLOYMENT_LETTER', critical: true, extract: true },
  BANK_STATEMENT: { type: 'BANK_STATEMENT', critical: true, extract: true },
  DEGREE_CERTIFICATE: { type: 'DEGREE_CERTIFICATE', critical: true, extract: true },
  IELTS_CERTIFICATE: { type: 'IELTS_CERTIFICATE', critical: true, extract: true },
  PAYSLIPS: { type: 'PAYSLIP', critical: true, extract: true },
  TB_CERTIFICATE: { type: 'TB_CERTIFICATE', critical: false, extract: true },
  PROOF_OF_ADDRESS: { type: 'UTILITY_BILL', critical: false, extract: true },
  PHOTO: { type: 'PHOTO', critical: false, extract: false },
}

// Extraction confidence bands per processor metrics (Confluence 113410081)
const CONFIDENCE_BANDS: Record<string, [number, number]> = {
  EMPLOYMENT_LETTER: [0.78, 0.92],
  DEGREE_CERTIFICATE: [0.8, 0.93],
  PAYSLIP: [0.85, 0.95],
  PASSPORT: [0.86, 0.97],
  BANK_STATEMENT: [0.88, 0.97],
  default: [0.9, 0.99],
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const outcomes = JSON.parse(readFileSync(join(CORPUS, 'expected_outcomes.json'), 'utf8')).outcomes as Array<{
    slot: number
    channel: string
    expected_decision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW'
    failure_reasons: string[]
    rules_triggered: Array<{ rule_id: string; edge_case: string; result: string; detail: string }>
  }>

  const payloadFiles = [
    ...readdirSync(join(CORPUS, 'visakey')).map((f) => join(CORPUS, 'visakey', f)),
    ...readdirSync(join(CORPUS, 'govdirect')).map((f) => join(CORPUS, 'govdirect', f)),
  ].filter((f) => f.endsWith('.json')).sort()

  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  console.log(`Connected: ${DATABASE_URL}`)

  if (RESET) {
    await client.query(`TRUNCATE callback_events, recommendations, drools_evaluations, opa_evaluations,
      external_checks, document_extractions, documents, applications, submission_payload, applicants,
      rule_versions, policy_versions CASCADE`)
    console.log('Truncated all tables')
  }

  // --- Versions (one ACTIVE row per engine file) -----------------------------
  const droolsVersions = [
    { rule_file: 'universal/universal_rules.drl', count: 5 },
    { rule_file: 'skilled_worker/skilled_worker_rules.drl', count: 15 },
  ].map((v) => ({ ...v, id: detUuid('rule_version', v.rule_file) }))
  const opaVersions = [
    { policy_file: 'hard/hard_policies.rego', count: 6 },
    { policy_file: 'soft/soft_policies.rego', count: 6 },
  ].map((v) => ({ ...v, id: detUuid('policy_version', v.policy_file) }))

  for (const v of droolsVersions) {
    await client.query(
      `INSERT INTO rule_versions (rule_version_id, rule_file, version, gcs_path, deployed_by, status, rule_count, deployed_at)
       VALUES ($1,$2,'1.2.0',$3,'seed-replica','ACTIVE',$4,'2026-06-01T08:00:00Z') ON CONFLICT DO NOTHING`,
      [v.id, v.rule_file, `gs://openvisa-dis-rules-dev/drools/active/${v.rule_file}`, v.count],
    )
  }
  for (const v of opaVersions) {
    await client.query(
      `INSERT INTO policy_versions (policy_version_id, policy_file, version, gcs_path, deployed_by, status, policy_count, deployed_at)
       VALUES ($1,$2,'1.1.0',$3,'seed-replica','ACTIVE',$4,'2026-06-01T08:00:00Z') ON CONFLICT DO NOTHING`,
      [v.id, v.policy_file, `gs://openvisa-dis-rules-dev/opa/active/${v.policy_file}`, v.count],
    )
  }
  const ruleVersionId = droolsVersions[1].id // SW file for all rule rows (simplification)

  // --- Applications ----------------------------------------------------------
  let seeded = 0
  for (const file of payloadFiles.slice(0, LIMIT === Infinity ? undefined : LIMIT)) {
    const p = JSON.parse(readFileSync(file, 'utf8'))
    const slot = Number(file.match(/-(\d+)\.json$/)?.[1])
    const outcome = outcomes.find((o) => o.slot === slot)
    if (!outcome) { console.warn(`No expected outcome for slot ${slot}, skipping`); continue }

    const srcId: string = p.source_application_id
    const appId = detUuid('app', srcId)
    const applicantId = detUuid('applicant', srcId)
    const submissionId = detUuid('submission', srcId)
    const submittedAt: string = p.submitted_at
    const evalAt = new Date(new Date(submittedAt).getTime() + 90_000).toISOString()

    // Ground truth → catalogue rule outcomes
    const failed = outcome.rules_triggered.filter((r) => r.result === 'FAIL')
    const failedByRule = new Map<string, string>() // RULE-* -> detail
    for (const f of failed) {
      const mapped = CORPUS_RULE_MAP[f.rule_id]
      if (mapped) failedByRule.set(mapped, f.detail)
    }
    const isRejected = outcome.expected_decision === 'REJECTED'
    const isManual = outcome.expected_decision === 'MANUAL_REVIEW'
    const failOutcome = isRejected ? 'NOT_SATISFIED' : 'REVIEW_REQUIRED'

    const isNewEntrant = !!p.answers?.employment?.isNewEntrant
    const hasTb = !!p.answers?.healthDeclaration?.hasTbCertificate

    // --- applicants ---
    const fullName = p.passport_data.full_name
    await client.query(
      `INSERT INTO applicants (applicant_id, passport_number_hashed, full_name, date_of_birth, nationality, marital_status, email, phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NULL) ON CONFLICT (applicant_id) DO NOTHING`,
      [applicantId, sha(p.passport_data.number), fullName, p.applicant.date_of_birth,
       String(p.applicant.nationality_code).slice(0, 2).padEnd(3, 'X'), // alpha-2 → CHAR(3) (corpus carries alpha-2; pad deterministically)
       p.answers?.personalInfo?.maritalStatus ?? 'unknown', p.applicant.email],
    )

    // --- submission_payload ---
    await client.query(
      `INSERT INTO submission_payload (submission_id, source_application_id, source_reference, source_channel,
        visa_type, country_code, submitted_at, caseworker_id, applicant, passport_data, biometric_verification,
        answers_personalinfo, answers_employment, answers_fees, answers_englishlanguage, answers_travelhistory,
        answers_criminalrecord, answers_healthdeclaration, documents, eligibility_score, callback_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
       ON CONFLICT (submission_id) DO NOTHING`,
      [submissionId, srcId, p.source_reference, p.source_channel, p.visa_type, p.country_code, submittedAt,
       p.caseworker_id ?? null, p.applicant, p.passport_data, p.biometric_verification ?? null,
       p.answers.personalInfo, p.answers.employment, p.answers.fees, p.answers.englishLanguage,
       p.answers.travelHistory, p.answers.criminalRecord, p.answers.healthDeclaration,
       JSON.stringify(p.documents), p.eligibility_score ?? null, p.callback_url],
    )

    // --- documents + extractions ---
    const docs = (p.documents as any[]).map((d, i) => {
      const map = DOC_TYPE_MAP[d.type] ?? { type: d.type, critical: false, extract: false }
      return {
        id: detUuid('doc', srcId, d.document_id ?? String(i)),
        source_document_id: d.document_id ?? null,
        ...map,
        gcs_path: d.gcs_path ?? `gs://bkt-dev-dis-docs/${srcId}/${map.type}/${d.filename}`,
        mime_type: d.mime_type ?? 'application/pdf',
        size: d.size_bytes ?? Math.floor(detFloat(40_000, 900_000, srcId, 'size', String(i))),
      }
    })
    const extractable = docs.filter((d) => d.extract)

    // completeness — derived from corpus doc coverage; doc-processing writes
    // this verdict INTO applications.status (V5 §4)
    const completenessScore = Math.round(
      failedByRule.has('RULE-U05') ? detFloat(72, 84, srcId, 'comp') : detFloat(88, 100, srcId, 'comp'),
    )
    const appStatus = completenessScore > 91 ? 'COMPLETE' : 'INCOMPLETE_PENDING'

    // --- applications ---
    await client.query(
      `INSERT INTO applications (dis_application_id, submission_id, source_application_id, source_channel,
        caseworker_id, applicant_id, request_id, visa_type, status, callback_url, submission_ip,
        device_fingerprint, user_agent, auth_context, payload_doc_count, expected_doc_count,
        processed_doc_count, cross_doc_fraud, completeness_score, completeness_trace, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
       ON CONFLICT (dis_application_id) DO NOTHING`,
      [appId, submissionId, srcId, p.source_channel, p.caseworker_id ?? null, applicantId,
       detUuid('request', srcId), p.visa_type, appStatus, p.callback_url,
       p.source_channel === 'visakey' ? '203.0.113.10' : null,
       p.source_channel === 'visakey' ? detUuid('device', srcId) : null,
       'seed-replica/1.0', { source_channel: p.source_channel, caseworker_id: p.caseworker_id ?? null },
       docs.length, docs.length, extractable.length,
       { cross_doc_consistency: failedByRule.has('RULE-W14') ? 'FLAGGED' : 'CLEAR' },
       completenessScore,
       { required: extractable.map((d) => d.type), missing: [], score: completenessScore },
       submittedAt],
    )

    for (const d of docs) {
      await client.query(
        `INSERT INTO documents (dis_document_id, source_document_id, dis_application_id, document_type,
          requirement_tier, processing_tier, criticality, gcs_path, processing_status, quality_score,
          file_size_bytes, mime_type)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (dis_document_id) DO NOTHING`,
        [d.id, d.source_document_id, appId, d.type, d.critical ? 'MANDATORY' : 'OPTIONAL',
         d.extract ? (['PASSPORT', 'BANK_STATEMENT'].includes(d.type) ? 'TIER_1' : 'TIER_2') : null,
         d.critical ? 'CRITICAL' : 'SUPPORTING', d.gcs_path,
         d.extract ? 'EXTRACTED' : 'UPLOADED',
         round2(detFloat(0.7, 0.99, srcId, 'q', d.id)), d.size, d.mime_type],
      )

      if (!d.extract) continue
      const band = CONFIDENCE_BANDS[d.type] ?? CONFIDENCE_BANDS.default
      const confidence = round2(detFloat(band[0], band[1], srcId, 'conf', d.id))
      // fraud: elevated on the fraud-consistency docs when W14 failed
      const fraudHot = failedByRule.has('RULE-W14') && ['EMPLOYMENT_LETTER', 'PAYSLIP', 'BANK_STATEMENT'].includes(d.type)
      const fraudScore = round2(fraudHot ? detFloat(0.62, 0.78, srcId, 'fraud', d.id) : detFloat(0.02, 0.28, srcId, 'fraud', d.id))
      const fraudStatus = fraudScore <= 0.3 ? 'CLEAR' : fraudScore <= 0.6 ? 'LOW_RISK' : fraudScore <= 0.8 ? 'MEDIUM_RISK' : 'HIGH_RISK'
      const signals = Object.fromEntries(
        ['metadata_analysis', 'font_consistency', 'layout_anomaly', 'document_quality', 'cross_doc_consistency', 'content_plausibility']
          .map((s) => [s, { score: round2(Math.min(fraudScore + detFloat(-0.05, 0.05, srcId, s, d.id), 0.99)), flags: fraudHot && s === 'cross_doc_consistency' ? ['CROSS_DOC_MISMATCH'] : [] }]),
      )

      await client.query(
        `INSERT INTO document_extractions (extraction_id, dis_document_id, dis_application_id,
          extraction_method, extraction_model_version, processor_id, raw_extraction, normalised_fields,
          fraud_score, fraud_status, fraud_signals, confidence_score, processing_time_ms)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (extraction_id) DO NOTHING`,
        [detUuid('extr', srcId, d.id), d.id, appId, 'CUSTOM_EXTRACTOR',
         'pretrained-foundation-model-v1.3-2025-03-31',
         `projects/977813303563/locations/europe-west2/processors/prc-dev-dis-${d.type.toLowerCase().replace(/_/g, '-')}`,
         {}, normalisedFieldsFor(d.type, p), fraudScore, fraudStatus, signals, confidence,
         Math.floor(detFloat(900, 4200, srcId, 'ms', d.id))],
      )
    }

    // --- external_checks (7 per DDL CHECK; OPEN-8) ---
    const worldcheckFlag = isManual && [...failedByRule.keys()].some((r) => ['RULE-U03', 'RULE-W11'].includes(r))
    for (const checkType of CHECK_TYPES) {
      const flagged = checkType === 'WORLDCHECK' && worldcheckFlag
      const skipped = checkType === 'DEVICE_IP_RISK' && p.source_channel === 'govdirect'
      await client.query(
        `INSERT INTO external_checks (check_id, dis_application_id, dis_document_id, check_type, api_version,
          request_payload, response_payload, check_status, risk_level, confidence_score, flags,
          drools_consumed, opa_consumed, response_time_ms, created_at)
         VALUES ($1,$2,$3,$4,'v1',$5,$6,$7,$8,$9,$10,true,true,$11,$12) ON CONFLICT (check_id) DO NOTHING`,
        [detUuid('chk', srcId, checkType), appId,
         ['INTERPOL', 'PASSPORT_VERIFY', 'BORDER_CONTROL'].includes(checkType) ? docs.find((d) => d.type === 'PASSPORT')?.id ?? null : null,
         checkType, { applicant: fullName, source: 'seed-replica' },
         skipped ? { skipped: 'GOV_DIRECT_CHANNEL' } : flagged ? { matches_found: [{ type: 'PEP_RELATIVE', list: 'PEP_STATE_LEVEL' }] } : { clear: true },
         flagged ? 'FLAGGED' : 'CLEAR', flagged ? 'LOW' : 'NONE',
         round2(detFloat(0.7, 0.99, srcId, 'chkconf', checkType)),
         flagged ? { pep_relative_match: true } : {},
         Math.floor(detFloat(200, 1800, srcId, 'chkms', checkType)), evalAt],
      )
    }

    // --- drools_evaluations (20 per app) ---
    const ruleRows = RULES.map((r) => {
      const failDetail = failedByRule.get(r.rule_id)
      const na = (r.rule_id === 'RULE-W04' && !isNewEntrant && !failedByRule.has('RULE-W04'))
        || (r.rule_id === 'RULE-W10' && !hasTb && !failedByRule.has('RULE-W10'))
      const oc = failDetail ? failOutcome : na ? 'NOT_APPLICABLE' : 'SATISFIED'
      return {
        ...r,
        outcome: oc,
        reasoning: failDetail
          ?? (na
            ? (r.rule_id === 'RULE-W04' ? 'Not applicable — applicant is not a new entrant; general threshold applied.' : 'Not applicable — TB certificate not required for this applicant.')
            : `${r.rule_name}: requirement satisfied.`),
        evidence_refs: failDetail ? extractable.slice(0, 2).map((d) => `document_extractions:${detUuid('extr', srcId, d.id)}`) : [],
        remediation: failDetail ? 'Officer to review the underlying evidence and confirm the assessment.' : null,
      }
    })
    for (const r of ruleRows) {
      await client.query(
        `INSERT INTO drools_evaluations (rule_result_id, dis_application_id, rule_id, rule_name, rule_category,
          outcome, severity, reasoning, evidence_refs, remediation, rule_version_id, evaluated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (rule_result_id) DO NOTHING`,
        [detUuid('rule', srcId, r.rule_id), appId, r.rule_id, r.rule_name, r.rule_category,
         r.outcome, r.severity, r.reasoning, r.evidence_refs, r.remediation, ruleVersionId, evalAt],
      )
    }

    // --- opa_evaluations (12 per app) ---
    // Soft-flag mapping for MANUAL_REVIEW slots: sanctions/criminal failures →
    // OPA-S02; document/extraction failures → OPA-S03. Other manual-review
    // triggers stay drools-only (faithful to as-built: a MANDATORY
    // NOT_SATISFIED rule forces manual review without any OPA flag).
    const completenessFlag = isManual && failedByRule.has('RULE-U05')
    const opaRows = POLICIES.map((pol) => {
      const flagged = (pol.policy_id === 'OPA-S02' && worldcheckFlag)
        || (pol.policy_id === 'OPA-S03' && completenessFlag)
      return {
        ...pol,
        outcome: flagged ? 'FLAG' : pol.policy_type === 'HARD' ? 'ALLOW' : 'PASS', // VARCHAR(10): REVIEW_REQUIRED unstorable
        denial_reasons: flagged
          ? pol.policy_id === 'OPA-S02'
            ? ['World-Check returned a LOW-risk PEP-relative match.', 'Officer must assess relevance before deciding.']
            : [failedByRule.get('RULE-U05') ?? 'Document completeness or quality below threshold.', 'Officer must verify the affected documents.']
          : [],
      }
    })
    for (const pol of opaRows) {
      await client.query(
        `INSERT INTO opa_evaluations (opa_result_id, dis_application_id, policy_id, policy_name, policy_type,
          outcome, denial_reasons, input_context, policy_version_id, evaluated_at, processing_time_ms)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (opa_result_id) DO NOTHING`,
        [detUuid('opa', srcId, pol.policy_id), appId, pol.policy_id, pol.policy_name, pol.policy_type,
         pol.outcome, pol.denial_reasons, { application: srcId },
         pol.policy_type === 'HARD' ? opaVersions[0].id : opaVersions[1].id, evalAt,
         Math.floor(detFloat(20, 220, srcId, 'opams', pol.policy_id))],
      )
    }

    // --- recommendation + callback ---
    const recOutcome =
      outcome.expected_decision === 'APPROVED' ? 'RECOMMEND_APPROVE'
        : outcome.expected_decision === 'REJECTED' ? 'RECOMMEND_REJECT'
          : 'MANUAL_REVIEW'
    const failedIds = [...failedByRule.keys()]
    const hardFails = isRejected ? failedIds : []
    const softFlags = isManual ? [...failedIds, ...(worldcheckFlag ? ['OPA-S02', 'EXT_WORLDCHECK'] : [])] : []
    const reason = outcome.failure_reasons[0]
      ?? 'All eligibility and compliance criteria met.'

    // component scores: flat map + rich map
    const flatScores: Record<string, number | null> = {}
    const richScores: Record<string, unknown | null> = {}
    for (const [component, ruleIds] of Object.entries(COMPONENT_RULES)) {
      const compRules = ruleRows.filter((r) => ruleIds.includes(r.rule_id))
      const allNa = compRules.length > 0 && compRules.every((r) => r.outcome === 'NOT_APPLICABLE')
      if (allNa) { flatScores[component] = null; richScores[component] = null; continue }
      const hasFail = compRules.some((r) => r.outcome === 'NOT_SATISFIED')
      const hasReview = compRules.some((r) => r.outcome === 'REVIEW_REQUIRED')
      const score = Math.round(hasFail ? detFloat(20, 30, srcId, component) : hasReview ? detFloat(60, 84, srcId, component) : detFloat(85, 100, srcId, component))
      const [good, review, bad] = COMPONENT_STATUS[component]
      const status = hasFail ? bad : hasReview ? review : good
      flatScores[component] = score
      richScores[component] = {
        component, score, status,
        status_description: hasFail || hasReview ? compRules.find((r) => r.outcome !== 'SATISFIED' && r.outcome !== 'NOT_APPLICABLE')?.reasoning ?? '' : 'All checks satisfied.',
        confidence: component === 'fraud_risk' ? round2(1 - detFloat(0.02, 0.28, srcId, 'fraudc')) : round2(detFloat(0.8, 0.99, srcId, 'c', component)),
        ...(component === 'fraud_risk' ? { raw_fraud_score: round2(detFloat(0.02, 0.28, srcId, 'fraudc')) } : {}),
        rule_results: compRules.filter((r) => r.outcome !== 'NOT_APPLICABLE').map((r) => ({
          rule_id: r.rule_id, rule_name: r.rule_name,
          result: r.outcome === 'SATISFIED' ? 'PASS' : 'FAIL',
          severity: r.severity, details: r.reasoning,
          ...(component === 'fraud_risk' ? {} : { remediation: r.remediation ?? undefined }),
        })),
        opa_results: [], extraction_sources: [], external_check_types: [],
      }
    }

    const naCount = ruleRows.filter((r) => r.outcome === 'NOT_APPLICABLE').length
    const failCount = ruleRows.filter((r) => r.outcome === 'NOT_SATISFIED').length
    const passCount = ruleRows.filter((r) => r.outcome === 'SATISFIED').length
    const softFailCount = opaRows.filter((o) => !['ALLOW', 'PASS'].includes(o.outcome)).length
    const checksFailed = worldcheckFlag ? 1 : 0

    const rulesSummary = {
      rules: { drools_rules_evaluated: 20, drools_rules_passed: passCount, drools_rules_failed: failCount + ruleRows.filter((r) => r.outcome === 'REVIEW_REQUIRED').length, drools_rules_not_applicable: naCount },
      opa_policies: {
        opa_total_evaluated: 12, opa_total_passed: 12 - softFailCount, opa_total_failed: softFailCount,
        opa_hard_evaluated: 6, opa_hard_passed: 6, opa_hard_failed: 0,
        opa_soft_evaluated: 6, opa_soft_passed: 6 - softFailCount, opa_soft_failed: softFailCount,
      },
      external_checks: { external_checks_evaluated: 7, external_checks_passed: 7 - checksFailed, external_checks_failed: checksFailed, external_checks_error: 0 },
    }

    const callbackPayload = {
      dis_application_id: appId,
      recommendation: recOutcome,
      recommendation_reason: reason,
      evaluation_breakdown: {
        drools_evaluation: `${passCount} of 20 rules satisfied; ${naCount} not applicable${failCount ? `; ${failCount} not satisfied` : ''}.`,
        external_checks_evaluation: checksFailed ? 'WORLDCHECK flagged for officer review.' : 'All external checks clear.',
        opa_evaluation: softFailCount ? `${softFailCount} soft polic${softFailCount === 1 ? 'y' : 'ies'} require review.` : 'All policies allow.',
      },
      component_scores: richScores,
      drools_evaluations: ruleRows.map((r) => ({ rule_id: r.rule_id, rule_name: r.rule_name, rule_category: r.rule_category, outcome: r.outcome, severity: r.severity, reasoning: r.reasoning, evidence_refs: r.evidence_refs, remediation: r.remediation, created_at: evalAt })),
      opa_evaluations: opaRows.map((o) => ({ policy_id: o.policy_id, policy_name: o.policy_name, policy_type: o.policy_type, outcome: o.outcome, created_at: evalAt })),
      external_checks: CHECK_TYPES.map((t) => ({ check_type: t, check_status: t === 'WORLDCHECK' && worldcheckFlag ? 'FLAGGED' : 'CLEAR', created_at: evalAt })),
      rules_summary: rulesSummary,
      completeness_score: completenessScore,
      completeness_status: appStatus === 'COMPLETE' ? 'COMPLETE' : 'INCOMPLETE_PENDING',
      generated_at: evalAt,
      drools_version: droolsVersions.map((v) => ({ rule_file: v.rule_file, rule_version_id: v.id, created_at: '2026-06-01T08:00:00Z' })),
      opa_version: opaVersions.map((v) => ({ policy_file: v.policy_file, policy_version_id: v.id, created_at: '2026-06-01T08:00:00Z' })),
      note: 'This is a system recommendation to assist caseworker decision-making. Final determination rests with the authorised decision-maker.',
    }

    const recommendationId = detUuid('rec', srcId)
    await client.query(
      `INSERT INTO recommendations (recommendation_id, dis_application_id, outcome, caseworker_summary,
        confidence, component_scores, hard_fail_rules, soft_flag_rules, recommendation_at,
        total_processing_time_ms, drools_version, opa_version, callback_sent_at, callback_status, submission_payload)
       VALUES ($1,$2,$3,$4,NULL,$5,$6,$7,$8,$9,$10,$11,$12,'SUCCESS_200',$13)
       ON CONFLICT (dis_application_id) DO NOTHING`,
      [recommendationId, appId, recOutcome, reason, flatScores, hardFails, softFlags, evalAt,
       Math.floor(detFloat(45_000, 180_000, srcId, 'total_ms')),
       { version: callbackPayload.drools_version }, { version: callbackPayload.opa_version },
       evalAt, callbackPayload],
    )

    await client.query(
      `INSERT INTO callback_events (callback_event_id, dis_application_id, recommendation_id, callback_url,
        attempt_number, status, http_status_code, payload_hash, initiated_at, completed_at, response_time_ms, source_channel)
       VALUES ($1,$2,$3,$4,1,'DELIVERED',200,$5,$6,$7,$8,$9) ON CONFLICT (callback_event_id) DO NOTHING`,
      [detUuid('cbev', srcId), appId, recommendationId, p.callback_url,
       sha(JSON.stringify(callbackPayload)).toString('hex').slice(0, 64), evalAt, evalAt,
       Math.floor(detFloat(120, 900, srcId, 'cbms')), p.source_channel],
    )

    seeded++
    if (seeded % 20 === 0) console.log(`  …${seeded} applications seeded`)
  }

  console.log(`Done: ${seeded} applications seeded.`)
  await client.end()
}

// ---------------------------------------------------------------------------
// Per-doc-type normalised fields, built from real payload data
// ---------------------------------------------------------------------------

function normalisedFieldsFor(docType: string, p: any): Record<string, unknown> {
  const emp = p.answers?.employment ?? {}
  const eng = p.answers?.englishLanguage ?? {}
  const pass = p.passport_data ?? {}
  switch (docType) {
    case 'PASSPORT':
      return {
        document_number: pass.number, full_name: pass.full_name,
        date_of_birth: pass.date_of_birth, nationality_code: pass.nationality,
        issuing_country_code: pass.issuing_country, sex: pass.gender,
        issue_date: pass.issue_date, expiry_date: pass.expiry_date,
        mrz_valid: true, mrz_checksum_passed: true,
      }
    case 'EMPLOYMENT_LETTER':
      return {
        employer_name: emp.employerName, job_title: emp.jobTitle,
        annual_salary_gbp: emp.annualIncome, start_date: emp.startDate,
        hours_per_week: emp.hoursPerWeek, employment_type: 'FULL_TIME',
        salary_matches_cos: true, employer_matches_cos: true,
      }
    case 'BANK_STATEMENT': {
      const base = (emp.annualIncome ?? 40000) / 12
      return {
        account_holder_name: pass.full_name, currency: 'GBP',
        lowest_balance_gbp: Math.round(base * 2.4), closing_balance_gbp: Math.round(base * 3.1),
        meets_maintenance_threshold: true, salary_credit_detected: true,
      }
    }
    case 'IELTS_CERTIFICATE':
      return {
        candidate_name: pass.full_name, test_type: eng.testType,
        overall_score: eng.overallScore, listening_score: eng.listeningScore,
        reading_score: eng.readingScore, writing_score: eng.writingScore,
        speaking_score: eng.speakingScore, test_date: eng.testDate,
        trf_number: eng.testReferenceNumber,
      }
    case 'DEGREE_CERTIFICATE':
      return { candidate_name: pass.full_name, qualification_title: 'BACHELOR DEGREE', rqf_level_equivalent: 6 }
    case 'PAYSLIP':
      return { employee_name: pass.full_name, employer_name: emp.employerName, gross_pay: Math.round((emp.annualIncome ?? 40000) / 12), pay_frequency: 'MONTHLY' }
    case 'TB_CERTIFICATE': {
      const h = p.answers?.healthDeclaration ?? {}
      return { patient_name: pass.full_name, outcome: 'CLEAR', clinic_name: h.tbCertificateClinicName ?? null, issuing_country: h.tbCertificateClinicCountry ?? null }
    }
    case 'UTILITY_BILL':
      return { account_holder_name: pass.full_name, utility_type: 'ELECTRICITY' }
    default:
      return {}
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
