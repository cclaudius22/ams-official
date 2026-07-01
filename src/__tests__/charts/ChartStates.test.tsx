import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChartEmpty, ChartSkeleton } from '@/components/charts/ChartStates'

describe('ChartStates', () => {
  it('ChartEmpty shows a plain-language default message, overridable per chart', () => {
    const { rerender } = render(<ChartEmpty />)
    expect(screen.getByText('No data in this range')).toBeInTheDocument()

    rerender(<ChartEmpty message="No applications in this range" />)
    expect(screen.getByText('No applications in this range')).toBeInTheDocument()
  })

  it('ChartEmpty can show a secondary hint', () => {
    render(<ChartEmpty message="No applications in this range" hint="Try widening the date range." />)
    expect(screen.getByText('Try widening the date range.')).toBeInTheDocument()
  })

  it('ChartSkeleton renders an accessible loading status (not a bare spinner)', () => {
    render(<ChartSkeleton />)
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })
})
