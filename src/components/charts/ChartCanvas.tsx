'use client'
/**
 * ChartCanvas — the state gate every chart passes through.
 *
 * loading → skeleton · empty → designed empty state · otherwise → the chart,
 * sized by a ResponsiveContainer at a consistent height. Centralising this is
 * what guarantees no chart in the estate ever shows a blank box or a bare spinner.
 */
import { type ReactElement } from 'react'
import { ResponsiveContainer } from 'recharts'
import { ChartEmpty, ChartSkeleton } from './ChartStates'
import { CHART_HEIGHT } from './tokens'

export interface ChartCanvasProps {
  loading?: boolean
  isEmpty?: boolean
  height?: number
  emptyMessage?: string
  emptyHint?: string
  children: ReactElement
}

export function ChartCanvas({
  loading,
  isEmpty,
  height = CHART_HEIGHT,
  emptyMessage,
  emptyHint,
  children,
}: ChartCanvasProps) {
  if (loading) return <ChartSkeleton height={height} />
  if (isEmpty) return <ChartEmpty height={height} message={emptyMessage} hint={emptyHint} />
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}
