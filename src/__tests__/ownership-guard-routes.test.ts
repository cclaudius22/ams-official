// @vitest-environment node
/**
 * Task 5 — per-case ownership guard + token-first officerId, exercised at the
 * route layer (real handlers, real `generateToken`, DATA_PROVIDER=ams-demo).
 * Follows the act-as-hardening.test.ts idiom: call the exported GET handler
 * directly with a hand-built NextRequest, no server needed.
 *
 * Covers:
 *  - GET /api/ams-demo/applications/:id/review — 401 no token; officer token
 *    (owner) → 200; officer token (non-owner) → 403; admin token (bypass) → 200.
 *  - GET /api/ams-demo/rfis — 401 no token; officer token ignores ?officerId=
 *    (token wins); admin token requires ?officerId= (400 if absent, 200 with).
 *
 * officer-demo (Rachel Johnson) owns all 18 deep_set cases at provider init
 * (Task 4c — see deep-set-officer-assignment.test.ts); HO-SW-DEEP-2026-00005
 * is one of them and is NOT one of the 3 RFI heroes, so it's a clean
 * ownership-only fixture independent of the RFI scaffold.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as reviewGET } from '@/app/api/ams-demo/applications/[id]/review/route'
import { GET as rfisGET } from '@/app/api/ams-demo/rfis/route'
import { generateToken } from '@/lib/auth'
import { resetProvider } from '@/data/providers'

const ORIGINAL_DATA_PROVIDER = process.env.DATA_PROVIDER
const OWNED_ID = 'HO-SW-DEEP-2026-00005'

function officerToken(officerId: string): string {
  return generateToken({
    userId: `user-${officerId}`,
    email: `${officerId}@demo.gov`,
    role: 'officer',
    organizationId: 'ho-demo',
    officerId,
  })
}

function adminToken(): string {
  return generateToken({
    userId: 'user-admin',
    email: 'admin@demo.gov',
    role: 'admin',
    organizationId: 'ho-demo',
  })
}

function reviewRequest(id: string, cookie?: string): { request: NextRequest; params: Promise<{ id: string }> } {
  const headers: Record<string, string> = {}
  if (cookie) headers['cookie'] = cookie
  return {
    request: new NextRequest(`http://localhost/api/ams-demo/applications/${id}/review`, { headers }),
    params: Promise.resolve({ id }),
  }
}

function rfisRequest(query: string, cookie?: string): NextRequest {
  const headers: Record<string, string> = {}
  if (cookie) headers['cookie'] = cookie
  return new NextRequest(`http://localhost/api/ams-demo/rfis${query}`, { headers })
}

describe('per-case ownership guard + token-first RFI lane (ams-demo)', () => {
  beforeEach(() => {
    process.env.DATA_PROVIDER = 'ams-demo'
    resetProvider()
  })

  afterEach(() => {
    process.env.DATA_PROVIDER = ORIGINAL_DATA_PROVIDER
    resetProvider()
  })

  describe('GET /api/ams-demo/applications/:id/review', () => {
    it('no token → 401', async () => {
      const { request, params } = reviewRequest(OWNED_ID)
      const response = await reviewGET(request, { params })
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.success).toBe(false)
    })

    it('officer token (owner, officer-demo) + owned deep_set id → 200', async () => {
      const { request, params } = reviewRequest(OWNED_ID, `auth-token=${officerToken('officer-demo')}`)
      const response = await reviewGET(request, { params })
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
    })

    it('officer token for a DIFFERENT officer + same deep_set id → 403', async () => {
      const { request, params } = reviewRequest(OWNED_ID, `auth-token=${officerToken('officer-2')}`)
      const response = await reviewGET(request, { params })
      expect(response.status).toBe(403)
      const body = await response.json()
      expect(body).toEqual({ success: false, error: 'Case not assigned to you' })
    })

    it('admin token (bypass) + same deep_set id → 200', async () => {
      const { request, params } = reviewRequest(OWNED_ID, `auth-token=${adminToken()}`)
      const response = await reviewGET(request, { params })
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
    })
  })

  describe('GET /api/ams-demo/rfis', () => {
    it('no token → 401', async () => {
      const response = await rfisGET(rfisRequest('?officerId=officer-demo'))
      expect(response.status).toBe(401)
      const body = await response.json()
      expect(body.success).toBe(false)
    })

    it('officer token ignores ?officerId= — token wins (officer-demo lane, 3 items, not officer-2\'s 0)', async () => {
      const response = await rfisGET(
        rfisRequest('?officerId=officer-2', `auth-token=${officerToken('officer-demo')}`)
      )
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(3)
    })

    it('admin token + ?officerId=officer-demo → 3 items', async () => {
      const response = await rfisGET(rfisRequest('?officerId=officer-demo', `auth-token=${adminToken()}`))
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
      expect(body.data).toHaveLength(3)
    })

    it('admin token without ?officerId= → 400', async () => {
      const response = await rfisGET(rfisRequest('', `auth-token=${adminToken()}`))
      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.success).toBe(false)
    })
  })
})
