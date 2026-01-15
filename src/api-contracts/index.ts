/**
 * API Contracts - Backend Integration Types
 *
 * This module defines the TypeScript interfaces for all API endpoints
 * used by the AMS frontend to communicate with the GCP + Postgres backend.
 *
 * Usage:
 *   import { LiveApplication, GetApplicationsResponse } from '@/api-contracts'
 *
 * These contracts serve as documentation for the backend team and enable
 * type-safe API client generation in the future.
 */

// Common types
export * from './common'

// Applications API
export * from './applications'

// Reviews API (decisions, notes, escalations)
export * from './reviews'

// Metrics API (analytics, SLA, performance)
export * from './metrics'

// Users API (officers, super admin)
export * from './users'

// Teams API (collaboration, tasks, activity)
export * from './teams'
