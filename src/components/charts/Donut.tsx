'use client'
/** Donut — composition at a glance (status / recommendation mix). */
import { type ReactNode } from 'react'
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts'
import { ChartCard } from './ChartCard'
import { ChartCanvas } from './ChartCanvas'
import { ChartTooltip } from './ChartTooltip'
import { resolveColor, type ChartDatum, type ColorResolver } from './_internal'

export interface DonutProps {
  data: ChartDatum[]
  nameKey?: string
  valueKey?: string
  title?: ReactNode
  loading?: boolean
  color?: ColorResolver<ChartDatum>
  valueFormatter?: (value: number | string) => string
  legend?: boolean
  height?: number
  emptyMessage?: string
}

export function Donut({
  data,
  nameKey = 'name',
  valueKey = 'value',
  title,
  loading,
  color,
  valueFormatter,
  legend = true,
  height,
  emptyMessage,
}: DonutProps) {
  // Empty when there is nothing to draw OR every slice is zero.
  const isEmpty = !data || data.length === 0 || data.every((d) => Number(d[valueKey] ?? 0) === 0)
  return (
    <ChartCard title={title}>
      <ChartCanvas loading={loading} isEmpty={isEmpty} height={height} emptyMessage={emptyMessage}>
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius="62%"
            outerRadius="82%"
            paddingAngle={2}
            strokeWidth={0}
            isAnimationActive={false}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={resolveColor(color, entry, i)} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip valueFormatter={valueFormatter ? (v) => valueFormatter(v) : undefined} />} />
          {legend && (
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={9}
              wrapperStyle={{ fontSize: 12 }}
            />
          )}
        </PieChart>
      </ChartCanvas>
    </ChartCard>
  )
}
