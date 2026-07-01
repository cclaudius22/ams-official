/**
 * DIS Data Provider seam.
 *
 * The contract every DIS consumer depends on is the DISApplicationView type
 * (src/api-contracts/dis.ts) plus the granular reads behind it. This provider
 * abstracts WHERE that data comes from so the source can flip between:
 *   - 'mock'    — the in-repo fixture (default; demo-safe, no DB needed)
 *   - 'replica' — the local Postgres replica of Deloitte's schema (2F.3)
 *   - 'deloitte'— Deloitte's own read endpoints (2F.4, later)
 *
 * Mirrors the existing src/data/providers/index.ts (getDataProvider) pattern:
 * a singleton resolved from an env var via dynamic import.
 */

import type {
  DISApplicationView,
  DISQueueRow,
  DroolsRuleResult,
  OPAPolicyResult,
  ExternalCheckResult,
  DISDocument,
  DocumentExtraction,
  QueueState,
  VisaType,
} from '@/api-contracts/dis'

export interface DISQueueFilters {
  /** Filter to a single derived queue state (e.g. READY_FOR_REVIEW). */
  queue_state?: QueueState
  visa_type?: VisaType
}

export interface DISPagination {
  page: number
  pageSize: number
}

export interface DISPaginated<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** E3 — Glass Box trail (read from the opa/drools TABLES, carries denial_reasons). */
export interface DISTrail {
  rule_results: DroolsRuleResult[]
  opa_results: OPAPolicyResult[]
}

/** E4 — per-document evidence: documents joined to their extractions + app-level fraud. */
export interface DISDocumentsResult {
  documents: DISDocument[]
  document_extractions: DocumentExtraction[]
  cross_doc_fraud: Record<string, unknown> | null
}

/**
 * E2 core — the recommendation slice of the composite (no detail arrays).
 * What GET /api/dis/applications/{id} returns; getApplicationView extends it.
 */
export type DISRecommendationCore = Pick<
  DISApplicationView,
  | 'recommendation'
  | 'component_scores'
  | 'source_channel'
  | 'queue_state'
  | 'source_application_id'
  | 'source_reference'
  | 'dis_application_id'
  | 'submitted_at'
>

/**
 * The five V5 §6 reads + the composite assembly. Every method is keyed on the
 * AMS-facing source_application_id (e.g. VK-2026-RK-4821), never the DIS UUID.
 * A method returns null when no application matches that id.
 */
export interface DISDataProvider {
  /** E1 — queue list (filtered on derived queue_state), paginated. */
  getApplications(filters: DISQueueFilters, pagination: DISPagination): Promise<DISPaginated<DISQueueRow>>
  /** Composite — full assembled view for the reviewer page (E2+E3+E4+E5 + llm_summary). */
  getApplicationView(sourceApplicationId: string): Promise<DISApplicationView | null>
  /** E3 — rule_results + opa_results incl. denial_reasons. */
  getTrail(sourceApplicationId: string): Promise<DISTrail | null>
  /** E4 — documents + extractions + cross_doc_fraud. */
  getDocuments(sourceApplicationId: string): Promise<DISDocumentsResult | null>
  /** E5 — external_checks (7 types incl. COS_CHECK). */
  getExternalChecks(sourceApplicationId: string): Promise<ExternalCheckResult[] | null>
}

// Singleton provider instance (reset between tests via resetDISProvider).
let providerInstance: DISDataProvider | null = null

export async function getDISProvider(): Promise<DISDataProvider> {
  if (!providerInstance) {
    const providerType = process.env.DIS_DATA_PROVIDER || 'mock'

    if (providerType === 'mock') {
      const { MockDISProvider } = await import('./mock-provider')
      providerInstance = new MockDISProvider()
    } else if (providerType === 'replica') {
      const { ReplicaDISProvider } = await import('./replica-provider')
      providerInstance = new ReplicaDISProvider()
    } else {
      // 'deloitte' wired in phase 2F.4.
      throw new Error(`Unknown or unimplemented DIS data provider: ${providerType}`)
    }
  }

  return providerInstance
}

/** Reset the singleton — for tests, and to re-resolve after an env change. */
export function resetDISProvider(): void {
  providerInstance = null
}
