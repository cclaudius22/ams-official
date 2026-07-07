/**
 * GET /api/ams-demo/rfis?officerId=<id>  (RFI lane — token-first, Task 5)
 *
 * The officer's RFI lane: their RFI-enabled deep_set cases projected into lane
 * rows (applicant · issue · due date · derived state), grouped client-side into
 * Awaiting / Returned / Overdue. Served by the active queue-layer provider when
 * it exposes the RFI-queue capability (AmsDemoProvider, i.e.
 * DATA_PROVIDER=ams-demo); any other provider → 404.
 *
 * AUTH (Task 5): the pre-auth query-param-only mode is RETIRED. No valid
 * known-role token → 401. An OFFICER's lane is always their own — `officerId`
 * comes from the token and any `?officerId=` query param is IGNORED (can't be
 * used to read another officer's lane). An ADMIN has no personal lane, so
 * `?officerId=` is required for oversight viewing of a specific officer's
 * lane → 400 if absent.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getDataProvider } from '@/data/providers'
import { hasRfiQueueCapability } from '@/data/providers/rfiQueueAdapter'
import { getCurrentUser } from '@/lib/auth'
import { isKnownRole } from '@/lib/authRedirect'

export async function GET(request: NextRequest) {
  try {
    const caller = await getCurrentUser(request)
    if (!caller || !isKnownRole(caller.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const provider = await getDataProvider()

    if (!hasRfiQueueCapability(provider)) {
      return NextResponse.json(
        { success: false, error: 'RFI queue not available for the active data provider' },
        { status: 404 }
      )
    }

    let officerId: string | undefined
    if (caller.role === 'officer') {
      officerId = caller.officerId
    } else {
      officerId = request.nextUrl.searchParams.get('officerId')?.trim() || undefined
    }

    if (!officerId) {
      return NextResponse.json(
        { success: false, error: 'officerId query parameter is required' },
        { status: 400 }
      )
    }

    const items = await provider.getRfiQueue(officerId)
    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('[API] GET /ams-demo/rfis error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch RFI queue' }, { status: 500 })
  }
}
