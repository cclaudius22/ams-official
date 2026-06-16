/**
 * ReplicaDISProvider — reads the local Postgres replica of Deloitte's DIS schema
 * (db/, :5499) and assembles DISApplicationView. Selected when
 * DIS_DATA_PROVIDER=replica. 2F.4 adds a sibling DeloitteDISProvider that hits
 * Deloitte's real endpoints behind the same seam.
 *
 * The five reads live in ./queries/* (each TDD-validated against the seeded
 * replica). getApplicationView is the composite assembly the reviewer page
 * consumes: it stitches the recommendation core + trail + documents + external
 * checks, maps the wire→view key renames at the boundary, and mocks llm_summary
 * (no DIS source — that's the separate OV-IP Azure endpoint).
 */

import type {
  DISDataProvider,
  DISQueueFilters,
  DISPagination,
  DISPaginated,
  DISTrail,
  DISDocumentsResult,
} from './index'
import type { DISApplicationView, DISQueueRow, ExternalCheckResult } from '@/api-contracts/dis'
import { queryQueue } from './queries/queue'
import { queryRecommendationCore } from './queries/recommendation'
import { queryTrail } from './queries/trail'
import { queryDocuments } from './queries/documents'
import { queryExternalChecks } from './queries/externalChecks'

/**
 * llm_summary has no source among the five reads — it is produced by the OV-IP
 * narrative service (Azure/Gemma, V5 §6) which is not yet wired. Until then the
 * replica view carries this honest placeholder rather than a fabricated letter.
 */
const LLM_SUMMARY_PENDING =
  'AI narrative pending — the OV-IP summary service is not yet wired to the read layer. ' +
  'This recommendation was produced deterministically by Drools + OPA; see the rule trace for the reasoning.'

export class ReplicaDISProvider implements DISDataProvider {
  getApplications(filters: DISQueueFilters, pagination: DISPagination): Promise<DISPaginated<DISQueueRow>> {
    return queryQueue(filters, pagination)
  }

  getTrail(sourceApplicationId: string): Promise<DISTrail | null> {
    return queryTrail(sourceApplicationId)
  }

  getDocuments(sourceApplicationId: string): Promise<DISDocumentsResult | null> {
    return queryDocuments(sourceApplicationId)
  }

  getExternalChecks(sourceApplicationId: string): Promise<ExternalCheckResult[] | null> {
    return queryExternalChecks(sourceApplicationId)
  }

  async getApplicationView(sourceApplicationId: string): Promise<DISApplicationView | null> {
    // The recommendation core decides existence — no recommendation row means
    // there is no view to assemble (404 at the route).
    const core = await queryRecommendationCore(sourceApplicationId)
    if (!core) return null

    const [trail, docs, checks] = await Promise.all([
      queryTrail(sourceApplicationId),
      queryDocuments(sourceApplicationId),
      queryExternalChecks(sourceApplicationId),
    ])

    return {
      ...core,
      // Wire→view key rename happens inside the trail read (drools_evaluations
      // → rule_results, opa_evaluations → opa_results); denial_reasons come
      // from the OPA table, which is why Panel 2 must be fed from here, not the
      // recommendation callback blob.
      rule_results: trail?.rule_results ?? [],
      opa_results: trail?.opa_results ?? [],
      external_checks: checks ?? [],
      documents: docs?.documents ?? [],
      document_extractions: docs?.document_extractions ?? [],
      llm_summary: LLM_SUMMARY_PENDING,
      // audit_log intentionally omitted — legacy V3 shape with no as-built
      // source; recommendation.rules_summary + version arrays are the evidence.
    }
  }
}
