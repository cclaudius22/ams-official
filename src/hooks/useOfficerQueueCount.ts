/**
 * Officer gateway (Task 6) — the officer's REAL assigned-case count, shared by
 * the "My Queue" sidebar badge (SidebarNavigation.tsx) so it never drifts from
 * the fake "My Queue 23" it replaces. Cheapest possible fetch (pageSize=1):
 * the sidebar only needs `total` from the /api/applications envelope, never
 * the actual case list.
 *
 * Fail-quiet by design: the sidebar renders on every /dashboard/** page, so a
 * slow/failed count fetch must never surface an error state there — it just
 * means no badge (NavLink already treats a falsy badge as "don't render").
 */
import { useEffect, useState } from 'react'

export interface OfficerQueueCount {
  /** Real assigned-case count for `officerId`, or null while loading/unknown/failed. */
  count: number | null
  loading: boolean
}

export function useOfficerQueueCount(officerId: string | undefined): OfficerQueueCount {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!officerId) {
      setCount(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    const params = new URLSearchParams({ assignedTo: officerId, pageSize: '1' })
    fetch(`/api/applications?${params}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json?.success && typeof json.total === 'number') {
          setCount(json.total)
        } else {
          setCount(null)
        }
      })
      .catch(() => {
        // Fail-quiet: the sidebar renders everywhere, a badge is a nicety.
        if (!cancelled) setCount(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [officerId])

  return { count, loading }
}
