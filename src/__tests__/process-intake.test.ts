import { beforeEach, afterEach, describe, expect, it } from 'vitest'

import { POST } from '@/app/api/assignments/process-intake/route'
import { getDataProvider, resetProvider } from '@/data/providers'

const ORIGINAL_DATA_PROVIDER = process.env.DATA_PROVIDER
const ORIGINAL_CORPUS_PATH = process.env.AMS_DEMO_CORPUS_PATH

describe('POST /api/assignments/process-intake', () => {
  beforeEach(() => {
    resetProvider()
    process.env.DATA_PROVIDER = 'ams-demo'
    process.env.AMS_DEMO_CORPUS_PATH = 'data/demo-corpus'
  })

  afterEach(() => {
    resetProvider()
    process.env.DATA_PROVIDER = ORIGINAL_DATA_PROVIDER
    process.env.AMS_DEMO_CORPUS_PATH = ORIGINAL_CORPUS_PATH
  })

  it('processes only the bulk Received intake, excluding Rachel deep-set work already in progress', async () => {
    const response = await POST()
    const body = await response.json()

    expect(body.success).toBe(true)
    expect(body.data).toEqual({
      processed: 1000,
      total: 1000,
      distribution: {
        RECOMMEND_APPROVE: 600,
        RECOMMEND_REJECT: 250,
        MANUAL_REVIEW: 150,
      },
    })

    const provider = await getDataProvider()
    const { data, total } = await provider.getApplications({}, { page: 1, pageSize: 2000 })
    expect(total).toBe(1018)
    expect(data.filter((app) => app.status === 'Processed' && !app.assignedTo)).toHaveLength(1000)
    expect(data.filter((app) => app.id.startsWith('HO-SW-DEEP-') && app.status === 'In Progress')).toHaveLength(18)
  })
})
