/**
 * Chart primitives — public barrel.
 *
 * The shared chart layer. Pages import from here and pass data + labels only;
 * palette, chrome, tooltip, motion, and states are all inherited. Re-skinning
 * the estate is a one-file change in `theme.ts` / `tokens.ts`.
 */

// Tokens & helpers
export {
  CHART_PALETTE,
  CHART_INK,
  INK_RAMP,
  inkStep,
  seriesColor,
  statusColor,
  recommendationColor,
  visaTypeColor,
  SEMANTIC_COLORS,
} from './theme'
export { AXIS, GRID, TOOLTIP_SURFACE, MOTION, TYPE, CHART_HEIGHT } from './tokens'
export { formatPercent, formatCount, formatSignedPercent } from './format'
export type { ChartSeries, ChartDatum, ColorResolver } from './_internal'

// Frame, state, tooltip
export { ChartCard, type ChartCardProps } from './ChartCard'
export { ChartCanvas, type ChartCanvasProps } from './ChartCanvas'
export { ChartTooltip, type ChartTooltipProps, type ChartTooltipItem } from './ChartTooltip'
export { ChartEmpty, ChartSkeleton, type ChartEmptyProps, type ChartSkeletonProps } from './ChartStates'
export { KpiCard, type KpiCardProps } from './KpiCard'
export { MetricCard, type MetricCardProps } from './MetricCard'

// Chart wrappers
export { HBar, type HBarProps } from './HBar'
export { Donut, type DonutProps } from './Donut'
export { StackedBar, type StackedBarProps } from './StackedBar'
export { AreaTrend, type AreaTrendProps } from './AreaTrend'
export { LineWithTarget, type LineWithTargetProps } from './LineWithTarget'
export { Heatmap, heatmapColor, type HeatmapProps, type HeatmapRow, type HeatmapCell } from './Heatmap'
