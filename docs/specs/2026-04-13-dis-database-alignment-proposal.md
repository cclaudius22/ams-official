# Database Alignment Proposal: VisaKey → DIS Cloud SQL

**Date:** 13 April 2026  
**Author:** Chris Claudius, OpenVisa CTO  
**For:** Deloitte India (Neeraj, Preety, Ranita, Satyarth)  
**Status:** DRAFT — awaiting DIS Cloud SQL DDL from Deloitte  
**Related:** Integration Spec V3, Open Item Q32 (PostgreSQL + BigQuery schemas)

---

## TL;DR

In Sprint 3, when DIS moves from mock to live Cloud SQL on GCP, we propose that **VisaKey writes submitted applications and documents directly to the DIS database** rather than POSTing JSON payloads via HTTP. This eliminates data duplication, removes webhook-based sync, and gives the entire platform a single source of truth.

---

## 1. Current Architecture (Two Databases)

```
VisaKey App (Expo)
    │
    ▼
VisaKey Backend (Hono)  ──────► VisaKey Neon DB
    │                             ├── users (Clerk auth)
    │                             ├── applications         ◄── DUPLICATED
    │                             ├── documents             ◄── DUPLICATED
    │                             ├── eligibility_tokens
    │                             └── visa_types / form_defs
    │
    ├── POST /api/v1/applications  (JSON payload + signed GCS URLs)
    │
    ▼
DIS API (FastAPI)  ────────────► DIS Cloud SQL
    │                             ├── applications         ◄── DUPLICATED
    │                             ├── documents             ◄── DUPLICATED
    │                             ├── document_extractions
    │                             ├── rule_results
    │                             ├── opa_results
    │                             ├── external_checks
    │                             └── decisions
    │
    ├── POST /api/webhooks/dis-decision  (callback to VisaKey)
    │
    ▼
AMS Dashboard (Next.js)  ──────► reads from DIS Cloud SQL via API
```

**Problems with this:**
- `applications` and `documents` exist in **both** databases
- Status sync relies on webhook callbacks (fragile, latency, failure modes)
- When DIS updates a decision, VisaKey doesn't know until the webhook fires
- AMS reads from DIS, but VisaKey reads from its own copy — potential drift
- No single place to query "all applications with their decisions"

---

## 2. Proposed Architecture (Single DIS Database for Processing)

```
VisaKey App (Expo)
    │
    ▼
VisaKey Backend (Hono)  ──────► VisaKey Neon DB (channel state only)
    │                             ├── users (Clerk auth, profiles)
    │                             ├── eligibility_tokens
    │                             └── visa_types / form_definitions
    │
    ├── INSERT INTO applications  ─────► DIS Cloud SQL (single source of truth)
    ├── INSERT INTO documents     ─────►   ├── applications
    ├── SELECT status FROM apps   ◄─────   ├── documents
    │                                      ├── document_extractions
    │                                      ├── rule_results
    │                                      ├── opa_results
    │                                      ├── external_checks
    │                                      └── decisions
    │
    │  (no webhook needed for status — VisaKey reads directly)
    │
AMS Dashboard (Next.js)  ──────► reads from DIS Cloud SQL (same DB)
```

**Benefits:**
- **One source of truth** — no sync, no drift
- **No webhooks** for status — VisaKey polls or subscribes to the same DB
- **AMS sees exactly what VisaKey submitted** — no translation layer
- **DIS pipeline triggers off DB inserts** — `applications.status = 'submitted'` triggers processing
- **Simpler error handling** — no HTTP POST failure modes, retry logic, etc.

---

## 3. What We Need from Deloitte

### 3.1 The DIS Cloud SQL DDL (Critical — Open Item Q32)

We need the `CREATE TABLE` statements for DIS Cloud SQL. Specifically:

#### Tables we need to WRITE to (from VisaKey):

| Table | What we write | When |
|-------|--------------|------|
| `applications` | Application metadata, applicant info, form answers, visa type, source channel | On submission |
| `documents` | Document metadata, GCS paths, types, sizes | On upload (during application) |

#### Tables we need to READ from (for VisaKey status + AMS dashboard):

