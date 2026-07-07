import { describe, it, expect } from 'vitest'
import { ownsCase } from '@/lib/caseOwnership'

/**
 * Task 5 — per-case ownership guard (pure predicate).
 *
 * `ownsCase` is the single source of truth for "does this officer own this
 * case" — true ONLY when both ids are defined, non-empty, and equal. The
 * admin bypass (spec amendment, Chris 3 Jul) is NOT expressed here: it's a
 * call-site decision (role === 'admin' skips this check entirely) so this
 * function stays a pure officer<->case equality check.
 */
describe('ownsCase', () => {
  it('true when assignedToId equals officerId', () => {
    expect(ownsCase('officer-demo', 'officer-demo')).toBe(true)
  })

  it('false when assignedToId and officerId differ', () => {
    expect(ownsCase('officer-demo', 'officer-2')).toBe(false)
  })

  it('false when assignedToId is undefined', () => {
    expect(ownsCase(undefined, 'officer-demo')).toBe(false)
  })

  it('false when officerId is undefined', () => {
    expect(ownsCase('officer-demo', undefined)).toBe(false)
  })

  it('false when both are undefined', () => {
    expect(ownsCase(undefined, undefined)).toBe(false)
  })

  it('false when assignedToId is an empty string', () => {
    expect(ownsCase('', 'officer-demo')).toBe(false)
  })

  it('false when officerId is an empty string', () => {
    expect(ownsCase('officer-demo', '')).toBe(false)
  })

  it('false when both are empty strings', () => {
    expect(ownsCase('', '')).toBe(false)
  })
})
