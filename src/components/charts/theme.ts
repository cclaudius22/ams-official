/**
 * Chart theme — the single source of truth for chart colour.
 *
 * Replaces the per-file palettes that were scattered across the dashboard
 * (`SUBTLE_COLORS` ×2, `COLORS`, `BLUE_GREEN_SCHEME`, `CATEGORICAL_SCHEME`,
 * `STATUS_COLORS`, `VISA_COLORS`, `AREA_/SLA_CHART_COLORS`). Every chart
 * primitive resolves colour from here so the estate reads as one system.
 *
 * Canon: this is aggregate-analytics colour only. The recommendation enum is
 * consumed from the published contract — never re-declared here.
 */
import type { RecommendationOutcome } from '@/api-contracts/queue-contract'

/** Canonical categorical series palette (Tailwind *-400 family, dark-mode friendly). */
export const CHART_PALETTE: string[] = [
  '#60a5fa', // blue-400
  '#34d399', // emerald-400
  '#facc15', // yellow-400
  '#fb923c', // orange-400
  '#a78bfa', // violet-400
  '#fb7185', // rose-400
  '#9ca3af', // gray-400
]

/** Stable, wrapping colour for the nth series. Handles negative indices safely. */
export function seriesColor(index: number): string {
  const len = CHART_PALETTE.length
  const i = ((index % len) + len) % len
  return CHART_PALETTE[i]
}

/** Deterministic string → palette index (fallback colouring for unrecognised keys). */
function hashIndex(s: string, mod: number): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % mod
}

/**
 * Stable colour per canonical visa type — the same hue everywhere a type appears
 * (e.g. skilled_worker is always indigo). Keyed by the registry's canonical key.
 * A cohesive jewel family, deliberately offset from the reserved semantic hues.
 */
const VISA_TYPE_COLOR_MAP: Record<string, string> = {
  skilled_worker_visa: '#6366f1', // indigo — hero (the live phase-1 route)
  student_visa: '#0ea5e9', // sky
  senior_specialist_worker_visa: '#8b5cf6', // violet
  spouse_partner_visa: '#14b8a6', // teal
  global_talent_visa: '#ec4899', // pink
  innovator_founder_visa: '#f59e0b', // amber
}

export function visaTypeColor(visaTypeId: string): string {
  return VISA_TYPE_COLOR_MAP[visaTypeId] ?? seriesColor(hashIndex(visaTypeId, CHART_PALETTE.length))
}

/** Reserved semantic colours — fixed meaning, never used as decorative series colours. */
export const SEMANTIC_COLORS = {
  positive: '#10b981', // emerald-500 — approve / terminal positive
  negative: '#ef4444', // red-500 — reject / terminal negative
  warning: '#f59e0b', // amber-500 — manual review / pending / waiting
  info: '#3b82f6', // blue-500 — in progress
  neutral: '#94a3b8', // slate-400 — other / unknown
} as const

/** Semantic colour for the queue lifecycle, bucketed by meaning. */
const STATUS_COLOR_MAP: Record<string, string> = {
  // pre-decision / waiting → amber
  Received: '#f59e0b',
  Processed: '#f59e0b',
  Pending: '#f59e0b',
  'Pending Assignment': '#f59e0b',
  'Awaiting Allocation': '#f59e0b',
  'Awaiting Info': '#f59e0b',
  // in flight → blue
  'In Progress': '#3b82f6',
  Escalated: '#3b82f6',
  // terminal positive → emerald
  Approved: '#10b981',
  Decided: '#10b981',
  // terminal negative → red
  Rejected: '#ef4444',
}
const STATUS_FALLBACK = '#9ca3af' // gray-400

export function statusColor(status: string): string {
  return STATUS_COLOR_MAP[status] ?? STATUS_FALLBACK
}

/** Recommendation → semantic colour. Consumes the canonical enum (never re-declared). */
const RECOMMENDATION_COLOR_MAP: Record<RecommendationOutcome, string> = {
  RECOMMEND_APPROVE: '#10b981', // emerald-500
  RECOMMEND_REJECT: '#ef4444', // red-500
  MANUAL_REVIEW: '#f59e0b', // amber-500
}

export function recommendationColor(outcome: RecommendationOutcome): string {
  return RECOMMENDATION_COLOR_MAP[outcome]
}
