/**
 * Chart design tokens — the non-colour half of the visual grammar.
 *
 * Restraint over chrome (Linear/Stripe register): hairline grid, no axis lines,
 * muted small ticks, tasteful motion, one type scale. Defined once here so every
 * primitive inherits the same language and the estate is re-skinnable in one place.
 * (Colour lives in `theme.ts`.)
 */

/** Muted axis treatment — no axis line, no tick marks, small slate labels. */
export const AXIS = {
  tickFontSize: 11,
  tickFill: '#94a3b8', // slate-400
  axisLine: false as const,
  tickLine: false as const,
} as const

/** Minimal grid — a single horizontal hairline, never the vertical Excel lattice. */
export const GRID = {
  stroke: '#eef2f6', // near-invisible hairline (light)
  strokeDark: '#1f2937', // gray-800 (dark)
  horizontal: true as const,
  vertical: false as const,
} as const

/** Tooltip surface — rounded, hairline border, soft shadow. */
export const TOOLTIP_SURFACE = {
  radius: 8,
  border: '1px solid #e2e8f0', // slate-200
  borderDark: '1px solid #334155', // slate-700
  shadow: '0 4px 16px -4px rgba(15, 23, 42, 0.12)',
} as const

/** Tasteful motion — fade + slight rise, ease-out; consumers gate on prefers-reduced-motion. */
export const MOTION = {
  enter: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
  /** Recharts in-chart draw duration (ms) for data-change transitions. */
  chartDrawMs: 600,
} as const

/** One type scale across KPI cards, titles, and chart labels. `tabular-nums` aligns figures. */
export const TYPE = {
  kpiValue: 'text-3xl font-semibold tabular-nums tracking-tight text-gray-900 dark:text-gray-100',
  kpiUnit: 'text-base font-medium text-gray-400 dark:text-gray-500',
  kpiLabel: 'text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400',
  chartTitle: 'text-sm font-medium text-gray-500 dark:text-gray-400',
} as const

/** Standard chart body height (px) — consistent vertical rhythm across the estate. */
export const CHART_HEIGHT = 288 // h-72
