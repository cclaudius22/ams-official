/**
 * MetricCard — the unified summary tile (icon chip + label + value).
 *
 * Replaces the bespoke summary card on the queue board, on the same type scale
 * and `tabular-nums` as `KpiCard`.
 */
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TYPE } from './tokens'
import { formatCount } from './format'

export interface MetricCardProps {
  label: string
  value: number | string
  icon: ReactNode
  /** Tailwind background class for the icon chip, e.g. 'bg-indigo-500'. */
  accentClassName?: string
}

export function MetricCard({ label, value, icon, accentClassName = 'bg-indigo-500' }: MetricCardProps) {
  const display = typeof value === 'number' ? formatCount(value) : value
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className={cn('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white', accentClassName)}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className={TYPE.kpiLabel}>{label}</div>
        <div className="text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-100">{display}</div>
      </div>
    </div>
  )
}
