'use client'
/** Area trend over time — one or more series with soft gradient fills. */
import { type ReactNode } from 'react'
import { Area, AreaChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from './ChartCard'
import { ChartCanvas } from './ChartCanvas'
import { ChartTooltip } from './ChartTooltip'
import { AXIS, GRID } from './tokens'
import { seriesColor } from './theme'
import { type ChartDatum, type ChartSeries } from './_internal'

export interface AreaTrendProps {
  data: ChartDatum[]
  series: ChartSeries[]
  xKey?: string
  stacked?: boolean
  title?: ReactNode
  loading?: boolean
  legend?: boolean
  height?: number
  emptyMessage?: string
}

export function AreaTrend({
  data,
  series,
  xKey = 'name',
  stacked = false,
  title,
  loading,
  legend = true,
  height,
  emptyMessage,
}: AreaTrendProps) {
  const isEmpty = !data || data.length === 0
  const gradId = (key: string) => `area-grad-${key}`
  return (
    <ChartCard title={title}>
      <ChartCanvas loading={loading} isEmpty={isEmpty} height={height} emptyMessage={emptyMessage}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <defs>
            {series.map((s, i) => {
              const c = s.color ?? seriesColor(i)
              return (
                <linearGradient key={s.key} id={gradId(s.key)} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              )
            })}
          </defs>
          <CartesianGrid stroke={GRID.stroke} vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: AXIS.tickFontSize, fill: AXIS.tickFill }}
            axisLine={AXIS.axisLine}
            tickLine={AXIS.tickLine}
          />
          <YAxis
            tick={{ fontSize: AXIS.tickFontSize, fill: AXIS.tickFill }}
            axisLine={AXIS.axisLine}
            tickLine={AXIS.tickLine}
          />
          <Tooltip content={<ChartTooltip />} />
          {legend && <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s, i) => {
            const c = s.color ?? seriesColor(i)
            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label ?? s.key}
                stackId={stacked ? '1' : undefined}
                stroke={c}
                strokeWidth={2}
                fill={`url(#${gradId(s.key)})`}
                isAnimationActive={false}
              />
            )
          })}
        </AreaChart>
      </ChartCanvas>
    </ChartCard>
  )
}
