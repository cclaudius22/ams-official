# AMS Official — Session Log

**Purpose:** If the IDE crashes or we start a fresh chat, read this file first. It tells you exactly where we left off, what's been built, what's next, and where all the context lives.

---

## Last session: 16 June 2026

**Model note:** Fable 5 (the 12th's model) is unavailable; now on Opus 4.8. Session began strategy/comms only, then resumed the 2F.3 build under ultracode — see "16 June (cont.)" below.

### Nishit's read-API spec received

PDF: `docs/cc-notes/Open Visa Mail - RE_ Subject_ Read API Endpoints — Two Asks for the 17th.pdf`. Deloitte **accepted the 5-endpoint granular shape** (a real shift — not just the monolith), but gave **no response schemas**, the **queue endpoint is functionally wrong**, and the "Suggested Approach" still lobbies for the consolidated `/applications/{id}/status` (Neeraj's existing Status API).

Diff vs V5 §6:

| Their endpoint | §6 | Gap |
|---|---|---|
| `GET /applications/status?startDateTime=&endDateTime=` | #1 queue | **Won't drive the queue** — date filter only, no pagination/visa_type; and `applications.status` is the completeness verdict, NOT the decision (V5 §4), so the queue must join `recommendations` and filter `outcome='MANUAL_REVIEW'` |
| `GET /app_decision/{id}/details` | #2 detail | response shape unknown; "decision" vs recommendation naming (minor) |
| `GET /rules_evaluations/{id}/details` | #3 trail | must include `opa_evaluations.denial_reasons` (callback omits it) |
| `GET /doc_processing/{id}/details` | #4 documents | must mint GCS signed URLs, not just `gcs_path` |
| `GET /external_checks/{id}/details` | #5 ext checks | shape unknown; expect 7 types incl. SPONSOR_VERIFICATION |

Cross-cutting: no response column at all; app id specified 3× (path `{id}` + `X-RequestID` header + GET body — GET-with-body anti-pattern); date format `DD-MM-YYYY` contradicts their own `TIMESTAMPTZ`/ISO-8601 storage.

### Done

- Vetted Chris's reply draft. Corrected the posture (not "blocked/guessing" → building against the schema in parallel); added the queue-endpoint defect as its own point. Reply redraft saved at `docs/cc-notes/2026-06-16-read-api-reply-draft.md`.
- X-RequestID: confirmed Chris's "duplication" read was correct once the spec showed `X-RequestID: <application_id>` (CC had earlier mis-advised it was standard tracing).

### What's next

1. Send the reply (response schemas = gating ask).
2. Tuesday 17th: WBS review (Isabela) + Deloitte's delivery dates.
3. Resume build: **2F.3** (5 read endpoints over the replica) → **2F.4** provider flip → **Panel 3** (2.3/2.4).
4. Still open: access asks to DevOps (sent 12th); engineering defects OPEN-9/11/12 to Preety/Satyarth.
5. **Date check:** PDF says WBS covers work "through 26 June"; pivot notes say engagement end 30 June — confirm which is which before quoting either externally.

### 16 June (cont.) — Build resumed under ultracode: 2F.3 + 2F.4 plan

**Effort:** ultracode (Opus 4.8, xhigh + workflow orchestration). Code work now starting.

**Understand sweep** (workflow `understand-2f3-read-layer`, 5 parallel readers + synthesis). Raw output at `<session transcript>/tasks/w194fne7i.output`. Headline: the build-log oversells what exists — **no DIS provider, no DIS route, no replica-read code exist anywhere.** The only producer of `DISApplicationView` is the static fixture `src/lib/mockDISData.ts`, imported directly by the reviewer page. But the consumer seam is uniform: both panels + the legacy adapter depend only on the `DISApplicationView` type (`src/api-contracts/dis.ts:618`) — hit that type and everything downstream works.

**Scope decision (Chris):** full pass = **2F.3 read layer + 2F.4 page wiring in one go.** Mock stays the provider default + page fallback so the demo never goes blank; flipping to replica data is a one-env-var change.

**Build plan (infra → provider → 5 endpoints → wire page → tests):**
1. `src/lib/disDb.ts` — singleton `pg.Pool` + new `DIS_REPLICA_URL` env (default `postgres://dis:dis@localhost:5499/openvisa_pg_db`); mirror the `globalForPrisma` hot-reload guard in `src/lib/db.ts`.
2. `src/data/dis-providers/` — fresh `DISDataProvider` interface + `getDISProvider()` switching on `DIS_DATA_PROVIDER` (`mock`|`replica`|later `deloitte`); `MockDISProvider` first, then `ReplicaDISProvider` (SQL + wire→view assembly + `deriveQueueState()`). Mirrors `src/data/providers/index.ts:102`.
3. Five V5 §6 endpoints under `/api/dis/*`, keyed on **`source_application_id`** (e.g. `VK-2024-1835` — the id the page holds, NOT the DIS UUID): E1 `/applications` (queue list, derived `queue_state`, paginated), E2 `/{id}`, E3 `/{id}/trail` (reads the `opa_evaluations`/`drools_evaluations` TABLES so `denial_reasons` reach Panel 2), E4 `/{id}/documents`, E5 `/{id}/external-checks`.
4. Wire `src/app/dashboard/reviewer/[applicationId]/page.tsx` to fetch the assembled view; mock = initial-state fallback.
5. Tests — mock-provider unit + route-envelope; replica integration self-skips when `:5499` unreachable (CI green without docker).

**Decisions taken:** raw `pg.Pool` (not Prisma/ORM — Deloitte owns the schema, throwaway replica); fresh DIS provider (do NOT touch the queue/officer `ApplicationDataProvider` or `disViewAdapter`); new `/api/dis/*` namespace; new `DISQueueRow` type for E1 (both existing `LiveApplication` defs bind raw `ApplicationStatus`, violating the V5 §4 derived-`queue_state` rule); **GCS signed URLs stubbed, deferred to 2F.5** (no `@google-cloud/storage` dep, no real objects behind seeded paths, KMS/GCS access ask still outstanding — isolate behind one `signUrl()`); `normalizeOutcome` to tolerate both `APPROVE` (table) and `APPROVED` (spec sample — spec is internally inconsistent).

**Data caveats (empty ≠ bug):** `denial_reasons` only on 2 flagged OPA policies; `confidence` always NULL; no FAILED/RETRYING callbacks; `REJECT` never seeded (folded into MANUAL_REVIEW); nationality padded `GBX`-style; rich `component_scores`/`evaluation_breakdown` live in `recommendations.submission_payload` JSONB, not the flat column.

**Grounding state at this checkpoint:** docker replica **DOWN** (port 5499 closed); corpus present at `../openvisa-synthetic-data/output/json_payloads`; `pg`+`tsx` available; no `DIS_*` env vars yet.

**RESUME HERE:**
1. Bring up + seed replica: `cd db && ./build-initdb.sh && docker compose up -d && npx tsx ../scripts/seedReplica.ts --reset`
2. Inspect real row + JSONB shapes, then implement foundation (`dis.ts` types, `disDb.ts`, provider+mock, `queueState`) → 5 endpoints → wire page → tests.
3. Then run the adversarial review workflow.

**Note:** `docs/specs/build-log.md` "Current position" is stale (still says Phase 1 / Phase 2 not started) — refresh it when the 2F.3/2F.4 work commits.

### 16 June (cont. 2) — 🚩 PIT STOP: 2F.3 read layer complete + verified

**The five V5 §6 read endpoints are built over the replica behind the provider seam, and verified end-to-end.** Page wiring (2F.4) is the next step, deliberately held for a check-in — everything so far is additive/isolated and does NOT touch the demo path (reviewer page still renders mock).

**Shipped (all new/additive):**
- `src/lib/disDb.ts` — `pg.Pool` singleton over `DIS_REPLICA_URL` (default `:5499`).
- `src/data/dis-providers/` — `DISDataProvider` interface + `getDISProvider()` (env `DIS_DATA_PROVIDER` = `mock` default | `replica` | later `deloitte`); `MockDISProvider`, `ReplicaDISProvider`, `queueState.ts` (`deriveQueueState`), `signUrl.ts` (GCS stub), and `queries/{queue,recommendation,trail,documents,externalChecks}.ts`.
- `src/app/api/dis/applications/...` — E1 `/`, E2 `/{id}`, E3 `/{id}/trail`, E4 `/{id}/documents`, E5 `/{id}/external-checks`, + composite `/{id}/view` (what the page will fetch).
- `dis.ts` drift fix (SPONSOR_VERIFICATION + CRITICAL) + `DISQueueRow`.
- 7 test files under `src/__tests__/dis-*` (replica integration tests self-skip when `DIS_REPLICA_URL` unset).

**Verification (pre-pit-stop):** `39/39` tests pass (16 foundation + 23 replica integration, live against `:5499`); `tsc` 76 errors total = the pre-existing onboarding debt, **0 in our files**; all 6 endpoints curl'd 200 over HTTP with `DIS_DATA_PROVIDER=replica`: list total 100 / READY_FOR_REVIEW 58, detail MANUAL_REVIEW + 9 component keys, trail 20 rules/12 opa + denial_reasons, docs 11/10 + image_url, checks 7 incl SPONSOR_VERIFICATION, composite view full, unknown id → 404.

**Run the replica-backed app:** `DIS_DATA_PROVIDER=replica DIS_REPLICA_URL=postgres://dis:dis@localhost:5499/openvisa_pg_db npm run dev` (replica must be up + seeded first).

**Key real-data facts (from the live build):** no `VK-...` ids exist — visakey = UUID-shaped, govdirect = `HO-SW-2026-...`; `visa_type` stored hyphenated (`skilled-worker`) → normalized to underscore; rich `component_scores`/version arrays live in `recommendations.submission_payload` JSONB (columns are score-only / `{version:[]}`-wrapped); all 100 apps have DELIVERED callbacks → APPROVE → CALLBACK_SENT, MANUAL_REVIEW → READY_FOR_REVIEW.

**Open items for the adversarial review (next phase, not blocking the pit stop):**
1. `documents` returns a `PHOTO` doc whose `document_type` is NOT in the `DocumentType` union (12 types) — Panel 3 must handle/exclude it (like CoS).
2. `documents` query stamps extraction timestamps via SQL `::text` (non-ISO `' +00'`) while the others use `toISOString()` — normalize for consistency.
3. `llm_summary` is an honest placeholder (OV-IP Azure endpoint not wired).
4. `denial_reasons` only populated on ~4/58 MANUAL_REVIEW apps; mock fixture has 6 external checks vs replica's 7.

**RESUME HERE (after Chris's check-in):**
1. Wire `src/app/dashboard/reviewer/[applicationId]/page.tsx` → fetch `/api/dis/applications/{id}/view`, `setDisView`, keep `mockDISApplicationView` as initial-state fallback. Browser-verify Panels 1 & 2 render from replica (denial_reasons visible) for a real seeded id.
2. Run the adversarial review workflow over the read layer + apply fixes.
3. Final verification + commit.

### Parked backlog (cross-cutting — NOT part of 2F)

- **AMS dashboard auth — do AFTER task 2.15 (end of the current Phase 2 plan), before Cloud Run.** The dashboard is currently OPEN (no gate). Before it's exposed on Cloud Run (demo host prj-demo-dis-6549) it needs at least an admin login. Auth primitives already exist (`src/app/api/auth/{login,logout,me}`, `JWT_SECRET`) but don't gate the dashboard routes. Full RBAC is explicitly deferred to a later phase. Keep it a discrete task — don't entangle with the 2F read-layer work. (Chris, 16 Jun; timing updated same day from "next session" → "after 2.15".)

---

## Session: 12 June 2026 (morning)

### What happened

1. **Morning verification sweep (V5 §11): Deloitte PUSHED on deadline** — dis-api main populated (intake + dispatcher + dis-end-api Status API source), rec-engine/rules-engine/data-pipeline mains merged. Deployed env unchanged. **Read endpoints still zero** — EOD scope-confirmation deadline still open.
2. **Schema drift caught same morning** (V5 §1a delta): outcome wire vocab now `APPROVE`/`REJECT`/`MANUAL_REVIEW`; callback keys + tables renamed `drools_evaluations`/`opa_evaluations`; new `caseworker_summary` column (watch OV-IP Panel 1 boundary); new `callback_events` table; Status API contract extracted (OPEN-5 ✓); OPEN-8 new: 7 external checks expected, not 6.
3. **Task 2.0c committed** — wire types updated (`RecommendationOutcome = 'APPROVE' | 'MANUAL_REVIEW'`, callback key renames, `CallbackEvent`, `DISStatusResponse`), normalizeOutcome already absorbed both vocab eras.

### Deloitte response + strategy pivot (same day, V5 §1b)

Nishit's reply: 17 June = timelines published, not endpoints; substantive answer Monday 15 June. With WBS ending 30 June, endpoints can't be assumed in-window. **Pivot: OV builds the read layer (new Phase 2F)** — local Postgres replica from their own DDL + synthetic seed data + V5 §6 endpoints as Next route handlers behind the provider seam. Deloitte endpoints become a swap option, not a dependency. Access asks (IAM DB user, KMS, GCS) to be sent now. Chris's counter-email sent pinning delivery dates vs the 30 June WBS end and the owed 3-week UAT window.

### Afternoon (same day)

1. **Task 2.1 DONE** — `RecommendationSummaryPanel` (Panel 1): badge, derived score, statutory note, rules_summary tiles, flag chips, AI-generated case summary + disclaimer, evaluation breakdown. Browser-verified. (`e83ac38`)
2. **Task 2.2 DONE** — `GlassBoxTracePanel` (Panel 2): 5-stage trace on as-built vocab, denial_reasons rendered, N/A greyed, "Other checks" bucket so the audit trail never drops a result. Browser-verified. (`68a1142`)
3. **Housekeeping** — V1/V2/V3 specs + DB proposal + June 7 brief archived to `docs/specs/historical/` with superseded banners; build-log refreshed; `.playwright-mcp/` gitignored. (`11d16a3`, `f102e81`, `4cf8c3f`)
4. **Demo env + identity** — `prj-demo-dis-6549` is the demo/dashboard host; `sa-ov-dis-read@prj-demo-dis-6549.iam.gserviceaccount.com` created (uniqueId 118218356534822839751); 5-item access ask sent to Deloitte DevOps (Cloud SQL IAM user + in-DB SELECT grants + KMS decrypt + GCS objectViewer + network path). (`586c1b1`)
5. **Phase 2F.1+2F.2 DONE** — `db/` schema replica (Deloitte DDL @ ecd23b9, docker :5499) + `scripts/seedReplica.ts` (deterministic, 100 apps, 42 APPROVE / 58 MANUAL_REVIEW, corpus ground-truth reasoning). Findings: DDL create-set defect (OPEN-11), OPA outcome VARCHAR(10) → soft flag is `FLAG` (OPEN-4 resolved), 7th check = SPONSOR_VERIFICATION (OPEN-8 resolved), passport_number_raw code/DDL drift (OPEN-12). (`2f725b1`)
6. Confluence page 113410081 (Doc AI processor metrics) reviewed → OPEN-9/10; added to Hermes watch list.

### What's next

1. **2F.3** — the five read endpoints (V5 §6) as Next route handlers over the replica, behind the provider seam; then **2F.4** provider flip
2. **Tasks 2.3/2.4 — Panel 3 (Evidence)**: external check cards + document extraction cards (replica now provides the data)
3. **Monday 15th:** Nishit's substantive answer (ask for endpoint *contracts* alongside dates); **17th:** published timelines → V5 §10 contingency
4. **Report to Deloitte:** OPEN-11 (broken DDL create-set), OPEN-12 (passport_number_raw drift), OPEN-9 (classifier label vocab), plus chase the access asks
5. Hermes-sibling repo-diff agent — priority rising (4 schema-affecting changes in 8 days)
6. Replica note: `cd db && ./build-initdb.sh && docker compose up -d && npx tsx ../scripts/seedReplica.ts --reset`

---

## Previous session: 11 June 2026

### What happened this session

1. **Chris rejected the original thin DIS_Officer_UI_Data_Contract.md**; it was rewritten the same day as the "Full Frontend Data Contract" (V4-aligned, ownership-keyed) — useful companion, but superseded where V5 §9 corrects it
2. **Scope-gap email sent to Deloitte (Siddharth)** demanding the 5 officer-dashboard read endpoints — confirmation/contracts/dates by **EOD 12 June**, deployed-code push to main by **9:00 12 June**
3. **As-built route audit** (`docs/specs/dis-api-route-audit-2026-06-11.md`): zero read endpoints exist in spec, code, or the live env. dis-api `main`/`dev` are empty; code on `release/dev` (`945e9c9`) = intake service (1 endpoint) + doc-upload dispatcher. Live dev project `prj-dev-dis-9666` verified directly: ghost **Status API** (`cldrn-dev-dis-end-api`, deployed 10 June by Neeraj, in no repo) exposes only `GET /api/v1/applications/{id}/status`; its env is wired to ALL read tables — natural read-layer host. Live decisions table is named **`recommendations`**
4. **V5 spec written** (`docs/specs/2026-06-11-dis-integration-spec-v5.md`) — supersedes V3 + V4 §2/§8/§9 on data contracts; V4 keeps UX authority. Headline: as-built `applications.status` is CREATED → completeness verdict and never updates again — **queue state must be derived** (V5 §4). REJECTED disabled in code. Callback payload (V5 §5) is the authoritative detail shape. Six read-endpoint contracts defined ownership-neutrally (V5 §6)

### What's next

1. **Morning 12 June, before standup:** verification protocol (V5 §11) — re-audit repos + Cloud Run + Status API openapi.json; check whether Deloitte pushed
2. **Task 2.0b** — type alignment patch (V5 §8: rule/OPA renames, nullable component scores, BORDER_CONTROL, rebuild mocks + adapter)
3. **Task 2.1** — `RecommendationSummaryPanel` (renamed from DecisionSummaryPanel per language rule)
4. Deloitte response → V5 §10 contingency table

### Uncommitted at session end

V5 spec, route audit doc, rewritten contract doc, June 7 build brief (not plan-of-record), this log update. Chris commits himself — suggested message in the session transcript.

---

## Previous session: 2 May 2026

### What happened this session

1. **Recovered from a crash** — rebuilt context from memory files, Confluence (9 pages), and git history
2. **Created V3 spec** (`docs/specs/2026-04-12-dis-integration-spec-v3.md`) — fixed 10 gaps from V2, added Rules Management UI + API Gateway prototypes, Audit Trail Panel
3. **Completed Phase 1 — Type Alignment** (6 tasks, 3 commits):
   - `src/api-contracts/dis.ts` — full DIS contract (decision, 9 component scores, 20 Drools rules, 12 OPA policies, 6 external APIs, fraud signals, audit log, `DISApplicationView`)
   - `src/types/extraction.ts` — per-doc typed schemas for all 12 document types (V1.2 aligned)
   - `src/types/application.ts` — extended with `sourceChannel`, `disApplicationId`, `disView`
   - `src/lib/nationality.ts` — 90-country ISO 3166-1 converter
   - `src/lib/normalizeOutcome.ts` — 3-vocabulary decision outcome mapper (VK Backend / DIS / AMS legacy)
   - `src/types/completeness.ts` — `CompletenessConfig` + Skilled Worker config
   - `src/api-contracts/applications.ts` — renamed `ScanRecommendation` → `OfficerScanRecommendation`
4. **V1.2 Canonical Schema alignment** — 25 anomalies found and fixed across 11 of 12 doc types. `extraction.ts` full rewrite. `fraud_signals` properly typed in `dis.ts`.
5. **Phase 2A Task 2.0 — reviewer page type swap** (`src/lib/mockDISData.ts`, `src/lib/disViewAdapter.ts`, reviewer page updated)
6. **Created V4 spec** (`docs/specs/2026-05-02-dis-integration-spec-v4.md`) — 3-panel officer dashboard architecture (Decision Summary → Glass Box Rule Trace → Evidence), Hermes Confluence sync agent, Datadog/QA requirements
7. **Scrubbed internal observations** from all committed docs (no response-pattern characterisations)

### Branch state

**Branch:** `feat/dis-integration-v3` pushed to `origin`

**Commits (newest first):**

| Commit | Summary |
|--------|---------|
| (pending) | V4 spec + session log |
| `613784d` | Task 2.0 type swap + V1.2 alignment + doc scrub |
| `f32fb5b` | Phase 1 tasks 1.3-1.6 |
| `c0eebb0` | Phase 1 tasks 1.1-1.2 |
| `4690f3b` | Spec freeze (V1/V2/V3 + devdocs on main) |

### What's next

**Immediate (Phase 2A):**
- Task 2.1 — Panel 1: `DecisionSummaryPanel` component (SCRUM-63)
- Task 2.2 — Panel 2: `GlassBoxTracePanel` component (SCRUM-64)
- Task 2.3-2.4 — Panel 3: `EvidencePanel` (external APIs + doc extractions) (SCRUM-64)

**Parked (waiting on Deloitte sign-off):**
- Tasks 2.P1-P4 — per-doc field-dependent components (Document Extraction Viewer, Fraud Detail Modal, Cross-Doc Consistency, mock data transformer)
- Sign-off email drafted at `docs/specs/deloitte-signoff-request-2026-04-15.md` — Chris sending end of week

**Hermes agent (Phase 2E):**
- `scripts/hermes.ts` — Confluence sync agent, watches 15 pages in DD space

### Key files to read for context

| Priority | File | What it tells you |
|----------|------|-------------------|
| 1 | **This file** | Where we left off |
| 2 | `docs/specs/2026-05-02-dis-integration-spec-v4.md` | Single source of truth for dashboard architecture (3-panel + Hermes) |
| 3 | `docs/specs/2026-04-12-dis-integration-spec-v3.md` | Authoritative for TypeScript types, Drools/OPA, extraction schemas |
| 4 | `docs/specs/build-log.md` | Task-by-task implementation state with commit SHAs |
| 5 | `docs/specs/progress.md` | Spec revision history + Confluence review results |
| 6 | `docs/specs/deloitte-signoff-request-2026-04-15.md` | 6 artifacts needed from Deloitte, response tracker |
| 7 | `docs/devdocs/DIS-alignment-docs/AMS_DASHBOARD_AGENT_HANDOVER.md` | Build priorities, admin modules, Datadog, QA hooks |
| 8 | `docs/devdocs/Canonical Document Extraction Schema.md` | V1.2 per-doc field schemas (source of truth for extraction types) |

### Key repos

| Repo | Purpose |
|------|---------|
| `ams-official` (this repo) | AMS officer dashboard — the frontend we're building |
| `openvisa-synthetic-data` | 100 JSON payloads, 5,410 corpus docs, Praxia gold examples, Drools reference data, caseworker reasoning docs |

### Jira tickets

| Ticket | Description |
|--------|-------------|
| [SCRUM-7](https://openvisa.atlassian.net/browse/SCRUM-7) | Parent — DIS integration, Phase 1/2 scope split |
| SCRUM-63 | Application list + detail view (Panels 1, document accordion) |
| SCRUM-64 | Audit trail + Glass Box explainability view (Panels 2, 3, audit) |
| SCRUM-65 | DIS API integration + Clerk auth (Phase 3) |

### Deloitte contacts

| Person | Role | What they own |
|--------|------|---------------|
| Ranita Roy | AI/ML | Custom Extractor, extraction pipeline, PostgreSQL schema |
| Preety Gupta Bansal | Lead Engineer | Drools rules, `/api/rules/reload`, ingestion API |
| Vidhyotha Shetty | OPA | All OPA policies (H01-H04 implemented 8-10 April) |
| Neeraj Jha | External APIs | World-Check live + 5 mock APIs |
| Satyarth Bhardwaj | Doc AI | Classifier + extractors |

### Important context

- **PostgreSQL schema v13 signed off 17 April** on Confluence page 30048272 — we haven't pulled this yet. Do it on next Confluence auth.
- **Chris is running 6 ML training agents this weekend** — don't interrupt with questions that can wait
- **Praxia glass_box_decision format** (in `openvisa-synthetic-data/output/praxia/gold/skilled_worker/`) is the target for Panel 1 + Panel 2
- **"AI Extracts, Rules Decide"** — the core principle. AI never makes the decision. Drools + OPA decide deterministically. LLM summary is post-decision, read-only.
- **Chris's tone:** casual ("fam"), prefers direct action, no ceremony. Commit messages logged in his personal notes. He commits himself — give him the message text, don't auto-commit without asking.

---

## Crash recovery checklist

1. Read this file
2. `git checkout feat/dis-integration-v3`
3. `git log --oneline -10`
4. Read `docs/specs/build-log.md` for task-level state
5. Read V4 spec for dashboard architecture
6. Read V3 spec for type definitions
7. `npx tsc --noEmit 2>&1 | grep -E "(dis|extraction|application)" | wc -l` — should be 0
8. Pick up from the "What's next" section above
