'use client'
/** Single line over time with an optional dashed target reference (e.g. SLA vs 95%). */
import { type ReactNode } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from './ChartCard'
import { ChartCanvas } from './ChartCanvas'
import { ChartTooltip } from './ChartTooltip'
import { AXIS, GRID } from './tokens'
import { SEMANTIC_COLORS } from './theme'
import { type ChartDatum } from './_internal'

export interface LineWithTargetProps {
  data: ChartDatum[]
  xKey?: string
  valueKey?: string
  valueLabel?: string
  color?: string
  target?: number
  targetLabel?: string
  title?: ReactNode
  loading?: boolean
  valueFormatter?: (value: number | string) => string
  yDomain?: [number | 'auto', number | 'auto']
  height?: number
  emptyMessage?: string
}

export function LineWithTarget({
  data,
  xKey = 'name',
  valueKey = 'value',
  valueLabel = 'Value',
  color = SEMANTIC_COLORS.info,
  target,
  targetLabel,
  title,
  loading,
  valueFormatter,
  yDomain = ['auto', 'auto'],
  height,
  emptyMessage,
}: LineWithTargetProps) {
  const isEmpty = !data || data.length === 0
  return (
    <ChartCard title={title}>
      <ChartCanvas loading={loading} isEmpty={isEmpty} height={height} emptyMessage={emptyMessage}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid stroke={GRID.stroke} vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: AXIS.tickFontSize, fill: AXIS.tickFill }}
            axisLine={AXIS.axisLine}
            tickLine={AXIS.tickLine}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: AXIS.tickFontSize, fill: AXIS.tickFill }}
            axisLine={AXIS.axisLine}
            tickLine={AXIS.tickLine}
          />
          <Tooltip content={<ChartTooltip valueFormatter={valueFormatter ? (v) => valueFormatter(v) : undefined} />} />
          {target !== undefined && (
            <ReferenceLine
              y={target}
              stroke={SEMANTIC_COLORS.warning}
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={
                targetLabel
                  ? { value: targetLabel, position: 'insideTopRight', fontSize: 11, fill: AXIS.tickFill }
                  : undefined
              }
            />
          )}
          <Line
            type="monotone"
            dataKey={valueKey}
            name={valueLabel}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartCanvas>
    </ChartCard>
  )
}
