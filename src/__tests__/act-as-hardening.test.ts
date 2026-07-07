// @vitest-environment node
/**
 * Task 4e / Fix A (security review finding): the demo act-as re-mint branch
 * (`POST /api/auth/login` with `{actAsOfficerId}`) must require an existing,
 * known-role (`admin` | `officer`) session before minting a token for a
 * *different* officer. Previously any anonymous caller could hit this branch
 * and walk away with a valid officer/admin auth cookie for any seeded
 * officer id — no session required. The email/password branches (demo and
 * Prisma) are unrelated and unchanged; initial sign-in must keep working
 * without a session.
 *
 * Exercises the route handler directly (no server needed) with
 * DATA_PROVIDER=ams-demo — the only provider under which this branch runs.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'
import { generateToken } from '@/lib/auth'

const ORIGINAL_DATA_PROVIDER = process.env.DATA_PROVIDER

function actAsRequest(officerId: string, cookie?: string): NextRequest {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (cookie) headers['cookie'] = cookie
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers,
    body: JSON.stringify({ actAsOfficerId: officerId }),
  })
}

function officerSessionCookie(): string {
  const token = generateToken({
    userId: 'user-officer',
    email: 'officer@demo.gov',
    role: 'officer',
    organizationId: 'ho-demo',
    officerId: 'officer-demo',
  })
  return `auth-token=${token}`
}

describe('POST /api/auth/login — act-as re-mint requires a session (ams-demo)', () => {
  beforeEach(() => {
    process.env.DATA_PROVIDER = 'ams-demo'
  })

  afterEach(() => {
    process.env.DATA_PROVIDER = ORIGINAL_DATA_PROVIDER
  })

  it('rejects act-as with no auth cookie at all (401)', async () => {
    const response = await POST(actAsRequest('officer-2'))
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Sign in before switching officers')
  })

  it('accepts act-as with a valid session cookie, for a known officer id (200 + Set-Cookie + officerId)', async () => {
    const response = await POST(actAsRequest('officer-2', officerSessionCookie()))
    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).toMatch(/auth-token=/)
    const body = await response.json()
    expect(body.officerId).toBe('officer-2')
  })

  it('rejects act-as with a valid session but an unknown officer id (401)', async () => {
    const response = await POST(actAsRequest('officer-does-not-exist', officerSessionCookie()))
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unknown officer id')
  })
})
