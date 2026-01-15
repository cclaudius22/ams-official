/**
 * Common API types shared across all endpoints
 * These are the foundational types for the GCP + Postgres backend integration
 */

// Standard API response wrapper
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// Pagination
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Date range filter
export interface DateRange {
  from: string  // ISO 8601 date string
  to: string    // ISO 8601 date string
}

// Timeframe for metrics queries
export type TimeFrame = 'today' | 'week' | 'month' | 'quarter' | 'year'

// Sort direction
export type SortDirection = 'asc' | 'desc'

export interface SortParams {
  field: string
  direction: SortDirection
}
