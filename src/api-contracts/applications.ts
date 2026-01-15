/**
 * Applications API Contract
 * Endpoints for managing visa applications and the live queue
 */

import type { ApiResponse, PaginatedResponse, PaginationParams, DateRange } from './common'

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type ApplicationStatus =
  | 'In Progress'
  | 'Approved'
  | 'Pending'
  | 'Rejected'
  | 'Escalated'
  | 'Pending Assignment'
  | 'Awaiting Info'

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface ApplicationFilters {
  search?: string
  status?: ApplicationStatus[]
  visaType?: string[]
  country?: string[]
  assignedTo?: string[]
  dateRange?: DateRange
}

export interface UpdateStatusRequest {
  status: ApplicationStatus
}

export interface BulkAssignRequest {
  applicationIds: string[]
  officerId: string
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface AssignedOfficer {
  id: string
  name: string
  avatar?: string
}

export interface LiveApplication {
  id: string
  applicantName: string
  country: string
  visaType: string
  category?: string
  submittedAt: string
  status: ApplicationStatus
  assignedTo?: AssignedOfficer
  flags?: string[]
}

export interface ApplicationSection {
  status: string
  validationStatus: 'valid' | 'invalid' | 'pending' | 'incomplete'
  data: Record<string, unknown>
  updatedAt: string
}

export interface ApplicationProgress {
  stageProgress: StageProgress[]
  overallProgress: number
  lastUpdated: string
}

export interface StageProgress {
  stage: string
  status: 'completed' | 'in_progress' | 'pending'
  completedAt: string | null
}

export interface TimelineEvent {
  id: string
  type: 'status_change' | 'assignment' | 'note' | 'decision' | 'document_upload'
  description: string
  userId?: string
  userName?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface ApplicantDetails {
  email?: string
  emailVerified?: boolean
  phoneNumber?: string
  phoneVerified?: boolean
  name?: string
  givenNames?: string
  surname?: string
}

export interface ApplicationDetail extends LiveApplication {
  userId: string
  visaTypeId: string
  currentStage: string
  processingType: string
  sections: Record<string, ApplicationSection>
  progress: ApplicationProgress
  timeline: TimelineEvent[]
  applicantDetails: ApplicantDetails
  createdAt: string
  updatedAt: string
}

export interface LiveQueueStats {
  total: number
  inProgress: number
  approved: number
  pending: number
  rejected: number
  escalated: number
  unassigned: number
}

// ============================================================================
// ENDPOINT CONTRACTS
// ============================================================================

/**
 * GET /api/applications
 * Fetch paginated list of applications with optional filters
 */
export type GetApplicationsRequest = ApplicationFilters & PaginationParams
export type GetApplicationsResponse = PaginatedResponse<LiveApplication>

/**
 * GET /api/applications/:id
 * Fetch single application with full details
 */
export type GetApplicationByIdRequest = { id: string }
export type GetApplicationByIdResponse = ApiResponse<ApplicationDetail>

/**
 * GET /api/applications/stats
 * Fetch queue statistics
 */
export type GetQueueStatsResponse = ApiResponse<LiveQueueStats>

/**
 * PATCH /api/applications/:id/status
 * Update application status
 */
export type UpdateStatusResponse = ApiResponse<{ updated: boolean }>

/**
 * POST /api/applications/bulk-assign
 * Assign multiple applications to an officer
 */
export type BulkAssignResponse = ApiResponse<{ assignedCount: number }>

/**
 * GET /api/applications/:id/scan
 * Fetch AI scan results for an application
 */
export interface AIScanResult {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  scanStartedAt?: string
  scanCompletedAt?: string
  isValid: boolean
  score: number
  rootednessScore?: number
  intentScore?: number
  issues: ScanIssue[]
  recommendations: ScanRecommendation[]
}

export interface ScanIssue {
  id: string
  sectionId: string
  fieldId?: string
  type: 'missing' | 'invalid' | 'inconsistent' | 'suspicious' | 'incomplete'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  context?: Record<string, unknown>
}

export interface ScanRecommendation {
  id: string
  relatedIssueIds: string[]
  message: string
  actionType: 'verify' | 'request_info' | 'escalate' | 'reject'
}

export type GetScanResultResponse = ApiResponse<AIScanResult>

/**
 * POST /api/applications/:id/scan/trigger
 * Trigger a new AI scan
 */
export type TriggerScanResponse = ApiResponse<{ scanId: string; started: boolean }>
