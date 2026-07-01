# Officer Dashboard — Build Brief

> **⚠️ SUPERSEDED — historical record only (archived 12 June 2026).**
> The read API surface is now defined by **V5 §6**
> (`docs/specs/2026-06-11-dis-integration-spec-v5.md`); dashboard UX authority
> remains V4. This brief's 7-endpoint surface was documented intent that never
> matched as-built (see `docs/specs/dis-api-route-audit-2026-06-11.md`) — though
> its `APPROVE`/`MANUAL_REVIEW` vocabulary and status-poll endpoint were later
> validated by Deloitte's 12 June push. Do not build against this document.

You are building the Officer Dashboard for DIS (Decision Intelligence System), 
Open Visa's Phase 1 GovTech platform. This is the caseworker review UI. The Glass 
Box explainability is the core differentiator — every recommendation must be fully 
traceable to the rules, policies, and evidence behind it.

## CRITICAL LANGUAGE RULE
DIS produces RECOMMENDATIONS, never decisions. The caseworker makes the final 
decision. Use "recommendation" everywhere in UI copy, variable names, and comments 
for DIS output. The only place "decision" appears is the caseworker's own final 
action (the POST /decision endpoint).

## STEP 0 — GROUND TRUTH FIRST (do this before writing any UI)
Do not build against assumptions. Read the actual contracts:
1. Read the dis-api repo. Enumerate the ACTUAL routes and their response JSON 
   shapes. The documented intent (below) may differ from as-built — the repo wins.
2. Cross-check against the SCRUM-17 OpenAPI spec.
3. Produce a short ROUTES.md mapping each documented endpoint below to the actual 
   path + response shape you found. Flag every mismatch. Stop and surface 
   discrepancies before proceeding.

## DOCUMENTED API SURFACE (intent — verify against repo)
GET  /api/v1/applications                      — queue list (filter + pagination)
GET  /api/v1/applications/{id}                 — full detail
GET  /api/v1/applications/{id}/status          — processing status poll
GET  /api/v1/applications/{id}/recommendation  — recommendation + component scores + trail
GET  /api/v1/applications/{id}/documents       — docs + extraction + fraud signals
GET  /api/v1/applications/{id}/external-checks  — 6 external check results
POST /api/v1/applications/{id}/decision        — caseworker final decision + mandatory reason

## ARCHITECTURE
Build a mock API layer that matches the EXACT response shapes found in dis-api, so 
swapping mock → live is a config flip, not a rewrite. Front end never talks to mock 
shapes that differ from the real API.

## DATA SHAPES TO RENDER
Recommendation values (Phase 1): APPROVE, MANUAL_REVIEW. (REJECT maps to 
MANUAL_REVIEW in Phase 1 — display accordingly.)

Application statuses: CREATED, PROCESSING, RULES_EVALUATING, MANUAL_REVIEW, 
APPROVED, REJECTED, WITHDRAWN, EXPIRED, COMPLETED.

9 Component Scores (each 0–100, higher=better, status-labelled). Render as the 
at-a-glance applicant summary:
1. Passport (VALID/REVIEW_REQUIRED/INVALID)
2. Financial (SUFFICIENT/REVIEW_REQUIRED/INSUFFICIENT)
3. Employment (VERIFIED/REVIEW_REQUIRED/UNVERIFIED) — CoS is structured input, conf always 1.0
4. English Language (MET/REVIEW_REQUIRED/NOT_MET)
5. Immigration Compliance (COMPLIANT/REVIEW_REQUIRED/NON_COMPLIANT) — hard-fail component
6. Criminal Record (CLEAR/REVIEW_REQUIRED/FLAGGED)
7. Health (MET/REVIEW_REQUIRED/NOT_MET — can be NOT_APPLICABLE/null, exclude from flags)
8. Document Quality (HIGH_QUALITY/ACCEPTABLE/LOW_QUALITY) — meta-score, not about applicant
9. Fraud Risk (LOW_RISK/MEDIUM_RISK/HIGH_RISK) — inverted internally: score=(1−fraud)×100
Status thresholds: ≥85 good band, 60–84 review, <60 bad band.
null = NOT_APPLICABLE — render as N/A, must NOT trigger "any component <70" soft flag.

Completeness Score (pre-processing): 0–100. >91 COMPLETE, 70–90 INCOMPLETE_PENDING, 
<70 DOCUMENTS_REQUIRED. Passport is a hard gate (absent = cannot begin regardless of score).

6 External Checks (render each with risk_level + check_status + per-check recommendation):
World-Check (LIVE), Interpol (mock), Passport Verification (mock), Border Control (mock), 
Device & IP Risk (mock, VisaKey only), Email & Phone Reputation (mock).
- risk_level: HIGH/MEDIUM/LOW · check_status: CLEAR/FLAGGED/BLOCKED/ERROR/TIMEOUT
- Aggregation: any BLOCKED/FLAGGED/ERROR → MANUAL_REVIEW; all CLEAR → APPROVE.

Decision Trail (Glass Box — the key view):
- Each Drools rule (RULE-U01–U05, W01–W15): MANDATORY/ADVISORY severity, 
  SATISFIED/NOT_SATISFIED/REVIEW_REQUIRED/BLOCKED status.
- Each OPA policy (OPA-H01–H06 hard, S01–S06 soft): HARD/SOFT, ALLOW/DENY.
- Evaluation order: P1 hard-fail → REJECT(→MANUAL_REVIEW P1); P2 soft-flag → 
  MANUAL_REVIEW; P3 all clear → APPROVE. No short-circuit — ALL conditions 
  evaluated and shown for the audit trail.

## VIEWS (build in this priority order)
1. Application Queue — pending review; filter by status, priority, visa type.
2. Application Detail — applicant info, documents, extraction, external checks.
3. Glass Box Decision Trail — every rule, every OPA policy, every external check, 
   with confidence + evidence links. THE differentiator. Build this carefully.
4. Document Viewer — side-by-side original image + extracted fields + fraud signals.
5. Recommendation Panel — shows DIS recommendation (APPROVE/MANUAL_REVIEW); 
   caseworker makes FINAL decision via POST /decision with mandatory reason.

## BUILD PRINCIPLES
- Channel-aware: VISAKEY vs GOV_DIRECT differ (biometrics, some fields). Some 
  components return NOT_APPLICABLE for GOV_DIRECT (e.g. RULE-U02 biometric).
- Add `triggered_by` field on any UI-triggered backend action ("officer-dashboard").
- Instrument Datadog RUM/APM from the start (OTel SDK only — no dd-trace; EU1 region).
- Add test hooks / data-* attributes for AI-agentic QA; deterministic synthetic seeding.
- Channel/status/risk colour coding must be accessible (not colour-alone signalling).

## SEQUENCE
1. Read dis-api → ROUTES.md → mock layer matching exact shapes. SURFACE MISMATCHES.
2. Application Queue + Detail against the mock layer.
3. Glass Box Decision Trail.
4. Document Viewer + Recommendation Panel.
5. Wire Datadog RUM; add test hooks.

Start with Step 0. Do not write UI until ROUTES.md exists and mismatches are flagged.