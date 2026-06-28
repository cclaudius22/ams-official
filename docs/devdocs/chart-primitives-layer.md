# Chart Primitives Layer — Developer Guide

> **What:** the shared charting system at `src/components/charts/`. Every dashboard chart
> renders through it, so the estate reads as one premium, consistent visual language.
> **Why it exists:** the dashboard previously mixed **Recharts + Nivo** with per-page palettes,
> three different tooltips, and no empty/loading states. This layer consolidates on **Recharts**,
> retires Nivo, and centralises colour/chrome/motion/states so polish is set once.
> **Status (2026-06-27):** built + live on `/dashboard/live-intelligence`. Recharts is the single
> charting lib; Nivo fully removed. `LiveQueueMetrics` (`/dashboard/livequeue`) is the one chart
> surface NOT yet migrated — see [Remaining work](#remaining-work).

---

## 1. Quick start

Import everything from the barrel. Pass **data + labels only** — palette, axes, tooltip, motion,
and empty/loading states are inherited.

```tsx
import { HBar, Donut, LineWithTarget, visaTypeColor } from '@/components/charts'

// Horizontal bar, coloured by canonical visa type (stable colour-as-meaning)
<HBar
  title="Applications by Visa Type"
  data={[{ name: 'Skilled Worker', value: 612, visaTypeId: 'skilled_worker_visa' }, /* … */]}
  color={(d) => visaTypeColor(String(d.visaTypeId))}
/>

// Donut with a percent formatter
<Donut title="Recommendation distribution" data={dist} valueFormatter={(v) => `${v}%`} />

// Line with a dashed target reference
<LineWithTarget title="SLA (24h)" data={sla} valueKey="within" target={95} yDomain={[85, 100]} />
```

Each wrapper renders inside a `ChartCard` (frame + title + motion) and a `ChartCanvas`
(the state gate). You don't compose those yourself for standard charts.

---

## 2. The visual grammar

Premium-but-restrained — think Linear/Stripe, fitted to a government decisioning tool.

### Colour: two roles, never mixed
- **Semantic (reserved meaning)** — `SEMANTIC_COLORS`: `positive` emerald, `negative` red,
  `warning` amber, `info` blue, `neutral` slate. **Never** used as decorative series colours.
- **Categorical visa-type** — `visaTypeColor(visaTypeId)` returns a **stable** hue per canonical
  key, so a type is the same colour in *every* chart:

  | canonical key | colour | |
  |---|---|---|
  | `skilled_worker_visa` | `#6366f1` indigo | **hero** (live phase-1 route) |
  | `student_visa` | `#0ea5e9` sky | |
  | `senior_specialist_worker_visa` | `#8b5cf6` violet | |
  | `spouse_partner_visa` | `#14b8a6` teal | |
  | `global_talent_visa` | `#ec4899` pink | |
  | `innovator_founder_visa` | `#f59e0b` amber | |

  Unknown keys get a deterministic palette fallback. For non-visa categories use `seriesColor(i)`.

### Chrome (restraint)
No axis lines, no tick marks, a single horizontal hairline grid (`#eef2f6`), muted 11px slate ticks,
generous whitespace. Configured once in `tokens.ts` (`AXIS`, `GRID`).

### Typography + numbers
One type scale (`TYPE` tokens), `tabular-nums` everywhere so figures align, uppercase micro-labels.
Format via `format.ts` (`formatPercent`, `formatCount`, `formatSignedPercent`).

### Motion
Load motion = **framer-motion** card fade + 8px rise (`MOTION.enter`), `prefers-reduced-motion`
respected. **Recharts per-series animation is deliberately OFF** (`isAnimationActive={false}`) — see
[Gotchas](#5-conventions--gotchas).

### States
Every chart has a **designed empty state** (`ChartEmpty` — plain-language, interface voice) and a
**skeleton loader** (`ChartSkeleton`) — never a blank box or a bare spinner.

---

## 3. File map

```
src/components/charts/
  theme.ts          Colour: CHART_PALETTE, seriesColor, statusColor,
                    recommendationColor, visaTypeColor, SEMANTIC_COLORS
  tokens.ts         Non-colour grammar: AXIS, GRID, TOOLTIP_SURFACE, MOTION, TYPE, CHART_HEIGHT
  format.ts         formatPercent, formatCount, formatSignedPercent
  _internal.ts      ColorResolver, resolveColor, ChartSeries, ChartDatum  (not exported in barrel)

  ChartCard.tsx     Frame: Card + title + framer-motion enter
  ChartCanvas.tsx   State gate: loading→skeleton, empty→ChartEmpty, else→ResponsiveContainer
  ChartTooltip.tsx  THE single custom tooltip (used by every Recharts chart)
  ChartStates.tsx   ChartEmpty + ChartSkeleton
  KpiCard.tsx       Unified KPI tile (value + unit + signed trend)
  MetricCard.tsx    Summary tile (icon chip + label + value)

  HBar.tsx          Horizontal bar      (the workhorse)
  Donut.tsx         Donut / composition
  StackedBar.tsx    Vertical stacked bar
  AreaTrend.tsx     Area trend over time (1+ series, gradient fills)
  LineWithTarget.tsx Single line + optional dashed target reference
  Heatmap.tsx       Custom CSS-grid heatmap (no charting lib — retired Nivo) + heatmapColor()

  index.ts          Public barrel — import from here
```

---

## 4. Component API reference

All wrappers accept `title?`, `loading?`, `height?` (default `CHART_HEIGHT` = 288), `emptyMessage?`.
`color` props accept a `ColorResolver`: a fixed string **or** `(entry, index) => string`.

| Component | Key props | Notes |
|---|---|---|
| `HBar` | `data, indexKey='name', valueKey='value', color?, valueFormatter?, labelWidth=96` | horizontal bars |
| `Donut` | `data, nameKey='name', valueKey='value', color?, valueFormatter?, legend=true` | empty if all values 0 |
| `StackedBar` | `data, series: ChartSeries[], indexKey='name', legend=true` | empty if no data **or** no series |
| `AreaTrend` | `data, series: ChartSeries[], xKey='name', stacked=false, legend=true` | gradient area fills |
| `LineWithTarget` | `data, xKey='name', valueKey='value', valueLabel, color?, target?, targetLabel?, valueFormatter?, yDomain=['auto','auto']` | `target` draws a dashed amber reference line |
| `Heatmap` | `rows: HeatmapRow[], base='#6366f1', min?, max?, valueFormatter?, legend=true` | `HeatmapRow = { id, cells: { x, value }[] }`; sequential light→`base` scale |
| `KpiCard` | `title, value, unit?, trend?, invertTrend?, subtitle?` | `trend` is a signed %; set `invertTrend` where ↓ is good (backlog, processing time) |
| `MetricCard` | `label, value, icon, accentClassName?` | icon chip + value |
| `ChartCard` | `title?, action?, className?, children` | frame; `action` = header-right slot (e.g. refresh) |
| `ChartTooltip` | (Recharts injects `active/payload/label`) `valueFormatter?, labelFormatter?` | pass via `content={<ChartTooltip … />}` |
| `ChartEmpty` | `message?, hint?, icon?, height?` | |
| `ChartSkeleton` | `height?, bars?` | `role="status"`, `motion-safe:animate-pulse` |

`ChartSeries = { key: string; label?: string; color?: string }` — for multi-series charts
(`StackedBar`, `AreaTrend`). `ChartDatum = Record<string, string|number|boolean|undefined>`.

---

## 5. Conventions & gotchas

- **Consume the contract.** Data shapes come from `@/api-contracts/queue-contract`
  (`LiveApplication`, `RecommendationOutcome`, the `VISA_TYPES` registry). **Never** invent a
  parallel data shape, hardcode the visa-type list, or re-declare the recommendation enum.
- **Group/filter on `visaTypeId`** (canonical key), render labels via `visaTypeLabel(visaTypeId)`.
  Don't split on the free-text `visaType` display string.
- **Recharts per-series animation is OFF by design.** Recharts' `isAnimationActive` interacts badly
  with `ResponsiveContainer`'s 0-width first paint: bars/lines/areas animate from a zero-size frame
  and never redraw, rendering **invisible**. The fix here is to disable it and let framer-motion's
  card enter carry the motion (also better for perf — no re-grow on every data poll). If you add a
  new Recharts wrapper, keep `isAnimationActive={false}`.
- **Canon — no per-application numeric scores in officer per-case views.** These charts are
  aggregate analytics (queue-level) and are fine. Do **not** introduce a per-case risk/grade number
  into a reviewer's per-application view. The OV Intelligence panel is the deliberate exception and
  is **out of scope** (don't touch it).
- **Recommendation language.** Where DIS outcomes appear, keep `RECOMMEND_APPROVE/REJECT/MANUAL_REVIEW`
  framing — "DIS recommends, the officer decides" — not bare "approve/reject" decisions.
- **Don't touch:** `src/data/providers/json-provider.ts`, `output_demo`, the reviewer surface
  (`src/app/dashboard/reviewer/**`), and `OVIntelligencePanel.tsx`.
- **tsc baseline = 76 errors.** Keep it at 76 (0 new): `npx tsc --noEmit 2>&1 | grep -c "error TS"`.

---

## 6. Adding a new chart

Standard pattern — wrap Recharts in `ChartCard` + `ChartCanvas`, use the tokens + the one tooltip:

```tsx
'use client'
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from './ChartCard'
import { ChartCanvas } from './ChartCanvas'
import { ChartTooltip } from './ChartTooltip'
import { AXIS, GRID } from './tokens'
import { resolveColor, type ChartDatum, type ColorResolver } from './_internal'

export function MyChart({ data, title, loading, color }: { /* … */ }) {
  return (
    <ChartCard title={title}>
      <ChartCanvas loading={loading} isEmpty={!data?.length}>
        <BarChart data={data}>
          <CartesianGrid stroke={GRID.stroke} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: AXIS.tickFontSize, fill: AXIS.tickFill }}
                 axisLine={AXIS.axisLine} tickLine={AXIS.tickLine} />
          <YAxis tick={{ fontSize: AXIS.tickFontSize, fill: AXIS.tickFill }}
                 axisLine={AXIS.axisLine} tickLine={AXIS.tickLine} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={resolveColor(color, d, i)} />)}
          </Bar>
        </BarChart>
      </ChartCanvas>
    </ChartCard>
  )
}
```

Then export it from `index.ts`. Mark files using Recharts/framer-motion/hooks `'use client'`.

---

## 7. Testing

- TDD. Tests live in `src/__tests__/charts/`. Run: `npx vitest run src/__tests__/charts/`.
- **Pure logic** (theme resolvers, formatters, `heatmapColor`) is unit-tested directly.
- **Recharts wrappers**: `ResponsiveContainer` measures 0 in happy-dom, so tests mock it to inject a
  fixed size (see `wrappers.test.tsx`). Assert on the **state gate** (loading→`role="status"`,
  empty→message, data→`<svg>` present) rather than chart internals.
- Whole suite green baseline: **154 passed / 24 skipped**; tsc **76**.

---

## 8. How the migration was done (reference for the remaining surfaces)

`/dashboard/live-intelligence` was migrated by **swapping presentation only** — the data hooks
(`useVisaMetrics` in `LiveMetricsSection`, `useProcessingMetrics`) were preserved; only the chart
rendering moved onto the wrappers. Pattern:
1. Map each old chart → a wrapper (`old horizontal bar` → `HBar`, `old Nivo heatmap` → `Heatmap`, …).
2. Keep the hook's field names; pass them via `valueKey`/`xKey`/series `key`.
3. Delete the file's local palettes / `CustomTooltip` / chart sub-components.
4. Verify: tsc 76, suite green, before/after screenshot of the real page.

Migrated: `src/components/dashboard/LiveMetricsSection.tsx`, `ProcessingMetricsTab.tsx`.

---

## 9. Remaining work

- **T9 — `LiveQueueMetrics.tsx`** (`/dashboard/livequeue`): the last unmigrated chart surface.
  **Gated** on the data-layer owner's sign-off — his adversarial gate has this file in scope and may
  apply a fix, so let it land first (don't both touch it in the same window). Migrate **presentation
  only**, and **preserve the pending-count filter**: both the status-donut "Pending" bucket and
  `metrics.pending` must keep counting the new lifecycle statuses —
  `'Received' || 'Processed' || 'Awaiting Allocation'` alongside the legacy
  `'Pending' || 'Pending Assignment' || 'Awaiting Info'` — or the queue backlog reads as **0**.
  **Re-read the file at migration time** (the gate may have adjusted it). Coordinate before editing
  it or `livequeue/page.tsx`.
- **Data-wiring track (deferred):** the migrated charts still read `Math.random()` mock hooks. Real
  data = a `@/api-contracts/queue-contract` adapter mapping `LiveApplication[]` → chart series via
  `visaTypeId` / `visaTypeLabel` / `RecommendationOutcome`. The wrappers are data-shape-agnostic, so
  this is a drop-in at the adapter layer.
- **Flagged follow-ups (review-surfaced, out of original scope):**
  1. `src/hooks/useProcessingMetrics.tsx` still declares local palettes (`SUBTLE_COLORS`, …) and
     injects a `fill` side-channel into data. Harmless today (the `Donut`s colour via `seriesColor`
     and ignore `fill`), but cleaning the hook would complete the consolidation.
  2. `LiveMetricsSection`'s mock "by visa type" list is non-canonical (`Business/Tourist/…`). It's
     demo data coloured by `seriesColor`, so no bug — but regenerate it from `VISA_TYPES` for demo
     coherence when wiring real data.

---

## 10. Background reading
- Estate inventory: `docs/cc-notes/2026-06-25-charting-estate-inventory.md`
- Consolidation decision: `docs/cc-notes/2026-06-25-charting-consolidation-recommendation.md`
- Build worklog (full task-by-task history): `docs/cc-notes/2026-06-25-charting-consolidation-worklog.md`
- Data contract (the seam): `src/api-contracts/queue-contract.ts` + `docs/specs/2026-06-25-ams-queue-data-contract.md`
