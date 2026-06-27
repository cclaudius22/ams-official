# Charting Consolidation — Recommendation

> **Decision-shaping doc. No code changed.** Builds on the measurement pass in
> [`2026-06-25-charting-estate-inventory.md`](./2026-06-25-charting-estate-inventory.md).
> Date: 2026-06-25 · Branch: feat/dis-integration-v3

## Recommendation in one line
**Standardise on Recharts, delete Nivo, and introduce a single shared chart layer** (`src/components/charts/`). The library choice is the easy part; the shared layer is what actually makes the estate look world-class.

---

## The decision

### 1. Library: consolidate on **Recharts**, remove **Nivo** entirely
The measurement makes this near-automatic:
- Recharts is already **71%** of charts and owns **100%** of the real-data charts.
- **4 of 5** Nivo charts map onto Recharts patterns **already shipping in this repo** (horizontal bar, stacked bar, gradient-area line).
- Nivo is confined to **one component, one tab**, plus **2 dead imports** (`@nivo/pie`, `@nivo/calendar`).
- Removing `@nivo/*` (5 sub-packages) trims meaningful JS off a dashboard bundle.

**The only real engineering question is the heatmap** (chart #13) — Recharts has no native heatmap.

### 2. Heatmap: build a small custom `<Heatmap>` primitive, do **not** keep a Nivo island
A day/stage heatmap is a grid of coloured cells — ~half a day as a CSS-grid/SVG primitive with full design control and zero dependency. Keeping all of Nivo alive to serve **one decorative, currently-hardcoded chart** fails cost/benefit. Build it once, own the look, drop Nivo.
*(Fallback if we want it even cheaper: re-cast as a Recharts Treemap or a simple bar-by-stage. But the custom primitive gives the best polish ceiling.)*

### 3. The real lever: a shared chart layer (`src/components/charts/`)
This is where "knock-the-eyeballs" actually comes from. Today every chart is hand-rolled: `SUBTLE_COLORS` defined **twice**, **3** separate tooltips, duplicated KPI cards, no shared loading/empty states. Introduce:

| Module | Replaces | Purpose |
|---|---|---|
| `theme.ts` | 8 scattered palette consts | One palette + status/risk colours + gradient/grid/axis tokens + dark-mode tokens |
| `ChartCard.tsx` | re-declared Card+Header+height shell | Consistent frame every chart sits in |
| `ChartTooltip.tsx` | 3 separate `CustomTooltip`s | One tooltip, one feel |
| `KpiCard.tsx` / `MetricCard.tsx` | 2 duplicated stat cards | Unified metric cards |
| `states.tsx` | (none today) | Shared Loading / Empty / Error — a current gap and a demo-killer |
| Wrappers: `<AreaTrend> <HBar> <StackedBar> <Donut> <LineWithTarget> <Heatmap>` | inline chart JSX | Opinionated Recharts wrappers with theme + motion + responsive baked in; pages pass **data + labels only** |

After this, polish is set **once** and every surface inherits it.

---

## Sequencing (low-risk, phased)

- **Phase 0 — Decide.** Lock Recharts; approve the shared layer + custom heatmap.
- **Phase 1 — Build the shared layer & migrate existing Recharts (≈1–1.5d).** Extract theme/tooltip/cards/states; port the 12 current Recharts charts onto the wrappers. Pure dedupe, no behaviour change. **Visual-regression checkpoint** (before/after screenshots).
- **Phase 2 — Kill Nivo (≈1d).** Port the 4 trivial Nivo charts to wrappers; build custom `<Heatmap>`; remove `@nivo/*` deps + dead imports. **`tsc` must stay at the 76 baseline.**
- **Phase 3 — Polish pass (≈1.5–2d).** Motion/transitions, refined palette, empty/loading/error states, number/locale formatting, dark-mode parity, accessibility (aria labels, `prefers-reduced-motion`). **This is the eyeballs phase.**
- **Parallel track (separate workstream) — Wire real data.** ~82% of charts are mock today. Replacing `Math.random()` hooks with real feeds is larger and **decoupled** from the library consolidation — don't conflate them.

**Rough total: ~4–5 days** for consolidation + base polish (excludes data-wiring).

---

## Risk & guardrails
- **Low risk** overall — Recharts is already dominant; Phase 1–2 are extract/dedupe + like-for-like ports.
- **Main risk = visual regressions** → mitigate with before/after Playwright screenshots (baseline PNGs already exist in the repo root).
- **`tsc --noEmit` stays at 76** (0 new) — same guard as the queue-allocation plan.
- **Coordination flag:** `LiveQueueMetrics` lives on `/dashboard/livequeue`, which the **skilled-worker queue-allocation plan also touches**. Sequence the chart refactor so it doesn't collide with that work (do one, then rebase the other — or scope LiveQueueMetrics last).
- **Out of scope / leave alone:** `OVIntelligencePanel`'s SVG risk rings are bespoke and *not* part of this estate (and are on the do-not-touch list). The consolidation touches none of the forbidden files (`json-provider.ts`, `output_demo`, reviewer page, `OVIntelligencePanel`).

## What NOT to do
- Don't remove Nivo **before** the shared layer + `<Heatmap>` exist.
- Don't conflate **data-wiring** with **library consolidation** — separate tracks.
- Don't introduce a **third** charting lib (visx/tremor/etc.); the estate is too small to justify it and Recharts clears the polish bar with a good shared layer.

---

## Decisions I need from you
1. **Full Nivo removal + custom heatmap** (recommended) — or keep one Nivo heatmap island?
2. **Polish (Phase 3) in scope now**, or land consolidation first and polish as a follow-up?
3. **Data-wiring priority** — kick off the parallel real-data track now, or defer until after consolidation?
4. **Order vs the queue-allocation plan** — chart work first, or let the skilled-worker plan land on `/livequeue` first?
