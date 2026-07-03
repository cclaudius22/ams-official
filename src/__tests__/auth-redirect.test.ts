// src/__tests__/auth-redirect.test.ts
// Table-tests for the pure route-gating helpers (src/lib/authRedirect.ts).
// Spec: docs/specs/2026-06-30-rfi-officer-roles-design.md §3 route table.

import { describe, it, expect } from 'vitest'
import { isKnownRole, landingFor, routeDecision } from '@/lib/authRedirect'

describe('isKnownRole', () => {
  it('treats admin as known', () => {
    expect(isKnownRole('admin')).toBe(true)
  })

  it('treats officer as known', () => {
    expect(isKnownRole('officer')).toBe(true)
  })

  it('treats an unrecognized role string as unknown', () => {
    expect(isKnownRole('applicant')).toBe(false)
  })

  it('treats an empty-string role as unknown', () => {
    expect(isKnownRole('')).toBe(false)
  })

  it('treats a missing role as unknown', () => {
    expect(isKnownRole(undefined)).toBe(false)
  })
})

describe('landingFor', () => {
  it('lands admin on the live queue', () => {
    expect(landingFor('admin')).toBe('/dashboard/livequeue')
  })

  it('lands officer on the reviewer gateway', () => {
    expect(landingFor('officer')).toBe('/dashboard/reviewer')
  })
})

describe('routeDecision', () => {
  // --- officer: blocked from admin-only surfaces ---
  it('blocks officer from /dashboard/livequeue, redirecting to the gateway', () => {
    expect(routeDecision('officer', '/dashboard/livequeue')).toEqual({
      allow: false,
      redirectTo: '/dashboard/reviewer',
    })
  })

  it('blocks officer from /dashboard/live-intelligence, redirecting to the gateway', () => {
    expect(routeDecision('officer', '/dashboard/live-intelligence')).toEqual({
      allow: false,
      redirectTo: '/dashboard/reviewer',
    })
  })

  // --- officer: allowed on reviewer surfaces ---
  it('allows officer on the reviewer gateway', () => {
    expect(routeDecision('officer', '/dashboard/reviewer')).toEqual({ allow: true })
  })

  it('allows officer on /dashboard/reviewer/queue', () => {
    expect(routeDecision('officer', '/dashboard/reviewer/queue')).toEqual({ allow: true })
  })

  it('allows officer on /dashboard/reviewer/rfis', () => {
    expect(routeDecision('officer', '/dashboard/reviewer/rfis')).toEqual({ allow: true })
  })

  it('allows officer on a per-case reviewer path', () => {
    expect(
      routeDecision('officer', '/dashboard/reviewer/HO-SW-DEEP-2026-00012')
    ).toEqual({ allow: true })
  })

  // --- admin: blocked from reviewer surfaces ---
  it('blocks admin from the reviewer gateway, redirecting to the live queue', () => {
    expect(routeDecision('admin', '/dashboard/reviewer')).toEqual({
      allow: false,
      redirectTo: '/dashboard/livequeue',
    })
  })

  it('blocks admin from /dashboard/reviewer/queue', () => {
    expect(routeDecision('admin', '/dashboard/reviewer/queue')).toEqual({
      allow: false,
      redirectTo: '/dashboard/livequeue',
    })
  })

  it('blocks admin from /dashboard/reviewer/rfis', () => {
    expect(routeDecision('admin', '/dashboard/reviewer/rfis')).toEqual({
      allow: false,
      redirectTo: '/dashboard/livequeue',
    })
  })

  it('blocks admin from a per-case reviewer path', () => {
    expect(
      routeDecision('admin', '/dashboard/reviewer/HO-SW-DEEP-2026-00012')
    ).toEqual({
      allow: false,
      redirectTo: '/dashboard/livequeue',
    })
  })

  // --- admin: allowed on admin surfaces ---
  it('allows admin on /dashboard/livequeue', () => {
    expect(routeDecision('admin', '/dashboard/livequeue')).toEqual({ allow: true })
  })

  it('allows admin on /dashboard/live-intelligence', () => {
    expect(routeDecision('admin', '/dashboard/live-intelligence')).toEqual({ allow: true })
  })

  // --- shared ground: neither role is blocked from other /dashboard surfaces ---
  it('allows officer on unlisted /dashboard surfaces', () => {
    expect(routeDecision('officer', '/dashboard/knowledgebase')).toEqual({ allow: true })
  })

  it('allows admin on unlisted /dashboard surfaces', () => {
    expect(routeDecision('admin', '/dashboard/knowledgebase')).toEqual({ allow: true })
  })

  // --- unknown/missing role: treat as unauthenticated (controller resolution) ---
  it('treats an unknown role as unauthenticated', () => {
    expect(routeDecision('applicant', '/dashboard/livequeue')).toEqual({
      allow: false,
      redirectTo: '/signin',
    })
  })

  it('treats a missing role as unauthenticated', () => {
    expect(routeDecision(undefined, '/dashboard/reviewer')).toEqual({
      allow: false,
      redirectTo: '/signin',
    })
  })

  it('treats an empty-string role as unauthenticated', () => {
    expect(routeDecision('', '/dashboard/livequeue')).toEqual({
      allow: false,
      redirectTo: '/signin',
    })
  })
})
