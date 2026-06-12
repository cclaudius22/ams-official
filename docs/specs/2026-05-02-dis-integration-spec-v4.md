# AMS Officer Dashboard — Integration Spec V4

**Date:** 2 May 2026
**Author:** Chris Claudius + Claude Code
**Status:** Single source of truth — supersedes V3 for dashboard architecture
**Scope:** Officer dashboard 3-panel architecture, document review, Confluence sync agent, Datadog observability, QA readiness
**Supersedes:** V3 dashboard sections (12.0–12.9). V3 remains authoritative for types, rules, OPA, extraction schemas, and Phase 1 type alignment work.

---

## What changed from V3

V3 described the dashboard as a flat list of components (9 component score cards, glass-box trail, external checks panel, etc.). V4 replaces that with a **3-panel architecture** based on how real caseworkers actually reason about applications:

1. **Panel 1 — Decision Summary:** The AI-generated caseworker reasoning letter
2. **Panel 2 — Glass Box Rule Trace:** Every rule and policy that fired, staged
3. **Panel 3 — Evidence:** Raw external API results + document extractions

Below the 3 panels, the existing expandable document accordion is preserved unchanged.

V4 also adds:
- **Hermes** — a Confluence sync agent that keeps this repo aligned with Deloitte's daily technical doc updates
- Datadog observability instrumentation requirements
- AI-agentic QA readiness (`data-testid` attributes, state inspection endpoints)
- The `triggered_by` extensibility pattern for all admin actions
- Expanded application lifecycle statuses (9 states, not just 3 decision outcomes)

---

## Table of Contents

