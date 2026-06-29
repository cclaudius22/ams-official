/**
 * GET /api/ams-demo/applications/:id/review  (Slice 3a)
 *
 * The per-case deep review for an ams-demo `deep_set` application: the fully
 * enriched `DISApplicationView` (Panels 1–3) plus the `OVAssessment` (Panel 4),
 * both applicant-specific from Lenny's 3.0 corpus enrichment. One round-trip the
 * reviewer page fetches so all four panels render from real per-case data with
 * NO fallback to the mock fixture / synthetic OV.
 *
 * Served by the active queue-layer provider when it exposes the deep-review
 * capability (AmsDemoProvider, i.e. DATA_PROVIDER=ams-demo). Any other provider
 * → 404, and the page keeps its existing (replica/mock) behaviour.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getDataProvider } from '@/data/providers'
import { hasDeepSetReviewCapability } from '@/data/providers/deepSetReviewAdapter'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const provider = await getDataProvider()

    if (!hasDeepSetReviewCapability(provider)) {
      return NextResponse.json(
        { success: false, error: 'Deep review not available for the active data provider' },
        { status: 404 }
      )
    }

    const review = await provider.getDeepSetReview(id)
    if (!review) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: review })
  } catch (error) {
    console.error('[API] GET /ams-demo/applications/:id/review error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch deep review' }, { status: 500 })
  }
}
