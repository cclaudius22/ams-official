/**
 * GET /api/ams-demo/applications/:id/review  (Slice 3a; ownership guard Task 5)
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
 *
 * AUTH + PER-CASE OWNERSHIP (Task 5): no valid known-role token → 401. An
 * ADMIN bypasses the ownership check entirely (spec amendment, Chris 3 Jul —
 * demo-wide access decision). An OFFICER may only open a case assigned to
 * them: we look up the case's `assignedTo` via `getApplications` (queue-layer
 * assignment state — deep_set cases are assigned at provider init, Task 4c)
 * and gate with the pure `ownsCase` predicate → 403 if not theirs.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getDataProvider } from '@/data/providers'
import { hasDeepSetReviewCapability } from '@/data/providers/deepSetReviewAdapter'
import { getCurrentUser } from '@/lib/auth'
import { isKnownRole } from '@/lib/authRedirect'
import { ownsCase } from '@/lib/caseOwnership'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const caller = await getCurrentUser(request)
    if (!caller || !isKnownRole(caller.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const provider = await getDataProvider()

    if (!hasDeepSetReviewCapability(provider)) {
      return NextResponse.json(
        { success: false, error: 'Deep review not available for the active data provider' },
        { status: 404 }
      )
    }

    if (caller.role === 'officer') {
      const { data } = await provider.getApplications({ search: id }, { page: 1, pageSize: 10 })
      const match = data.find((a) => a.id === id)
      if (!ownsCase(match?.assignedTo?.id, caller.officerId)) {
        return NextResponse.json({ success: false, error: 'Case not assigned to you' }, { status: 403 })
      }
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
