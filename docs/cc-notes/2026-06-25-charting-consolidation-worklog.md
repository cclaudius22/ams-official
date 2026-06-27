# Charting Consolidation — Worklog + Implementation Plan (Agent 2 / charting lane)

> **This is my single observability/tracking MD.** All progress, decisions, and the
> task breakdown live here — no further MDs will be added.
> Snapshot inventory → [`…-charting-estate-inventory.md`](./2026-06-25-charting-estate-inventory.md) ·
> Decision → [`…-charting-consolidation-recommendation.md`](./2026-06-25-charting-consolidation-recommendation.md)
> Date: 2026-06-25 · Branch: feat/dis-integration-v3 · HEAD: edec6ed (Agent 1's published contract — ✅ already on it, no rebase needed)

## GO conditions (locked)
- ✅ On `edec6ed` (contract + stable Slice-1 `/livequeue`). No rebase required — already HEAD.
- Consume `@/api-contracts/queue-contract` for any data feed — never invent a parallel shape. (Data-wiring is deferred; primitives stay shape-agnostic so wiring is a drop-in adapter.)
- Shared chart-primitives layer + full Nivo removal **first** (new files under `src/components/charts/`, zero collision with Agent 1).
- `LiveQueueMetrics.tsx` migrates **LAST** — ping Agent 1 before touching; gated on his sign-off (pending-count logic + 96/904 tuning + adversarial gate).
- Production-grade, not demo-grade. Don't touch: OV Intelligence panel, json-provider, reviewer surface, output_demo.
- Recharts = standard. Nivo goes (stalled at v0.99, 13+ months). Custom Recharts heatmap — no Nivo island.
- Canon: no aggregate/numeric score in per-application officer view; "recommendation" language in DIS-output panels. (Chart estate is aggregate analytics — canon-safe — but I will not introduce per-case numeric scores anywhere.)

## Decisions (from Chris, 25 Jun)
1. Full Nivo removal + custom heatmap — **yes**.
2. Polish = follow-up; land consolidation (Phases 1–2) first.
3. Data-wiring = separate deferred track; consumes the queue-contract.
4. Parallel with Agent 1, not sequential; `LiveQueueMetrics` last.

---

## Target architecture — `src/components/charts/` (all NEW files)
| File | Kind | Replaces | TDD? |
|---|---|---|---|
| `theme.ts` | tokens + pure resolvers (`seriesColor(i)`, `statusColor`, `recommendationColor`, gradient/grid/axis/tooltip themes, dark-mode) | 8 scattered palette consts (`SUBTLE_COLORS`×2, `COLORS`, `BLUE_GREEN_SCHEME`, `CATEGORICAL_SCHEME`, `STATUS_COLORS`, `VISA_COLORS`, `AREA_/SLA_CHART_COLORS`) | ✅ pure |
| `format.ts` | number/percent/duration/locale formatters | ad-hoc inline `${value}%` | ✅ pure |
| `ChartCard.tsx` | Card+Header+Title+fixed-height frame + states slot | re-declared shells | render |
| `ChartTooltip.tsx` | one tooltip | 3 separate `CustomTooltip`s | render |
| `ChartStates.tsx` | Loading / Empty / Error | (none today — a gap) | render |
| `KpiCard.tsx`, `MetricCard.tsx` | unified stat cards | 2 duplicated impls | render |
| `AreaTrend / HBar / StackedBar / Donut / LineWithTarget` | opinionated Recharts wrappers (theme + responsive + motion baked in; take generic series, not contract shapes) | inline chart JSX | render |
| `Heatmap.tsx` | **custom** SVG/CSS-grid heatmap (replaces Nivo); pure `heatmapScale(v,min,max)` color bucketing | `@nivo/heatmap` | ✅ scale + render |
| `index.ts` | barrel | — | — |

**Design rule:** wrappers are data-shape-agnostic (`{ name, value }[]` / `{ id, data }[]`). The queue-contract binds later at an **adapter** layer (deferred data track) — primitives never import contract types for *data*, only optionally for *label helpers*. This keeps the seam clean.

---

## Phase 1 — Shared layer (new files only · ZERO collision)
- [ ] **T0 — Baseline.** Capture `tsc --noEmit` error count (expect **76**) + `npx vitest run` green. Record numbers here.
- [ ] **T1 — `theme.ts` + `format.ts`** (TDD: failing test → impl → pass). Pure resolvers + formatters. Gate: vitest green · tsc 76.
- [ ] **T2 — `ChartCard` + `ChartTooltip` + `ChartStates` + `KpiCard`/`MetricCard`** (render smoke tests). Gate: vitest green · tsc 76.
- [ ] **T3 — Recharts wrappers** `AreaTrend/HBar/StackedBar/Donut/LineWithTarget` (render tests w/ sample series). Gate: vitest green · tsc 76.
- [ ] **T4 — custom `Heatmap`** (TDD on `heatmapScale` bucketing → render test). Gate: vitest green · tsc 76.
- [ ] **T5 — `index.ts` barrel** + commit. `rg "@nivo" src/components/charts` = 0 (born Nivo-free).
- **Phase-1 gate:** all vitest green · tsc still 76 · NO existing file touched (`git diff --stat` shows only `src/components/charts/**` + tests).

## Phase 2 — Migrate the 2 mock surfaces + remove Nivo (NOT LiveQueueMetrics)
- [ ] **T6 — `LiveMetricsSection.tsx`** (5 Recharts charts) → wrappers + theme. Before/after Playwright screenshot for parity. Gate: tsc 76.
- [ ] **T7 — `ProcessingMetricsTab.tsx`** — the entangled dual-lib file. Port 4 Nivo charts → wrappers; Nivo heatmap → custom `<Heatmap>`; 4 Recharts charts → wrappers; drop the 2 dead Nivo imports. Remove ALL `@nivo/*`. Before/after screenshot. Gate: tsc 76.
- [ ] **T8 — Excise Nivo dependency.** Remove `@nivo/*` (5 packages) from package.json; refresh lockfile; `rg "@nivo" src` = **0**; production build passes; note bundle delta. Gate: tsc 76 · vitest green.
- **Phase-2 gate:** vitest green · tsc 76 · `rg @nivo src` empty · screenshots match · build clean.

## LiveQueueMetrics — LAST (gated)
- [ ] **T9 (BLOCKED on Agent 1 sign-off)** — ping Agent 1 (he owns pending-count logic; gated on his adversarial gate + 96/904 tuning). Only after hands-off: migrate `LiveQueueMetrics.tsx` (3 real-data Recharts charts) onto the shared layer. This is the ONE file in my lane that reads real contract data today — keep its data logic intact, swap only presentation.

## Deferred (not now)
- **Phase 3 — Polish** (motion, refined palette, empty/loading parity, a11y, dark-mode) — inherits from the settled shared layer.
- **Data-wiring track** — replace `Math.random()` hooks with a contract adapter (`LiveApplication[]` → series via `visaTypeId`/`visaTypeLabel`/`RecommendationOutcome`). Separate workstream.

## Verification gates (every task)
`npx tsc --noEmit 2>&1 | grep -c "error TS"` == **76** (0 new) · `npx vitest run` green · existing DIS suite untouched · Phase 2 adds before/after screenshots + `rg @nivo src` == 0.

---

## Design grammar (Phase-3 polish, baked into the primitives — not a later pass)
Premium-from-birth, Linear/Stripe register, fit for a high-stakes decisioning tool. Signature = colour-as-meaning + near-invisible chrome + one shared tooltip & type scale. All centralized tokens → re-skin in one place.
- **Two colour roles (never mixed):**
  - *Semantic (reserved):* `SEMANTIC_COLORS` — approve=emerald · reject=red · manual/pending=amber · in-progress=blue · neutral=slate. Never decorative.
  - *Categorical visa-type (`visaTypeColor`, stable per canonical key):* skilled_worker `#6366f1` (hero) · student `#0ea5e9` · senior_specialist `#8b5cf6` · spouse_partner `#14b8a6` · global_talent `#ec4899` · innovator_founder `#f59e0b`. Same hue for a type in every chart.
  - No within-chart collision: visa-type series and status/recommendation series live on different charts.
- **Chrome:** no axis lines / tick marks; single horizontal hairline grid (`#eef2f6`); muted 11px slate ticks; whitespace. (`AXIS`/`GRID`)
- **Type + numbers:** one scale; `tabular-nums` so figures align; uppercase micro-labels. (`TYPE`, `format.ts`)
- **Motion:** fade + 8px rise, 0.4s ease-out on load; 600ms Recharts redraw on data change; `prefers-reduced-motion` respected. (`MOTION`)
- **Tooltip + states:** one `ChartTooltip` (rounded, hairline border, soft shadow, colour dot + tabular value); designed empty state (plain-language, interface voice) + skeleton loader. (`TOOLTIP_SURFACE`, `ChartStates`)
- Out of scope: OV Intelligence SVG risk rings (own designed component). Canon: no per-application numeric scores.

## Progress log
- 2026-06-25 — Recon complete (inventory + recommendation). GO received. Confirmed already on `edec6ed`; read the published queue-contract + spec. Plan drafted.
- 2026-06-25 — **T0** baseline captured: tsc **76**, vitest **121 passed / 24 skipped** (green). **T1 done** (TDD): `theme.ts` + `format.ts`. Phase-3 grammar folded into the layer (per Chris): extended `theme.ts` with `visaTypeColor` + `SEMANTIC_COLORS`, added `tokens.ts` (chrome/motion/type). 8 chart tests green · tsc 76.
- 2026-06-26 — **T2 done** (TDD): `ChartTooltip` (the single custom tooltip), `ChartStates` (`ChartEmpty` + `ChartSkeleton`), `KpiCard` + `MetricCard`. Full suite **138 passed / 24 skipped**; `git status` shows only new `src/components/charts/**` + tests (zero existing files touched); tsc **76**. Commits held (shared tree w/ Agent 1; commit only when Chris asks).
- 2026-06-27 — **T3 done** (TDD): `ChartCard` (frame + framer-motion enter), `ChartCanvas` (state gate), wrappers `HBar`/`Donut`/`StackedBar`/`AreaTrend`/`LineWithTarget`, `_internal.ts`, barrel `index.ts` (T5 pulled forward). Built `__preview__/ChartsPreview.tsx` + temp route `src/app/charts-preview/` (TO REMOVE before merge); screenshotted light + dark via standalone headless chromium.
  - **Decision — Recharts per-series animation disabled (`isAnimationActive={false}`).** The ResponsiveContainer 0-initial-size + Recharts series animation bug left bars/lines/areas stuck invisible on first paint. Dropped it; framer-motion's card fade/rise carries "motion on load" — more reliable and more restrained (no bars re-growing on every poll). **Open:** "smooth transitions on data change" is therefore not animated — flagged to Chris; revisit if wanted (would need a mount/size gate, not Recharts' built-in).
  - Full suite **147 passed / 24 skipped** · tsc **76** · zero existing files touched.
- 2026-06-27 — **T4 done** (TDD) → **Phase 1 COMPLETE.** Custom `<Heatmap>` (CSS grid, pure `heatmapColor` sequential scale; no Recharts/Nivo — lighter + faster, per Chris's perf priority). Added to preview (backlog by day×stage) + barrel; screenshotted. Animation confirmed off (perf > motion, per Chris). Full suite **152 passed / 24 skipped** · tsc **76** · zero existing files touched.
  - **Shared layer built (all `src/components/charts/`):** `theme` · `tokens` · `format` · `ChartTooltip` · `ChartStates` · `KpiCard` · `MetricCard` · `ChartCard` · `ChartCanvas` · `HBar` · `Donut` · `StackedBar` · `AreaTrend` · `LineWithTarget` · `Heatmap` · `index` barrel (+ `__preview__` dev aid).
  - **Next: Phase 2** (migrate onto the layer + remove Nivo): T6 `LiveMetricsSection`, T7 `ProcessingMetricsTab` (drops all `@nivo/*` incl. heatmap), T8 remove `@nivo/*` from package.json (`rg @nivo src` → 0). Then **T9 `LiveQueueMetrics` LAST**, gated on Agent 1's hands-off. Remove temp route `src/app/charts-preview/` before merge.
