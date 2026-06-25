/**
 * POST /api/assignments/process-intake
 *
 * The "machine" beat: flips all `Received` apps → `Processed` (the recommendation
 * was pre-computed by DIS; here it's revealed) and returns the recommendation
 * distribution so the UI can show the tiles (≈ 600 / 250 / 150 on the real corpus).
 * Provider-agnostic; only apps in `Received` are affected (no-op for json/output_demo).
 */
import { NextResponse } from 'next/server'
import { getDataProvider } from '@/data/providers'

export async function POST() {
  try {
    const provider = await getDataProvider()
    const { data: apps } = await provider.getApplications({}, { page: 1, pageSize: 100000 })

    const distribution: Record<string, number> = {
      RECOMMEND_APPROVE: 0,
      RECOMMEND_REJECT: 0,
      MANUAL_REVIEW: 0,
    }
    let processed = 0
    for (const app of apps) {
      if (app.status === 'Received') {
        await provider.updateApplicationStatus(app.id, 'Processed')
        processed++
      }
      if (app.recommendation && app.recommendation in distribution) {
        distribution[app.recommendation]++
      }
    }

    return NextResponse.json({ success: true, data: { processed, total: apps.length, distribution } })
  } catch (error) {
    console.error('[API] POST /assignments/process-intake error:', error)
    return NextResponse.json({ success: false, error: 'Failed to process intake' }, { status: 500 })
  }
}
