import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChartTooltip } from '@/components/charts/ChartTooltip'

describe('ChartTooltip — the single custom tooltip', () => {
  it('renders nothing when inactive or when the payload is empty', () => {
    const { container, rerender } = render(
      <ChartTooltip active={false} payload={[{ name: 'A', value: 1 }]} />,
    )
    expect(container).toBeEmptyDOMElement()
    rerender(<ChartTooltip active payload={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the label and one row per series with name + value', () => {
    render(
      <ChartTooltip
        active
        label="Skilled Worker"
        payload={[
          { name: 'Approved', value: 612, color: '#10b981' },
          { name: 'Rejected', value: 248, color: '#ef4444' },
        ]}
      />,
    )
    expect(screen.getByText('Skilled Worker')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('612')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()
    expect(screen.getByText('248')).toBeInTheDocument()
  })

  it('groups thousands by default and honours a value formatter', () => {
    const { rerender } = render(
      <ChartTooltip active label="Volume" payload={[{ name: 'Received', value: 1234, color: '#6366f1' }]} />,
    )
    expect(screen.getByText('1,234')).toBeInTheDocument()

    rerender(
      <ChartTooltip
        active
        label="SLA"
        payload={[{ name: 'Within SLA', value: 95, color: '#3b82f6' }]}
        valueFormatter={(v) => `${v}%`}
      />,
    )
    expect(screen.getByText('95%')).toBeInTheDocument()
  })
})
