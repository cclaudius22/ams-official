# 🚀 FRESH CHAT — START HERE (AMS build, resuming at Slice 3 / 3a)

**Hand this to the fresh chat.** You are **Sam** (Agent 1, the data/queue/app lane). Casual tone with Chris ("fam"), direct action, no ceremony. Everything below is committed + pushed on `feat/dis-integration-v3` (HEAD `2fc19de`) — tree clean, nothing at risk.

## ▶ Your FIRST action
1. `git checkout feat/dis-integration-v3 && git pull` then read `SESSION_LOG.md` (top RESUME-HERE block) + `docs/specs/2026-06-29-slice3-deep-review-plan.md`.
2. **Check if Lenny's 3.0 enrichment landed:** do `data/demo-corpus/deep_set/applications/*.json` now have a top-level **`dis_application_view`** + a 3-dimension **`ov_assessment`**? (Brief was sent to Lenny 30 Jun.)
   - **Yes →** start **3a**.
   - **No →** ping Chris / wait, or build 3a's wiring against the contract in parallel (the temporary **A-fallback adapter** is acceptable until enrichment lands).

## What's DONE (don't rebuild)
- **Slice 0** — visa registry, DIS adapter, `AmsDemoProvider` (`DATA_PROVIDER=ams-demo`, corpus `data/demo-corpus`), contract extensions. Data contract **published**: `src/api-contracts/queue-contract.ts`.
- **Slice 1** — multi-visa queue + capacity-aware `allocateBatch` + process-intake/auto-allocate + UI. **Adversarial gate passed + fixed.**
- **Capacity tuning** — cap 25/officer/day, fresh seed loads → 152 allocated / 848 queued, "today's intake … 15-day SLA". Provisional model: `docs/devdocs/officer-capacity-model.md`.
- **Slice 2** — officer worklist (`/dashboard/reviewer/queue`) shows real assigned cases via tested `src/lib/officerQueue.ts`; Rachel mock removed.
- **Agent 2** (charting lane) — shared chart layer, Nivo removed, `LiveQueueMetrics` migrated. (Open cross-agent nit: align his Officer-Workload chart thresholds >100/>200 to the ~25 daily scale.)

## Slice 3 — the deep review (your current work)
**Goal:** `/dashboard/reviewer/<deep_set_id>` opens the SAME 4 panels (Recommendation · Glass Box · Evidence · OV Intelligence) but **per-case from the enriched deep_set, not the generic mock.** Decision **B** (enrich corpus); never C; A = temp fallback only.

- **3.0 (Lenny, in flight):** enrich the 18 deep_set → full `dis_application_view` (per-rule `rule_results`, 9 `component_scores`, 7 `external_checks`, `opa_results`) + rich `ov_assessment` (3 dimensions). Contract: `dis.ts:637` / `ov.ts:27` / example `mockDISData.ts:22`. Gotchas: `PAYSLIP` not PAYSLIPS; counts reconcile; applicant-specific (not cloned Rani Kumari).
- **3a (you):** `AmsDemoProvider.getApplicationById(<deep_set_id>)` → map `dis_application_view` → `DISApplicationView`; wire the reviewer page to load it for ams-demo ids. **BLOCKER to clear:** `src/app/dashboard/reviewer/[applicationId]/page.tsx:358` passes `syntheticOvAssessment()` + uses `mockDISApplicationView` — swap BOTH for per-case data.
- **3b:** RFI lifecycle (3 hero cases: flag missing doc → `Awaiting Info` → applicant responds → decide).
- **3c:** OV-panel polish — 4 notes: score↔risk polarity, generic-donut hero redesign, attention-routing (supporting-vs-tempering factor chips), sticky-action-bar overlaps the panel footer.
- **ACCEPTANCE (3a):** open `/dashboard/reviewer/<deep_set_id>` → all 4 panels render with **NO fallback to mock/synthetic.**

## How we work (keep to this)
- **TDD** (red→green), then **verify**: full vitest suite green + `npx tsc --noEmit` = **76** (0 new baseline) + **Playwright browser evidence**. Run app: `DATA_PROVIDER=ams-demo AMS_DEMO_CORPUS_PATH=data/demo-corpus PORT=3000 bun run dev` (bun is the package manager now). Demo flow: livequeue → Process intake → Auto-Allocate → switch officer → My Queue → (3a) open a case.
- **Commit per task; push "just in case"** (Chris is fine with you committing + pushing on the feature branch). Update `SESSION_LOG.md` resume block as you go.
- **Don't touch:** `json-provider.ts`, `output_demo`, `OVIntelligencePanel.tsx` is yours for 3c but coordinate; charting/`src/components/charts/` is **Agent 2's lane**.
- **Agents:** you = **Sam** to **Lenny** (corpus-gen); **Agent 2** = charting. Two agents share this working tree — only commit your own files.

## Orientation docs
`SESSION_LOG.md` (where we are) · `docs/specs/2026-06-29-slice3-deep-review-plan.md` (Slice-3 plan + Lenny brief) · `docs/specs/2026-06-24-multi-visa-queue-allocation-design.md` (the queue spec) · `docs/LAUNCH_BLOCKERS.md` (mocked-vs-real map) · `docs/devdocs/officer-capacity-model.md`.

**Kickoff line for Chris to paste:** *"Resume the AMS build — read docs/cc-notes/2026-06-30-FRESH-CHAT-START-HERE.md. We're on Slice 3 / 3a."*
