import { describe, it, expect } from 'vitest'
import { transformApplicationToReview, slaDaysRemaining } from '@/lib/officerQueue'
import type { LiveApplication } from '@/api-contracts/applications'

const NOW = new Date('2026-06-25T10:00:00Z')
const baseApp: LiveApplication = {
  id: 'HO-SW-2026-00000001',
  applicantName: 'Karan Nair',
  country: 'IN',
  visaType: 'Skilled Worker',
  visaTypeId: 'skilled_worker_visa',
  status: 'In Progress',
  submittedAt: '2026-06-20T10:00:00Z',
  assignedTo: { id: 'officer-2', name: 'Ricardo Martinez' },
  recommendation: 'RECOMMEND_APPROVE',
}

describe('officerQueue transform', () => {
  it('maps the REAL recommendation to verdict + priority (status-led)', () => {
    expect(transformApplicationToReview({ ...baseApp, recommendation: 'RECOMMEND_APPROVE' }, NOW)).toMatchObject({ aiRecommendation: 'Approve', priority: 'low' })
    expect(transformApplicationToReview({ ...baseApp, recommendation: 'RECOMMEND_REJECT' }, NOW)).toMatchObject({ aiRecommendation: 'Reject', priority: 'high' })
    expect(transformApplicationToReview({ ...baseApp, recommendation: 'MANUAL_REVIEW' }, NOW)).toMatchObject({ aiRecommendation: 'Review', priority: 'medium' })
  })

  it('uses the real applicant / visa type / country / id (no fabrication)', () => {
    const r = transformApplicationToReview(baseApp, NOW)
    expect(r.applicant).toBe('Karan Nair')
    expect(r.type).toBe('Skilled Worker')
    expect(r.country).toBe('IN')
    expect(r.id).toBe('HO-SW-2026-00000001')
  })

  it('maps lifecycle status to the worklist tab bucket', () => {
    expect(transformApplicationToReview({ ...baseApp, status: 'In Progress' }, NOW).status).toBe('active')
    expect(transformApplicationToReview({ ...baseApp, status: 'Awaiting Allocation' }, NOW).status).toBe('pending')
    expect(transformApplicationToReview({ ...baseApp, status: 'Decided' }, NOW).status).toBe('completed')
    expect(transformApplicationToReview({ ...baseApp, status: 'Escalated' }, NOW).status).toBe('escalated')
  })

  it('computes SLA days remaining against the 15-working-day standard', () => {
    expect(slaDaysRemaining('2026-06-20T10:00:00Z', NOW)).toBe(10) // submitted 5 days ago → 15-5
    expect(slaDaysRemaining(undefined, NOW)).toBeNull()
  })

  it('defaults gracefully when recommendation is absent', () => {
    const r = transformApplicationToReview({ ...baseApp, recommendation: undefined }, NOW)
    expect(r.aiRecommendation).toBe('Review')
    expect(r.priority).toBe('medium')
  })
})