| Table | What we read | When |
|-------|-------------|------|
| `applications` | `status`, `decision_outcome`, `processing_path`, `risk_level` | User checks app status |
| `document_extractions` | Per-document extraction results, fraud scores | AMS officer reviews |
| `rule_results` | 20 Drools rule outcomes (PASS/FAIL + detail) | AMS glass-box trail |
| `opa_results` | 12 OPA policy outcomes (BLOCK/REVIEW_REQUIRED/PASS) | AMS glass-box trail |
| `external_checks` | 6 API check results | AMS external checks panel |
| `decisions` | Final decision, component scores, audit log | AMS + VisaKey status |

#### Tables DIS pipeline writes to (we never write, only read):

| Table | Written by |
|-------|-----------|
| `document_extractions` | Document AI processors |
| `rule_results` | Drools engine |
| `opa_results` | OPA engine |
| `external_checks` | Cloud Workflows (6 APIs) |
| `decisions` | Decision matrix |

### 3.2 Specific Schema Questions for Deloitte

These are the questions we need answered to align the VisaKey write path:

#### Q1: `applications` table — column definitions

We currently store this in VisaKey's DB:

```sql
-- What we have (Drizzle ORM → Postgres)
CREATE TABLE applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         VARCHAR(255) NOT NULL,          -- Clerk user ID
  visa_type_id    UUID NOT NULL,
  reference       VARCHAR(50),                     -- e.g., "VK-SW-001"
  status          VARCHAR(30) NOT NULL DEFAULT 'incomplete',
  country_code    VARCHAR(10) NOT NULL DEFAULT 'GB',
  answers         JSONB,                           -- all form section answers
  completed_sections TEXT[],
  identity_verification JSONB,                     -- passport OCR + liveness
  submitted_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT now(),
  updated_at      TIMESTAMP DEFAULT now()
);
```

**Questions:**
- Does DIS have an `applications` table, or is it called something else (`submissions`, `cases`)?
- What is the primary key type — UUID, CUID, or integer sequence?
- Does DIS expect `visa_type` as a slug string (`'skilled-worker'`) or a foreign key to a visa types table?
- Where do form answers go — single JSONB column, or normalised into separate tables?
- Is there a `source_channel` column? What are the valid values?
- Is there an `auth_context` JSONB column for the opaque API key + device fingerprint?
- What status values does DIS use? Our current values: `incomplete`, `needs_review`, `in_review`, `approved`, `rejected`, `withdrawn`

#### Q2: `documents` table — column definitions

Our current schema:

```sql
CREATE TABLE documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id    UUID NOT NULL REFERENCES applications(id),
  user_id           VARCHAR(255) NOT NULL,
  type              VARCHAR(50) NOT NULL,          -- e.g., 'BANK_STATEMENT', 'PASSPORT'
  original_filename VARCHAR(500) NOT NULL,
  mime_type         VARCHAR(100) NOT NULL,
  size_bytes        INTEGER NOT NULL,
  gcs_path          VARCHAR(1000) NOT NULL,        -- e.g., '{userId}/{appId}/BANK_STATEMENT/...'
  gcs_uri           VARCHAR(1000),                 -- gs://bucket/path
  status            VARCHAR(30) DEFAULT 'uploaded',
  metadata          JSONB,
  created_at        TIMESTAMP DEFAULT now()
);
```

**Questions:**
- Does DIS use the same document type enum values we use? Our current values: `PASSPORT`, `BANK_STATEMENT`, `EMPLOYMENT_LETTER`, `PAYSLIPS`, `COS`, `IELTS_CERTIFICATE`, `DEGREE_CERTIFICATE`, `TB_CERTIFICATE`, `PHOTO`, `PROOF_OF_ADDRESS`, etc.
- Does DIS expect raw files in a specific GCS bucket/path structure, or can we keep `{userId}/{appId}/{type}/{filename}`?
- Is there a `tier` column (TIER_1/TIER_2) in the documents table, or only in `document_extractions`?
- Is there a `criticality` column (CRITICAL/SUPPORTING)?

#### Q3: GCS bucket structure

- What GCS bucket does DIS read documents from?
- Can VisaKey upload directly to that bucket, or do we need to copy/move files?
- Is there a specific path convention DIS expects?
- Are signed URLs still the mechanism, or does DIS read from GCS directly using service account permissions?

#### Q4: Access control

