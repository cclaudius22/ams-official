/**
 * MockDISProvider — returns the in-repo fixture (src/lib/mockDISData.ts).
 *
 * This is the default provider branch and the demo/page fallback: the reviewer
 * page renders from this when DIS_DATA_PROVIDER is unset, so a down replica
 * never blanks the demo. It also pins the DISDataProvider contract the replica
 * provider must satisfy.
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
import { mockDISApplicationView } from '@/lib/mockDISData'

export class MockDISProvider implements DISDataProvider {
  private readonly view: DISApplicationView = mockDISApplicationView

  /** The fixture is keyed by either id form. */
  private matches(id: string): boolean {
    return id === this.view.source_application_id || id === this.view.dis_application_id
  }

  private toQueueRow(): DISQueueRow {
    return {
      dis_application_id: this.view.dis_application_id,
      source_application_id: this.view.source_application_id,
      source_channel: this.view.source_channel,
      visa_type: 'skilled_worker',
      applicant_name: 'Rani Kumari',
      queue_state: this.view.queue_state ?? 'READY_FOR_REVIEW',
      recommendation: this.view.recommendation.recommendation,
      completeness_score: this.view.recommendation.completeness_score,
      submitted_at: this.view.submitted_at,
    }
  }

  async getApplications(
    filters: DISQueueFilters,
    pagination: DISPagination,
  ): Promise<DISPaginated<DISQueueRow>> {
    let rows: DISQueueRow[] = [this.toQueueRow()]
    if (filters.queue_state) rows = rows.filter((r) => r.queue_state === filters.queue_state)
    if (filters.visa_type) rows = rows.filter((r) => r.visa_type === filters.visa_type)

    const total = rows.length
    const start = (pagination.page - 1) * pagination.pageSize
    const data = rows.slice(start, start + pagination.pageSize)
    return {
      data,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    }
  }

  async getApplicationView(sourceApplicationId: string): Promise<DISApplicationView | null> {
    return this.matches(sourceApplicationId) ? this.view : null
  }

  async getTrail(sourceApplicationId: string): Promise<DISTrail | null> {
    if (!this.matches(sourceApplicationId)) return null
    return { rule_results: this.view.rule_results, opa_results: this.view.opa_results }
  }

  async getDocuments(sourceApplicationId: string): Promise<DISDocumentsResult | null> {
    if (!this.matches(sourceApplicationId)) return null
    return {
      documents: this.view.documents ?? [],
      document_extractions: this.view.document_extractions,
      cross_doc_fraud: null,
    }
  }

  async getExternalChecks(sourceApplicationId: string): Promise<ExternalCheckResult[] | null> {
    if (!this.matches(sourceApplicationId)) return null
    return this.view.external_checks
  }
}
