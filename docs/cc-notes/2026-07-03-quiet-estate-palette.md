# Quiet-estate chart palette — decision record

> Date: 2026-07-03 · Branch: main (uncommitted with the capacity-band fix) · Chris-approved live, iteratively.
> Supersedes the direction options in the 2 Jul artifact board; complements
> [`2026-06-25-charting-consolidation-recommendation.md`](./2026-06-25-charting-consolidation-recommendation.md).

## What changed and why

Chris's brief: charts "too primary and in your face" — wanted premium/subtle/stylish. Validation
(dataviz six-checks: lightness band, chroma floor, CVD separation, contrast) showed the old palette
was also **broken**, not just loud:

- indigo `#6366f1` ↔ violet `#8b5cf6` ΔE **3.3** under protanopia (≥12 required) — Skilled Worker
  and Senior Specialist indistinguishable to red-blind readers;
- sky/teal/amber below 3:1 contrast on white;
- `#f59e0b` was BOTH the Innovator series colour AND the warning semantic (status impersonating a series).

## The chosen system (Direction B "quiet estate" + Chris's one-colour rule)

**Rule: colour only where it carries meaning.** Identity comes from labels.

- **`CHART_INK = '#2d5a9e'`** (deep ink blue) — every visa type (`visaTypeColor()` returns it for ALL
  keys — Chris: "I prefer the visa types to all be one colour"), every nominal single-series bar,
  every single-series line/area. Chosen by Chris after seeing BOTH the ink blue and a brand-indigo
  (`#6366f1`) alternative live on the dev server; indigo read "too purple".
- **`INK_RAMP`** `#8fb0d9 → #6f94c4 → #4f77ae → #2d5a9e → #1c3d73` — ordinal surfaces (stage bars via
  `inkStep(i, n)`, dark-first) and any future stacked-by-visa-type chart. Validated `--ordinal`
  (monotone L, ΔL ≥ 0.06, light end ≥ 2:1).
- **`SEMANTIC_COLORS`** muted: positive `#1f5f40` forest · negative `#7f2422` oxblood · warning
  `#d47a16` saffron · info `#6b93c4` slate blue · neutral `#94a3b8`. All CVD-distinct (ΔE ≥ 12) from
  every categorical slot — the amber double-duty is dead. Warning↔ochre is the one floor-band pair
  (11.7); legal because they never share a chart and status always ships with labels.
- **`CHART_PALETTE`** (rare genuine multi-category charts, e.g. reason donuts):
  `#2d5a9e · #ad8737 · #54439c · #0e8a72 · #cf7099 · #4a7a3d` — muted, adjacent ΔE 12.3, all ≥ 3:1.
  Order is the CVD mechanism; don't reorder.
- **Backlog heatmap UNTOUCHED** — keeps its `#6366f1` sequential ramp by Chris's explicit
  instruction ("I like the colours there, keep them").
- **Process-intake button** (`livequeue/page.tsx`): violet-600 + Sparkles → ink blue `#2d5a9e`
  (+ `#1c3d73` hover) + Inbox icon — operational, not "AI magic".

## Key learnings (don't re-litigate)

1. **Six simultaneous muted hues cannot pass all-pairs CVD** — 0/15,625 combos. Bars/stacks are
   checked on adjacent pairs; HBar rows carry text labels so colour is never identity-alone there.
2. **"Premium" ≠ desaturated.** Below OKLCH chroma ~0.10 hues read gray and stop doing identity work.
   The register is deeper/inkier at controlled chroma.
3. The old map's three blue-family hues (indigo/sky/violet) were structurally CVD-broken — mooted by
   the one-colour rule rather than re-hued.

## Where it lives / verification

- Single source: `src/components/charts/theme.ts` (+ barrel exports `CHART_INK`, `INK_RAMP`, `inkStep`).
- Call-site re-roles: `LiveMetricsSection.tsx`, `ProcessingMetricsTab.tsx` (flat ink for nominal bars,
  `inkStep` for the stage chart); `LiveQueueMetrics.tsx` needed no edit (keyed API kept).
- Tests: `src/__tests__/charts/theme.test.ts` pins the system (ink hex, one-colour rule, semantic
  hexes, ramp behaviour). Full suite 228 pass / 24 skip · `tsc --noEmit` 76 baseline (0 new).
- Browser-verified (Playwright, Executive demo login): livequeue + live-intelligence Overview +
  Processing tabs, in both queue states (fresh green-headroom AND post-allocate all-red-at-cap).

## Deferred

- **Dark-mode restep** — the deep inks were validated against white; dark surfaces need their own
  steps from the same hues (dataviz: dark mode is selected, not flipped). Do with the Phase-3 polish.
- Data-wiring track unchanged (mock hooks still mock).
- KPI-card icon chips + status pills use Tailwind classes outside the chart theme — align if wanted.