- How does VisaKey authenticate to DIS Cloud SQL? Service account IAM? Cloud SQL Auth Proxy? Direct connection string?
- What permissions does VisaKey need — INSERT-only on `applications` + `documents`, SELECT on processing tables?
- Does DIS use Cloud SQL IAM database authentication or username/password?
- Is there a VPC peering requirement between VisaKey's Cloud Run and DIS's Cloud SQL?

#### Q5: Pipeline triggering

- Currently we POST to DIS API (which presumably triggers the pipeline). If we write directly to Cloud SQL, how does the pipeline know a new application has been submitted?
- Options: (a) DB trigger / change notification, (b) Pub/Sub message after INSERT, (c) VisaKey also hits a lightweight "process" endpoint, (d) DIS polls for `status = 'submitted'`
- Which does Deloitte prefer?

#### Q6: Decision results

- When DIS finishes processing, does it update the `applications` row (e.g., `status = 'approved'`), or write to a separate `decisions` table?
- If separate `decisions` table — what's the FK relationship to `applications`?
- When VisaKey needs to show "Your application is approved" — what column/table does it read?

---

## 4. What We Bring to the Table

### 4.1 Data VisaKey Writes at Submission

This is exactly what we'd INSERT into DIS Cloud SQL:

```json
{
  "source_application_id": "uuid",
  "source_reference": "VK-SW-001",
  "source_channel": "visakey",
  "visa_type": "skilled-worker",
  "country_code": "GB",
  "submitted_at": "2026-04-13T10:00:00Z",

  "applicant": {
    "user_id": "clerk_user_id",
    "email": "applicant@example.com",
    "first_name": "Arun",
    "last_name": "Patel",
    "date_of_birth": "1992-03-15",
    "nationality_code": "IN",
    "gender": "male"
  },

  "passport_data": {
    "number": "T1234567",
    "issuing_country": "IN",
    "expiry_date": "2030-09-22",
    "mrz_line1": "P<INDPATEL<<ARUN<<<<<<<<<<<<",
    "mrz_line2": "T12345674IND9203153M3009229<<<<<<<<"
  },

  "biometric_verification": {
    "mrz_check_passed": true,
    "face_match_score": 0.94,
    "liveness_passed": true,
    "provider": "regula",
    "session_id": "session_uuid"
  },

  "answers": {
    "personalInfo": { "firstName": "Arun", "lastName": "Patel", "dateOfBirth": "1992-03-15", "nationality": "IN" },
    "employment": { "employerName": "TechCorp UK Ltd", "jobTitle": "Senior Software Engineer", "annualIncome": "55000", "socCode": "2136" },
    "financial": { "bankName": "HDFC Bank", "accountBalance": "15000" }
  },

  "auth_context": {
    "auth_method": "SERVICE_TOKEN",
    "api_key_id": "visakey-prod-001",
    "device_fingerprint": "fp_abc123",
    "submission_ip": "203.0.113.42"
  }
}
```

### 4.2 Documents VisaKey Writes

For each document, we INSERT a row + upload the file to GCS:

```json
{
  "application_id": "uuid (FK to applications)",
  "type": "BANK_STATEMENT",
  "original_filename": "hdfc_statement_jan2026.pdf",
  "mime_type": "application/pdf",
  "size_bytes": 245760,
  "gcs_path": "visakey-uploads/{app_id}/BANK_STATEMENT/1681384800-hdfc_statement_jan2026.pdf",
  "uploaded_at": "2026-04-13T09:45:00Z"
}
```

### 4.3 Document Types We Send (Skilled Worker)

| VisaKey Doc Type | DIS `document_type` | Tier | Criticality | Required? |
|-----------------|---------------------|------|-------------|-----------|
| `PASSPORT` | `PASSPORT` | T1 | CRITICAL | Yes (auto-captured from IDV) |
| `PHOTO` | `PHOTO` | N/A | SUPPORTING | Yes (auto-captured) |
| `COS` | N/A (structured input) | N/A | CRITICAL | Yes (reference number, not a file) |
| `EMPLOYMENT_LETTER` | `EMPLOYMENT_LETTER` | T2 | CRITICAL | Yes |
| `PAYSLIPS` | `PAYSLIP` | T2 | CRITICAL | Yes |
| `IELTS_CERTIFICATE` | `IELTS_CERTIFICATE` | T2 | CRITICAL | Yes |
| `BANK_STATEMENT` | `BANK_STATEMENT` | T1 | CRITICAL | Yes |
| `EMPLOYMENT_CONTRACT` | (not in DIS spec currently) | T2 | SUPPORTING | Optional |
| `TB_CERTIFICATE` | `TB_CERTIFICATE` | T2 | SUPPORTING | Conditional on nationality |

