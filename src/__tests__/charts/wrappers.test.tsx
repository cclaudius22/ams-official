import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { cloneElement, isValidElement, type ReactElement } from 'react'

// Recharts' ResponsiveContainer measures via ResizeObserver (mocked to 0 in happy-dom),
// so charts never get dimensions. Shim it to inject a fixed size — the wrappers' own
// logic (state gate, colour, series) is what's under test, not Recharts' measurement.
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>()
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactElement }) =>
      isValidElement(children) ? cloneElement(children, { width: 600, height: 300 } as never) : children,
  }
})

import { ChartCard } from '@/components/charts/ChartCard'
import { ChartCanvas } from '@/components/charts/ChartCanvas'
import { HBar } from '@/components/charts/HBar'
import { Donut } from '@/components/charts/Donut'
import { StackedBar } from '@/components/charts/StackedBar'
import { AreaTrend } from '@/components/charts/AreaTrend'
import { LineWithTarget } from '@/components/charts/LineWithTarget'
import { visaTypeColor } from '@/components/charts/theme'

const dist = [
  { name: 'Skilled Worker', value: 612, visaTypeId: 'skilled_worker_visa' },
  { name: 'Student', value: 240, visaTypeId: 'student_visa' },
]

describe('ChartCard', () => {
  it('renders its title and children', () => {
    render(
      <ChartCard title="SLA Attainment">
        <div>chart-body</div>
      </ChartCard>,
    )
    expect(screen.getByText('SLA Attainment')).toBeInTheDocument()
    expect(screen.getByText('chart-body')).toBeInTheDocument()
  })
})

describe('ChartCanvas — the state gate', () => {
  it('shows the skeleton while loading and hides the chart', () => {
    render(
      <ChartCanvas loading>
        <span data-testid="chart-child" />
      </ChartCanvas>,
    )
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
    expect(screen.queryByTestId('chart-child')).toBeNull()
  })

  it('shows a designed empty state when empty', () => {
    render(
      <ChartCanvas isEmpty emptyMessage="Nothing here yet">
        <span data-testid="chart-child" />
      </ChartCanvas>,
    )
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
    expect(screen.queryByTestId('chart-child')).toBeNull()
  })

  it('renders the chart child otherwise', () => {
    render(
      <ChartCanvas>
        <span data-testid="chart-child" />
      </ChartCanvas>,
    )
    expect(screen.getByTestId('chart-child')).toBeInTheDocument()
  })
})

describe('chart wrappers', () => {
  it('HBar: loading → skeleton, empty → designed message, data → chart', () => {
    const { rerender, container } = render(<HBar title="Applications by Visa Type" data={[]} loading />)
    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()

    rerender(<HBar title="Applications by Visa Type" data={[]} emptyMessage="No applications in this range" />)
    expect(screen.getByText('No applications in this range')).toBeInTheDocument()

    rerender(
      <HBar title="Applications by Visa Type" data={dist} color={(d) => visaTypeColor(String(d.visaTypeId))} />,
    )
    expect(screen.queryByText('No applications in this range')).toBeNull()
    expect(screen.queryByRole('status')).toBeNull()
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('Donut renders with data and shows an empty state for all-zero data', () => {
    const { rerender, container } = render(<Donut title="Status" data={dist} />)
    expect(container.querySelector('svg')).not.toBeNull()

    rerender(<Donut title="Status" data={[{ name: 'A', value: 0 }]} emptyMessage="No records" />)
    expect(screen.getByText('No records')).toBeInTheDocument()
  })

  it('StackedBar renders multiple series with data', () => {
    const series = [
      { key: 'queueTime', label: 'Queue' },
      { key: 'activeTime', label: 'Active' },
    ]
    const data = [
      { name: 'Intake', queueTime: 2, activeTime: 1 },
      { name: 'Review', queueTime: 3, activeTime: 2 },
    ]
    const { container } = render(<StackedBar title="Queue vs Active" data={data} series={series} />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('AreaTrend renders stacked series with gradients', () => {
    const series = [
      { key: 'received', label: 'Received' },
      { key: 'approved', label: 'Approved' },
    ]
    const data = [
      { name: '9AM', received: 10, approved: 6 },
      { name: '10AM', received: 14, approved: 9 },
    ]
    const { container } = render(<AreaTrend title="Today" data={data} series={series} stacked />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('LineWithTarget renders a series and a target reference', () => {
    const data = [
      { name: '00:00', within: 95 },
      { name: '04:00', within: 97 },
    ]
    const { container } = render(
      <LineWithTarget title="SLA 24h" data={data} valueKey="within" valueLabel="% Within SLA" target={95} />,
    )
    expect(container.querySelector('svg')).not.toBeNull()
  })
})
