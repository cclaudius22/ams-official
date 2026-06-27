# Charting Estate Inventory — Consolidation Measurement Pass

> **Analysis only. No code changed, no libraries removed.** This is the measurement
> pass that informs the Recharts-vs-Nivo consolidation decision.
> Date: 2026-06-25 · Branch: feat/dis-integration-v3

## TL;DR
- The **entire** charting estate is **3 files**. Nivo lives in **only 1** of them.
- **17 rendered charts**: **12 Recharts (71%)** · **5 Nivo (29%)**. **Recharts is the majority.**
- **4 of 5 Nivo charts** have trivial Recharts equivalents (horizontal bars, stacked bar, gradient-area line — all patterns *already used elsewhere in this repo*).
- The **only** Nivo chart with no native Recharts equivalent is the **backlog heatmap** — and it renders **hardcoded inline mock data**.
- `ProcessingMetricsTab.tsx` is the **entangled** component: it runs **both libraries side-by-side**.
- **~82% of charts are mock/hardcoded.** Only `LiveQueueMetrics` (3 charts) reads real data.
- Nivo also has **2 dead imports** (`@nivo/pie`, `@nivo/calendar`) — imported, never rendered.

---

## 1. Per-chart breakdown

### File A — `src/components/dashboard/LiveMetricsSection.tsx`
- **Route:** `/dashboard/live-intelligence` (Overview tab) · **Library:** Recharts · **Data:** MOCK (`useVisaMetrics`, `Math.random()`)

| # | Chart title | Type | Lib | Data |
|---|---|---|---|---|
| 1 | Applications Processing Today | Area (stacked, gradient) | Recharts | mock |
| 2 | Avg Processing Time by Visa Type | Bar (horizontal) | Recharts | mock |
| 3 | Application Status Distribution | Pie (donut) | Recharts | mock |
| 4 | SLA Performance (24h) | Line (+ target line) | Recharts | mock |
| 5 | Visa Approval Rate by Country | Bar (horizontal) | Recharts | mock |
| — | Processing Efficiency Metrics | stat cards (not a chart) | — | mock |

### File B — `src/components/dashboard/LiveQueueMetrics.tsx`
- **Route:** `/dashboard/livequeue` · **Library:** Recharts · **Data:** ✅ **WIRED** (real `applications`/`officials` props → `/api/applications`, `/api/officers`)

| # | Chart title | Type | Lib | Data |
|---|---|---|---|---|
| 6 | Applications by Visa Type | Bar (horizontal) | Recharts | **real** |
| 7 | Status Distribution | Pie (donut) | Recharts | **real** |
| 8 | Officer Workload | Bar (horizontal, capacity colour) | Recharts | **real** |
| — | 4× summary MetricCards | stat cards (not charts) | — | **real** |

### File C — `src/components/dashboard/ProcessingMetricsTab.tsx`  ⚠️ DUAL-LIBRARY
- **Route:** `/dashboard/live-intelligence` (Processing Metrics tab) · **Library:** Nivo **+** Recharts · **Data:** MOCK (`useProcessingMetrics`, `Math.random()`) — several charts **doubly hardcoded** (literal inline arrays, not even from the hook)

| # | Chart title | Type | Lib | Data |
|---|---|---|---|---|
| 9 | SLA Attainment Rate Over Time | Line (gradient area) | **Nivo** | mock (hook) |
| 10 | SLA Attainment by Visa Type | Bar (horizontal) | **Nivo** | mock (hook) |
| 11 | Average Cycle Time by Stage | Bar (horizontal) | **Nivo** | mock (hook) |
| 12 | Queue vs Active Time per Stage | Bar (stacked) | **Nivo** | mock (hook) |
| 13 | Backlog Distribution by Day & Stage | **Heatmap** | **Nivo** | **hardcoded inline** |
| 14 | Top Reasons for SLA Misses | Pie (donut) | Recharts | mock (hook) |
| 15 | Manual vs Automated Processing | Pie (donut) | Recharts | mock (hook) |
| 16 | Automation Performance Metrics | Bar (horizontal) | Recharts | **hardcoded inline** |
| 17 | Top Escalation Reasons | Bar (horizontal) | Recharts | mock (hook) |
| — | 8× KPI cards (42min, 3.2d, 94.8%, 283, 72%, 214…) | stat cards | — | **hardcoded inline** |

---

## 2. The split