> **⚠️ Potential mismatch:** We use `PAYSLIPS` (plural), DIS spec uses `PAYSLIP` (singular). Need to align.

---

## 5. How We Present This to Deloitte

### The Ask (email/meeting format)

> **Subject: Sprint 3 Database Alignment — VisaKey Direct Write to DIS Cloud SQL**
>
> Hi Neeraj / Preety,
>
> As we move into Sprint 3 (live DIS integration), we'd like to propose that VisaKey writes submitted applications and documents **directly to DIS Cloud SQL** rather than going through the HTTP API.
>
> **Why:** Eliminates data duplication (applications + documents currently exist in both VisaKey DB and DIS DB), removes webhook-based status sync, and gives us a single source of truth that both the AMS dashboard and VisaKey read from.
>
> **What we need from you:**
>
> 1. **Cloud SQL DDL** — `CREATE TABLE` statements for `applications`, `documents`, and the processing output tables (`document_extractions`, `rule_results`, `opa_results`, `external_checks`, `decisions`). This is the Open Item Q32 from the integration spec.
>
> 2. **GCS bucket access** — Which bucket should VisaKey upload documents to? Path convention?
>
> 3. **Access control** — How does VisaKey authenticate to Cloud SQL? IAM service account? Cloud SQL Auth Proxy? VPC peering needed?
>
> 4. **Pipeline trigger mechanism** — If we INSERT directly instead of POST to the API, how does the DIS pipeline know to start processing? Pub/Sub? DB trigger? Lightweight "start processing" endpoint?
>
> I've attached our current schema and the exact payload shape we'd write. Happy to do a 30-min schema alignment call this week.
>
> Chris

### Fallback Position

If Deloitte prefers to keep the HTTP API as the intake mechanism (which is a valid architectural choice for decoupling), then we stay with the current design but request:

1. **Decision status polling endpoint** — `GET /api/v1/applications/{id}/status` so VisaKey doesn't depend solely on webhooks
2. **Idempotent submission** — so we can safely retry failed POSTs
3. **Document type enum alignment** — confirm the exact string values they accept

---

## 6. Migration Path (if approved)

| Step | Action | Owner | When |
|------|--------|-------|------|
| 1 | Deloitte shares Cloud SQL DDL | Deloitte | Sprint 3 kickoff |
| 2 | We review and map VisaKey columns → DIS columns | OpenVisa | +1 day |
| 3 | Add DIS Cloud SQL connection to VisaKey backend | OpenVisa | +1 day |
| 4 | Replace `dis.service.ts` HTTP POST with direct INSERT | OpenVisa | +2 days |
| 5 | Replace webhook handler with DB status polling/subscription | OpenVisa | +1 day |
| 6 | AMS reads from DIS Cloud SQL instead of mock data | OpenVisa | +2 days |
| 7 | Remove VisaKey `applications` and `documents` tables (after migration) | OpenVisa | Sprint 4 |

### What stays in VisaKey's Neon DB (not migrated)

| Table | Why it stays |
|-------|-------------|
| `users` | Clerk auth, user profiles — channel-specific, DIS doesn't need this |
| `eligibility_tokens` | Pre-qualification scoring — VisaKey-specific feature |
| `visa_types` | Form engine config — drives the Expo app UI |
| `form_definitions` | JSON Schema + UI schema for form rendering |

---

## 7. Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Deloitte says no (keep HTTP API) | Medium | Fallback: keep current design, add status polling endpoint |
| Cloud SQL schema doesn't match our data | Medium | Schema alignment call before writing code |
| VPC / network issues between Cloud Run and Cloud SQL | Low | Cloud SQL Auth Proxy handles this |
| Column type mismatches (e.g., we use UUID, they use BIGINT) | Medium | Mapping layer in VisaKey backend |
| DIS pipeline doesn't support direct DB inserts as trigger | Medium | Pub/Sub message after INSERT (VisaKey sends) |
