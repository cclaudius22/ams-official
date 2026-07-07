/**
 * Users API Contract
 * Endpoints for user management, officers, and super admin operations
 */

import type { ApiResponse } from './common'

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export type UserRole = 'super_admin' | 'senior_officer' | 'officer' | 'specialist' | 'viewer'

export type ClearanceLevel = 'CTC' | 'SC' | 'DV'

export type VettingAuthority = 'UKSV' | 'MOD' | 'FCO' | 'HOME_OFFICE'

export type DeviceType = 'workstation' | 'security_token' | 'mobile'

export type BiometricMethod = 'mfa' | 'facial_recognition' | 'fingerprint'

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface CreateUserRequest {
  firstName: string
  lastName: string
  email: string
  role: UserRole
  department?: string
  clearanceLevel?: ClearanceLevel
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
  role?: UserRole
  department?: string
  isActive?: boolean
}

export interface UserFilters {
  search?: string
  role?: UserRole[]
  department?: string[]
  isActive?: boolean
}

export interface DeviceRegistration {
  type: DeviceType
  name: string
  identifier?: string
  verified: boolean
  registeredAt: string
}

export interface ClearanceDetails {
  level: ClearanceLevel
  authority: VettingAuthority
  number: string
  expiryDate: string
  lastVettingDate: string
  nextVettingDue: string
  vettingReference: string
}

export interface AccessRestrictions {
  allowedIPs: string[]
  workHours: {
    start: string  // HH:mm format
    end: string    // HH:mm format
  }
  allowedLocations: string[]
  maxConcurrentSessions: number
}

export interface EmergencyContact {
  phone: string
  email: string
  alternatePhone?: string
}

export interface BackupAdminConfig {
  primaryAdminId: string
  secondaryAdminId: string
}

export interface CreateSuperAdminRequest {
  // Personal details
  firstName: string
  lastName: string
  email: string           // Must be .gov.uk domain
  phone: string
  employeeId: string
  positionTitle: string
  department: string

  // Security clearance
  clearance: ClearanceDetails

  // Biometrics
  biometricMethods: BiometricMethod[]
  biometricRegisteredAt?: string

  // Devices
  registeredDevices: DeviceRegistration[]

  // Access restrictions
  accessRestrictions: AccessRestrictions

  // Emergency & backup
  backupAdmins: BackupAdminConfig
  emergencyContact: EmergencyContact
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  department?: string
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface ConsulateOfficial extends User {
  activeApplications: number
  completedToday: number
  completedThisWeek: number
  avgProcessingTime: number
  slaCompliance: number
  specializations?: string[]
  /**
   * When true, this officer is excluded from capacity-aware bulk allocation
   * (`allocateBatch`) regardless of specialization/load — e.g. Rachel Johnson
   * (officer-demo), whose reviewer queue is dedicated to the enriched deep_set
   * corpus only (Task 4c). Additive/optional so it defaults to false (included)
   * for every other officer.
   */
  excludeFromBulkAllocation?: boolean
}

export interface SuperAdmin extends User {
  employeeId: string
  positionTitle: string
  clearance: ClearanceDetails
  biometricMethods: BiometricMethod[]
  registeredDevices: DeviceRegistration[]
  accessRestrictions: AccessRestrictions
  backupAdmins: BackupAdminConfig
  emergencyContact: EmergencyContact
}

export interface UserSession {
  id: string
  userId: string
  deviceName: string
  ipAddress: string
  location?: string
  startedAt: string
  lastActivityAt: string
  isActive: boolean
}

export interface ClearanceVerification {
  isValid: boolean
  employeeId: string
  clearanceLevel?: ClearanceLevel
  expiryDate?: string
  verifiedAt: string
  verificationSource: string
}

// ============================================================================
// ENDPOINT CONTRACTS
// ============================================================================

/**
 * GET /api/users
 * Get list of users with optional filters
 */
export type GetUsersResponse = ApiResponse<User[]>

/**
 * GET /api/users/:id
 * Get single user by ID
 */
export type GetUserByIdResponse = ApiResponse<User>

/**
 * POST /api/users
 * Create new user
 */
export type CreateUserResponse = ApiResponse<User>

/**
 * PATCH /api/users/:id
 * Update existing user
 */
export type UpdateUserResponse = ApiResponse<User>

/**
 * DELETE /api/users/:id
 * Deactivate user (soft delete)
 */
export type DeleteUserResponse = ApiResponse<{ deactivated: boolean }>

/**
 * GET /api/users/officers
 * Get list of consulate officials with workload stats
 */
export type GetOfficersResponse = ApiResponse<ConsulateOfficial[]>

/**
 * GET /api/users/officers/:id
 * Get single officer with full stats
 */
export type GetOfficerByIdResponse = ApiResponse<ConsulateOfficial>

/**
 * POST /api/super-admin
 * Create new super admin account
 */
export type CreateSuperAdminResponse = ApiResponse<{
  userId: string
  message: string
  requiresApproval: boolean
}>

/**
 * GET /api/super-admin/:id
 * Get super admin details
 */
export type GetSuperAdminResponse = ApiResponse<SuperAdmin>

/**
 * POST /api/users/:id/clearance/verify
 * Verify user's clearance status
 */
export type VerifyClearanceResponse = ApiResponse<ClearanceVerification>

/**
 * POST /api/users/:id/devices
 * Register new device for user
 */
export type RegisterDeviceResponse = ApiResponse<DeviceRegistration>

/**
 * DELETE /api/users/:id/devices/:deviceId
 * Remove registered device
 */
export type RemoveDeviceResponse = ApiResponse<{ removed: boolean }>

/**
 * GET /api/users/:id/sessions
 * Get active sessions for user
 */
export type GetSessionsResponse = ApiResponse<UserSession[]>

/**
 * DELETE /api/users/:id/sessions/:sessionId
 * Terminate specific session
 */
export type TerminateSessionResponse = ApiResponse<{ terminated: boolean }>

/**
 * GET /api/users/search
 * Search users by name/email (for assignment dropdowns)
 */
export interface SearchUsersRequest {
  query: string
  role?: UserRole
  limit?: number
}
export type SearchUsersResponse = ApiResponse<User[]>
