/**
 * MockDISProvider — the default DIS provider branch (DIS_DATA_PROVIDER unset or
 * 'mock'). Returns the in-repo fixture so the reviewer page / demo never depend
 * on the docker replica being up. This is the seam 2F.4 flips to 'replica'.
 *
 * These tests pin the DISDataProvider method signatures that the replica
 * provider (and Deloitte provider, later) must also satisfy.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { getDISProvider, resetDISProvider } from '@/data/dis-providers'
import { mockDISApplicationView } from '@/lib/mockDISData'

const FIXTURE_ID = 'VK-2026-RK-4821'

describe('MockDISProvider (default provider)', () => {
  beforeEach(() => {
    resetDISProvider()
    delete process.env.DIS_DATA_PROVIDER
  })

  it('getApplicationView returns the fixture composite for the seeded source id', async () => {
    const provider = await getDISProvider()
    const view = await provider.getApplicationView(FIXTURE_ID)
    expect(view).toEqual(mockDISApplicationView)
  })

  it('getApplicationView returns null for an unknown id', async () => {
    const provider = await getDISProvider()
    expect(await provider.getApplicationView('NOPE-404')).toBeNull()
  })

  it('getTrail returns the fixture rule_results (20) + opa_results (12)', async () => {
    const provider = await getDISProvider()
    const trail = await provider.getTrail(FIXTURE_ID)
    expect(trail?.rule_results).toHaveLength(20)
    expect(trail?.opa_results).toHaveLength(12)
    // denial_reasons must survive (Panel 2 renders them) — OPA-S02 is flagged.
    const s02 = trail?.opa_results.find((p) => p.policy_id === 'OPA-S02')
    expect(s02?.denial_reasons.length).toBeGreaterThan(0)
  })

  it('getExternalChecks returns the fixture checks', async () => {
    const provider = await getDISProvider()
    const checks = await provider.getExternalChecks(FIXTURE_ID)
    expect(checks).toHaveLength(mockDISApplicationView.external_checks.length)
  })

  it('getDocuments returns the fixture extractions', async () => {
    const provider = await getDISProvider()
    const docs = await provider.getDocuments(FIXTURE_ID)
    expect(docs?.document_extractions).toHaveLength(
      mockDISApplicationView.document_extractions.length,
    )
  })

  it('getApplications projects the fixture into one DISQueueRow', async () => {
    const provider = await getDISProvider()
    const page = await provider.getApplications({}, { page: 1, pageSize: 20 })
    expect(page.total).toBe(1)
    expect(page.data[0]).toMatchObject({
      source_application_id: FIXTURE_ID,
      queue_state: 'READY_FOR_REVIEW',
      recommendation: 'MANUAL_REVIEW',
      visa_type: 'skilled_worker',
    })
  })

  it('getApplications honours a queue_state filter (no match → empty)', async () => {
    const provider = await getDISProvider()
    const page = await provider.getApplications({ queue_state: 'AUTO_RECOMMENDED' }, { page: 1, pageSize: 20 })
    expect(page.total).toBe(0)
    expect(page.data).toHaveLength(0)
  })
})
