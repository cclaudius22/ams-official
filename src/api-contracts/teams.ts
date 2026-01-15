/**
 * Teams API Contract
 * Endpoints for team collaboration, tasks, and activity tracking
 */

import type { ApiResponse } from './common'
import type { User } from './users'

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type CollaborationStatus = 'in_progress' | 'pending_review' | 'completed' | 'cancelled'

export type Priority = 'high' | 'medium' | 'low'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export type ActivityType =
  | 'task_assigned'
  | 'task_completed'
  | 'note_added'
  | 'decision_made'
  | 'collaboration_started'
  | 'collaboration_completed'
  | 'member_added'
  | 'member_removed'
  | 'status_changed'

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface CreateCollaborationRequest {
  applicationId: string
  priority: Priority
  description?: string
  participantIds: string[]
}

export interface UpdateCollaborationRequest {
  status?: CollaborationStatus
  priority?: Priority
  description?: string
}

export interface AddParticipantsRequest {
  participantIds: string[]
}

export interface CreateTaskRequest {
  title: string
  description?: string
  applicationId: string
  collaborationId?: string
  assigneeId: string
  priority: Priority
  dueDate: string  // ISO 8601
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  assigneeId?: string
  priority?: Priority
  dueDate?: string
  status?: TaskStatus
}

export interface CollaborationFilters {
  status?: CollaborationStatus[]
  priority?: Priority[]
  search?: string
  participantId?: string
  applicationId?: string
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: Priority[]
  assigneeId?: string
  applicationId?: string
  collaborationId?: string
  dueBefore?: string
  dueAfter?: string
}

export interface ActivityFilters {
  type?: ActivityType[]
  userId?: string
  applicationId?: string
  collaborationId?: string
  since?: string
  limit?: number
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface CollaborationParticipant {
  id: string
  name: string
  role: string
  avatar?: string
  joinedAt: string
}

export interface Collaboration {
  id: string
  applicationId: string
  applicantName: string
  status: CollaborationStatus
  priority: Priority
  description?: string
  participants: CollaborationParticipant[]
  pendingTasks: number
  completedTasks: number
  totalTasks: number
  lastActivity: string
  createdAt: string
  createdById: string
  createdByName: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  applicationId: string
  collaborationId?: string
  assigneeId: string
  assigneeName: string
  assigneeAvatar?: string
  assignedById: string
  assignedByName: string
  priority: Priority
  status: TaskStatus
  dueDate: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TeamActivity {
  id: string
  type: ActivityType
  userId: string
  userName: string
  userAvatar?: string
  userRole: string
  targetId?: string
  targetType?: 'application' | 'collaboration' | 'task' | 'note'
  applicationId?: string
  collaborationId?: string
  timestamp: string
  description: string
  metadata?: Record<string, unknown>
}

export interface TeamStats {
  activeCollaborations: number
  pendingTasks: number
  completedTasksToday: number
  completedTasksThisWeek: number
  teamMembers: number
  avgTaskCompletionTime: number  // Hours
}

export interface CollaborationStats {
  totalParticipants: number
  pendingTasks: number
  completedTasks: number
  totalNotes: number
  avgResponseTime: number  // Hours
  daysActive: number
}

// ============================================================================
// ENDPOINT CONTRACTS
// ============================================================================

/**
 * GET /api/collaborations
 * Get list of collaborations with filters
 */
export type GetCollaborationsResponse = ApiResponse<Collaboration[]>

/**
 * POST /api/collaborations
 * Create new collaboration
 */
export type CreateCollaborationResponse = ApiResponse<Collaboration>

/**
 * GET /api/collaborations/:id
 * Get collaboration by ID
 */
export type GetCollaborationByIdResponse = ApiResponse<Collaboration>

/**
 * GET /api/collaborations/application/:applicationId
 * Get collaboration for an application
 */
export type GetCollaborationByAppResponse = ApiResponse<Collaboration | null>

/**
 * PATCH /api/collaborations/:id
 * Update collaboration
 */
export type UpdateCollaborationResponse = ApiResponse<Collaboration>

/**
 * POST /api/collaborations/:id/participants
 * Add participants to collaboration
 */
export type AddParticipantsResponse = ApiResponse<Collaboration>

/**
 * DELETE /api/collaborations/:id/participants/:participantId
 * Remove participant from collaboration
 */
export type RemoveParticipantResponse = ApiResponse<{ removed: boolean }>

/**
 * GET /api/collaborations/:id/stats
 * Get collaboration statistics
 */
export type GetCollaborationStatsResponse = ApiResponse<CollaborationStats>

/**
 * GET /api/tasks
 * Get tasks with filters
 */
export type GetTasksResponse = ApiResponse<Task[]>

/**
 * GET /api/tasks/my
 * Get current user's assigned tasks
 */
export type GetMyTasksResponse = ApiResponse<Task[]>

/**
 * POST /api/tasks
 * Create new task
 */
export type CreateTaskResponse = ApiResponse<Task>

/**
 * GET /api/tasks/:id
 * Get task by ID
 */
export type GetTaskByIdResponse = ApiResponse<Task>

/**
 * PATCH /api/tasks/:id
 * Update task
 */
export type UpdateTaskResponse = ApiResponse<Task>

/**
 * PATCH /api/tasks/:id/complete
 * Mark task as completed
 */
export type CompleteTaskResponse = ApiResponse<Task>

/**
 * DELETE /api/tasks/:id
 * Cancel/delete task
 */
export type DeleteTaskResponse = ApiResponse<{ deleted: boolean }>

/**
 * GET /api/activity/team
 * Get team activity feed
 */
export type GetTeamActivityResponse = ApiResponse<TeamActivity[]>

/**
 * GET /api/activity/collaboration/:collaborationId
 * Get activity for specific collaboration
 */
export type GetCollaborationActivityResponse = ApiResponse<TeamActivity[]>

/**
 * GET /api/activity/user/:userId
 * Get activity for specific user
 */
export type GetUserActivityResponse = ApiResponse<TeamActivity[]>

/**
 * GET /api/teams/stats
 * Get team overview statistics
 */
export type GetTeamStatsResponse = ApiResponse<TeamStats>

/**
 * GET /api/teams/members
 * Get all team members
 */
export type GetTeamMembersResponse = ApiResponse<User[]>
