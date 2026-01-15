/**
 * Reviews API Contract
 * Endpoints for visa officer review decisions and workflows
 */

import type { ApiResponse } from './common'

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type EscalationReason =
  | 'requires_senior_review'
  | 'policy_clarification'
  | 'incomplete_information'
  | 'sanctions_list'
  | 'failed_checks'
  | 'suspected_fraud'
  | 'complex_case'
  | 'technical_issue'

export type NoteCategory = 'question' | 'concern' | 'verification' | 'general'

export type DecisionType = 'approved' | 'rejected' | 'escalated'

export type SectionDecision = 'approve' | 'refer'

export type ContactType = 'email' | 'phone' | 'video'

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface ApprovalRequest {
  rationale?: string
  reviewerId: string
}

export interface RejectionRequest {
  rationale: string  // Required for rejections
  reviewerId: string
}

export interface EscalationRequest {
  reasons: EscalationReason[]
  notes?: string
  reviewerId: string
  escalateToId?: string  // Optional specific supervisor
}

export interface SectionDecisionRequest {
  decision: SectionDecision
  notes?: string
  reviewerId: string
}

export interface AddNoteRequest {
  content: string
  category: NoteCategory
  authorId: string
}

export interface ContactRequest {
  contactType: ContactType
  message?: string
  scheduledTime?: string  // ISO 8601 for video calls
  reviewerId: string
}

export interface ResolveNoteRequest {
  resolvedById: string
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface DecisionResult {
  success: boolean
  decision: DecisionType
  decisionId: string
  applicationId: string
  timestamp: string
}

export interface Note {
  id: string
  applicationId: string
  sectionId?: string
  content: string
  category: NoteCategory
  authorId: string
  authorName: string
  authorRole: string
  authorAvatar?: string
  createdAt: string
  resolved: boolean
  resolvedAt?: string
  resolvedById?: string
  resolvedByName?: string
}

export interface DecisionRecord {
  id: string
  applicationId: string
  decision: DecisionType
  rationale?: string
  reviewerId: string
  reviewerName: string
  reviewerRole: string
  timestamp: string
  escalationReasons?: EscalationReason[]
  escalatedToId?: string
  escalatedToName?: string
}

export interface ContactLog {
  id: string
  applicationId: string
  contactType: ContactType
  message?: string
  scheduledTime?: string
  reviewerId: string
  reviewerName: string
  createdAt: string
  status: 'sent' | 'scheduled' | 'completed' | 'failed'
}

export interface SectionDecisionRecord {
  id: string
  applicationId: string
  sectionId: string
  decision: SectionDecision
  notes?: string
  reviewerId: string
  reviewerName: string
  timestamp: string
}

// ============================================================================
// ENDPOINT CONTRACTS
// ============================================================================

/**
 * POST /api/reviews/:applicationId/approve
 * Submit approval decision
 */
export type ApproveResponse = ApiResponse<DecisionResult>

/**
 * POST /api/reviews/:applicationId/reject
 * Submit rejection decision (rationale required)
 */
export type RejectResponse = ApiResponse<DecisionResult>

/**
 * POST /api/reviews/:applicationId/escalate
 * Escalate application to supervisor
 */
export type EscalateResponse = ApiResponse<DecisionResult>

/**
 * POST /api/reviews/:applicationId/sections/:sectionId/decision
 * Record decision for individual section
 */
export type SectionDecisionResponse = ApiResponse<SectionDecisionRecord>

/**
 * POST /api/reviews/:applicationId/sections/:sectionId/notes
 * Add note to specific section
 */
export type AddNoteResponse = ApiResponse<Note>

/**
 * GET /api/reviews/:applicationId/notes
 * Get all notes for an application
 */
export type GetNotesResponse = ApiResponse<Note[]>

/**
 * PATCH /api/reviews/notes/:noteId/resolve
 * Mark note as resolved
 */
export type ResolveNoteResponse = ApiResponse<Note>

/**
 * POST /api/reviews/:applicationId/contact
 * Log contact attempt with applicant
 */
export type ContactResponse = ApiResponse<ContactLog>

/**
 * GET /api/reviews/:applicationId/history
 * Get decision history for an application
 */
export type GetDecisionHistoryResponse = ApiResponse<DecisionRecord[]>

/**
 * GET /api/reviews/:applicationId/sections/:sectionId/decisions
 * Get section-level decision history
 */
export type GetSectionDecisionsResponse = ApiResponse<SectionDecisionRecord[]>
