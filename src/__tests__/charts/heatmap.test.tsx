import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Heatmap, heatmapColor } from '@/components/charts/Heatmap'

const HEX = /^#[0-9a-fA-F]{6}$/

describe('heatmapColor — the sequential scale', () => {
  it('maps min → light start and max → base hue, clamping out-of-range values', () => {
    const base = '#6366f1'
    expect(heatmapColor(0, 0, 100, base).toLowerCase()).toBe('#f1f5f9') // light start
    expect(heatmapColor(100, 0, 100, base).toLowerCase()).toBe('#6366f1') // full base
    expect(heatmapColor(-50, 0, 100, base).toLowerCase()).toBe('#f1f5f9') // clamp low
    expect(heatmapColor(9999, 0, 100, base).toLowerCase()).toBe('#6366f1') // clamp high
  })

  it('returns an in-between hex for mid values and never divides by zero', () => {
    const mid = heatmapColor(50, 0, 100)
    expect(mid).toMatch(HEX)
    expect(mid.toLowerCase()).not.toBe('#f1f5f9')
    expect(mid.toLowerCase()).not.toBe('#6366f1')
    expect(heatmapColor(5, 5, 5)).toMatch(HEX) // min === max is safe
  })

  it('always returns a valid hex — never #NaNNaNNaN — for non-finite values or short-hex bases', () => {
    expect(heatmapColor(NaN, 0, 100)).toMatch(HEX) // NaN value
    expect(heatmapColor(Infinity, 0, 100)).toMatch(HEX) // ±Infinity value
    expect(heatmapColor(50, 0, 100, '#fff')).toMatch(HEX) // 3-digit shorthand base
    expect(heatmapColor(50, 0, 100, '#fff').toLowerCase()).not.toContain('nan')
  })
})

describe('Heatmap', () => {
  const rows = [
    { id: 'Intake', cells: [{ x: 'Mon', value: 12 }, { x: 'Tue', value: 7 }] },
    { id: 'Review', cells: [{ x: 'Mon', value: 5 }, { x: 'Tue', value: 9 }] },
  ]

  it('renders the title, row labels, column headers and cell values', () => {
    render(<Heatmap title="Backlog by day and stage" rows={rows} legend={false} />)
    expect(screen.getByText('Backlog by day and stage')).toBeInTheDocument()
    expect(screen.getByText('Intake')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Tue')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('shows the designed empty state with no rows', () => {
    render(<Heatmap title="Backlog" rows={[]} emptyMessage="No backlog data" />)
    expect(screen.getByText('No backlog data')).toBeInTheDocument()
  })

  it('shows the skeleton while loading', () => {
    render(<Heatmap title="Backlog" rows={[]} loading />)
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })
})
