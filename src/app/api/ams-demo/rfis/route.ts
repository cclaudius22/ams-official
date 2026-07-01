/**
 * GET /api/ams-demo/rfis?officerId=<id>  (RFI lane — pre-auth subset, Task 9)
 *
 * The officer's RFI lane: their RFI-enabled deep_set cases projected into lane
 * rows (applicant · issue · due date · derived state), grouped client-side into
 * Awaiting / Returned / Overdue. Served by the active queue-layer provider when
 * it exposes the RFI-queue capability (AmsDemoProvider, i.e.
 * DATA_PROVIDER=ams-demo); any other provider → 404.
 *
 * PRE-AUTH: `officerId` comes from the query string (no JWT yet). When the auth
 * phase lands it will be read from the token instead; the provider already owns
 * the ownership convention.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getDataProvider } from '@/data/providers'
import { hasRfiQueueCapability } from '@/data/providers/rfiQueueAdapter'

export async function GET(request: NextRequest) {
  try {
    const provider = await getDataProvider()

    if (!hasRfiQueueCapability(provider)) {
      return NextResponse.json(
        { success: false, error: 'RFI queue not available for the active data provider' },
        { status: 404 }
      )
    }

    const officerId = request.nextUrl.searchParams.get('officerId')?.trim()
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
