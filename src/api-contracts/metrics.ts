/**
 * Metrics API Contract
 * Endpoints for analytics, SLA tracking, and performance dashboards
 */

import type { ApiResponse, TimeFrame } from './common'
import type { ApplicationStatus } from './applications'

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface MetricsQuery {
  timeframe: TimeFrame
  startDate?: string  // ISO 8601, overrides timeframe
  endDate?: string    // ISO 8601, overrides timeframe
}

export interface SlaQuery extends MetricsQuery {
  groupBy?: 'visa_type' | 'team' | 'country' | 'date'
}

export interface WorkloadQuery {
  departmentId?: string
  includeInactive?: boolean
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

// Queue Overview Metrics
export interface QueueMetrics {
  processingVolume: number       // Total applications processed
  avgProcessingTime: number      // Average time in minutes
  approvalRate: number           // Percentage (0-100)
  rejectionRate: number          // Percentage (0-100)
  slaCompliance: number          // Percentage (0-100)
  pendingCount: number           // Currently pending
  inProgressCount: number        // Currently in progress
}

// Processing Time Analytics
export interface ProcessingTimeByType {
  visaType: string
  visaTypeId: string
  avgTime: number          // Minutes
  minTime: number          // Minutes
  maxTime: number          // Minutes
  count: number            // Number of applications
  percentile95: number     // 95th percentile in minutes
}

// Status Distribution
export interface StatusDistributionItem {
  status: ApplicationStatus
  count: number
  percentage: number
}

export type StatusDistribution = StatusDistributionItem[]

// SLA Performance
export interface SlaPerformance {
  date: string
  attainmentRate: number     // Percentage
  totalProcessed: number
  slaMet: number
  slaMissed: number
  avgTimeToSla: number       // Hours remaining on average
}

export interface SlaByVisaType {
  visaType: string
  visaTypeId: string
  targetHours: number
  avgHours: number
  compliance: number         // Percentage
  totalApplications: number
  missedCount: number
}

export interface SlaByTeam {
  teamId: string
  teamName: string
  compliance: number         // Percentage
  totalApplications: number
  avgProcessingHours: number
}

export interface SlaMissReason {
  reason: string
  count: number
  percentage: number
}

// Officer Workload
export interface OfficerWorkload {
  officerId: string
  officerName: string
  officerAvatar?: string
  role: string
  activeApplications: number
  completedToday: number
  completedThisWeek: number
  avgProcessingTime: number    // Minutes
  slaCompliance: number        // Percentage
}

// Officer Performance
export interface OfficerPerformance {
  officerId: string
  officerName: string
  period: TimeFrame
  applicationsProcessed: number
  approvalRate: number
  avgProcessingTime: number
  slaCompliance: number
  escalationRate: number
  accuracyScore?: number       // If quality reviews exist
}

// Geographic Analysis
export interface CountryApprovalRate {
  country: string              // ISO country code
  countryName: string
  approvalRate: number         // Percentage
  rejectionRate: number        // Percentage
  totalApplications: number
  avgProcessingTime: number    // Minutes
}

// Backlog Analysis
export interface BacklogHeatmapData {
  day: string                  // Day of week (Mon, Tue, etc)
  stage: string                // Processing stage name
  count: number                // Number of applications
  avgAge: number               // Hours in backlog
}

// Automation Metrics
export interface AutomationMetrics {
  manualCount: number
  automatedCount: number
  automatedPercentage: number
  automationAccuracy: number   // Percentage
  avgManualTime: number        // Minutes
  avgAutomatedTime: number     // Minutes
  escalationFromAuto: number   // Count escalated from auto-review
}

// Escalation Analytics
export interface EscalationMetrics {
  totalEscalations: number
  escalationRate: number       // Percentage
  avgResolutionTime: number    // Hours
  byReason: EscalationByReason[]
  trend: EscalationTrend[]
}

export interface EscalationByReason {
  reason: string
  count: number
  percentage: number
  avgResolutionTime: number
}

export interface EscalationTrend {
  date: string
  count: number
  rate: number
}

// Stage Efficiency
export interface StageEfficiency {
  stage: string
  avgDuration: number          // Minutes
  queueTime: number            // Minutes waiting
  activeTime: number           // Minutes being worked
  bottleneckScore: number      // 0-100, higher = more bottleneck
  throughput: number           // Applications per hour
}

// ============================================================================
// ENDPOINT CONTRACTS
// ============================================================================

/**
 * GET /api/metrics/queue
 * Get overall queue metrics
 */
export type GetQueueMetricsResponse = ApiResponse<QueueMetrics>

/**
 * GET /api/metrics/processing-time
 * Get processing time breakdown by visa type
 */
export type GetProcessingTimeResponse = ApiResponse<ProcessingTimeByType[]>

/**
 * GET /api/metrics/status-distribution
 * Get current status distribution
 */
export type GetStatusDistributionResponse = ApiResponse<StatusDistribution>

/**
 * GET /api/metrics/sla
 * Get SLA performance over time
 */
export type GetSlaPerformanceResponse = ApiResponse<SlaPerformance[]>

/**
 * GET /api/metrics/sla/by-type
 * Get SLA breakdown by visa type
 */
export type GetSlaByTypeResponse = ApiResponse<SlaByVisaType[]>

/**
 * GET /api/metrics/sla/by-team
 * Get SLA breakdown by team
 */
export type GetSlaByTeamResponse = ApiResponse<SlaByTeam[]>

/**
 * GET /api/metrics/sla/miss-reasons
 * Get reasons for SLA misses
 */
export type GetSlaMissReasonsResponse = ApiResponse<SlaMissReason[]>

/**
 * GET /api/metrics/workload
 * Get officer workload distribution
 */
export type GetWorkloadResponse = ApiResponse<OfficerWorkload[]>

/**
 * GET /api/metrics/officers/:officerId/performance
 * Get individual officer performance
 */
export type GetOfficerPerformanceResponse = ApiResponse<OfficerPerformance>

/**
 * GET /api/metrics/approval-rates
 * Get approval rates by country
 */
export type GetApprovalRatesResponse = ApiResponse<CountryApprovalRate[]>

/**
 * GET /api/metrics/backlog-heatmap
 * Get backlog heatmap data (by day/stage)
 */
export type GetBacklogHeatmapResponse = ApiResponse<BacklogHeatmapData[]>

/**
 * GET /api/metrics/automation
 * Get automation vs manual processing metrics
 */
export type GetAutomationMetricsResponse = ApiResponse<AutomationMetrics>

/**
 * GET /api/metrics/escalations
 * Get escalation analytics
 */
export type GetEscalationMetricsResponse = ApiResponse<EscalationMetrics>

/**
 * GET /api/metrics/stages
 * Get stage efficiency metrics
 */
export type GetStageEfficiencyResponse = ApiResponse<StageEfficiency[]>
