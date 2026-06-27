import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from '@/components/charts/KpiCard'
import { MetricCard } from '@/components/charts/MetricCard'

describe('KpiCard', () => {
  it('renders title, formatted value, unit and a signed trend', () => {
    render(<KpiCard title="SLA Performance" value={94.8} unit="%" trend={1.2} />)
    expect(screen.getByText('SLA Performance')).toBeInTheDocument()
    expect(screen.getByText('94.8')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
    expect(screen.getByText('+1.2%')).toBeInTheDocument()
  })

  it('groups thousands in the value and colours a falling trend as a loss', () => {
    render(<KpiCard title="Current Backlog" value={1283} trend={-12} />)
    expect(screen.getByText('1,283')).toBeInTheDocument()
    const trend = screen.getByText('-12%')
    expect(trend.className).toMatch(/red/)
  })
})

describe('MetricCard', () => {
  it('renders label, grouped value and the icon', () => {
    render(<MetricCard label="Total Applications" value={1234} icon={<span data-testid="metric-icon" />} />)
    expect(screen.getByText('Total Applications')).toBeInTheDocument()
    expect(screen.getByText('1,234')).toBeInTheDocument()
    expect(screen.getByTestId('metric-icon')).toBeInTheDocument()
  })
})
