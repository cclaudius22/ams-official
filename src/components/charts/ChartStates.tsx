/**
 * ChartStates — designed empty + loading states.
 *
 * What separates production-grade from demo: never a blank box or a bare spinner.
 * `ChartEmpty` is an invitation to act, in the interface's voice; `ChartSkeleton`
 * is a shimmer that mimics the chart's shape.
 */
import { type ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { CHART_HEIGHT } from './tokens'

export interface ChartEmptyProps {
  message?: string
  hint?: string
  icon?: ReactNode
  height?: number
}

export function ChartEmpty({
  message = 'No data in this range',
  hint,
  icon,
  height = CHART_HEIGHT,
}: ChartEmptyProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1.5 text-center"
      style={{ height }}
    >
      <div className="text-gray-300 dark:text-gray-600" aria-hidden>
        {icon ?? <Inbox className="h-7 w-7" strokeWidth={1.5} />}
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{message}</p>
      {hint && <p className="text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  )
}

export interface ChartSkeletonProps {
  height?: number
  bars?: number
}

// Deterministic bar heights (no Math.random in render → stable across re-renders/tests).
const SKELETON_PATTERN = [0.5, 0.82, 0.45, 0.95, 0.6, 0.74, 0.4]

export function ChartSkeleton({ height = CHART_HEIGHT, bars = 7 }: ChartSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading chart"
      className="flex items-end gap-2 motion-safe:animate-pulse"
      style={{ height }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md bg-gray-200 dark:bg-gray-700"
          style={{ height: `${SKELETON_PATTERN[i % SKELETON_PATTERN.length] * 100}%` }}
        />
      ))}
      <span className="sr-only">Loading chart…</span>
    </div>
  )
}
