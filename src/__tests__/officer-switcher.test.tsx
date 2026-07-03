/**
 * Task 4e / Fix B (Task 4 review finding): OfficerSwitcher must not silently
 * swallow a failed act-as re-mint. Previously `setCurrentOfficer` ran before
 * the re-mint POST, and any non-200/thrown response fell back to "keep the
 * client-only switch" — leaving the UI on the newly-picked officer while the
 * `auth-token` cookie still carried the *old* officerId. That divergence is
 * exactly what the upcoming per-case ownership guard would turn into
 * wrong-officer gating. This spec locks in: revert to the previous officer
 * and surface a visible error when the re-mint fails; on success, switch and
 * clear any prior error; only `router.refresh()` on success.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OfficerSwitcher from '@/components/dashboard/OfficerSwitcher'
import { OfficerProvider, STORAGE_KEY } from '@/contexts/OfficerContext'
import { defaultOfficers } from '@/data/seed/officers'

// setup.tsx globally mocks next/navigation without `refresh`; OfficerSwitcher
// calls router.refresh() on a successful re-mint, so override it here with a
// spy we can assert on.
const refresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh,
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

const [initialOfficer, targetOfficer] = defaultOfficers

async function renderSwitcher() {
  localStorage.removeItem(STORAGE_KEY)
  render(
    <OfficerProvider>
      <OfficerSwitcher />
    </OfficerProvider>
  )
  // Wait for the OfficerProvider's mount effect (localStorage restore) to
  // resolve past the loading skeleton.
  await screen.findByText(`${initialOfficer.firstName} ${initialOfficer.lastName}`)
}

async function switchTo(user: ReturnType<typeof userEvent.setup>, officerName: string) {
  await user.click(screen.getByRole('button', { name: new RegExp(initialOfficer.lastName) }))
  const items = await screen.findAllByText(officerName)
  await user.click(items[items.length - 1])
}

describe('OfficerSwitcher — act-as re-mint failure handling', () => {
  beforeEach(() => {
    refresh.mockClear()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('switches officer and refreshes on a successful re-mint, with no error shown', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, officerId: targetOfficer.id }),
    })

    const user = userEvent.setup()
    await renderSwitcher()

    await switchTo(user, `${targetOfficer.firstName} ${targetOfficer.lastName}`)

    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1))
    expect(
      screen.getAllByText(`${targetOfficer.firstName} ${targetOfficer.lastName}`).length
    ).toBeGreaterThan(0)
    expect(screen.queryByText(/switch|failed|error/i)).not.toBeInTheDocument()
  })

  it('reverts to the previous officer and shows an error when the re-mint fails (500)', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'boom' }),
    })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const user = userEvent.setup()
    await renderSwitcher()

    await switchTo(user, `${targetOfficer.firstName} ${targetOfficer.lastName}`)

    // Reverts: the trigger button shows the *previous* officer again, not
    // the one that was clicked, and router.refresh() must not fire.
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: new RegExp(initialOfficer.lastName) })
      ).toBeInTheDocument()
    })
    expect(refresh).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalled()

    // A visible inline error near the switcher.
    expect(screen.getByText(/switch|failed|error/i)).toBeInTheDocument()
  })

  it('clears a previous error on the next successful switch', async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: 'boom' }) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, officerId: targetOfficer.id }),
      })

    const user = userEvent.setup()
    await renderSwitcher()

    await switchTo(user, `${targetOfficer.firstName} ${targetOfficer.lastName}`)
    await waitFor(() => expect(screen.getByText(/switch|failed|error/i)).toBeInTheDocument())

    await switchTo(user, `${targetOfficer.firstName} ${targetOfficer.lastName}`)
    await waitFor(() => expect(refresh).toHaveBeenCalledTimes(1))
    expect(screen.queryByText(/switch|failed|error/i)).not.toBeInTheDocument()
  })
})
