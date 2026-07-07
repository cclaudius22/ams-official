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
import { mapDeepSetReview } from './deepSetReviewAdapter'
import type { DeepSetReview, DeepSetReviewCapable } from './deepSetReviewAdapter'
import { mapDeepSetApplicationDetail } from './deepSetApplicationDetailAdapter'
import { mapRfi } from './deepSetRfiAdapter'
import type { RfiSummary } from './deepSetRfiAdapter'
import { mapRfiQueueItem } from './rfiQueueAdapter'
import type { RfiLaneItem, RfiQueueCapable } from './rfiQueueAdapter'

/**
 * Task 4c (Chris directive): Rachel Johnson (officer-demo) is the single demo
 * officer for enriched deep review — ALL 18 deep_set cases are hers, assigned
 * at initialize() (see `assignDeepSetCasesToRachel`). She is excluded from
 * bulk allocation (`excludeFromBulkAllocation` on her seed record, enforced by
 * `allocateBatch`), so her queue contains ONLY these 18 — no Global Talent,
 * Student, Senior/Specialist, or bulk skilled-worker apps.
 */
const DEEP_SET_OFFICER_ID = 'officer-demo'

/**
 * Pre-auth ownership convention: the corpus models no officer assignment on the
 * deep_set RFI heroes (`caseworker_id` is null). All 3 RFI-enabled heroes route
 * to Rachel Johnson (officer-demo) per Task 4c — including 00014, moved off
 * Ricardo Martinez (officer-2) so Rachel's RFI lane is complete and Ricardo's
 * RFI lane goes empty (Chris approved). Officers not listed here get an empty
 * lane.
 */
const RFI_LANE_ASSIGNMENTS: Record<string, string> = {
  'HO-SW-DEEP-2026-00012': 'officer-demo', // Rachel Johnson — missing payslip month 2
  'HO-SW-DEEP-2026-00013': 'officer-demo', // Rachel Johnson — insufficient bank statement month 2
  'HO-SW-DEEP-2026-00014': 'officer-demo', // Rachel Johnson — CoS salary mismatch (moved from officer-2, Task 4c)
}

export class AmsDemoProvider implements ApplicationDataProvider, DeepSetReviewCapable, RfiQueueCapable {
  private corpusPath: string
  private cache: Map<string, LiveApplication> = new Map()
  private assignments: Map<string, string> = new Map() // appId -> officerId
  private statusOverrides: Map<string, ApplicationStatus> = new Map()
  private initialized = false
  private rawBulk: Map<string, unknown> = new Map()

