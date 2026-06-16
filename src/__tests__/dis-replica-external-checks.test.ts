// @vitest-environment node
//
// Integration test for E5 — queryExternalChecks (task 2F.3).
// Runs only when DIS_REPLICA_URL is set (local Postgres replica up + seeded),
// so CI without docker stays green.
//
//   DIS_REPLICA_URL=postgres://dis:dis@localhost:5499/openvisa_pg_db \
//     npx vitest run src/__tests__/dis-replica-external-checks.test.ts

import { describe, it, expect } from 'vitest'
import { queryExternalChecks } from '@/data/dis-providers/queries/externalChecks'
import type { ExternalCheckType, CheckStatus } from '@/api-contracts/dis'

const CHECK_TYPES: ReadonlyArray<ExternalCheckType> = [
  'WORLDCHECK',
  'INTERPOL',
  'PASSPORT_VERIFY',
  'BORDER_CONTROL',
  'DEVICE_IP_RISK',
  'EMAIL_PHONE_REPUTATION',
  'SPONSOR_VERIFICATION',
]

const VALID_STATUS: ReadonlyArray<CheckStatus> = ['CLEAR', 'FLAGGED', 'BLOCKED', 'ERROR', 'TIMEOUT']
const VALID_RISK = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', null]

// A real seeded MANUAL_REVIEW application (confirmed live: 7 external_checks).
const KNOWN_SOURCE_ID = 'HO-SW-2026-36110347'

describe.skipIf(!process.env.DIS_REPLICA_URL)('queryExternalChecks (E5, replica)', () => {
  it('returns exactly 7 external-check rows for a known seeded application', async () => {
    const rows = await queryExternalChecks(KNOWN_SOURCE_ID)
    expect(rows).not.toBeNull()
    expect(rows).toHaveLength(7)
  })

  it('covers all 7 check types including SPONSOR_VERIFICATION (OPEN-8)', async () => {
    const rows = await queryExternalChecks(KNOWN_SOURCE_ID)
    const types = new Set((rows ?? []).map((r) => r.check_type))
    for (const t of CHECK_TYPES) {
      expect(types.has(t)).toBe(true)
    }
    expect(types.has('SPONSOR_VERIFICATION')).toBe(true)
    expect(types.size).toBe(7)
  })

  it('every row has a valid check_status and risk_level, and well-typed fields', async () => {
    const rows = await queryExternalChecks(KNOWN_SOURCE_ID)
    expect(rows).not.toBeNull()
    for (const r of rows ?? []) {
      expect(VALID_STATUS).toContain(r.check_status)
      expect(VALID_RISK).toContain(r.risk_level)
      // confidence_score is a numeric (not a string) within [0,1]
      expect(typeof r.confidence_score).toBe('number')
      expect(r.confidence_score).toBeGreaterThanOrEqual(0)
      expect(r.confidence_score).toBeLessThanOrEqual(1)
      // response_time_ms is an integer number
      expect(typeof r.response_time_ms).toBe('number')
      expect(Number.isInteger(r.response_time_ms)).toBe(true)
      // flags + response_payload are plain objects (JSONB)
      expect(typeof r.flags).toBe('object')
      expect(r.flags).not.toBeNull()
      expect(typeof r.response_payload).toBe('object')
      // keying / identity fields
      expect(typeof r.check_id).toBe('string')
      expect(typeof r.dis_application_id).toBe('string')
      // document_id is a UUID string for doc-bound checks, null otherwise
      expect(r.document_id === null || typeof r.document_id === 'string').toBe(true)
      expect(typeof r.created_at).toBe('string')
    }
  })

  it('document_id is populated only for the document-bound check types', async () => {
    const rows = await queryExternalChecks(KNOWN_SOURCE_ID)
    const byType = new Map((rows ?? []).map((r) => [r.check_type, r]))
    for (const t of ['INTERPOL', 'PASSPORT_VERIFY', 'BORDER_CONTROL'] as const) {
      expect(typeof byType.get(t)?.document_id).toBe('string')
    }
    // channel/identity checks are not bound to a document
    for (const t of ['WORLDCHECK', 'DEVICE_IP_RISK', 'EMAIL_PHONE_REPUTATION', 'SPONSOR_VERIFICATION'] as const) {
      expect(byType.get(t)?.document_id).toBeNull()
    }
  })

  it('returns null for an unknown application id', async () => {
    const rows = await queryExternalChecks('VK-DOES-NOT-EXIST-9999')
    expect(rows).toBeNull()
  })
})
