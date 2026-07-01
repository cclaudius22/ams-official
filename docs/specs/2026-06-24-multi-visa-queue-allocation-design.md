# Multi-Visa Queue + Capacity-Aware Auto-Allocation — design spec (Slices 0 + 1)

**Date:** 2026-06-24 · **Status:** for review (pre-implementation) · **Branch:** `feat/dis-integration-v3`
**Companions:** `docs/cc-notes/2026-06-24-uk-caseworker-workload-research.md` (the verified workload model) · `docs/cc-notes/2026-06-24-demo-corpus-spec.md` (the corpus being generated in parallel) · `docs/LAUNCH_BLOCKERS.md`

## 1. Goal & the demo story
Show, end-to-end, that **a government can receive many visa types, AMS auto-allocates each to the right officer within realistic human capacity, and the officer decides** — with the machine doing the heavy processing and the human keeping control of the decision.

Two-beat narrative this spec must enable:
1. **Intake → process → allocate** (Phase-2 *vision*: multi-visa breadth) — 1,000 applications arrive, AMS "processes" them in seconds (reveals recommendations + a clear/clear/flagged distribution), then auto-allocates the *decision* workload across officers within capacity.
2. **Officer decides** (Phase-1 *reality*: skilled-worker depth) — opening a skilled-worker case lands on the existing reviewer page (DIS Glass Box + Evidence + OV assessment). *(Deep review + the RFI lifecycle = Slice 3; this spec stops at delivering a decision-ready, allocated queue.)*

## 2. What already exists (do NOT rebuild)
Verified live this session:
- **Live Queue page** `src/app/dashboard/livequeue/page.tsx` (590 lines): metrics cards, **Applications-by-Visa-Type** chart (already renders 6 types), Status Distribution, **Officer Workload** chart, table with an **Assigned-to** column, search/filters, an **Auto-Assign All** button, a demo **Reset**, and an auto-assign **results banner** (per-officer counts) — i.e. a working allocation board.
- **Assignment engine** `src/services/assignment/auto-assign.ts`: `suggestOfficerForApplication()` + `calculateAssignmentScore()` (specialization +30, workload, SLA, processing time, seniority).
- **APIs** `src/app/api/assignments/{route,auto-assign-all,suggest,reset}`, `src/app/api/officers/route.ts`.
- **8 seed officers** `src/data/seed/officers.ts` (`ConsulateOfficial`: `specializations`, `activeApplications`, `slaCompliance`, `avgProcessingTime`, `completedToday`, `role`, `isActive`) with multi-visa specializations.
- **Provider** `src/data/providers/json-provider.ts` (active: `DATA_PROVIDER=json`, `SYNTHETIC_DATA_PATH=../openvisa-synthetic-data/output_demo`).

**The verified gap:** auto-assign is **not capacity-aware** → one click put **463** cases on one officer (specialization bonus dominates; workload penalty is weak and not recomputed during the batch). And the volumes/dates are unrealistic. This spec fixes the realism and feeds the new DIS-aligned corpus through the existing surfaces.

## 3. Operating model (the formula — locked with Chris)
**End-to-end = Processing (machine, scales infinitely) + Decisioning (human, the only bottleneck). DIS recommends; the officer decides.**

- **Two clocks, never conflated:** (1) **active officer touch-time** per case → drives capacity/headcount; (2) **elapsed time to decision** → drives SLA/applicant experience (for RFI cases, most elapsed time is the applicant responding, not the system).
- **Decision effort is a distribution, not a constant:**
  | Case type (from `recommendation`) | Active touch-time | Share |
  |---|---|---|
  | clear `RECOMMEND_APPROVE` | ~10 min | ~60% |
  | clear `RECOMMEND_REJECT` | ~20 min | ~25% |
  | `MANUAL_REVIEW` / RFI | ~45 min (across touches) | ~15% |
  Blended ≈ **~18 min/case → ~20 decisions/officer/day** (all numbers are levers, not published facts).
