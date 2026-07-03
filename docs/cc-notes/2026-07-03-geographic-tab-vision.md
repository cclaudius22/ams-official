# Geographic Analysis tab — Chris's vision (PARKED, do not forget)

> Date: 2026-07-03 · Status: **parked deliberately** — Predictions tab was built first (Chris's call).
> The tab stays visible with its placeholder; do NOT remove it.

## What Chris wants here (his words, 3 Jul)

- **Current intake of different nationalities in the country** — who is applying, from where, now.
- **Predictions over the next 12 months** — nationality/origin intake forecast.
- **"Something quite spectacular… some sort of spatial intelligence"** — this tab is meant to be a
  wow-moment, not another bar-chart grid. Think map-first, interactive, exploratory.

## Constraints to respect when building it

- Avoid "approval rate by nationality" as a headline — reads as profiling in a HO context. Volume,
  demand forecasting, and documentation-friction framings are the safe, useful angles.
- The corpus (`data/demo-corpus`) already carries nationalities — intake-by-nationality can be real
  (provider-derived), not mock, from day one.
- No third charting library (estate rule). A map layer is a different question — evaluate a
  lightweight/dependency-light approach (inline SVG world map, or a purpose-built canvas) before
  reaching for a heavy geo lib; whatever is chosen must fit the quiet-estate register
  (`docs/cc-notes/2026-07-03-quiet-estate-palette.md` — ink `#2d5a9e`, sequential ink ramps).
- 12-month forecast = operational forecasting (volumes), consistent with the Predictions tab's
  no-applicant-level-prediction guardrail.

## Related state (same day)

Predictions tab BUILT (capacity what-if slider on the shared 25/day cap + backlog clearance
projection + 30-day intake forecast — `src/components/dashboard/PredictionsTab.tsx`,
`src/lib/capacityProjection.ts`). Processing Metrics tab reworked to DIS domain + canonical visa
types (`src/__tests__/processing-metrics-domain.test.ts` locks the vocabulary). Overview tab's
visa types fixed to the registry.
