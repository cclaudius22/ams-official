/**
 * AMS QUEUE DATA CONTRACT — PUBLISHED, single source of truth.
 *
 * Owned by Agent 1 (the multi-visa-queue / data + provider layer). This barrel
 * is THE import surface for the queue's data contract. Agent 2 (presentation /
 * charting) consumes from here — do NOT invent a parallel shape, do NOT hardcode
 * visa types, do NOT re-declare the recommendation enum. Import from
 * `@/api-contracts/queue-contract`.
 *
 * Spec: docs/specs/2026-06-25-ams-queue-data-contract.md
 */

// --- Provider access (how to read the queue) ---
export { getDataProvider } from '@/data/providers'
export type { ApplicationDataProvider, PaginatedResponse, PaginationParams } from '@/data/providers'

// --- The DIS-aligned shape the queue reads through ---
export type {
  LiveApplication,
  ApplicationDetail,
  ApplicationStatus,
  ApplicationFilters,
} from './applications'

// --- Recommendation enum (canonical, defined once in dis.ts) ---
export type { RecommendationOutcome } from './dis'

// --- Canonical visa-type taxonomy (the 6 FINAL types — use these, never hardcode) ---
export { VISA_TYPES, normalizeVisaType, visaTypeLabel, visaTypePhase } from '@/config/visaTypes'
export type { VisaTypeDef, VisaPhase } from '@/config/visaTypes'
