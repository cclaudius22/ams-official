'use client'
/** Horizontal bar — categories down the left, values across. The estate's workhorse. */
import { type ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from './ChartCard'
import { ChartCanvas } from './ChartCanvas'
import { ChartTooltip } from './ChartTooltip'
import { AXIS, GRID } from './tokens'
import { resolveColor, type ChartDatum, type ColorResolver } from './_internal'

export interface HBarProps {
  data: ChartDatum[]
  indexKey?: string
  valueKey?: string
  title?: ReactNode
  loading?: boolean
  color?: ColorResolver<ChartDatum>
  valueFormatter?: (value: number | string) => string
  height?: number
  emptyMessage?: string
  /** Width reserved for the category labels. */
  labelWidth?: number
}

export function HBar({
  data,
  indexKey = 'name',
  valueKey = 'value',
  title,
  loading,
  color,
  valueFormatter,
  height,
  emptyMessage,
  labelWidth = 96,
}: HBarProps) {
  const isEmpty = !data || data.length === 0
  return (
    <ChartCard title={title}>
      <ChartCanvas loading={loading} isEmpty={isEmpty} height={height} emptyMessage={emptyMessage}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid stroke={GRID.stroke} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: AXIS.tickFontSize, fill: AXIS.tickFill }}
            axisLine={AXIS.axisLine}
            tickLine={AXIS.tickLine}
          />
          <YAxis
            type="category"
            dataKey={indexKey}
            width={labelWidth}
            tick={{ fontSize: AXIS.tickFontSize, fill: AXIS.tickFill }}
            axisLine={AXIS.axisLine}
            tickLine={AXIS.tickLine}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148,163,184,0.08)' }}
            content={<ChartTooltip valueFormatter={valueFormatter ? (v) => valueFormatter(v) : undefined} />}
          />
          <Bar dataKey={valueKey} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {data.map((entry, i) => (
              <Cell key={i} fill={resolveColor(color, entry, i)} />
            ))}
          </Bar>
        </BarChart>
      </ChartCanvas>
    </ChartCard>
  )
}