  // Slice 3a — the deep_set (18 skilled-worker cases enriched to full
  // DISApplicationView + OVAssessment). Loaded lazily and separately from the
  // 1,000-app bulk set: the queue/allocation layer reads bulk only; the reviewer
  // page reads a deep_set case on demand. Keyed by source_application_id.
  private deepSetRaw: Map<string, unknown> = new Map()
  private deepSetLoaded = false

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
        if (live.id) {
          this.cache.set(live.id, live)
          this.rawBulk.set(live.id, raw)
        }
      } catch (err) {
        console.error(`[AmsDemoProvider] Failed to load ${file}:`, err)
      }
    }
    this.initialized = true
    console.log(`[AmsDemoProvider] Loaded ${this.cache.size} apps (bulk only; documents not read)`)

    // Task 4c — surface the 18 deep_set cases in the main queue too, dedicated
    // to Rachel Johnson (officer-demo). Without this they're only reachable via
    // getDeepSetReview()/getRfiQueue(); the queue/allocation layer (and hence
    // GET /api/applications) never saw them. Loaded eagerly here (not lazily)
    // so `assignedTo=officer-demo` returns exactly these 18 from cold start.
    await this.assignDeepSetCasesToRachel()
  }

  /**
   * Loads the deep_set corpus into the main application cache (same mapper as
   * bulk — the raw shape is corpus-compatible) and pre-assigns every case to
   * Rachel Johnson (officer-demo). Idempotent: safe to call once from
   * initialize(); ensureDeepSetLoaded() guards the underlying file read.
   */
  private async assignDeepSetCasesToRachel(): Promise<void> {
    await this.ensureDeepSetLoaded()
    for (const [id, raw] of this.deepSetRaw) {
      if (!this.cache.has(id)) {
        const live = mapDisAlignedApp(raw)
        if (live.id) this.cache.set(live.id, live)
      }
      this.assignments.set(id, DEEP_SET_OFFICER_ID)
    }
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

  // Deep_set and bulk ids return a real per-applicant ApplicationDetail built
  // from the corpus record so the reviewer page header + section accordion show
  // the actual applicant — not the hardcoded John-Doe mock. Deep_set DIS/OV
  // panels are served separately by getDeepSetReview() via
  // /api/ams-demo/applications/:id/review; bulk ids are queue/header only.
  async getApplicationById(id: string): Promise<ApplicationDetail | null> {
    await this.ensureDeepSetLoaded()
    const raw = this.deepSetRaw.get(id) ?? this.rawBulk.get(id)
    if (raw === undefined) return null
    return mapDeepSetApplicationDetail(raw)
  }
  async getScanResult(): Promise<AIScanResult | null> {
    return null
  }

  /**
   * Lazily load the 18 enriched deep_set cases from
   * `{corpusPath}/deep_set/applications/*.json` (Slice 3a). Independent of the
   * bulk `initialize()`. Missing dir → no-op (deep review simply unavailable).
   */
  private async ensureDeepSetLoaded(): Promise<void> {
    if (this.deepSetLoaded) return
    const dir = path.join(process.cwd(), this.corpusPath, 'deep_set', 'applications')
    try {
      const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'))
      for (const file of files) {
        try {
          const raw = JSON.parse(await fs.readFile(path.join(dir, file), 'utf-8'))
          const id = raw?.source_application_id
          if (typeof id === 'string') this.deepSetRaw.set(id, raw)
        } catch (err) {
          console.error(`[AmsDemoProvider] Failed to load deep_set ${file}:`, err)
        }
      }
    } catch {
      // deep_set dir absent — deep review unavailable, queue/allocation unaffected
    }
    this.deepSetLoaded = true
    console.log(`[AmsDemoProvider] Loaded ${this.deepSetRaw.size} deep_set cases`)
  }

  /**
   * The per-case reviewer payload (full DISApplicationView + OVAssessment) for a
   * deep_set application id. Returns null for unknown/bulk/unenriched ids so the
   * reviewer page degrades to its existing path rather than crashing a panel.
   */
  async getDeepSetReview(id: string): Promise<DeepSetReview | null> {
    await this.ensureDeepSetLoaded()
    const raw = this.deepSetRaw.get(id)
    if (raw === undefined) return null
    const review = mapDeepSetReview(raw)
    if (!review) return null
    review.rfi = await this.loadRfi(raw)
    return review
  }

  /**
   * Slice 3b scaffold — for an RFI-enabled case, read the issued `request.json`
   * and applicant `response.json` artifacts (paths from `rfi_lifecycle`) and
   * build the RfiSummary. Best-effort: a missing/unreadable artifact just yields
   * a thinner summary; non-RFI cases return null.
   */
  private async loadRfi(raw: unknown): Promise<RfiSummary | null> {
    const lc = (raw as { rfi_lifecycle?: { enabled?: boolean; request_artifact?: unknown; response_artifact?: unknown } })
      .rfi_lifecycle
    if (!lc?.enabled) return null
    const readArtifact = async (rel: unknown): Promise<unknown> => {
      if (typeof rel !== 'string') return undefined
      try {
        return JSON.parse(await fs.readFile(path.join(process.cwd(), this.corpusPath, 'deep_set', rel), 'utf-8'))
      } catch {
        return undefined
      }
    }
    const [request, response] = await Promise.all([
      readArtifact(lc.request_artifact),
      readArtifact(lc.response_artifact),
    ])
    return mapRfi(raw, request, response)
  }

  /**
   * RFI lane (pre-auth subset — Task 8): the officer's RFI-enabled deep_set
   * cases projected into lane rows, with state derived against `nowISO`
   * (defaults to the real clock; pass a fixed value for deterministic demos).
   *
   * Ownership is the assignment map above — each hero is scoped to its assigned
   * officer; officers with no assigned heroes get an empty lane. Reuses
   * `loadRfi` so the lane and the per-case panel read the same corpus artifacts.
   */
  async getRfiQueue(officerId: string, nowISO: string = new Date().toISOString()): Promise<RfiLaneItem[]> {
    await this.ensureDeepSetLoaded()
    const items: RfiLaneItem[] = []
    for (const [id, raw] of this.deepSetRaw) {
      if (RFI_LANE_ASSIGNMENTS[id] !== officerId) continue
      const rfi = await this.loadRfi(raw)
      const item = mapRfiQueueItem(raw, rfi, nowISO)
      if (item) items.push(item)
    }
    // Deterministic order for the demo: soonest deadline first, then id.
    return items.sort((a, b) => (a.dueAt ?? '').localeCompare(b.dueAt ?? '') || a.id.localeCompare(b.id))
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