- **SLA anchor (citable):** straightforward non-settlement standard = **15 working days**; Priority 5 days; Super Priority next day.
- **Three headline claims** (replace the single blended "~80%" tile — it can't survive a non-uniform caseload):
  1. **Processing latency >99% eliminated** (2 weeks → <1 min) — every case, incl. hard ones. (Machine; arithmetic.)
  2. **Human attention triaged** — ~85% arrive as clear recommendations, ~15% flagged for deeper review.
  3. **Officer decision throughput ~2× on routine cases** (cited: ICIBI/NAO/Leeds); complex/RFI handled at proper depth.
- **National scale = a slider, never a stated fact:** 1,000,000/yr ÷ 250 working days = 4,000/day; at ~20 decisions/officer/day → ~200 decision-officers. The 8-officer demo is **one region**, independent of the national figure.

## 4. Scope — multi-visa queue NOW; skilled-worker is the deep-review route (corrected 24 Jun)
The **queue, auto-allocation, and distribution run on all 1,000 multi-visa apps from the start** — the multi-visa board IS the Phase-2 vision and the most important demo beat. **"Skilled-worker first" governs only the Phase-1 *deep-review* route** (the cases opened for full DIS Glass Box + OV + RFI — the 18 `deep_set` cases, Slice 3). The registry/provider/`allocateBatch` are visa-agnostic and serve all 6 types immediately.

- **Corpus:** `data/demo-corpus/` — **in-repo, self-contained** (from Lenny's `ams_demo_corpus_2026_06_24`, verified spec-true). `bulk/applications/` = 1,000 multi-visa apps, each with an explicit `recommendation` (drives queue/allocation/distribution NOW); `deep_set/` = 18 skilled-worker cases with full DIS/OV scaffolding + 3 RFI heroes (deep review, Slice 3). **`bulk/documents/` is intentionally absent in-repo** (GCS-bound, LB-3) — queue/allocation must NOT depend on it.
- **In (this spec):** Slice 0 (visa registry + extended `LiveApplication` + DIS corpus adapter + new `AmsDemoProvider`) and Slice 1 (capacity-aware allocation + intake→process→allocate + distribution + SLA) — **over all 1,000 multi-visa apps, allocated across ALL officers by specialization**.
- **Provider:** new `AmsDemoProvider` (`DATA_PROVIDER=ams-demo`, default path `data/demo-corpus`). **Do NOT modify** `json-provider`/`output_demo` (fallback), the reviewer page, or `OVIntelligencePanel.tsx`.
- **Out (later slices, interface-ready):** Slice 2 officer worklist; Slice 3 **skilled-worker** deep review + scenario-consistent OV + **RFI lifecycle** (`Awaiting Info`) + OV-panel polish; visa-config / officer-onboarding (Phase-2 RBAC stub).

---

## 5. Slice 0 — Visa-type registry + DIS-aligned ingestion

### 5.1 Registry (`src/config/visaTypes.ts`) — new
The single source of vocab truth **and** the multi-visa config surface.
```ts
export type VisaPhase = 1 | 2
export interface VisaTypeDef {
  key: string            // AMS canonical, e.g. 'skilled_worker_visa'
  label: string          // 'Skilled Worker'
  wireAliases: string[]  // ['skilled-worker','skilled_worker'] — corpus/DIS vocab
  specialization: string // officer-specialization token (== key here)
  phase: VisaPhase       // 1 = live DIS+OV pipeline; 2 = queue/allocation only
}
export const VISA_TYPES: VisaTypeDef[]          // the 6 types
export function normalizeVisaType(raw: string): string | null   // any vocab → canonical key
export function visaTypeLabel(key: string): string
export function visaTypePhase(key: string): VisaPhase
```
- Entries: `skilled_worker_visa` (**phase 1**), `student_visa`, `senior_specialist_worker_visa`, `spouse_partner_visa`, `global_talent_visa`, `innovator_founder_visa` (all **phase 2**).
- `normalizeVisaType` matches against `key` + `wireAliases`, hyphen/underscore-insensitive; returns `null` for unknown (caller decides fallback). Pure, unit-tested.

### 5.2 Corpus ingestion (the DIS-aligned shape)
The corpus (`data/demo-corpus/bulk`, DIS-aligned schema + per-app `recommendation`) differs from `output_demo`'s schema. Add a **corpus adapter** so the queue speaks one internal model regardless of source:
- New `src/data/providers/ams-demo-provider.ts` implementing `ApplicationDataProvider`, selected by `DATA_PROVIDER=ams-demo`; **default corpus path `data/demo-corpus`** (`AMS_DEMO_CORPUS_PATH` overrides), reading `bulk/applications/` only — **never `bulk/documents/`** (intentionally absent in-repo; GCS-bound, LB-3). (Leaves `json-provider` + `output_demo` untouched as a fallback.)
- Maps each DIS-aligned app → `LiveApplication` (+ `ApplicationDetail`): identity from `applicant`, `visaType`/`visaTypeId` via `normalizeVisaType(app.visa_type)`, `country` from `country_code`, `submittedAt` from `submitted_at`, initial `status = 'Received'` (pre-processing — see §6.1), and carries `recommendation` + `anomaly_type` for the processing/distribution beat.
- Officers stay seed-sourced (unchanged).

**Acceptance:** queue loads from `data/demo-corpus/bulk`; all 6 visa types display with correct labels; `normalizeVisaType('skilled-worker') === 'skilled_worker_visa'` (matches `Ricardo`'s specialization); unknown visa type doesn't crash. Registry unit tests green; `tsc` 0 new errors.

---

## 6. Slice 1 — Capacity-aware allocation + intake→process→allocate

### 6.1 Processing phase (the machine beat)
- Apps start `status = 'Received'` with the `recommendation` **hidden** (the recommendation is pre-computed ground truth in the corpus, not shown until "processed" — consistent with the mock/replica framing in LB; we are not running real Drools/OPA here, DIS does that).
- A **"Process intake"** action flips all `Received` → `Processed`, reveals each `recommendation`, and shows an elapsed-time readout (**"1,000 processed in 47s"**) + the **distribution tiles** (counts of APPROVE / REJECT / MANUAL_REVIEW from the ground-truth field, ≈ 600 / 250 / 150).
- This dramatizes claim #1 (processing latency eliminated) honestly: the work the machine does instantly is the *processing*, not the decision.

### 6.2 Capacity-aware balanced allocation (kills the 463)
Replace the greedy batch loop with a **least-loaded-eligible** allocator (new `src/services/assignment/allocate-batch.ts`):
- **Per-officer capacity:** `dailyCapacity` (default ~30, config) + an active-WIP cap. Add to the officer model (or a config map keyed by officer id).
- **Algorithm:** for each `Processed`, unassigned app, among officers whose `specializations` include the app's canonical visa type **and** who are under cap and `isActive`, pick the **lowest current live load** (recomputed as the batch fills); tie-break by SLA/seniority. No eligible-under-cap officer → app stays **queued** (`status = 'Awaiting Allocation'`) or routes to the trainee (Evica, overflow). Specialization still respected; load is balanced, not greedy.
- Result on the board: a balanced spread within caps (e.g. ~25–30 each across the team) + a visible **"queued, awaiting capacity"** remainder (the realistic backlog) — not 463 vs 30.

### 6.3 Presentation (reuse the existing board, extend it)
- Reframe the metrics to the two-phase/distribution model: **Processing** stat (2 wks → <1 min), **Distribution** tile (≈600/250/150), **Officer decision capacity** (~20/day blended), **SLA** (15 working days). **Remove** the standalone throughput-% tile.
- Officer cards/workload chart show **load vs capacity** (e.g. 28/30) + SLA status; respect the cap visually.
- Keep the existing allocation results banner; extend it with the *reason* (specialization/load) per officer.

### 6.4 Queue-state model (interface-ready for RFI)
Canonical queue states for the demo: `Received` → `Processed` → `Awaiting Allocation` → `Assigned` (`In Progress`) → `Awaiting Info` (RFI park — **Slice 3**) → `Decided`. Define the full enum now so Slice 3's RFI lifecycle drops in without a requeue refactor; only the states up to `Assigned` are exercised in Slice 1.

**Acceptance (Slice 1):** one click allocates the processed pool with **no officer over cap** and a balanced spread (assert max-load ≤ cap, and spread variance below a threshold, in a unit test of `allocate-batch`); distribution tiles match the corpus ground-truth counts; the blended-% tile is gone; reset returns to a clean `Received` baseline. Browser-verified on `data/demo-corpus/bulk` (`DATA_PROVIDER=ams-demo`).

## 7. Data flow
`data/demo-corpus/bulk/applications/*.json` → `AmsDemoProvider` (+ `normalizeVisaType`) → `LiveApplication[]` → `GET /api/applications` → livequeue page → **Process intake** (reveal recommendations + distribution) → **Auto-Allocate** (`POST /api/assignments/auto-assign-all` → `allocateBatch` capacity-aware) → board + per-officer load → click a skilled-worker case → existing reviewer page (Slice 2/3).

## 8. Testing
- **Unit:** `normalizeVisaType` (vocab matrix incl. hyphen/underscore + unknown); `allocateBatch` (never exceeds cap; balanced spread; specialization respected; overflow → queued/trainee); distribution counts derive from `recommendation`.
- **Provider:** `AmsDemoProvider` maps the DIS-aligned shape → `LiveApplication` (visa label, recommendation carried, dates).
- **Browser (Playwright):** load `data/demo-corpus/bulk` → 6 types in the chart → Process → distribution tiles ≈600/250/150 → Auto-Allocate → no officer > cap, backlog visible → reset clean.
- **Governance/regression:** existing DIS suite stays green; `tsc` 0 new errors (76 baseline).

## 9. Risks / open questions
- **Officer capacity location** — extend `ConsulateOfficial` (`dailyCapacity`/`wipCap`) vs a separate config map. *Lean: config map keyed by id, so seed officers stay as-is.* (Decide in the plan.)
- **Provider strategy** — new `AmsDemoProvider` vs extend `json-provider` with shape detection. *Lean: new provider, leave json-provider/output_demo as fallback.*
- **Corpus timing** — Slice 0 (registry) and `allocateBatch` logic don't need the corpus; only the browser-verify + provider wiring do. Build registry + allocator + tests first; wire the corpus from `data/demo-corpus` (already in-repo).
- **"Processed in Xs" honesty** — make clear in copy this is the *processing/recommendation* step (pre-computed ground truth here; DIS computes it for real), not a decision. Keep the human-decides framing throughout.

## 10. Deferred (explicitly not in 0+1)
Slice 2 (officer worklist via `OfficerSwitcher`, no auth — LB-2 stays parked) · Slice 3 (deep review + scenario-consistent OV + **RFI lifecycle** + the 4 OV-polish notes from 23–24 Jun) · Slice 4 (visa-config + officer-onboarding Phase-2 RBAC stub). National-scale slide. Dates/data hygiene handled in the corpus, not here.