1. [3-Panel Architecture](#1-three-panel-architecture)
2. [Panel 1 — Decision Summary](#2-panel-1--decision-summary)
3. [Panel 2 — Glass Box Rule Trace](#3-panel-2--glass-box-rule-trace)
4. [Panel 3 — Evidence](#4-panel-3--evidence)
5. [Document Sections (Existing Accordion)](#5-document-sections-existing-accordion)
6. [Audit Trail Panel](#6-audit-trail-panel)
7. [Full Page Layout](#7-full-page-layout)
8. [Application Lifecycle Statuses](#8-application-lifecycle-statuses)
9. [Data Sources & Linking](#9-data-sources--linking)
10. [Admin UI Modules](#10-admin-ui-modules)
11. [Hermes — Confluence Sync Agent](#11-hermes--confluence-sync-agent)
12. [Observability & QA](#12-observability--qa)
13. [Implementation Plan (Revised)](#13-implementation-plan)
14. [Source Documents](#14-source-documents)

---

## 1. Three-Panel Architecture

At runtime with a real application, the officer sees three panels on the AMS dashboard, all linked by `dis_application_id`:

```
┌─────────────────────────────────────────────────────────────────┐
│ Panel 1 — Decision Summary                                      │
│ "Your application has been refused under paragraph 9.8.1(b)..." │
│ AI-generated caseworker reasoning letter                        │
│ Statutory basis • Refusal/grant grounds • Appeal risk           │
└────────────────────────┬────────────────────────────────────────┘
                         │ officer drills down: "why?"
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Panel 2 — Glass Box Rule Trace                                  │
│ Stage 1: Validity ✅ • Stage 2: Suitability ❌ • Stage 3: ...  │
│ Every Drools rule and OPA policy that fired                     │
│ RULE-W12: NOT_SATISFIED • RULE-U01-A: SATISFIED               │
│ With evidence references per check                              │
└────────────────────────┬────────────────────────────────────────┘
                         │ officer traces: "show me the evidence"
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ Panel 3 — Evidence                                              │
│ External API results (World-Check, Interpol, Border Control...) │
│ Document extractions (normalised_fields, fraud_signals)         │
│ Raw source data behind every rule check                         │
└─────────────────────────────────────────────────────────────────┘
```

**Flow:** Summary → Rules → Evidence. Full traceability. The officer starts with "what happened?", drills into "why?", then traces to "based on what data?".

---

## 2. Panel 1 — Decision Summary

### What it shows

The AI-generated caseworker reasoning letter — the same kind of structured decision letter a real Home Office caseworker would write. This is what the Praxia `glass_box_decision.stage_5_decision.decision_reasoning_summary` examples produce.

**Example (refusal):**

> Your application for a Skilled Worker visa has been refused.
>
> While your application met the minimum points requirement on paper, it is refused for two reasons.
>
> First, under paragraph 9.7.1 of the Immigration Rules, your application is refused because you made a false representation. On your application form, you declared that you had not previously been refused a visa for the UK. Home Office records confirm that you were refused a visit visa on 15/06/2022.
>
> Second, your application is refused because I am not satisfied that you meet the genuineness requirements of the Skilled Worker route under paragraphs SW 5.4 and SW 5.5...

**Example (grant):**

> The applicant qualifies as a skilled worker with a recognised qualification. The salary of £50,253 exceeds the applicable threshold of £41,700. All administrative and compliance checks are passed. Application granted under Appendix Skilled Worker.

### Data source

- **Phase 1 (mock):** The `llm_summary` field from `DISApplicationView` — currently a flat string generated by Gemini post-decision
- **Phase 2 (production):** A trained model (Praxia architecture) generates a structured decision letter with statutory references, refusal grounds, and appeal risk assessment. The output shape matches the Praxia `glass_box_decision.stage_5_decision` format

### What the officer sees

| Element | Description |
|---------|-------------|
| Decision badge | APPROVED (green) / MANUAL_REVIEW (amber) / REJECTED (red) |
| Overall score | `decision.overall_score` (0-100) with risk level badge |
| Confidence | `decision.confidence` — how confident the pipeline is |
| Reasoning letter | Full natural-language decision reasoning |
| Statutory basis | Paragraph references (e.g., "9.7.1", "SW 5.4", "SW 5.6") |
| Refusal grounds | Bullet list (when applicable) |
| Appeal risk | LOW / MEDIUM / HIGH with risk reasons |
| "AI-generated" label | Clear disclaimer: "This reasoning was generated by AI and is not a decision. The officer makes the decision." |

### Component

```
<DecisionSummaryPanel disView={disView} />
```

Collapsible accordion, **open by default**. The officer reads this first.

---

## 3. Panel 2 — Glass Box Rule Trace

### What it shows

Every Drools rule and OPA policy that fired, organised into assessment stages. The officer drills into this to see **why** the decision was made. Each check links to the evidence in Panel 3.

### Stage structure

Based on the Praxia `glass_box_decision` stages, adapted for the DIS Drools/OPA pipeline:

| Stage | Name | What it covers | DIS source |
|-------|------|----------------|------------|
| 1 | **Validity** | Application form, fees, CoS, sponsor licence | RULE-W01, RULE-W02, RULE-W15 |
| 2 | **Suitability** | Criminality, immigration history, false representations, sanctions | RULE-U03, RULE-W11, RULE-W12, OPA-H01, OPA-H03 |
| 3 | **Eligibility (Points)** | Mandatory points (sponsorship, skill level, English) + tradeable points (salary) | RULE-W03, RULE-W04, RULE-W05, RULE-W06, RULE-W07, RULE-W08 |
| 4 | **Compliance** | Document quality, extraction confidence, fraud, TB, completeness, maintenance funds | RULE-U01, RULE-U02, RULE-U04, RULE-U05, RULE-W09, RULE-W10, RULE-W13, RULE-W14, OPA-H02, OPA-H04, OPA-H05, OPA-H06 |
| 5 | **Soft Flags** | All OPA soft policies that flagged for review | OPA-S01 through OPA-S06 |

### What the officer sees per stage

Each stage is a collapsible section. When expanded:

| Element | Description |
|---------|-------------|
| Stage status | PASS (all checks passed) / FAIL (one or more failed) / REVIEW (flagged) |
| Check list | Each Drools rule / OPA policy in this stage |
| Per check: Rule ID | e.g., "RULE-W03" |
| Per check: Name | e.g., "Salary Threshold — General" |
| Per check: Result | PASS (green) / FAIL (red) / NOT_APPLICABLE (grey) |
| Per check: Detail | Human-readable explanation from `DroolsRuleResult.detail` |
| Per check: Evidence link | "View evidence →" links to the specific evidence in Panel 3 |
| Per check: Severity | MANDATORY (red if failed) / ADVISORY (amber if failed) |

**Summary bar at the top:** "18/20 rules PASS | 2 FAIL | 10/12 OPA PASS | 2 FLAGGED"

### Component

```
<GlassBoxTracePanel disView={disView} />
```

Collapsible accordion, **collapsed by default** (officer opens when they want to drill into the rules).

---

## 4. Panel 3 — Evidence

### What it shows

The raw source data behind every rule check — external API results and document extractions. The officer traces from a rule in Panel 2 back to the source evidence here.

### Two sub-sections

**4A — External API Results (6 cards)**

One card per external check. Each shows:

| API | Key fields displayed |
|-----|---------------------|
| World-Check | Risk level, categories checked, lists checked, matches found, PEP details |
| Interpol SLTD | Stolen/lost/revoked/invalid flags |
| Passport Verification | Overall match, field-level matches, authenticity, immigration history (overstay, deportation, refusal) |
| Device & IP Risk | VPN/Tor/proxy flags, device trust score, geo analysis (N/A for GovDirect) |
| Email & Phone | Disposable/fraud flags, domain age, carrier, VOIP |
| Sponsor Verification | Licence status, rating, route, suspension/revocation |

Status badge per card: CLEAR (green) / FLAGGED (amber) / BLOCKED (red) / ERROR (grey) / TIMEOUT (grey)

**4B — Document Extractions**

For each extracted document: a card showing extraction method (ID Parser / Form Parser / Custom Extractor), extraction confidence, fraud score with 5-level badge, and the key normalised fields.

Critical documents (structured view): typed field table with per-field values.
Supporting documents: same structured view (V1.2 canonical defines all doc types as structured — no more flexible JSONB).

Each document card also shows:
- Fraud signal breakdown: per-signal score + weight + flags
- Which rules consumed this document (backlinks to Panel 2)

### Component

```
<EvidencePanel disView={disView} />
```

Collapsible accordion, **collapsed by default**. Officer opens when tracing from a specific rule.

---

## 5. Document Sections (Existing Accordion)

**The existing expandable document accordion is PRESERVED exactly as-is.** Same design, same look and feel, same interaction patterns.

All submitted documents appear below the 3 panels in the same accordion pattern the officers already know:

| Section | Component | Status |
|---------|-----------|--------|
| Passport Information | `PassportSectionDetails` | KEEP |
| Identity Verification (KYC) | `KycSectionDetails` | KEEP |
| Residence Information | `ResidencySectionDetails` | KEEP |
| Visa Photo Analysis | `VisaPhotoSectionDetails` | KEEP |
| Existing Visas & Status | `ExistingVisasSectionDetails` | KEEP |
| Professional Information | `ProfessionalSectionDetails` | KEEP |
| Sponsorship & Role Details | `SponsorshipAndRoleDetails` | KEEP |
| Financial Information | `FinancialSectionDetails` | KEEP |
| Travel Details | `TravelSectionDetails` | KEEP |
| Travel Insurance | `TravelInsuranceSectionDetails` | KEEP |
| Required Documents | `DocumentsSectionDetails` | KEEP |
| Academic Qualifications | `AcademicQualificationsSectionDetails` | KEEP |
| Medical Information | `MedicalSectionDetails` | KEEP |
| Religious Worker Details | `ReligiousSectionDetails` | KEEP |

Each section:
- Expandable/collapsible (existing accordion pattern)
- Shows all submitted data for that section
- Section-level actions: approve / refer / add note (existing)
- DIS enhancement: each section shows which Drools rules apply to it (backlinks to Panel 2) and the extraction confidence for any documents in that section

**No redesign needed.** The document accordion continues to work exactly as it does today.

---

## 6. Audit Trail Panel

Sits between the document accordion and the DecisionFooter. Two streams:

**Stream 1 — DIS Automated Audit (read-only)**
Pipeline version, models used, processing location, document/rules/checks/OPA stats, errors, warnings.

**Stream 2 — Officer Action Audit (write)**
11 event types logged: `application.viewed`, `section.approved`, `section.referred`, `section.note_added`, `verification.rerun`, `contact.initiated`, `contact.info_requested`, `application.escalated`, `decision.approved`, `decision.rejected`, `application.decision_override`.

Every event carries the `triggered_by` pattern:
```json
{
  "triggered_by": "officer-dashboard",
  "triggered_by_user": "officer-uuid",
  "triggered_at": "2026-05-02T10:00:00Z",
  "session_id": "session-uuid"
}
```

Vertical timeline, filterable (All / DIS / Officer / Overrides), CSV/PDF export.

Full spec: V3 Section 12.9 (unchanged).

---

## 7. Full Page Layout

Top-to-bottom, the reviewer page at `/dashboard/reviewer/[applicationId]`:

```
┌─────────────────────────────────────────────┐
│ ApplicationHeader                            │  KEEP (+ source_channel badge, dis_application_id)
├─────────────────────────────────────────────┤
│ Panel 1 — Decision Summary                   │  NEW (open by default)
│   Decision badge, overall score, reasoning    │
│   letter, statutory basis, appeal risk        │
├─────────────────────────────────────────────┤
│ Panel 2 — Glass Box Rule Trace               │  NEW (collapsed by default)
│   5 stages: Validity → Suitability →         │
│   Eligibility → Compliance → Soft Flags      │
│   18/20 rules PASS | 2 FAIL | 10/12 OPA     │
├─────────────────────────────────────────────┤
│ Panel 3 — Evidence                           │  NEW (collapsed by default)
│   6 external API cards + document            │
│   extraction cards with fraud signals        │
├─────────────────────────────────────────────┤
│ ─── Existing Document Accordion ───          │  KEEP (same design, expandable)
│   Passport Section                           │
│   KYC / Identity Section                     │
│   Sponsorship & Role Section                 │
│   Financial Section                          │
│   Professional Section                       │
│   Academic Qualifications Section            │
│   Travel Section                             │
│   Medical Section                            │
│   Documents Section                          │
│   ... all other sections ...                 │
├─────────────────────────────────────────────┤
│ Audit Trail Panel                            │  NEW (DIS + officer actions)
├─────────────────────────────────────────────┤
│ DecisionFooter (sticky)                      │  KEEP (Approve / Reject / Escalate / Contact)
│ + NoteDialog, ContactDialog, EscalateDialog  │  KEEP all 5 dialogs
│   ApproveDialog, RejectDialog                │
└─────────────────────────────────────────────┘
```

**Design principle:** Officers see the AI decision first (Panel 1), drill into rules second (Panel 2), trace to evidence third (Panel 3), then review the raw submitted documents below (accordion). The flow matches how a caseworker naturally reasons: conclusion → justification → evidence → source material.

---

## 8. Application Lifecycle Statuses

DIS `DecisionOutcome` (3 values: APPROVED, MANUAL_REVIEW, REJECTED) is the **decision** status. The full application lifecycle has 9 states:

```typescript
export type ApplicationLifecycleStatus =
  | 'CREATED'            // Application submitted, not yet sent to DIS
  | 'PROCESSING'         // DIS is processing (extraction + external checks)
  | 'RULES_EVALUATING'   // Drools + OPA running
  | 'MANUAL_REVIEW'      // DIS decision: officer must review
  | 'APPROVED'           // Final: approved (by DIS auto-approve or officer)
  | 'REJECTED'           // Final: refused (by DIS auto-reject or officer)
  | 'WITHDRAWN'          // Applicant withdrew
  | 'EXPIRED'            // Application expired (no decision within SLA)
  | 'COMPLETED'          // Post-decision: all admin actions done, case closed
```

The AMS queue view shows lifecycle status. The reviewer page shows decision status (Panels 1-3) plus lifecycle status in the header.

---

## 9. Data Sources & Linking

All three panels are linked by `dis_application_id`:

```
                    dis_application_id
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                  ▼
    Panel 1            Panel 2            Panel 3
  (llm_summary)    (rule_results +     (external_checks +
                    opa_results)       document_extractions)
         │                 │                  │
         └────────┬────────┘                  │
                  │                           │
           Each rule in Panel 2               │
           has an evidence_ref ──────────────►│
           that deep-links to the             │
           specific evidence item             │
           in Panel 3                         │
```

**Panel 1** reads: `DISApplicationView.llm_summary` (Phase 1) or a structured Praxia-format decision object (Phase 2)
**Panel 2** reads: `DISApplicationView.rule_results[]` + `DISApplicationView.opa_results[]`
**Panel 3** reads: `DISApplicationView.external_checks[]` + `DISApplicationView.document_extractions[]`

**Cross-linking:** When an officer clicks a rule in Panel 2 (e.g., RULE-U03 Sanctions Screening), the UI scrolls Panel 3 to the World-Check external check result that RULE-U03 consumed. This is the "trace from rule to evidence" interaction.

---

## 10. Admin UI Modules

Three admin modules (from the Agent Handover briefing, 27 April 2026):

### 10.1 Rules Manager (`/dashboard/rules-management/`)

View, edit, and deploy Drools rules + OPA policies. Phase 1 = read-only catalogue. Phase 2 = full CRUD with deploy workflow.

Key features: rules catalogue (20 Drools + 12 OPA), rule detail editor (form-based, no raw DRL), reference data manager (11 files), publish workflow (draft → review → publish via `/api/rules/reload`), rule test simulator.

The `/api/rules/reload` contract (from Preety's query):
```json
{
  "reload_type": "DROOLS",
  "git_commit_sha": "abc123...",
  "gcs_source_path": "gs://openvisa-dis-rules-{env}/drools/active/skilled_worker/",
  "rule_files_changed": ["salary_rules.drl"],
  "triggered_by": "ams-rules-manager",
  "deployment_id": "deploy-uuid",
  "archive_path": "gs://openvisa-dis-rules-{env}/drools/archive/{timestamp}/"
}
```

### 10.2 Reference Data Manager (`/dashboard/reference-data/`)

Browse and edit the 11 reference data files. Inline editing, CSV bulk upload, schema validation, version control (Git → GCS), effective dating for scheduled changes.

### 10.3 External API Manager (`/dashboard/api-gateway/`)

Monitor 6 external APIs. Health dashboard, response latency, mock/live toggle, retry/fallback config, API test console.

---

## 11. Hermes — Confluence Sync Agent

### Purpose

Deloitte's technical documentation on Confluence changes daily — Drools rules get updated, BigQuery schemas evolve, API specs are revised, extraction schemas shift. Today we manually read Confluence and diff against our spec. That doesn't scale.

**Hermes** is an automated Confluence sync agent that monitors the DIS Delivery space on Confluence and reports changes back to this repo, so we always have up-to-date intelligence as we build.

### Name: Hermes

Named after the Greek messenger god — carries information between worlds (Confluence → this repo). Also the Roman Mercury, patron of communication and commerce.

### What Hermes does

1. **Watches Confluence pages** — monitors a defined list of pages in the DIS Delivery (DD) space for edits
2. **Detects changes** — compares current page content against the last-known snapshot stored in this repo
3. **Generates a diff report** — summarises what changed, who changed it, when, and what it might affect
4. **Commits the report** to `docs/hermes/` in the ams-official repo
5. **Flags impact** — cross-references changes against our TypeScript types, V4 spec, and build log to identify potential code impacts

### Pages Hermes watches

| Page | ID | What it contains | Impact area |
|------|----|-----------------|-------------|
| Query Response Log | 3571713 | Q1-Q40+ all Q&A with Deloitte | Any spec section |
| Canonical Extraction Schema | 27328513 | Per-doc field schemas | `extraction.ts`, Panel 3 |
| Drools & OPA Rules Engine | 26673153 | 20 rules + 12 policies | `dis.ts`, Panel 2 |
| External API Checks | 27197443 | 6 API specs | Panel 3, Verification Hub |
| Document Extraction & Classification | 27230212 | Extraction architecture hub | `extraction.ts` |
| Data Extraction Strategy (Ranita) | 13402113 | Fraud signals, processing tiers | `dis.ts` fraud types |
| Decision Callback Payload Spec | 4817079 | Callback JSON shape | `DISDecisionCallback` type |
| Decision Map v1.1 | 22446098 | Rule-to-doc mappings | Panel 2 stage mappings |
| Application Data Taxonomy | 15663108 | 3-field tuple model | Document type enums |
| CoS Pipeline README | 16809998 | CoS data flow | Sponsorship rules |
| Anti-Abuse Strategy | 26312707 | OPA-S04 phased plan | OPA soft policies |
| DevOps & Infrastructure | 26640432 | Terraform, KMS, CI/CD | Admin modules |
| PostgreSQL Schema | 30048272 | DDL v13 (signed off 17 Apr) | All types |
| Repository Structure | 3801090 | GitHub org, access plan | DevOps |
| Technical Reference (hub) | 26640385 | Index of all tech docs | Navigation |

### Output format

Each Hermes run produces a report at `docs/hermes/YYYY-MM-DD-hermes-report.md`:

```markdown
# Hermes Report — {date}

## Pages changed since last run

### {Page title} (page {id})
- **Last modified:** {date} by {author}
- **Previous snapshot:** {date}
- **Summary of changes:** {diff summary}
- **Potential code impact:**
  - `src/api-contracts/dis.ts` — {specific type/field affected}
  - `src/types/extraction.ts` — {specific interface affected}
  - V4 spec Section {n} — {what might need updating}
- **Action required:** REVIEW / UPDATE_TYPES / NO_ACTION

## Pages unchanged
{list of watched pages with no edits}

## New pages detected
{any new pages in the DD space not on the watch list}
```

### Implementation

**Phase 1 (manual trigger):**
Hermes runs as a CLI script (`scripts/hermes.ts`) that:
1. Authenticates to Confluence via the Atlassian MCP
2. Reads each watched page
3. Compares against snapshots in `docs/hermes/snapshots/`
4. Generates the diff report
5. Updates snapshots
6. Commits to the repo

Triggered manually: `npx tsx scripts/hermes.ts`

**Phase 2 (automated):**
Hermes runs on a schedule (daily, or on Confluence webhook trigger):
- GitHub Actions cron job (daily 8am UK time)
- Or: Confluence webhook → Cloud Function → Hermes script
- Posts a Slack notification to `#dis-engineering` when changes are detected
- Creates a GitHub issue if code impact is detected

### Snapshots

Hermes stores page snapshots in `docs/hermes/snapshots/{page_id}.md` — the full markdown content of each page at last check. This enables:
- Precise diffs (not just "page changed" but "these specific fields changed")
- Offline reference (the team can read Confluence content without Confluence access)
- Historical tracking (git log on snapshot files shows when each page was last updated)

### Why Hermes matters

The V1.0 → V1.2 canonical schema incident (25 anomalies discovered because the schema changed without notification) is exactly the kind of problem Hermes prevents. If Hermes had been running, it would have flagged the change the day Ranita/Preety updated the page, and we'd have caught it before building against stale types.

---

## 12. Observability & QA

### 12.1 Datadog Integration

We partner with Datadog. All UI components must be instrumented from the start:

| Layer | What | How |
|-------|------|-----|
| **RUM** (Real User Monitoring) | Page load times, interaction latency, error rates | `@datadog/browser-rum` SDK in `_app.tsx` |
| **APM** (Application Performance Monitoring) | Backend API call traces | `dd-trace` in API routes |
| **Log Management** | Structured logs from every UI action | `@datadog/browser-logs` |
| **Dashboards** | Officer productivity, queue depth, processing times | Pre-built in Datadog |

### 12.2 AI-Agentic QA Readiness

All interactive UI elements must have `data-testid` attributes for automated testing:

```tsx
// Every interactive element gets a testid
<Button data-testid="panel-1-expand-reasoning" onClick={...}>
  View Full Reasoning
</Button>

<Badge data-testid="decision-badge" variant={...}>
  {decision.outcome}
</Badge>

<AccordionTrigger data-testid="stage-2-suitability-trigger">
  Stage 2 — Suitability
</AccordionTrigger>
```

**Naming convention:** `{component}-{element}-{action}` — e.g., `glass-box-rule-w03-evidence-link`, `evidence-worldcheck-expand`, `audit-trail-filter-overrides`.

**State inspection endpoints** (debug only, disabled in production):
- `GET /api/debug/reviewer-state/{applicationId}` — current UI state for automated verification
- `GET /api/debug/dis-view/{applicationId}` — the `DISApplicationView` the page is rendering

**Deterministic seeding:** All mock data generators support seed parameter for reproducible test runs. `mockDISApplicationView` is already deterministic.

### 12.3 `triggered_by` Pattern

Every admin action includes provenance metadata:

```typescript
interface TriggeredByContext {
  triggered_by: 'officer-dashboard' | 'ams-rules-manager' | 'ams-reference-data-manager' | 'ams-api-manager' | 'github-actions' | 'hermes-agent'
  triggered_by_user: string    // officer/admin UUID
  triggered_at: string         // ISO 8601
  session_id: string           // browser session UUID
}
```

This is attached to: audit trail events, rule reload requests, reference data updates, API toggle actions, and Hermes sync reports.

---

## 13. Implementation Plan (Revised)

### Phase 2A — Officer Dashboard (3 panels + existing accordion)

| Task | Description | SCRUM |
|------|-------------|-------|
| 2.0 | ✅ DONE — Replace `AIScanResult` → `DISApplicationView` type swap | SCRUM-63 |
| 2.1 | **Panel 1 — DecisionSummaryPanel:** Decision badge, overall score, reasoning letter, statutory basis, appeal risk. Reads from `disView.llm_summary` (Phase 1) or structured Praxia format (Phase 2). Open by default. | SCRUM-63 |
| 2.2 | **Panel 2 — GlassBoxTracePanel:** 5-stage rule trace (Validity → Suitability → Eligibility → Compliance → Soft Flags). Summary bar. Per-rule: ID, name, result, detail, severity, evidence link. Collapsed by default. | SCRUM-64 |
| 2.3 | **Panel 3A — External API cards:** 6 cards with status badge, key response fields, response time. | SCRUM-64 |
| 2.4 | **Panel 3B — Document extraction cards:** Per-doc card with extraction method badge, confidence, fraud score (5-level), fraud signal breakdown (score + weight + flags), normalised field values. | SCRUM-64 |
| 2.5 | **Cross-panel linking:** Click a rule in Panel 2 → scroll Panel 3 to the evidence. Click a document in Panel 3 → scroll accordion to that document section. | SCRUM-64 |
| 2.6 | **Audit Trail Panel:** Dual-stream (DIS + officer). `triggered_by` on all events. Vertical timeline, filterable. | SCRUM-64 |
| 2.7 | **SectionCard DIS integration:** Each accordion section shows which rules apply + extraction confidence for docs in that section. Backlinks to Panel 2. | SCRUM-63 |
| 2.8 | **ApplicationHeader DIS badges:** `source_channel`, `dis_application_id`, lifecycle status. | SCRUM-63 |
| 2.9 | **ApproveDialog + RejectDialog:** Capture decision rationale for audit trail. `triggered_by` context. | SCRUM-63 |
| 2.10 | **`data-testid` on all interactive elements** across Panels 1-3 + accordion + footer + dialogs. | SCRUM-63 |

**Parked until Deloitte sign-off (per-doc field dependent):**

| Task | Description | Blocker |
|------|-------------|---------|
| 2.P1 | Document Extraction Viewer — typed field table per document | Canonical Schema sign-off |
| 2.P2 | Fraud Detail Modal — per-signal score + weight side by side | Fraud weight model sign-off |
| 2.P3 | Cross-Document Consistency View — field-by-field comparison | normalised_fields sign-off |
| 2.P4 | Mock DIS data transformer — realistic fixtures from 100 synthetic apps | Test fixture delivery |

### Phase 2B — Rules Management UI Prototype

| Task | Description |
|------|-------------|
| 2.11 | Rules catalogue — 20 Drools + 12 OPA in sortable/filterable table |
| 2.12 | Rule detail view — plain-English description, conditions, inputs, reference data, threshold values |
| 2.13 | Reference data viewer — browse 11 files with search/filter |
| 2.14 | Rule test simulator — run a rule against sample payload, see PASS/FAIL |
| 2.15 | Publish workflow mock — draft → review → publish UX (no backend) |

### Phase 2C — Verification Hub (existing page enhancements)

| Task | Description |
|------|-------------|
| 2.16 | Align `mockSystems.ts` with DIS `ExternalCheckResult` shape |
| 2.17 | "DIS already ran this" indicator per check |
| 2.18 | Deep-link from Panel 2 rule → Verification Hub with applicant pre-filled |
| 2.19 | Log manual re-checks to Audit Trail (`verification.rerun` event) |
| 2.20 | Mark non-DIS systems (Education, Criminal, Social Media) as "Officer-only" |

### Phase 2D — API Gateway Admin Prototype

| Task | Description |
|------|-------------|
| 2.21 | API overview — 6 cards with status, latency, mock/live indicator |
| 2.22 | API detail — schemas, recent requests, timeout/retry config |
| 2.23 | Mock/live toggle with impact confirmation dialog |
| 2.24 | Health monitoring — which rules break if an API is down |
| 2.25 | API test console — send test request, see raw response |

### Phase 2E — Hermes (Confluence Sync Agent)

| Task | Description |
|------|-------------|
| 2.26 | Hermes CLI script (`scripts/hermes.ts`) — read watched pages, compare snapshots, generate diff report |
| 2.27 | Snapshot storage (`docs/hermes/snapshots/`) — one `.md` per watched page |
| 2.28 | Impact detection — cross-reference page diffs against TypeScript types and V4 spec sections |
| 2.29 | Report format (`docs/hermes/YYYY-MM-DD-hermes-report.md`) with action-required flags |
| 2.30 | Phase 2: GitHub Actions cron job (daily 8am UK) + Slack notification to #dis-engineering |

### Phase 3 — Live DIS Integration

| Task | Description | SCRUM |
|------|-------------|-------|
| 3.1 | VK Backend: DIS submission service | SCRUM-65 |
| 3.2 | VK Backend: Webhook handler (`POST /api/webhooks/dis-decision`) | SCRUM-65 |
| 3.3 | Push notifications for decision received | SCRUM-65 |
| 3.4 | AMS: DIS API data provider (replace JSON file provider + mock data) | SCRUM-65 |
| 3.5 | Officer decision write path (approve/reject/escalate → DIS) | SCRUM-65 |
| 3.6 | Clerk auth integration with DIS webhook signature verification | SCRUM-65 |

### Phase 4 — Platform Features

| Task | Description |
|------|-------------|
| 4.1 | RBAC with clearance-gated views (CTC, SC, DV) |
| 4.2 | Rules Manager — production (evolve Phase 2B: real GCS backend, hot-reload, audit trail) |
| 4.3 | API Gateway — production (evolve Phase 2D: real Cloud Monitoring, circuit breakers, cost tracking) |
| 4.4 | Structured Praxia-format decision letter (replace flat `llm_summary` in Panel 1) |
| 4.5 | Bulk review workflows (batch approve/reject) |
| 4.6 | Annotation tools (officer annotates documents/fields) |
| 4.7 | Case assignment and workload balancing |
| 4.8 | SLA tracking (processing time targets) |
| 4.9 | BigQuery analytics dashboards |
| 4.10 | Multi-visa form definitions (Student, Global Talent, Family) |

---

## 14. Source Documents

| Document | Location | Relevance |
|----------|----------|-----------|
| V4 spec (this document) | `docs/specs/2026-05-02-dis-integration-spec-v4.md` | Single source of truth for dashboard architecture |
| V3 spec (types, rules, OPA, extraction) | `docs/specs/historical/2026-04-12-dis-integration-spec-v3.md` | Archived 12 June — types/contracts superseded by V5 §8 |
| Agent Handover | `docs/devdocs/DIS-alignment-docs/AMS_DASHBOARD_AGENT_HANDOVER.md` | Build priorities, admin modules, Datadog, QA hooks |
| Canonical Extraction Schema V1.2 | `docs/devdocs/Canonical Document Extraction Schema.md` | Per-doc field schemas |
| Build log | `docs/specs/build-log.md` | Task-by-task implementation state |
| Deloitte sign-off request | `docs/specs/deloitte-signoff-request-2026-04-15.md` | 6 artifact tracker |
| Progress log | `docs/specs/progress.md` | Spec revision history |
| Praxia gold examples (UK SW) | `openvisa-synthetic-data/output/praxia/gold/skilled_worker/` | Target format for Panel 1 + Panel 2 glass_box_decision |
| Praxia gold examples (Germany) | `openvisa-synthetic-data/output/praxia/gold/germany_skilled/` | Multi-jurisdiction reference |
| 100 JSON payloads | `openvisa-synthetic-data/output/json_payloads/` | DIS input payloads for mock data generation |
| Expected outcomes | `openvisa-synthetic-data/output/json_payloads/expected_outcomes.json` | Validation key for DIS pipeline (42 APPROVED, 38 REJECTED, 20 MANUAL_REVIEW) |
| Caseworker reasoning docs | `openvisa-synthetic-data/docs/caseworker-reasoning/` | Officer perspective for UX decisions |
| PostgreSQL schema v13 | Confluence page 30048272 | Signed-off DDL (17 April) — pull via Hermes |

---

*V4 is the single source of truth for the AMS officer dashboard moving forward. V3 remains authoritative for TypeScript types, Drools/OPA rule definitions, extraction schemas, and the Phase 1 type alignment work. When in doubt, V4 wins on dashboard UX; V3 wins on data contracts.*
