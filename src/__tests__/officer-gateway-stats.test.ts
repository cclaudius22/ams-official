/**
 * Task 6 — officer gateway "SLA position" tile.
 *
 * Pure derivation from the officer's real assigned cases (their submittedAt
 * dates) using the EXISTING slaDaysRemaining/SLA_WORKING_DAYS helpers from
 * src/lib/officerQueue.ts (read-only import, not modified here). No fake
 * numbers: nearest deadline / overdue count / due-soon count are all derived
 * straight from the case list the gateway page already fetched for the "My
 * Queue" tile — see docs/specs/2026-06-30-rfi-officer-roles-design.md §3.
 */
import { describe, it, expect } from 'vitest'
import {
  deriveSlaPosition,
  slaPositionHeadline,
  slaPositionSubtext,
  SLA_DUE_SOON_DAYS,
} from '@/lib/officerGatewayStats'
import { SLA_WORKING_DAYS } from '@/lib/officerQueue'

const NOW = new Date('2026-07-05T00:00:00.000Z')

function daysAgoISO(days: number): string {
  return new Date(NOW.getTime() - days * 86_400_000).toISOString()
}

describe('deriveSlaPosition', () => {
  it('returns null for an empty case list', () => {
    expect(deriveSlaPosition([], NOW)).toBeNull()
  })

  it('returns null when no case has a usable submittedAt', () => {
    expect(deriveSlaPosition([undefined, undefined], NOW)).toBeNull()
    expect(deriveSlaPosition(['not-a-date'], NOW)).toBeNull()
  })

  it('ignores undated cases but derives from the dated ones', () => {
    // submitted today → 15 days remaining (SLA_WORKING_DAYS)
    const pos = deriveSlaPosition([undefined, daysAgoISO(0)], NOW)
    expect(pos).not.toBeNull()
    expect(pos!.totalWithDates).toBe(1)
    expect(pos!.nearestDays).toBe(SLA_WORKING_DAYS)
  })

  it('nearestDays is the MINIMUM days-remaining across all dated cases', () => {
    // submitted 2 days ago (13 left) and 10 days ago (5 left) → nearest = 5
    const pos = deriveSlaPosition([daysAgoISO(2), daysAgoISO(10)], NOW)
    expect(pos!.nearestDays).toBe(5)
  })

  it('counts overdue cases (days remaining <= 0)', () => {
    // submitted 15 days ago → 0 left (boundary, counts overdue);
    // submitted 20 days ago → -5 left (overdue)
    const pos = deriveSlaPosition([daysAgoISO(15), daysAgoISO(20), daysAgoISO(1)], NOW)
    expect(pos!.overdueCount).toBe(2)
    expect(pos!.nearestDays).toBe(-5)
  })

  it('counts due-soon cases (0 < days remaining <= SLA_DUE_SOON_DAYS)', () => {
    // 12 days ago → 3 left (due soon); 1 day ago → 14 left (not due soon)
    const pos = deriveSlaPosition([daysAgoISO(12), daysAgoISO(1)], NOW)
    expect(pos!.dueSoonCount).toBe(1)
    expect(SLA_DUE_SOON_DAYS).toBeGreaterThan(0)
  })

  it('respects a custom slaDays override', () => {
    const pos = deriveSlaPosition([daysAgoISO(3)], NOW, 5)
    expect(pos!.nearestDays).toBe(2)
  })
})

describe('slaPositionHeadline', () => {
  it('reports no data honestly when null', () => {
    expect(slaPositionHeadline(null)).toMatch(/no/i)
  })

  it('reports the nearest working-day count when nothing is overdue', () => {
    const pos = deriveSlaPosition([daysAgoISO(2)], NOW)
    expect(slaPositionHeadline(pos)).toBe('13 working days')
  })

  it('singularizes "1 working day"', () => {
    const pos = deriveSlaPosition([daysAgoISO(14)], NOW)
    expect(slaPositionHeadline(pos)).toBe('1 working day')
  })

  it('leads with the overdue count (not a negative day count) when any case is overdue', () => {
    const pos = deriveSlaPosition([daysAgoISO(20), daysAgoISO(2)], NOW)
    expect(slaPositionHeadline(pos)).toBe('1 case overdue')
  })

  it('pluralizes multiple overdue cases', () => {
    const pos = deriveSlaPosition([daysAgoISO(20), daysAgoISO(16)], NOW)
    expect(slaPositionHeadline(pos)).toBe('2 cases overdue')
  })
})

describe('slaPositionSubtext', () => {
  it('is honest when there is no derivable SLA data', () => {
    expect(slaPositionSubtext(null)).toMatch(/no assigned case/i)
  })

  it('flags due-soon cases when present', () => {
    const pos = deriveSlaPosition([daysAgoISO(12)], NOW) // 3 left, due soon
    expect(slaPositionSubtext(pos)).toContain('due within')
  })

  it('does not mention due-soon when there are none', () => {
    const pos = deriveSlaPosition([daysAgoISO(1)], NOW) // 14 left
    expect(slaPositionSubtext(pos)).not.toContain('due within')
  })
})
