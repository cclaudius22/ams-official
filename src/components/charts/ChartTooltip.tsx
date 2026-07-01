/**
 * ChartTooltip — the ONE custom tooltip for the entire chart estate.
 *
 * Recharts passes `{ active, payload, label }` into whatever element is given to
 * a chart's `content` prop; every chart in the layer uses this, so the default
 * Recharts tooltip (the biggest "templated" tell) never appears. Clean type,
 * hairline border, soft shadow, colour dot + tabular value.
 */
import { TOOLTIP_SURFACE } from './tokens'
import { SEMANTIC_COLORS } from './theme'
import { formatCount } from './format'

export interface ChartTooltipItem {
  name?: string
  value?: number | string
  color?: string
  unit?: string
  dataKey?: string | number
  payload?: Record<string, unknown> & { fill?: string }
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: ChartTooltipItem[]
  label?: string | number
  /** Override how each value renders (e.g. percentages). Default groups thousands. */
  valueFormatter?: (value: number | string, item: ChartTooltipItem) => string
  /** Override how the header label renders. */
  labelFormatter?: (label: string | number) => string
}

function renderValue(
  value: number | string,
  item: ChartTooltipItem,
  valueFormatter?: ChartTooltipProps['valueFormatter'],
): string {
  if (valueFormatter) return valueFormatter(value, item)
  return typeof value === 'number' ? formatCount(value) : String(value)
}

export function ChartTooltip({ active, payload, label, valueFormatter, labelFormatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const hasLabel = label !== undefined && label !== ''

  return (
    <div
      className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-slate-700"
      style={{
        borderRadius: TOOLTIP_SURFACE.radius,
        boxShadow: TOOLTIP_SURFACE.shadow,
        padding: '8px 10px',
        minWidth: 124,
      }}
    >
      {hasLabel && (
        <div className="mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, i) => {
          const swatch = item.color ?? item.payload?.fill ?? SEMANTIC_COLORS.neutral
          const value = item.value ?? ''
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: swatch }}
                aria-hidden
              />
              {item.name !== undefined && (
                <span className="text-gray-500 dark:text-gray-400">{item.name}</span>
              )}
              <span className="ml-auto font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                {renderValue(value, item, valueFormatter)}
                {item.unit ?? ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
