/**
 * AmsDemoProvider — serves the in-repo DIS-aligned demo corpus (`data/demo-corpus`)
 * to the queue/allocation layer. Selected by `DATA_PROVIDER=ams-demo`.
 *
 * Reads `{corpusPath}/bulk/applications/*.json` ONLY — never `bulk/documents/`
 * (intentionally absent in-repo; GCS-bound, LB-3). Officer + assignment logic
 * mirrors JsonDataProvider (seed officers + in-memory assignment state). Bulk
 * apps have no `ApplicationDetail` (deep review = the deep_set, Slice 3), so
 * getApplicationById/getScanResult return null here.
 *
 * Does NOT modify json-provider/output_demo. See
 * docs/specs/2026-06-24-multi-visa-queue-allocation-design.md §5.2.
 */
import fs from 'fs/promises'
import path from 'path'

import type {
  ApplicationDataProvider,
  PaginationParams,
  PaginatedResponse,
  BulkAssignmentResult,
} from './index'
import type {
  LiveApplication,
  ApplicationDetail,
  ApplicationStatus,
  ApplicationFilters,
  LiveQueueStats,
  AIScanResult,
} from '@/api-contracts/applications'
import type { ConsulateOfficial } from '@/api-contracts/users'

import { defaultOfficers, getOfficersByVisaType } from '../seed/officers'
import { mapDisAlignedApp } from './disAlignedAdapter'

export class AmsDemoProvider implements ApplicationDataProvider {
  private corpusPath: string
  private cache: Map<string, LiveApplication> = new Map()
  private assignments: Map<string, string> = new Map() // appId -> officerId
  private statusOverrides: Map<string, ApplicationStatus> = new Map()
  private initialized = false

  constructor(corpusPath: string) {
    this.corpusPath = corpusPath
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    const appsDir = path.join(process.cwd(), this.corpusPath, 'bulk', 'applications')
    console.log(`[AmsDemoProvider] Initializing from ${appsDir}`)
    const files = (await fs.readdir(appsDir)).filter((f) => f.endsWith('.json'))
    for (const file of files) {
      try {
        const raw = JSON.parse(await fs.readFile(path.join(appsDir, file), 'utf-8'))
        const live = mapDisAlignedApp(raw)
        if (live.id) this.cache.set(live.id, live)
      } catch (err) {
        console.error(`[AmsDemoProvider] Failed to load ${file}:`, err)
      }
    }
    this.initialized = true
    console.log(`[AmsDemoProvider] Loaded ${this.cache.size} apps (bulk only; documents not read)`)
  }

  isInitialized(): boolean {
    return this.initialized
  }

  private withState(base: LiveApplication): LiveApplication {
    const app: LiveApplication = { ...base }
    if (this.statusOverrides.has(app.id)) app.status = this.statusOverrides.get(app.id)!
    const officerId = this.assignments.get(app.id)
    if (officerId) {
      const officer = defaultOfficers.find((o) => o.id === officerId)
      if (officer) {
        app.assignedTo = { id: officer.id, name: `${officer.firstName} ${officer.lastName}` }
        if (app.status !== 'Decided') app.status = 'In Progress'
      }
    }
    return app
  }

  async getApplications(
    filters: ApplicationFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<LiveApplication>> {
    let apps = Array.from(this.cache.values()).map((base) => this.withState(base))

    if (filters.search) {
      const s = filters.search.toLowerCase()
      apps = apps.filter((a) => a.id.toLowerCase().includes(s) || a.applicantName.toLowerCase().includes(s))
    }
    if (filters.status && filters.status.length > 0) apps = apps.filter((a) => filters.status!.includes(a.status))
    if (filters.visaType && filters.visaType.length > 0) {
      apps = apps.filter((a) => filters.visaType!.some((vt) => a.visaType.toLowerCase().includes(vt.toLowerCase())))
    }
    if (filters.country && filters.country.length > 0) apps = apps.filter((a) => filters.country!.includes(a.country))
    if (filters.assignedTo && filters.assignedTo.length > 0) {
      apps = apps.filter((a) => a.assignedTo && filters.assignedTo!.includes(a.assignedTo.id))
    }

    const total = apps.length
    const start = (pagination.page - 1) * pagination.pageSize
    return {
      data: apps.slice(start, start + pagination.pageSize),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    }
  }

  // Bulk corpus has no detail/scan — deep review (deep_set) is Slice 3.
  async getApplicationById(): Promise<ApplicationDetail | null> {
    return null
  }
  async getScanResult(): Promise<AIScanResult | null> {
    return null
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus): Promise<boolean> {
    if (!this.cache.has(id)) return false
    this.statusOverrides.set(id, status)
    return true
  }

  async getQueueStats(): Promise<LiveQueueStats> {
    const statuses = Array.from(this.cache.values()).map((a) => this.withState(a).status)
    const count = (s: ApplicationStatus) => statuses.filter((x) => x === s).length
    return {
      total: statuses.length,
      inProgress: count('In Progress'),
      approved: count('Approved'),
      pending: count('Received') + count('Processed') + count('Pending'),
      rejected: count('Rejected'),
      escalated: count('Escalated'),
      unassigned: count('Received') + count('Processed') + count('Awaiting Allocation'),
    }
  }

  async getOfficers(): Promise<ConsulateOfficial[]> {
    const counts = this.assignmentCounts()
    return defaultOfficers.map((o) => ({ ...o, activeApplications: o.activeApplications + (counts.get(o.id) ?? 0) }))
  }

  async getOfficersBySpecialization(visaType: string): Promise<ConsulateOfficial[]> {
    const counts = this.assignmentCounts()
    return getOfficersByVisaType(visaType).map((o) => ({
      ...o,
      activeApplications: o.activeApplications + (counts.get(o.id) ?? 0),
    }))
  }

  async getOfficerById(id: string): Promise<ConsulateOfficial | null> {
    return defaultOfficers.find((o) => o.id === id) ?? null
  }

  async assignApplication(applicationId: string, officerId: string, _method: 'auto' | 'manual' = 'manual'): Promise<boolean> {
    if (!this.cache.has(applicationId)) return false
    if (!defaultOfficers.find((o) => o.id === officerId)) return false
    this.assignments.set(applicationId, officerId)
    return true
  }

  async bulkAssign(applicationIds: string[], officerId: string): Promise<BulkAssignmentResult> {
    const results = await Promise.all(
      applicationIds.map(async (appId) => {
        const success = await this.assignApplication(appId, officerId)
        return { applicationId: appId, officerId, success, error: success ? undefined : 'Application or officer not found' }
      })
    )
    return {
      total: applicationIds.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    }
  }

  async unassignApplication(applicationId: string): Promise<boolean> {
    if (!this.assignments.has(applicationId)) return false
    this.assignments.delete(applicationId)
    this.statusOverrides.set(applicationId, 'Received')
    return true
  }

  private assignmentCounts(): Map<string, number> {
    const counts = new Map<string, number>()
    for (const id of this.assignments.values()) counts.set(id, (counts.get(id) ?? 0) + 1)
    return counts
  }
}
