'use client'
/** Vertical stacked bar — composition across categories (e.g. queue vs active time per stage). */
import { type ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from './ChartCard'
import { ChartCanvas } from './ChartCanvas'
import { ChartTooltip } from './ChartTooltip'
import { AXIS, GRID } from './tokens'
import { seriesColor } from './theme'
import { type ChartDatum, type ChartSeries } from './_internal'

export interface StackedBarProps {
  data: ChartDatum[]
  series: ChartSeries[]
  indexKey?: string
  title?: ReactNode
  loading?: boolean
  legend?: boolean
  height?: number
  emptyMessage?: string
}

export function StackedBar({
  data,
  series,
  indexKey = 'name',
  title,
  loading,
  legend = true,
  height,
  emptyMessage,
}: StackedBarProps) {
  const isEmpty = !data || data.length === 0 || series.length === 0
  const last = series.length - 1
  return (
    <ChartCard title={title}>
      <ChartCanvas loading={loading} isEmpty={isEmpty} height={height} emptyMessage={emptyMessage}>
        <BarChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
          <CartesianGrid stroke={GRID.stroke} vertical={false} />
          <XAxis
            dataKey={indexKey}
            tick={{ fontSize: AXIS.tickFontSize, fill: AXIS.tickFill }}
            axisLine={AXIS.axisLine}
            tickLine={AXIS.tickLine}
          />
          <YAxis
            tick={{ fontSize: AXIS.tickFontSize, fill: AXIS.tickFill }}
            axisLine={AXIS.axisLine}
            tickLine={AXIS.tickLine}
          />
          <Tooltip cursor={{ fill: 'rgba(148,163,184,0.08)' }} content={<ChartTooltip />} />
          {legend && <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label ?? s.key}
              stackId="a"
              fill={s.color ?? seriesColor(i)}
              radius={i === last ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ChartCanvas>
    </ChartCard>
  )
}
