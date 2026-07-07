/**
 * Chart theme — the single source of truth for chart colour.
 *
 * Quiet-estate register (Chris, 3 Jul 2026): colour appears only where it carries
 * meaning. Visa types are ALL one ink — identity comes from labels, not hue — and
 * the semantic set is muted to deep, editorial tones. Every value here passed the
 * dataviz validator (lightness band, chroma floor, CVD separation, 3:1 contrast on
 * white); see docs/cc-notes/2026-07-03-quiet-estate-palette.md before changing one.
 *
 * Canon: this is aggregate-analytics colour only. The recommendation enum is
 * consumed from the published contract — never re-declared here.
 */
import type { RecommendationOutcome } from '@/api-contracts/queue-contract'

/**
 * The one chart ink — every visa type, every single-series mark. Deep ink blue
 * (Chris's pick, 3 Jul, after seeing the brand-indigo alternative live; the Backlog
 * heatmap keeps its own indigo by his explicit instruction).
 */
export const CHART_INK = '#2d5a9e'

/**
 * Categorical palette for the rare chart with GENUINE multi-category identity
 * (e.g. reason donuts). Slot 1 is the ink; order is the CVD-safety mechanism
 * (validated adjacent ΔE 12.3 under protanopia/deuteranopia) — don't reorder.
 */
export const CHART_PALETTE: string[] = [
  '#2d5a9e', // ink blue (= CHART_INK)
  '#ad8737', // bronze ochre
  '#54439c', // dark violet
  '#0e8a72', // deep teal
  '#cf7099', // dusty rose
  '#4a7a3d', // moss
]

/** Stable, wrapping colour for the nth series. Handles negative indices safely. */
export function seriesColor(index: number): string {
  const len = CHART_PALETTE.length
  const i = ((index % len) + len) % len
  return CHART_PALETTE[i]
}

/**
 * One-hue ordinal ramp of the ink, light→dark (validated: monotone L, ΔL ≥ 0.06,
 * light end ≥ 2:1 on white). For ordered categories — process stages, tiers — and
 * any future stacked-by-visa-type surface (visa types stay one HUE by rule).
 */
export const INK_RAMP: string[] = ['#8fb0d9', '#6f94c4', '#4f77ae', '#2d5a9e', '#1c3d73']

/** Ramp step for category `index` of `count`: first category darkest, spreading lighter. */
export function inkStep(index: number, count: number): string {
  const last = INK_RAMP.length - 1
  const t = count <= 1 ? 0 : Math.min(Math.max(index, 0), count - 1) / (count - 1)
  return INK_RAMP[last - Math.round(t * last)]
}

/**
 * Every visa type wears the chart ink — all one colour (identity is the row/legend
 * label's job). Keyed API kept so call-sites and any future per-type exceptions
 * don't churn; unknown keys get the same ink, never a fallback rainbow.
 */
export function visaTypeColor(_visaTypeId: string): string {
  return CHART_INK
}

/** Reserved semantic colours — fixed meaning, never used as decorative series colours. */
export const SEMANTIC_COLORS = {
  positive: '#1f5f40', // deep forest — approve / terminal positive
  negative: '#7f2422', // oxblood — reject / terminal negative
  warning: '#d47a16', // saffron — manual review / pending / waiting
  info: '#6b93c4', // slate blue — in progress
  neutral: '#94a3b8', // slate-400 — other / unknown
} as const

/** Semantic colour for the queue lifecycle, bucketed by meaning. */
const STATUS_COLOR_MAP: Record<string, string> = {
  // pre-decision / waiting → saffron
  Received: SEMANTIC_COLORS.warning,
  Processed: SEMANTIC_COLORS.warning,
  Pending: SEMANTIC_COLORS.warning,
  'Pending Assignment': SEMANTIC_COLORS.warning,
  'Awaiting Allocation': SEMANTIC_COLORS.warning,
  'Awaiting Info': SEMANTIC_COLORS.warning,
  // in flight → slate blue
  'In Progress': SEMANTIC_COLORS.info,
  Escalated: SEMANTIC_COLORS.info,
  // terminal positive → forest
  Approved: SEMANTIC_COLORS.positive,
  Decided: SEMANTIC_COLORS.positive,
  // terminal negative → oxblood
  Rejected: SEMANTIC_COLORS.negative,
}

export function statusColor(status: string): string {
  return STATUS_COLOR_MAP[status] ?? SEMANTIC_COLORS.neutral
}

/** Recommendation → semantic colour. Consumes the canonical enum (never re-declared). */
const RECOMMENDATION_COLOR_MAP: Record<RecommendationOutcome, string> = {
  RECOMMEND_APPROVE: SEMANTIC_COLORS.positive,
  RECOMMEND_REJECT: SEMANTIC_COLORS.negative,
  MANUAL_REVIEW: SEMANTIC_COLORS.warning,
}

export function recommendationColor(outcome: RecommendationOutcome): string {
  return RECOMMENDATION_COLOR_MAP[outcome]
}
