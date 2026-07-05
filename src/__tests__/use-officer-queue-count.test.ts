/**
 * Task 6 — the sidebar "My Queue" badge count. Cheap (pageSize=1), fail-quiet
 * (the sidebar renders on every /dashboard page), and reads the REAL total
 * from the /api/applications envelope rather than a hardcoded number.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useOfficerQueueCount } from '@/hooks/useOfficerQueueCount'

describe('useOfficerQueueCount', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not fetch and returns a null count when officerId is undefined', () => {
    const { result } = renderHook(() => useOfficerQueueCount(undefined))
    expect(result.current.count).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('fetches with assignedTo + a cheap pageSize=1 and resolves the real total', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => ({ success: true, data: [{}], total: 18, page: 1, pageSize: 1, totalPages: 18 }),
    })

    const { result } = renderHook(() => useOfficerQueueCount('officer-demo'))

    await waitFor(() => expect(result.current.count).toBe(18))
    expect(result.current.loading).toBe(false)

    const calledUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string
    expect(calledUrl).toContain('/api/applications?')
    expect(calledUrl).toContain('assignedTo=officer-demo')
    expect(calledUrl).toContain('pageSize=1')
  })

  it('fails quiet: a rejected fetch resolves to a null count, never throws', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('network down'))

    const { result } = renderHook(() => useOfficerQueueCount('officer-demo'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.count).toBeNull()
  })

  it('fails quiet: a success:false response resolves to a null count', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => ({ success: false, error: 'boom' }),
    })

    const { result } = renderHook(() => useOfficerQueueCount('officer-demo'))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.count).toBeNull()
  })
})
