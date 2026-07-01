/**
 * Unit tests for deriveQueueState — the V5 §4 derived queue-state rule,
 * corrected 17 June 2026 to the Phase-1 human-in-the-loop model.
 *
 * Phase 1: every processed application goes to a caseworker. All three
 * recommendation outcomes (RECOMMEND_APPROVE / RECOMMEND_REJECT / MANUAL_REVIEW)
 * land in READY_FOR_REVIEW — the recommendation is advisory, never a gate.
 * AUTO_RECOMMENDED / CALLBACK_SENT are Phase-2 only and never produced here.
 */

import { describe, it, expect } from 'vitest'
import { deriveQueueState } from '@/data/dis-providers/queueState'

describe('deriveQueueState (Phase 1 — human-in-the-loop)', () => {
  it('RECOMMEND_APPROVE → READY_FOR_REVIEW (review and confirm)', () => {
    expect(deriveQueueState({ status: 'COMPLETE', recommendationOutcome: 'RECOMMEND_APPROVE' }))
      .toBe('READY_FOR_REVIEW')
  })

  it('RECOMMEND_REJECT → READY_FOR_REVIEW (review and confirm)', () => {
    expect(deriveQueueState({ status: 'COMPLETE', recommendationOutcome: 'RECOMMEND_REJECT' }))
      .toBe('READY_FOR_REVIEW')
  })

  it('MANUAL_REVIEW → READY_FOR_REVIEW (review soft flags)', () => {
    expect(deriveQueueState({ status: 'COMPLETE', recommendationOutcome: 'MANUAL_REVIEW' }))
      .toBe('READY_FOR_REVIEW')
  })

  it('no recommendation yet + COMPLETE → IN_PIPELINE (not ready)', () => {
    expect(deriveQueueState({ status: 'COMPLETE', recommendationOutcome: null }))
      .toBe('IN_PIPELINE')
  })

  it('INCOMPLETE_PENDING → AWAITING_DOCS', () => {
    expect(deriveQueueState({ status: 'INCOMPLETE_PENDING', recommendationOutcome: null }))
      .toBe('AWAITING_DOCS')
  })

  it('DOCUMENTS_REQUIRED → AWAITING_DOCS', () => {
    expect(deriveQueueState({ status: 'DOCUMENTS_REQUIRED', recommendationOutcome: null }))
      .toBe('AWAITING_DOCS')
  })

  it('CREATED → FAILED_INTAKE', () => {
    expect(deriveQueueState({ status: 'CREATED', recommendationOutcome: null }))
      .toBe('FAILED_INTAKE')
  })

  it('a present recommendation wins over a lagging status', () => {
    expect(deriveQueueState({ status: 'INCOMPLETE_PENDING', recommendationOutcome: 'RECOMMEND_APPROVE' }))
      .toBe('READY_FOR_REVIEW')
  })

  it('does not produce Phase-2 states (AUTO_RECOMMENDED / CALLBACK_SENT) in Phase 1', () => {
    const phase2 = new Set(['AUTO_RECOMMENDED', 'CALLBACK_SENT'])
    const outcomes = ['RECOMMEND_APPROVE', 'RECOMMEND_REJECT', 'MANUAL_REVIEW', null] as const
    for (const o of outcomes) {
      expect(phase2.has(deriveQueueState({ status: 'COMPLETE', recommendationOutcome: o }))).toBe(false)
    }
  })
})
