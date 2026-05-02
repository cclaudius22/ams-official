# Deloitte Sign-Off Request — AMS Dashboard Build Prerequisites

**Date sent:** 2026-04-15
**Sender:** Chris Claudius (OV)
**Deadline requested:** EOD Monday (next business day after 2026-04-15)
**Status:** 🟡 SENT — awaiting response
**Blocks:** AMS Phase 2 build start (specifically tasks 2.5, 2.7, 2.8, 2.16 — per-doc field-dependent components)
**Reference context:** V1.2 Canonical Schema surfaced 25 anomalies in a single morning (2026-04-14). Chris decision: require formal sign-off before Phase 2 commits to per-doc UI components.

---

## Email as sent

> **Subject:** DIS Integration — 6 sign-off artifacts required before AMS dashboard build
>
> Team,
>
> Open Visa is ready to begin the AMS officer dashboard build. Before we can proceed without risk of rework, we need the following 6 artifacts signed off:
>
> **1. Canonical Document Extraction Schema — frozen**
> Owner: Ranita + Preety
> Written confirmation that V1.2 (or V1.3 if further revisions land) exactly matches the implemented Custom Extractor labels and the document_extractions table structure. Page locked against silent edits.
>
> **2. PostgreSQL DDL — 4 tables (resolves Q32)**
> Owner: Preety
> CREATE TABLE statements for document_extractions, rule_results, opa_results, external_checks — column types, nullability, indexes, FK constraints, and JSONB column shape documentation.
>
> **3. OpenAPI 3.0 spec for DIS API (resolves SCRUM-17)**
> Owner: Preety
> Full spec for DIS ingestion, application read endpoints, decision write-back, and callback webhook, with error responses.
>
> **4. End-to-end test fixtures**
> Owner: Ranita + Preety
> 3 decision callback JSONs (APPROVED / MANUAL_REVIEW / REJECTED), 1 complete extraction row per document type, sample rule/OPA/external check rows from actual pipeline output.
>
> **5. Decision thresholds + component score weighting**
> Owner: Ranita + Preety
> Exact threshold values for each outcome, weighting formula for overall_score, confirmation of fraud weight model per Canonical Schema V1.2 Section 1.
>
> **6. Error + retry contract**
> Owner: Neeraj + Vidhyotha
> Behaviour spec for DIS unavailability, external API timeouts, callback retry semantics, webhook signature verification, rate limits.
>
> Also outstanding: DecisionDraft V2 (punch list posted 6 April).
>
> Once these 6 are confirmed, we estimate the AMS dashboard build at 10–14 days. Please confirm by EOD Monday what you can commit to and by when.
>
> Thanks,
> Chris

---

## Owner changes from initial draft (2026-04-15)

Chris corrected ownership on 2 items before sending — noted here because it shifts who to chase for each deliverable:

| Item | Initial draft owner | Final sent owner | Notes |
|------|---------------------|------------------|-------|
| 3 — OpenAPI 3.0 spec | Neeraj | **Preety** | SCRUM-17 ownership reassigned |
| 5 — Decision thresholds + weighting | Neeraj | **Ranita + Preety** | Joint ownership with extraction team |

Items 1, 2, 4, 6 unchanged from draft.

---

## Response tracker

Fill in responses as they arrive. One row per artifact.

| # | Artifact | Owner | Status | Response date | Commitment date | Notes |
|---|----------|-------|--------|---------------|-----------------|-------|
| 1 | Canonical Schema frozen | Ranita + Preety | 🟡 AWAITING | — | — | — |
| 2 | PostgreSQL DDL | Preety | 🟡 AWAITING | — | — | Tracked as Q32 |
| 3 | OpenAPI 3.0 spec | Preety | 🟡 AWAITING | — | — | Tracked as SCRUM-17 |
| 4 | End-to-end test fixtures | Ranita + Preety | 🟡 AWAITING | — | — | — |
| 5 | Thresholds + score weighting | Ranita + Preety | 🟡 AWAITING | — | — | Raised 23 March |
| 6 | Error + retry contract | Neeraj + Vidhyotha | 🟡 AWAITING | — | — | — |

**Also outstanding (referenced but not in the 6):**
- DecisionDraft V2 — punch list posted 6 April
- 7 extraction schema corrections — posted 1 April against Preety's extraction schema page

**Status legend:** 🟡 AWAITING / 🟢 DELIVERED / 🔴 REJECTED / ⚠️ PARTIAL / ❌ MISSED DEADLINE

---

## Minimum viable sign-off

Not all 6 items block equally. Internal assessment (Chris + Claude, 2026-04-15):

**Critical (blocks Phase 2 per-doc work):**
- Item 1 — Canonical Schema frozen
- Item 2 — PostgreSQL DDL
- Item 4 — Real test fixtures

**Delivering just items 1, 2, and 4 = ~85% of rework risk eliminated.** The remaining 3 items matter but don't affect the per-document field shapes that bit us on 2026-04-14.

**Important but not blocking Phase 2 UI work:**
- Item 3 — OpenAPI spec (Phase 3 blocker, not Phase 2)
- Item 5 — Thresholds + weights (AMS displays what DIS sends; only Audit Trail override detection really needs these)
- Item 6 — Error + retry contract (affects error states but not field shapes)

---

## What happens while waiting

**Phase 2 strategy until sign-off arrives:**

Build only the **schema-independent tasks** (Option B from 2026-04-15 discussion):

**Proceed with:**
- 2.0 — Replace `AIScanResult` → `DISApplicationView` (type swap)
- 2.1 — Component Scores Dashboard (9 cards)
- 2.2-2.4 — Glass-Box Trail (Drools + OPA Hard + OPA Soft)
- 2.6 — External Checks Panel
- 2.9 — LLM Summary Panel
- 2.10 — Duplicate Application Comparison
- 2.11 — Completeness Widget
- 2.12 — Audit Trail Panel
- 2.13-2.15 — SectionCard extensions, ApplicationHeader badges, Approve/Reject rationale capture
- 2.17-2.21 — Rules Management UI Prototype (2B)
- 2.22-2.26 — Verification Hub enhancements (2C)
- 2.27-2.31 — API Gateway Admin Prototype (2D)

**Park until sign-off:**
- 2.5 — Document Extraction Viewer (reads per-doc fields)
- 2.7 — Fraud Detail View (reads per-doc fraud signals)
- 2.8 — Cross-Document Consistency View (partially reads normalised_fields)
- 2.16 — Mock DIS data transformer (needs final fixture shapes)

**Coverage: 28 of 31 Phase 2 tasks can proceed with zero rework risk.**

---

## Escalation path if no response by Monday EOD

1. **Tuesday AM:** chase directly with Neeraj on Slack + email
2. **Tuesday PM:** if still no commitment on items 1, 2, 4 — escalate to Deloitte India engagement manager
3. **Wednesday:** decide between (a) proceeding with Option B only, (b) expanding to Option C (build everything with mock data, accept rework risk)
4. **End of week:** if no movement, consider a joint Open Visa / Deloitte working session to unblock

---

_Log this file alongside `progress.md` and `build-log.md` as part of the spec folder. Update the status table as responses come in._
