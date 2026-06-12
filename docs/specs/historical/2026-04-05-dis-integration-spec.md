# AMS + DIS Full Platform Integration Spec

> **⚠️ SUPERSEDED — historical record only (archived 12 June 2026).** Fully
> superseded by V2 → V3 → V4 (UX) and V5 (data contracts). Do not build
> against this document.

**Date:** 5 April 2026
**Author:** Chris Claudius + Claude Code
**Status:** Draft — awaiting review
**Scope:** Align the AMS officer dashboard with the Deloitte DIS build, VisaKey 2.0 backend, and VisaKey 2.0 Expo app

---

## Table of Contents

1. [Context and Vision](#1-context-and-vision)
2. [Platform Architecture](#2-platform-architecture)
3. [Codebase Inventory](#3-codebase-inventory)
4. [End-to-End Data Flow](#4-end-to-end-data-flow)
5. [Cross-System Gap Analysis](#5-cross-system-gap-analysis)
6. [What's Already Aligned](#6-whats-already-aligned)
7. [Integration Plan](#7-integration-plan)
8. [Type Definitions Required](#8-type-definitions-required)
9. [AMS UI Components Required](#9-ams-ui-components-required)
10. [Open Questions for Deloitte](#10-open-questions-for-deloitte)

---

## 1. Context and Vision

**AMS** (Application Management System) is the enlarged platform scaffold for Phases 2 and 3 of OpenVisa. It will grow to include RBAC, rule management, AI model configuration, and a decision matrix. For Phase 1, it serves as the officer dashboard where Home Office caseworkers review visa applications processed by the DIS.

**DIS** (Document Ingestion System) is the brain of the platform. Built by Deloitte, it handles:
- Document extraction (Gemini Vision)
- Rules engine (Drools — 25+ Skilled Worker rules)
- OPA guardrails
- Decision recommendations (APPROVED / REJECTED / MANUAL_REVIEW)
- Audit logging to Postgres and BigQuery

**VisaKey 2.0** is the applicant-facing mobile app (Expo/React Native) and its backend (Hono/Bun). It collects visa applications and submits them to the DIS. It receives decision callbacks from the DIS and notifies the applicant.

This spec defines how to integrate all three systems so the AMS officer dashboard correctly displays DIS processing results and enables officers to make informed decisions.

---

## 2. Platform Architecture

```
APPLICANT SIDE                         DELOITTE DIS                          OFFICER SIDE
─────────────────                      ────────────                          ────────────

  VisaKey 2.0                            DIS Brain                           AMS Dashboard
  Expo App                                                                   (Next.js 16)
  (React Native)        submit          Gemini Vision        officer queue
                    ──────────────>     Drools Rules     ───────────────>     Live Queue
  IDV (passport)                        Postgres                             Reviewer UI
  Form sections                         BigQuery             officer         AI Scan Result
  Doc upload        <──────────────     OPA Guardrails   <───────────────    Glass Box Trail
  Status updates     decision callback                                       Collaboration

        |                                      |                                     |
        v                                      v                                     v

  VisaKey 2.0                           Reference Data                       AMS Prisma DB
  Backend                               (our lookups)                        (auth only)
  (Hono/Bun)
                                        sponsor_register.csv                 Organization
  Drizzle/Postgres                      cos_register_mock.json               User (officer)
  GCS documents                         eligible_soc_codes.json              SystemConfig
  Clerk auth                            soc_going_rates.json
  IDV (Regula)                          immigration_salary_list.json         Apps: JSON files
                                        approved_tb_clinics.json             (mock provider)
                                        uk_universities.json
                                        salary_thresholds.json
```

### System Boundaries

| System | Repo | Tech Stack | Database |
|--------|------|-----------|----------|
| AMS Dashboard | `ams-official` | Next.js 16, React 19, TypeScript, Prisma 5 | Neon Postgres (auth only) |
| VisaKey Backend | `visakey2.0-backend` | Hono 4, Bun, Drizzle ORM | Neon Postgres (apps + docs + users) |
| VisaKey App | `visakey2.0-expoapp` | Expo 55, React Native 0.83, Zustand, React Query | None (in-memory + Clerk secure store) |
| DIS | Deloitte-managed | Gemini Vision, Drools, OPA, Spring Boot | Postgres + BigQuery |
| Synthetic Data | `openvisa-synthetic-data` | Python 3.13 | None (file generation only) |

---

## 3. Codebase Inventory

### AMS Dashboard (`ams-official`)

**Purpose:** Officer-facing dashboard for reviewing and deciding on visa applications.

**Key architecture decisions:**
- Prisma schema is intentionally minimal — only org/user/config for auth. No application models in Prisma.
- Application data comes from a pluggable `ApplicationDataProvider` interface. Currently a `JsonDataProvider` reads synthetic JSON files from disk. A future `DISApiProvider` will replace it.
- `DATA_PROVIDER` env var controls which provider is active (`"json"` for dev, future `"dis"` for production).
- A `transformer.ts` maps synthetic data format into dashboard types, including generating mock AI scan results.
- API contract files in `src/api-contracts/` define the canonical TypeScript shapes for all data exchange.

**Current pages:**

| Route | Purpose | Data Source |
|-------|---------|-------------|
| `/dashboard/livequeue` | Application queue with filters, assignment | `GET /api/applications` |
| `/dashboard/reviewer/[id]` | Full application review + decision | `GET /api/applications/:id` |
| `/dashboard/reviewer/queue` | Officer's personal queue | Mock data / API |
| `/dashboard/teams` | Team overview and collaboration | Mock data |
| `/dashboard/live-intelligence` | Analytics / metrics | Mock data |
| `/dashboard/knowledgebase` | Policy RAG chat (Gemini) | `POST /api/knowledgebase/chat` |
| `/visa-builder/*` | Visa type configuration | Mock data |
| `/super-admin/create` | Organization + admin setup | Prisma (only real DB write) |

**Implemented API routes:** `/api/auth/*`, `/api/applications`, `/api/applications/:id`, `/api/officers`, `/api/assignments`, `/api/knowledgebase/chat`

**Contract-only (not implemented):** `/api/reviews/*`, `/api/metrics/*`, `/api/teams/*`

### VisaKey 2.0 Backend (`visakey2.0-backend`)

**Purpose:** Applicant-facing API. Collects visa applications, stores documents in GCS, submits to DIS, receives decision callbacks.

**Database (Drizzle/Postgres) — 10 tables:**

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `countries` | ISO 3166 country list | `code` (alpha-2 PK), `name` |
| `country_configs` | Eligibility scoring per country | `scoring` (JSONB — tiers, weights, bonuses) |
| `users` | Applicant profiles (synced from Clerk) | `id` (Clerk ID), `email`, `onboarding` (JSONB), `profile` (JSONB) |
| `eligibility_tokens` | Scoring results + visa selection | `input`, `score`, `eligible_visas` (all JSONB), `expires_at` |
| `visa_types` | 12 UK visa types | `slug`, `label`, `fee`, `ihs`, `score_threshold` (all JSONB) |
| `form_definitions` | JSON Schema form definitions | `data_schema` (AJV), `ui_schema` (sections + fields) |
| `visa_type_form_definitions` | M:N junction | FK to both |
| `applications` | Visa applications | `status`, `reference` (VK-XXXXXXXX), `answers` (JSONB), `identity_verification` (JSONB) |
| `documents` | Uploaded docs metadata | `type`, `gcs_path`, `status`, `metadata` (JSONB) |
| `payments` | Payment records (stub) | `amount`, `status`, `provider_id` |
| `notifications` | Push notifications (stub) | `title`, `body`, `read` |

**Application status lifecycle:**
`incomplete` -> `needs_review` -> `in_review` -> `approved` / `rejected` / `withdrawn`

**DIS integration status:**
- `buildDeloitteDocumentList()` exists but missing `signed_url`
- `BiometricVerification` interface matches DIS contract
- No submission HTTP POST implemented
- No webhook handler for DIS callbacks
- `DIS_API_BASE_URL` and `DIS_API_KEY` env vars defined but commented out

### VisaKey 2.0 Expo App (`visakey2.0-expoapp`)

**Purpose:** Applicant-facing mobile app. Collects identity, form data, and documents.

**Application flow:**
1. Eligibility check (passport country + residence + existing visas) -> score
2. Auth (Clerk — email/password or SSO)
3. IDV (passport camera scan + liveness video)
4. Visa selection from ranked list
5. Document upload (camera, file picker, or photo library)
6. Form sections (personalInfo, employment, travelHistory, criminalRecord, healthDeclaration)
7. Submit

**State management:** Zustand (3 stores: auth, eligibility, readiness) + React Query. Not persisted across app restarts (known gap).

**Key gaps:**
- Only Skilled Worker form definition exists
- Regula SDK not yet integrated (mock IDV)
- No push notifications
- Zustand stores lost on app restart

---

## 4. End-to-End Data Flow

### Step-by-step with build status

| # | Step | From | To | Status | Notes |
|---|------|------|----|--------|-------|
| 1 | Applicant fills form | Expo App | VK Backend | **Built** | 5 sections, AJV validation |
| 2 | Documents uploaded to GCS | Expo App | GCS via VK Backend | **Built** | Max 15MB, path: `{userId}/{appId}/{type}/{ts}-{filename}` |
| 3 | Passport IDV (OCR + liveness) | Expo App | VK Backend | **Partially built** | Google Vision OCR works, Regula not integrated |
| 4 | Application submitted | Expo App | VK Backend | **Built** | Sets status to `needs_review`, records `submitted_at` |
| 5 | Payload forwarded to DIS | VK Backend | DIS API | **Not built** | `POST {DIS_API_BASE_URL}/api/v1/applications` — assembler + HTTP call missing |
| 6 | DIS extracts documents | DIS | DIS internal | **Deloitte building** | Gemini Vision extraction pipeline |
| 7 | DIS runs Drools rules | DIS | DIS internal | **Deloitte building** | 25+ Skilled Worker rules against reference data |
| 8 | DIS returns decision | DIS | VK Backend | **Not built** | Webhook `POST /api/webhooks/dis-decision` missing |
| 9 | Officer sees application in queue | DIS | AMS Dashboard | **Mocked** | JSON file provider reads synthetic data |
| 10 | Officer reviews AI analysis + rules | AMS Dashboard | Officer | **Partially built** | Generic `AIScanResult`, no Drools rule display |
| 11 | Officer approves/rejects/escalates | AMS Dashboard | AMS API | **Contract only** | Dialogs exist but log to console |
| 12 | Decision sent to DIS | AMS Dashboard | DIS | **Not built** | No write path |
| 13 | Decision forwarded to VK Backend | DIS | VK Backend | **Not built** | Part of webhook callback |
| 14 | Applicant notified | VK Backend | Expo App | **Not built** | No push notification integration |

### Payload Shape: VK Backend -> DIS (Contract v2)

```json
{
  "source_application_id": "uuid (from applications.id)",
  "source_reference": "VK-XXXXXXXX",
  "source_channel": "visakey",
  "visa_type": "skilled-worker",
  "country_code": "GB",
  "submitted_at": "2026-04-01T10:30:00Z",

  "applicant": {
    "user_id": "user_clerk_id",
    "email": "applicant@email.com",
    "first_name": "Arjun",
    "last_name": "Reddy",
    "date_of_birth": "1990-05-15",
    "nationality_code": "IN",
    "gender": "M"
  },

  "passport_data": {
    "number": "T1234567",
    "issuing_country": "IN",
    "nationality": "IN",
    "full_name": "REDDY ARJUN",
    "date_of_birth": "1990-05-15",
    "gender": "M",
    "issue_date": "2020-03-15",
    "expiry_date": "2030-03-14",
    "mrz_line1": "P<INDREDDY<<ARJUN<<<<<<<<<<<<<<<<<<<<<<<<<<<",
    "mrz_line2": "T12345674IND9005150M3003147<<<<<<<<<<<<<<02"
  },

  "biometric_verification": {
    "mrz_check_passed": true,
    "face_match_score": 0.92,
    "liveness_passed": true,
    "provider": "regula",
    "session_id": "sess_abc123",
    "verified_at": "2026-03-28T14:00:00Z"
  },

  "answers": {
    "personalInfo": { "firstName": "Arjun", "lastName": "Reddy", "dateOfBirth": "1990-05-15", "nationality": "IN", "maritalStatus": "single" },
    "employment": { "status": "employed", "employerName": "Meridian Technologies Ltd", "jobTitle": "Software Engineer", "annualIncome": 55000, "cosReferenceNumber": "COS-2026-7247410", "socCode": "2134", "startDate": "2026-06-06", "salaryFrequency": "ANNUAL", "hoursPerWeek": 37.5, "isNewEntrant": false },
    "travelHistory": { "previousUkVisas": [], "previousUkRefusals": false, "previousDeportations": false, "countriesVisitedLast5Years": ["US", "AE"] },
    "criminalRecord": { "hasConvictions": false, "hasPendingCharges": false, "hasCivilJudgments": false },
    "healthDeclaration": { "hasTbCertificate": true, "hasHealthConditions": false, "requiresAccessibility": false, "tbCertificateClinicName": "IOM Migration Health Assessment Centre, New Delhi", "tbCertificateClinicCountry": "IN" }
  },

  "documents": [
    { "document_id": "uuid", "type": "PASSPORT", "filename": "passport.jpg", "gcs_path": "user_id/app_id/PASSPORT/ts-passport.jpg", "signed_url": "https://storage...", "mime_type": "image/jpeg", "size_bytes": 2048000, "uploaded_at": "2026-03-28T14:00:00Z" }
  ],

  "eligibility_score": {
    "total": 75,
    "breakdown": { "passport": 35, "residence": 25, "existingVisas": 5, "bonus": 10 },
    "passport_country": "IN",
    "residence_country": "IN"
  },

  "callback_url": "https://visakey-api-977813303563.europe-west2.run.app/api/webhooks/dis-decision"
}
```

### Decision Callback: DIS -> VK Backend (Planned)

```json
{
  "dis_application_id": "uuid (DIS internal)",
  "source_application_id": "uuid (matches VK applications.id)",
  "source_reference": "VK-XXXXXXXX",
  "decision": {
    "outcome": "APPROVED | REJECTED | MANUAL_REVIEW",
    "confidence": 0.92,
    "component_scores": {
      "identity": { "score": 95, "issues": [] },
      "financial": { "score": 82, "issues": ["closing_balance_marginal"] },
      "employment": { "score": 100, "issues": [] }
    },
    "rules_engine_result": {
      "rules_triggered": [
        { "rule_id": "SALARY_FLOOR", "result": "PASS", "detail": "55000 >= 38700" },
        { "rule_id": "TB_CERT_VALIDITY", "result": "PASS", "detail": "Certificate within 6 months" }
      ],
      "glass_box_complete": true
    },
    "llm_summary": "Applicant meets all Skilled Worker visa requirements...",
    "external_checks": {
      "sponsor_licence": { "status": "ACTIVE", "rating": "A-rated" },
      "cos_validity": { "status": "VALID", "expires": "2026-06-01" }
    }
  },
  "audit_log": { "processed_at": "2026-04-01T12:00:00Z", "processing_time_ms": 4500 }
}
```

---

## 5. Cross-System Gap Analysis

### 5.1 Decision Model — Three Different Vocabularies

| Concept | VK Backend (`applications.status`) | DIS Expected Outcomes | AMS Dashboard Types |
|---------|-----------------------------------|----------------------|---------------------|
| Approved | `'approved'` | `'APPROVED'` | `'approved'` (DecisionType) / `'Approved'` (ApplicationStatus) |
| Rejected | `'rejected'` | `'REJECTED'` | `'rejected'` / `'Rejected'` |
| Needs human review | `'needs_review'` / `'in_review'` | `'MANUAL_REVIEW'` | `'escalated'` / `'Escalated'` |
| Not yet submitted | `'incomplete'` | — | `'In Progress'` |
| Awaiting assignment | — | — | `'Pending Assignment'` |
| Awaiting info | — | — | `'Awaiting Info'` |
| Withdrawn | `'withdrawn'` | — | — |

**Resolution:** Define a canonical `DecisionOutcome` enum in a shared types package. Map at system boundaries.

### 5.2 No Glass-Box Decision Trail in AMS

DIS produces per-rule audit output (19+ Drools rules, each with PASS/FAIL + detail string). The AMS `AIScanResult` has only generic `ScanIssue[]` with `type: 'missing' | 'invalid' | 'inconsistent' | 'suspicious' | 'incomplete'`. No rule IDs, no PASS/FAIL per rule, no glass-box trail.

**Impact:** Officers cannot see which Drools rules fired and why. This is the single biggest integration gap.

**Resolution:** Add `DroolsRuleResult` interface and a glass-box trail UI component. See [Section 8](#8-type-definitions-required).

### 5.3 Nationality Code Inconsistency

| System | Format | Example |
|--------|--------|---------|
| Expo app (eligibility input) | Alpha-2 | `"IN"` |
| VK Backend (Drizzle/Postgres) | Alpha-2 | `"IN"` |
| DIS payloads (`applicant.nationality_code`) | Alpha-2 | `"IN"` |
| COS register (`applicant_nationality`) | Alpha-3 | `"IND"` |
| AMS (`LiveApplication.country`) | Alpha-2 | `"IN"` |

**Resolution:** Standardise on alpha-2 for application data, alpha-3 for reference data lookups. Add an `alpha2ToAlpha3` mapping utility. The COS register already has the `ALPHA2_TO_ALPHA3` map in its generator script.

### 5.4 Applicant Data — AMS is Severely Undertyped

AMS `ApplicantDetails` has 5 optional fields:
```typescript
{ email?, phoneNumber?, name?, givenNames?, surname? }
```

DIS payload has 30+ structured applicant fields across `applicant`, `passport_data`, `biometric_verification`, and 5 `answers` sections.

**Resolution:** Extend `ApplicantDetails` and create typed section interfaces. See [Section 8](#8-type-definitions-required).

### 5.5 Section Model Mismatch

| AMS Sections (transformer) | DIS Payload Sections (`answers.*`) |
|---------------------------|-----------------------------------|
| `passport` | `passport_data` (top-level, not in answers) |
| `kyc` | — |
| `photo` | — |
| `study` / `cas` | — (not in Skilled Worker) |
| `englishProficiency` | `answers.englishLanguage` |
| `sponsorshipAndRole` | `answers.employment` (includes COS, SOC, salary) |
| `family` | — (not in Skilled Worker) |
| `business` | — (not in Skilled Worker) |
| `financial` | — (no direct section; from bank statement extraction) |
| `travel` / `travelInsurance` | `answers.travelHistory` |
| — (missing) | `answers.criminalRecord` |
| — (missing) | `answers.healthDeclaration` |

**Resolution:** Add `criminalRecord` and `healthDeclaration` sections to AMS. Map `sponsorshipAndRole` to DIS `employment` data.

### 5.6 Document Extraction Results — No Typed Home in AMS

DIS Gemini Vision produces typed extraction results per document type:

| Document Type | Key Extracted Fields |
|--------------|---------------------|
| PAYSLIP | `employer_name`, `employee_name`, `gross_pay`, `net_pay`, `tax_code`, `ni_number`, `pay_period_start/end` |
| BANK_STATEMENT | `bank_name`, `account_holder_name`, `account_number`, `sort_code`, `opening_balance`, `closing_balance`, `salary_credits[]` |
| EMPLOYMENT_LETTER | `employer_name`, `employee_name`, `job_title`, `salary_amount`, `salary_frequency`, `hours_per_week`, `start_date` |
| IELTS_CERTIFICATE | `candidate_name`, `overall_score`, `listening/reading/writing/speaking_score`, `trf_number`, `cefr_level`, `test_date` |
| DEGREE_CERTIFICATE | `institution_name`, `candidate_name`, `qualification_title`, `qualification_level`, `subject`, `award_date` |

AMS has no TypeScript interfaces for these. They would land in `Record<string, unknown>`.

**Resolution:** Create typed extraction result interfaces per document type. See [Section 8](#8-type-definitions-required).

### 5.7 Cross-Document Consistency — Not Modelled in AMS

DIS Drools performs 5 cross-document checks:

| Rule | What's Compared | Documents |
|------|----------------|-----------|
| RULE-W02 (NAME_CONSISTENCY) | Name matches across documents | Passport, employment letter, payslip, bank statement |
| RULE-W05 (SALARY_CONSISTENCY) | COS salary = employment letter salary = payslip gross * 12 | COS, employment letter, payslip |
| RULE-W09 (EMPLOYER_CONSISTENCY) | Employer name matches BACS credit description | Employment letter, payslip, bank statement |
| RULE-W06/W07 (MAINTENANCE_FUNDS) | Closing balance >= 1270 for 28 consecutive days | Bank statement, payslip |
| RULE-W11 (ENGLISH_VALIDITY) | Test date within 2 years of submission | IELTS certificate |

AMS has no UI or data model to surface these comparison results.

**Resolution:** Add a cross-document consistency view component. See [Section 9](#9-ams-ui-components-required).

### 5.8 Internal AMS Type Inconsistency

`ScanRecommendation.actionType` has two conflicting definitions:
- `src/types/aiScan.ts`: `'update' | 'upload' | 'verify' | 'contact_support' | 'resubmit'`
- `src/api-contracts/applications.ts`: `'verify' | 'request_info' | 'escalate' | 'reject'`

**Resolution:** Reconcile to a single definition in `api-contracts/`.

---

## 6. What's Already Aligned

These things are working correctly and don't need changes:

- **Pluggable data provider pattern** — AMS `DATA_PROVIDER` env var and `ApplicationDataProvider` interface is the correct integration point
- **Application ID format** — All systems use `VK-XXXXXXXX` / `HO-SW-NNN` style references
- **Document type constants** — `PASSPORT`, `EMPLOYMENT_LETTER`, `BANK_STATEMENT`, etc. match across all systems
- **Officer decision model** — Approve/Reject/Escalate with rationale and reviewer ID is already in AMS api-contracts
- **RESTful API structure** — Paginated listing, detail view, filter patterns are consistent
- **GCS document storage** — VK Backend and DIS both use the same bucket and path convention
- **Clerk auth** — VK Backend handles applicant auth, AMS handles officer auth, no conflict
- **Synthetic data alignment** — All 100 JSON payloads match the DIS contract v2, COS register is cross-referenced, reference data files match Drools schemas

---

## 7. Integration Plan

### Phase 1: Type Alignment (AMS only, no DIS dependency)

**Goal:** Make the AMS TypeScript types match the DIS data model so the UI can display DIS output correctly when the real API is connected.

**Estimated effort:** 2-3 days

| # | Task | File(s) | Description |
|---|------|---------|-------------|
| 1.1 | Add DIS decision types | `src/api-contracts/dis.ts` (new) | `DISDecision`, `DroolsRuleResult`, `ComponentScore`, `GlassBoxTrail`, `ExternalCheck`, `LLMSummary` interfaces |
| 1.2 | Extend `ApplicationDetail` | `src/api-contracts/applications.ts` | Add `source_channel`, `dis_application_id`, `drools_results`, `llm_summary`, `component_scores`, `external_checks` |
| 1.3 | Type section data | `src/types/section.ts` | Replace `Record<string, unknown>` with typed interfaces for `EmploymentSection`, `CriminalRecordSection`, `HealthDeclarationSection` matching DIS payload |
| 1.4 | Type document extractions | `src/types/extraction.ts` (new) | Typed extraction results per document type (payslip, bank statement, employment letter, IELTS, degree) |
| 1.5 | Standardise decision enum | `src/api-contracts/common.ts` | Single `DecisionOutcome` type with mapping functions for DIS/VK casing |
| 1.6 | Reconcile `actionType` | `src/types/aiScan.ts`, `src/api-contracts/applications.ts` | Merge to single definition |
| 1.7 | Add nationality mapping | `src/lib/nationality.ts` (new) | `alpha2ToAlpha3` / `alpha3ToAlpha2` utility |

### Phase 2: AMS UI for DIS Output (AMS, using synthetic data for dev)

**Goal:** Build the UI components that display DIS processing results to officers.

**Estimated effort:** 5-7 days

| # | Task | Description |
|---|------|-------------|
| 2.1 | Glass-box trail component | Shows every Drools rule with PASS/FAIL badge, severity colour, expandable detail. Replaces or augments current `ScanIssue` cards |
| 2.2 | Cross-document consistency view | Side-by-side comparison table showing name/salary/employer matches across passport, employment letter, payslip, bank statement |
| 2.3 | Document extraction viewer | Per-document panel showing Gemini Vision extracted fields with confidence indicators |
| 2.4 | LLM summary panel | Displays the Gemini-generated case summary with key findings highlighted |
| 2.5 | Component scores dashboard | Visual breakdown of identity/financial/employment scores with drill-down to contributing rules |
| 2.6 | External checks panel | Sponsor licence status, COS validity, TB clinic approval, university accreditation — each with lookup result |
| 2.7 | Update transformer | Modify `src/data/synthetic/transformer.ts` to generate realistic mock DIS output (Drools results, extractions) from synthetic data for dev/demo |

### Phase 3: Live DIS Integration (VK Backend + AMS)

**Goal:** Connect the real systems end-to-end.

**Estimated effort:** 5-7 days (depends on Deloitte API readiness)

| # | Task | Repo | Description |
|---|------|------|-------------|
| 3.1 | DIS submission service | `visakey2.0-backend` | Build the full payload assembler + HTTP POST to `DIS_API_BASE_URL/api/v1/applications` with signed URLs for all documents |
| 3.2 | Webhook handler | `visakey2.0-backend` | Implement `POST /api/webhooks/dis-decision` with HMAC verification, status update, timeline event append |
| 3.3 | Push notifications | `visakey2.0-backend` + `visakey2.0-expoapp` | Send push on decision received; add `expo-notifications` to app |
| 3.4 | DIS API data provider | `ams-official` | Implement `ApplicationDataProvider` backed by DIS API calls (replacing JSON file provider) |
| 3.5 | Officer decision write path | `ams-official` | Implement `/api/reviews/:id/approve`, `/reject`, `/escalate` routes that POST back to DIS |
| 3.6 | Two-ID tracking | `ams-official` | Store and display both `source_application_id` (VK) and `dis_application_id` (DIS) |

### Phase 4: Platform Features (AMS — Phase 2/3 vision)

**Goal:** Expand AMS into the full platform.

| # | Feature | Description |
|---|---------|-------------|
| 4.1 | RBAC | Extend officer roles with clearance-gated views (CTC, SC, DV levels) |
| 4.2 | Rules management UI | CRUD interface for Drools rules, referencing lookup files (SOC codes, going rates, ISL, etc.) |
| 4.3 | AI model configuration | Manage Gemini extraction prompts, confidence thresholds, document schemas |
| 4.4 | Decision matrix / analytics | BigQuery-backed dashboards for approval rates, processing times, rule trigger frequency |
| 4.5 | Multi-visa support | Extend form engine and rules for Student, Global Talent, Family, etc. |

---

## 8. Type Definitions Required

### 8.1 DIS Decision Types (`src/api-contracts/dis.ts`)

```typescript
// Canonical decision outcome — used across all systems
export type DecisionOutcome = 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';

// Individual Drools rule result
export interface DroolsRuleResult {
  rule_id: string;           // e.g. "SALARY_FLOOR", "TB_CERT_VALIDITY"
  result: 'PASS' | 'FAIL';
  detail: string;            // Human-readable explanation
  edge_case?: string;        // Edge case ID if applicable
}

// Component-level score (identity, financial, employment, etc.)
export interface ComponentScore {
  component: string;
  score: number;             // 0-100
  issues: string[];
}

// Glass-box decision trail
export interface GlassBoxTrail {
  rules_triggered: DroolsRuleResult[];
  glass_box_complete: boolean;
}

// External system check result
export interface ExternalCheck {
  check_type: string;        // "sponsor_licence", "cos_validity", "tb_clinic", "university"
  status: string;            // "ACTIVE", "VALID", "APPROVED", "NOT_FOUND"
  details: Record<string, unknown>;
}

// Full DIS decision payload (received via callback or API)
export interface DISDecision {
  dis_application_id: string;
  source_application_id: string;
  source_reference: string;
  decision: {
    outcome: DecisionOutcome;
    confidence: number;
    component_scores: ComponentScore[];
    rules_engine_result: GlassBoxTrail;
    llm_summary: string;
    external_checks: ExternalCheck[];
  };
  audit_log: {
    processed_at: string;
    processing_time_ms: number;
  };
}
```

### 8.2 Document Extraction Types (`src/types/extraction.ts`)

```typescript
export interface PayslipExtraction {
  employer_name: string;
  employee_name: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_pay: number;
  tax_deducted: number;
  ni_deducted: number;
  pension_deducted: number;
  student_loan_deducted: number;
  net_pay: number;
  pay_frequency: string;
  payslip_date: string;
  employee_number: string;
  tax_code: string;
  ni_number: string;
}

export interface BankStatementExtraction {
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  sort_code: string;
  statement_period: string;
  opening_balance: number;
  closing_balance: number;
  salary_credits: Array<{
    date: string;
    description: string;
    amount: number;
  }>;
  currency: string;
}

export interface EmploymentLetterExtraction {
  employer_name: string;
  employer_address: string;
  employee_name: string;
  job_title: string;
  start_date: string;
  salary_amount: number;
  salary_frequency: string;
  employment_type: string;
  hours_per_week: number;
  signatory_name: string;
  signatory_position: string;
  letter_date: string;
}

export interface IELTSExtraction {
  candidate_name: string;
  date_of_birth: string;
  nationality: string;
  test_date: string;
  test_type: string;
  overall_score: number;
  listening_score: number;
  reading_score: number;
  writing_score: number;
  speaking_score: number;
  trf_number: string;
  cefr_level: string;
  test_centre: string;
}

export interface DegreeCertificateExtraction {
  institution_name: string;
  candidate_name: string;
  qualification_title: string;
  qualification_level: string;
  subject: string;
  classification: string | null;
  award_date: string;
  country_of_institution: string;
}

export type DocumentExtraction =
  | { type: 'PAYSLIP'; data: PayslipExtraction }
  | { type: 'BANK_STATEMENT'; data: BankStatementExtraction }
  | { type: 'EMPLOYMENT_LETTER'; data: EmploymentLetterExtraction }
  | { type: 'IELTS_CERTIFICATE'; data: IELTSExtraction }
  | { type: 'DEGREE_CERTIFICATE'; data: DegreeCertificateExtraction };
```

### 8.3 Typed Section Data (`src/types/section.ts` — additions)

```typescript
export interface EmploymentSectionData {
  status: string;
  employerName: string;
  jobTitle: string;
  annualIncome: number;
  cosReferenceNumber: string;
  socCode: string;
  startDate: string;
  salaryFrequency: string;
  hoursPerWeek: number;
  isNewEntrant: boolean;
  newEntrantReason?: string;
}

export interface CriminalRecordSectionData {
  hasConvictions: boolean;
  convictionDetails?: string;
  hasPendingCharges: boolean;
  pendingChargeDetails?: string;
  hasCivilJudgments: boolean;
  civilJudgmentDetails?: string;
}

export interface HealthDeclarationSectionData {
  hasTbCertificate: boolean;
  hasHealthConditions: boolean;
  healthConditionDetails?: string;
  requiresAccessibility: boolean;
  accessibilityDetails?: string;
  tbCertificateClinicName?: string;
  tbCertificateClinicCountry?: string;
}

export interface EnglishLanguageSectionData {
  exemptNationality: boolean;
  testType?: string;
  testReferenceNumber?: string;
  overallScore?: number;
  speakingScore?: number;
  listeningScore?: number;
  readingScore?: number;
  writingScore?: number;
  testDate?: string;
}
```

---

## 9. AMS UI Components Required

### 9.1 Glass-Box Trail (`<GlassBoxTrail />`)

Displays every Drools rule that was evaluated, with:
- PASS (green badge) / FAIL (red badge) per rule
- Rule ID and human-readable description
- Expandable detail showing the values that were checked
- Summary: "18/19 rules passed, 1 failed"
- Filterable by result (show all / failures only / passes only)

### 9.2 Cross-Document Consistency View (`<CrossDocConsistency />`)

Side-by-side table showing:
- Field name (e.g. "Applicant Name")
- Value from each document source (Passport, Employment Letter, Payslip, Bank Statement)
- Match status (green tick if consistent, red flag if mismatch)
- Which Drools rule checked this (e.g. RULE-W02)

### 9.3 Document Extraction Viewer (`<ExtractionViewer />`)

Per-document panel showing:
- Document thumbnail/preview
- Table of extracted field name + value + confidence score
- Highlighting for fields with low confidence
- Link to original document in GCS

### 9.4 LLM Summary Panel (`<LLMSummary />`)

- Gemini-generated natural language case summary
- Key findings highlighted
- Risk factors called out
- Recommendation for officer action

### 9.5 External Checks Panel (`<ExternalChecks />`)

Shows results of lookups against reference data:
- Sponsor licence: Active/Inactive, A-rated/B-rated (from `sponsor_register.csv`)
- COS validity: Valid/Expired, within 3-month window (from `cos_register_mock.json`)
- TB clinic: Approved/Not approved (from `approved_tb_clinics.json`)
- University: Recognised/Not recognised, has degree-awarding powers (from `uk_universities.json`)
- SOC code: Eligible/Not eligible, going rate (from `eligible_soc_codes.json`, `soc_going_rates.json`)

---

## 10. Open Questions for Deloitte

These need answers from Neeraj/Preety/Ranita before Phase 3 implementation:

1. **DIS API endpoint and auth**: What is the actual URL for `POST /api/v1/applications`? API key or mTLS auth?
2. **Decision callback auth**: HMAC shared secret, mTLS, or API key? What's the payload signature format?
3. **DIS application tracking**: Does DIS generate its own `dis_application_id`? Is it returned in the submission response or only in the callback?
4. **Officer decision API**: How does the AMS send approve/reject/escalate decisions back to DIS? New endpoint or same callback URL?
5. **Real-time vs batch**: Does DIS process applications synchronously (response = decision) or asynchronously (callback later)?
6. **Postgres access**: Will AMS have direct read access to the DIS Postgres for application listing, or must it go through a DIS API?
7. **BigQuery access**: Will AMS have direct BigQuery access for analytics dashboards, or does DIS expose a metrics API?
8. **Component scores shape**: Is the `component_scores` structure in the callback payload final? Which components are included?
9. **LLM summary format**: Plain text or structured markdown? Max length?
10. **Document extraction confidence**: Does Gemini Vision return per-field confidence scores, or just an overall document confidence?

---

## Appendix: File References

### AMS Dashboard (`ams-official`)
- `src/api-contracts/applications.ts` — current application types
- `src/api-contracts/reviews.ts` — decision/escalation types
- `src/api-contracts/users.ts` — officer types
- `src/types/aiScan.ts` — AI scan result types
- `src/types/section.ts` — section data types
- `src/data/synthetic/transformer.ts` — synthetic data -> dashboard mapping
- `src/data/providers/json-provider.ts` — current data source
- `src/data/providers/index.ts` — provider interface + factory

### VisaKey 2.0 Backend (`visakey2.0-backend`)
- `src/db/schema.ts` — Drizzle schema (10 tables)
- `src/services/application.service.ts` — application CRUD + submit
- `src/services/document.service.ts` — doc upload/download + `buildDeloitteDocumentList()`
- `src/integrations/idv/types.ts` — IDV + BiometricVerification types
- `src/integrations/gcs.ts` — GCS upload/download/signed URLs
- `docs/devdocs/deloitte-data-contract-v2.md` — DIS contract documentation

### VisaKey 2.0 Expo App (`visakey2.0-expoapp`)
- `src/store/eligibilityStore.ts` — eligibility state
- `src/store/readinessStore.ts` — IDV/readiness state
- `src/lib/passportOcr.ts` — passport OCR types
- `src/lib/prequalification.ts` — readiness check types
- `src/api/mock/data/formDefinitions.json` — form schemas

### Synthetic Data (`openvisa-synthetic-data`)
- `output/json_payloads/expected_outcomes.json` — 100-entry answer key with rule IDs
- `output/drools_lookups/*` — all 8 reference data files
- `config/v2/edge_cases.py` — 24 edge cases with Drools rule mappings
- `docs/DELIVERY_LOG.md` — delivery status tracker

---

*This spec is version-controlled in the ams-official repo at `docs/specs/2026-04-05-dis-integration-spec.md`*
