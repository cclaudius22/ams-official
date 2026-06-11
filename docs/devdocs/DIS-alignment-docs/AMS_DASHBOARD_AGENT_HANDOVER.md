# AMS Dashboard & Officer Dashboard — Agent Handover Briefing
# Date: 27 April 2026 | Author: Chris (Open Visa) | Classification: Internal

---

## CONTEXT: WHAT'S HAPPENING RIGHT NOW

Deloitte India is building the **Decision Intelligence System (DIS)** — Phase 1 of Open Visa's immigration processing platform. DIS is a Glass Box AI pipeline that processes Skilled Worker visa applications through document extraction, external checks, rules evaluation, and compliance validation.

**Your job** is building the **AMS (Applicant Management System)** dashboards — the human-facing layer that sits on top of DIS. This includes the **Officer Dashboard** (caseworker review interface) and the **Admin Dashboard** (system management, rules management, reference data management).

The Deloitte team is currently implementing the backend pipeline. Today (27 April 2026) we responded to a query from Preety (Deloitte's lead engineer) about the `/api/rules/reload` endpoint. She asked whether the endpoint is triggered by a UI or by CI/CD. The answer is **both** — Phase 1 is CI/CD-only, Phase 2 adds a UI-based Rules Manager. This briefing ensures you build the mock UIs in a way that's ready for Phase 2.

---

## THE THREE ADMIN UI MODULES (Phase 2 AMS)

### 1. Rules Manager UI

**Purpose:** Allow authorised users (senior caseworkers, immigration policy teams) to view, edit, and deploy Drools rules and OPA policies through a web interface — without touching code.

**Current state (Phase 1):** Rules are deployed via Git → CI/CD → GCS → `/api/rules/reload`. No UI.

**Phase 2 target:**

| Feature | Description |
|---|---|
| View active rules | List all 20 Drools rules + 12 OPA policies with current status, version, last deployed |
| Edit rule parameters | Modify thresholds (e.g., salary minimum from £38,700 to £39,000) via form fields |
| Add new rules | Guided form: rule name, visa type, conditions, actions, severity |
| Preview changes | Run edited rule against test cases before deployment |
| Deploy to engine | One-click deploy: UI backend commits to Git → syncs to GCS → calls `/api/rules/reload` |
| Rollback | One-click restore from archive |
| Audit trail | Every change logged with user ID, timestamp, git_commit_sha, deployment_id |

**Key API contract for the reload:**

```
POST /api/rules/reload
{
  "reload_type": "DROOLS",              // or "OPA"
  "git_commit_sha": "abc123...",
  "gcs_source_path": "gs://openvisa-dis-rules-{env}/drools/active/skilled_worker/",
  "rule_files_changed": ["salary_rules.drl"],
  "triggered_by": "ams-rules-manager",  // Phase 2 value
  "deployment_id": "deploy-uuid",
  "archive_path": "gs://openvisa-dis-rules-{env}/drools/archive/{timestamp}/"
}
```

**Design principle:** The `triggered_by` field is the extensibility hook. Phase 1 = `"github-actions"`. Phase 2 = `"ams-rules-manager"`. The endpoint is caller-agnostic — same contract regardless of who triggers it.

### 2. Reference Data Manager UI

**Purpose:** Allow authorised users to update the lookup tables that Drools and OPA consume — salary thresholds, SOC codes, going rates, exempt nationalities, etc. — without code deployment.

**Current state (Phase 1):** Reference data files are JSON/CSV in GCS (`gs://openvisa-dis-rules-{env}/reference_data/`). Updated manually or via CI/CD. Both Drools and OPA detect file changes on their next refresh cycle.

**Phase 2 target:**

| Feature | Description |
|---|---|
| View reference data | Browse all 11 reference data files with search/filter |
| Edit values | Inline editing of JSON/CSV records (e.g., update a going rate for SOC code 2137) |
| Bulk upload | CSV upload for large updates (e.g., new sponsor register from Home Office) |
| Version control | Every edit committed to Git, synced to GCS, logged to BigQuery |
| Validation | Schema validation before save (type checking, required fields, range checks) |
| Effective dating | Schedule when a change takes effect (e.g., new salary thresholds from 4 April 2027) |

**Reference data files (11 total):**
- `salary_thresholds.json` — minimum salary by visa type and SOC code
- `english_exempt_nationalities.json` — ISO 3166-1 alpha-3 codes
- `tb_test_countries.json` — countries requiring TB testing
- `enhanced_scrutiny_nationalities.json` — enhanced vetting list
- `sponsor_register.csv` — 140,909 licensed sponsors
- `cos_register_mock.json` — 155 mock CoS records
- `eligible_soc_codes.json` — eligible occupation codes
- `soc_going_rates.json` — going rates per SOC code
- `immigration_salary_list.json` — Immigration Salary List rates
- `approved_tb_clinics.json` — approved clinics by country
- `uk_universities.json` — recognised UK institutions

### 3. External API Manager UI

**Purpose:** Monitor and manage the 6 external API integrations — health checks, response times, fallback configuration, mock/live toggle.

**Phase 1 external APIs:**

| API | Phase 1 Status | Notes |
|---|---|---|
| Reuters World-Check (PEP/Sanctions) | LIVE | Zero Footprint Screening (ZFS) |
| Interpol Database | MOCK | Mock → Sandbox → Production path |
| Passport Verification | MOCK | |
| Border Control / Travel History | MOCK | |
| Device & IP Risk | MOCK | VisaKey channel only |
| Email & Phone Reputation | MOCK | |

**Phase 2 target:** UI to toggle mock/live per API, view response latency dashboards, configure retry/fallback behaviour, and manage API credentials via Secret Manager integration.

---

## OFFICER DASHBOARD (Phase 1 + Phase 2)

### Phase 1 (build now as mock UI)

The Officer Dashboard is the caseworker's primary interface for reviewing visa applications that DIS has processed.

**Core views to build:**

| View | Description |
|---|---|
| Application Queue | List of applications pending review, filterable by status, priority, visa type |
| Application Detail | Full application view: applicant info, documents, extraction results, external check results |
| Decision Trail | Glass Box explainability view: every Drools rule result, every OPA policy result, every external check, with confidence scores and evidence links |
| Document Viewer | Side-by-side: original document image + extracted fields + fraud signals |
| Decision Panel | Approve / Reject / Request More Info — with mandatory reason field |
| Audit Log | Immutable record of every action taken by the officer |

**Decision statuses:** `CREATED`, `PROCESSING`, `RULES_EVALUATING`, `MANUAL_REVIEW`, `APPROVED`, `REJECTED`, `WITHDRAWN`, `EXPIRED`, `COMPLETED`

**Glass Box principle:** Every decision displayed must be traceable to a specific rule (RULE-W01 through W15), policy (OPA-H01 through H06, OPA-S01 through S06), or external check result. The officer must be able to see *why* the system recommended what it recommended.

### Phase 2 additions

- Bulk review workflows (batch approve/reject for straightforward cases)
- Annotation tools (officer can annotate specific documents/fields)
- Case assignment and workload balancing
- SLA tracking (processing time targets per application type)
- Integration with the Rules Manager (officer can flag a rule as potentially incorrect → escalates to policy team)

---

## ARCHITECTURE PRINCIPLES FOR MOCK UIs

### 1. Build against the real API contracts

All mock UIs should consume the same API endpoints that the production system will use. The DIS API contract is defined on SCRUM-17 (Jira). Key endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/applications` | POST | Submit application |
| `/api/v1/applications/{id}/status` | GET | Poll processing status |
| `/api/rules/reload` | POST | Trigger rules hot-reload (internal) |

### 2. Use the canonical schemas

All data structures should match:
- **PostgreSQL schema:** Confluence page 30048272 (v13, signed off 17 April)
- **Submission payloads:** Sample VisaKey and GovDirect payloads in project knowledge
- **Decision callback:** Sample decision callback payload in project knowledge
- **Extraction schema:** Confluence page 27328513

### 3. Design for the `triggered_by` extensibility pattern

Wherever the UI triggers a backend action (rule reload, reference data update, API toggle), include a `triggered_by` field that identifies the UI module. This creates a clean audit trail and allows the backend to apply different authorisation rules per trigger source.

Pattern:
```json
{
  "triggered_by": "ams-rules-manager",     // or "ams-reference-data-manager", "ams-api-manager", "officer-dashboard"
  "triggered_by_user": "user-uuid",
  "triggered_at": "2026-04-27T10:00:00Z",
  "session_id": "session-uuid"
}
```

### 4. Datadog observability integration

We partner with Datadog. The mock UIs should be instrumented from the start:
- **RUM (Real User Monitoring):** Page load times, interaction latency, error rates
- **APM (Application Performance Monitoring):** Backend API call traces
- **Log Management:** Structured logs from every UI action
- **Dashboards:** Pre-built dashboards for officer productivity, queue depth, processing times

This will also feed into the QA process — Deloitte's test plan will be validated against these observability signals.

### 5. AI-agentic QA readiness

We are implementing an AI-agentic QA process on the OV side. The mock UIs should expose:
- **Test hooks:** Data attributes on key UI elements for automated testing
- **State inspection endpoints:** Debug endpoints that expose current UI state for automated verification
- **Synthetic data compatibility:** All mock data generators should support deterministic seeding for reproducible test runs

---

## WHAT TO BUILD NOW (Priority Order)

1. **Officer Dashboard — Application Queue + Detail View** — this is the demo-ready piece for investor presentations and Home Office pilots
2. **Officer Dashboard — Glass Box Decision Trail** — the explainability view is our key differentiator
3. **Admin Dashboard — Rules Manager (read-only view first)** — list all rules with status, version, last deployed. Edit/deploy comes in Phase 2
4. **Admin Dashboard — Reference Data Viewer** — browse reference data files. Edit comes in Phase 2
5. **Admin Dashboard — External API Health Dashboard** — monitor all 6 APIs, show mock/live status

---

## KEY PEOPLE

| Person | Role | Relevance |
|---|---|---|
| **Preety Gupta Bansal** | Deloitte Lead — Ingestion, Drools | Building the `/api/rules/reload` endpoint. Her API contracts are your integration targets. |
| **Ranita Roy** | Deloitte — Vertex AI, Data Layer | Building the extraction pipeline and PostgreSQL schema. Her schema (page 30048272) is your data model. |
| **Vidhyotha Shetty** | Deloitte — OPA | Building all OPA policies. Her OPA output format feeds your compliance view. |
| **Neeraj Jha** | Deloitte — External APIs | Building World-Check live + 5 mock APIs. His response formats feed your external checks view. |
| **Satyarth Bhardwaj** | Deloitte — Doc AI | Building classifier + extractors. His output feeds your document viewer. |

---

## REFERENCE LINKS

- **DIS Pipeline Flow:** See the Mermaid diagram in the session handover (project knowledge)
- **Canonical Schema:** Confluence page 30048272
- **Rules & Policy Engine Spec:** `OpenVisa_DIS_Rules_Policy_Engine_Technical_Spec.md` (project knowledge)
- **Sample Payloads:** `Sample_VisaKey___DIS_submission_payload` and `Sample_DIS___VisaKey_decision_callback_` (project knowledge)
- **External API Specs:** `External_API_Check_Specifications__OpenVisa_DIS.pdf` (project knowledge)
- **SCRUM-17 (OpenAPI Spec):** All endpoint contracts with full JSON schemas in Jira comments

---

*This briefing is a living document. Update as Phase 1 delivery progresses and Phase 2 scope firms up.*
