/**
 * normalizeOutcome — maps the DIS pipeline's recommendation vocab (and legacy
 * variants) to the canonical DecisionOutcome. Added 17 June 2026 for the
 * RECOMMEND_* correction: the pipeline emits RECOMMEND_APPROVE /
 * RECOMMEND_REJECT / MANUAL_REVIEW.
 */

import { describe, it, expect } from 'vitest'
import { normalizeOutcome } from '@/lib/normalizeOutcome'

describe('normalizeOutcome — DIS pipeline vocab (RECOMMEND_*)', () => {
  it('maps RECOMMEND_APPROVE → APPROVED', () => {
    expect(normalizeOutcome('RECOMMEND_APPROVE')).toBe('APPROVED')
  })

  it('maps RECOMMEND_REJECT → REJECTED', () => {
    expect(normalizeOutcome('RECOMMEND_REJECT')).toBe('REJECTED')
  })

  it('maps MANUAL_REVIEW → MANUAL_REVIEW', () => {
    expect(normalizeOutcome('MANUAL_REVIEW')).toBe('MANUAL_REVIEW')
  })

  // Boundary robustness — legacy / other-vocab inputs still normalise.
  it('still maps legacy approve / approved → APPROVED', () => {
    expect(normalizeOutcome('approve')).toBe('APPROVED')
    expect(normalizeOutcome('APPROVED')).toBe('APPROVED')
  })

  it('still maps legacy reject / rejected → REJECTED', () => {
    expect(normalizeOutcome('reject')).toBe('REJECTED')
    expect(normalizeOutcome('rejected')).toBe('REJECTED')
  })

  it('returns undefined for an unknown value', () => {
    expect(normalizeOutcome('banana')).toBeUndefined()
  })
})
