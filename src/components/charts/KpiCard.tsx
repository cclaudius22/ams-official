/**
 * KpiCard — the unified KPI tile, on the one type scale.
 *
 * Replaces the two divergent KPI/stat cards. `tabular-nums` value, uppercase
 * micro-label, optional signed trend. Trend colour is sign-based by default;
 * pass `invertTrend` where down is good (backlog, processing time).
 */
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { TYPE } from './tokens'
import { formatCount, formatSignedPercent } from './format'

export interface KpiCardProps {
  title: string
  value: number | string
  unit?: string
  trend?: number
  /** When true, a falling trend is good (e.g. backlog ↓). Default: rising is good. */
  invertTrend?: boolean
  subtitle?: string
}

export function KpiCard({ title, value, unit, trend, invertTrend = false, subtitle }: KpiCardProps) {
  const display = typeof value === 'number' ? formatCount(value) : value
  const trendText =
    trend === undefined ? '' : Number.isInteger(trend) ? formatSignedPercent(trend, 0) : formatSignedPercent(trend, 1)

  const good = invertTrend ? (trend ?? 0) < 0 : (trend ?? 0) > 0
  const trendColour =
    trend === 0 || trend === undefined
      ? 'text-gray-400 dark:text-gray-500'
      : good
        ? 'text-emerald-600 dark:text-emerald-500'
        : 'text-red-600 dark:text-red-500'

  return (
    <Card className="border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <CardContent className="p-5">
        <div className={TYPE.kpiLabel}>{title}</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={TYPE.kpiValue}>{display}</span>
          {unit && <span className={TYPE.kpiUnit}>{unit}</span>}
          {trend !== undefined && (
            <span className={cn('ml-auto flex items-center gap-0.5 text-xs font-medium', trendColour)}>
              {trend > 0 && <ArrowUp className="h-3 w-3" aria-hidden />}
              {trend < 0 && <ArrowDown className="h-3 w-3" aria-hidden />}
              {trendText}
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}