| Library | Charts | Share | Files |
|---|---|---|---|
| **Recharts** | **12** | **71%** | A, B, C |
| **Nivo** | **5** | **29%** | C only |
| **Total** | **17** | 100% | 3 |

**Recharts is the clear majority and the only library that touches real data.**
Nivo is confined to a single component and a single tab.

---

## 3. Nivo-only charts → migration-cost list

Every Nivo chart, with its Recharts (v3) equivalent:

| Nivo chart | Recharts v3 equivalent | Cost | Notes |
|---|---|---|---|
| SLA Attainment Over Time (gradient-area line) | `LineChart`/`AreaChart` + `linearGradient` defs | **Trivial** | This exact gradient-area pattern is **already implemented** in `LiveMetricsSection` (chart #1). |
| SLA Attainment by Visa Type (horizontal bar) | `BarChart layout="vertical"` | **Trivial** | Same pattern used in charts #2, #5, #6, #8. |
| Avg Cycle Time by Stage (horizontal bar) | `BarChart layout="vertical"` | **Trivial** | Ditto. |
| Queue vs Active Time (stacked bar) | `Bar … stackId="x"` (native stacking) | **Easy** | Recharts stacks natively; v3 fine. |
| **Backlog Distribution (heatmap)** | **No native heatmap primitive** | **Medium — the only real cost** | Recharts v3 has Treemap + layout hooks but no heatmap. Options: (a) custom SVG/`<Cell>` grid, (b) re-cast as Treemap, (c) keep one tiny Nivo-heatmap island. **Currently hardcoded mock data — lowest-value chart to preserve.** |

**Conclusion:** 4/5 Nivo charts collapse into Recharts patterns this repo already ships. The heatmap is the single genuine decision point — and it's the least "real" chart on the board.

---

## 4. Entanglement

- **No shared chart layer.** Charts are **hand-rolled per page/component**. Each file re-declares its own:
  - Colour palettes — `SUBTLE_COLORS` is defined **twice** (Files A & C), plus `COLORS`, `BLUE_GREEN_SCHEME`, `CATEGORICAL_SCHEME`, `STATUS_COLORS`, `VISA_COLORS`, `AREA_CHART_COLORS`, `SLA_CHART_COLORS`.
  - `CustomTooltip` — **three** separate implementations.
  - `KpiCard` / `MetricCard` — duplicated stat-card components.
- **Dual-library component:** `ProcessingMetricsTab.tsx` imports and renders **both** Nivo (`ResponsiveLine`, `ResponsiveBar`, `ResponsiveHeatMap`) **and** Recharts (`PieChart`, `BarChart`) in the same file — the audit's flag is confirmed.
- **Dead Nivo imports:** `@nivo/pie` (`ResponsivePie`) and `@nivo/calendar` (`ResponsiveCalendar`) are imported but **never rendered** — the two donut pies in this file are Recharts, not Nivo.

---

## 5. Hardcoded vs wired

| Surface | Charts | Data state |
|---|---|---|
| `LiveQueueMetrics` (`/livequeue`) | 3 | ✅ **Real** — derived from `applications`/`officials` props |
| `LiveMetricsSection` (`/live-intelligence` Overview) | 5 | ❌ Mock — `Math.random()` generator (`useVisaMetrics`) |
| `ProcessingMetricsTab` (`/live-intelligence` Processing) | 9 | ❌ Mock — `Math.random()` (`useProcessingMetrics`); **#13 heatmap, #16 automation bar, and all KPI cards are literal hardcoded inline values** |

- **Extent:** **~82% (14/17) of charts are mock/hardcoded.** Only **18% (3/17)** read real data — and they're all Recharts.
- **Dead data in the hook:** `useProcessingMetrics` exposes `slaByTeam`, `processingTimeDistribution`, `stageCompletionRate`, `escalationRateTrend` — destructured but never rendered.

---

## 6. What this means for the consolidation decision (no action taken)
- **Standardising on Recharts** is the low-friction path: it's already the 71% majority, owns 100% of the real-data charts, and 4/5 Nivo charts map onto patterns this repo already uses. The only genuine engineering question is the **heatmap**.
- A **shared chart-primitives + single palette + one tooltip** layer is the higher-leverage win than the library choice itself — it's what will make the polish consistent across all surfaces.
- Most "charts" are decorative mock right now; **wiring real data** is a parallel (and larger) workstream from the library consolidation.
