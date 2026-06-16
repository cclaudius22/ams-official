/**
 * Unit tests for deriveQueueState — the V5 §4 derived queue-state rule.
 *
 * applications.status is only a completeness verdict (never the decision), so
 * the queue state the UI binds to is DERIVED from status + the recommendations
 * row + callback delivery. This is the single source of that derivation.
 *
 * Precedence decision (documented, confirm at pit stop):
 *   - A present recommendation outcome WINS over status-based states.
 *   - MANUAL_REVIEW always → READY_FOR_REVIEW (the caseworker queue), even once
 *     the informational callback is delivered — otherwise the queue empties.
 *   - APPROVE → CALLBACK_SENT once delivered, else AUTO_RECOMMENDED.
 */

import { describe, it, expect } from 'vitest'
import { deriveQueueState } from '@/data/dis-providers/queueState'

describe('deriveQueueState', () => {
  it('returns FAILED_INTAKE when status is CREATED and nothing progressed', () => {
    expect(deriveQueueState({ status: 'CREATED', recommendationOutcome: null, callbackDelivered: false }))
      .toBe('FAILED_INTAKE')
  })

  it('returns AWAITING_DOCS for INCOMPLETE_PENDING', () => {
    expect(deriveQueueState({ status: 'INCOMPLETE_PENDING', recommendationOutcome: null, callbackDelivered: false }))
      .toBe('AWAITING_DOCS')
  })

  it('returns AWAITING_DOCS for DOCUMENTS_REQUIRED', () => {
    expect(deriveQueueState({ status: 'DOCUMENTS_REQUIRED', recommendationOutcome: null, callbackDelivered: false }))
      .toBe('AWAITING_DOCS')
  })

  it('returns IN_PIPELINE when COMPLETE but no recommendation row yet', () => {
    expect(deriveQueueState({ status: 'COMPLETE', recommendationOutcome: null, callbackDelivered: false }))
      .toBe('IN_PIPELINE')
  })

  it('returns READY_FOR_REVIEW for a MANUAL_REVIEW recommendation', () => {
    expect(deriveQueueState({ status: 'COMPLETE', recommendationOutcome: 'MANUAL_REVIEW', callbackDelivered: false }))
      .toBe('READY_FOR_REVIEW')
  })

  it('keeps MANUAL_REVIEW in READY_FOR_REVIEW even after callback delivery (callback does not empty the queue)', () => {
    expect(deriveQueueState({ status: 'COMPLETE', recommendationOutcome: 'MANUAL_REVIEW', callbackDelivered: true }))
      .toBe('READY_FOR_REVIEW')
  })

  it('returns AUTO_RECOMMENDED for an APPROVE recommendation not yet delivered', () => {
    expect(deriveQueueState({ status: 'COMPLETE', recommendationOutcome: 'APPROVE', callbackDelivered: false }))
      .toBe('AUTO_RECOMMENDED')
  })

  it('returns CALLBACK_SENT for an APPROVE recommendation once delivered', () => {
    expect(deriveQueueState({ status: 'COMPLETE', recommendationOutcome: 'APPROVE', callbackDelivered: true }))
      .toBe('CALLBACK_SENT')
  })

  it('prioritises a present recommendation over the raw status', () => {
    // Defensive: even if status still reads INCOMPLETE_PENDING, a real
    // recommendation row means the pipeline ran — bind to the recommendation.
    expect(deriveQueueState({ status: 'INCOMPLETE_PENDING', recommendationOutcome: 'MANUAL_REVIEW', callbackDelivered: false }))
      .toBe('READY_FOR_REVIEW')
  })
})
