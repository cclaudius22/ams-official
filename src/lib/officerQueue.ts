/**
 * Officer worklist transform (Slice 2) — maps a queue `LiveApplication` to the
 * ReviewCard shape, surfacing the REAL DIS recommendation.
 *
 * Status-led (memory: dis-scoring-display-policy): the card's verdict + priority
 * come from the qualitative `recommendation` (RECOMMEND_APPROVE/REJECT/MANUAL_REVIEW),
 * NOT a fabricated numeric grade. Pure + unit-tested.
 */
import type { LiveApplication } from '@/api-contracts/applications'
import type { RecommendationOutcome } from '@/api-contracts/dis'

export interface ApplicationReview {
  id: string
  applicant: string
  riskScore: number
  slaRemaining: string
  aiRecommendation: 'Approve' | 'Reject' | 'Review'
  priority: 'high' | 'medium' | 'low'
  status: 'active' | 'pending' | 'completed' | 'escalated'
  flags: string[]
  team: { background: string; identity: string; document: string }
  lastUpdated: string
  documents: string[]
  type: string
  country: string
  submissionDate: string
  passport: string
}

/** DIS recommendation → qualitative card verdict + priority. */
const VERDICT: Record<
  RecommendationOutcome,
  { aiRecommendation: ApplicationReview['aiRecommendation']; priority: ApplicationReview['priority']; riskScore: number }
> = {
  RECOMMEND_APPROVE: { aiRecommendation: 'Approve', priority: 'low', riskScore: 30 },
  MANUAL_REVIEW: { aiRecommendation: 'Review', priority: 'medium', riskScore: 55 },
  RECOMMEND_REJECT: { aiRecommendation: 'Reject', priority: 'high', riskScore: 80 },
}

/** Lifecycle status → worklist tab bucket. */
const STATUS_TAB: Record<string, ApplicationReview['status']> = {
  'In Progress': 'active',
  Escalated: 'escalated',
  Decided: 'completed',
  Approved: 'completed',
  Rejected: 'completed',
  Received: 'pending',
  Processed: 'pending',
  'Awaiting Allocation': 'pending',
  'Awaiting Info': 'pending',
  Pending: 'pending',
  'Pending Assignment': 'pending',
}

export const SLA_WORKING_DAYS = 15

/** Days remaining against the 15-working-day standard (calendar-day approximation for the demo). `null` if no date. */
export function slaDaysRemaining(submittedAt: string | undefined, now: Date, slaDays = SLA_WORKING_DAYS): number | null {
  if (!submittedAt) return null
  const sub = new Date(submittedAt)
  if (Number.isNaN(sub.getTime())) return null
  const daysSince = Math.floor((now.getTime() - sub.getTime()) / 86_400_000)
  return slaDays - daysSince
}

function slaLabel(submittedAt: string | undefined, now: Date): string {
  const d = slaDaysRemaining(submittedAt, now)
  if (d === null) return '—'
  return d > 0 ? `${d}d left` : 'Overdue'
}

export function transformApplicationToReview(app: LiveApplication, now: Date): ApplicationReview {
  const v = app.recommendation
    ? VERDICT[app.recommendation]
    : { aiRecommendation: 'Review' as const, priority: 'medium' as const, riskScore: 50 }
  return {
    id: app.id,
    applicant: app.applicantName || 'Unknown Applicant',
    riskScore: v.riskScore,
    slaRemaining: slaLabel(app.submittedAt, now),
    aiRecommendation: v.aiRecommendation,
    priority: v.priority,
    status: STATUS_TAB[app.status] ?? 'active',
    flags: app.flags ?? [],
    team: { background: 'Pending', identity: 'Pending', document: 'Pending' },
    lastUpdated: app.submittedAt || 'Recently',
    documents: ['Passport', 'Supporting Documents'],
    type: app.visaType || 'Unknown',
    country: app.country || 'Unknown',
    submissionDate: (app.submittedAt || '').split('T')[0] || '',
    passport: 'N/A',
  }
}
