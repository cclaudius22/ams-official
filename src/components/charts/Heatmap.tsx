'use client'
/**
 * Heatmap — custom CSS-grid heatmap. Retires the last Nivo dependency.
 *
 * No charting lib: a grid of coloured cells on a sequential light→brand scale.
 * Lighter and faster than a charting-lib heatmap, fully on-grammar (ChartCard frame,
 * tokens, designed empty/loading states). Cell values are shown in-cell, so no
 * floating tooltip is needed.
 */
import { Fragment, type ReactNode } from 'react'
import { ChartCard } from './ChartCard'
import { ChartEmpty, ChartSkeleton } from './ChartStates'
import { CHART_HEIGHT } from './tokens'
import { formatCount } from './format'

const SCALE_START = { r: 241, g: 245, b: 249 } // slate-100 — the low end of the ramp

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function toHex(n: number): string {
  return Math.round(n).toString(16).padStart(2, '0')
}

/** Sequential cell colour: light slate at `min`, the brand `base` hue at `max`. */
export function heatmapColor(value: number, min: number, max: number, base = '#6366f1'): string {
  const t = max <= min ? 0 : clamp01((value - min) / (max - min))
  const b = hexToRgb(base)
  const r = SCALE_START.r + (b.r - SCALE_START.r) * t
  const g = SCALE_START.g + (b.g - SCALE_START.g) * t
  const bl = SCALE_START.b + (b.b - SCALE_START.b) * t
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`
}

export interface HeatmapCell {
  x: string
  value: number
}
export interface HeatmapRow {
  id: string
  cells: HeatmapCell[]
}
export interface HeatmapProps {
  rows: HeatmapRow[]
  title?: ReactNode
  loading?: boolean
  /** Brand hue for the high end of the ramp. Defaults to the skilled-worker indigo. */
  base?: string
  min?: number
  max?: number
  valueFormatter?: (value: number) => string
  emptyMessage?: string
  height?: number
  legend?: boolean
}

export function Heatmap({
  rows,
  title,
  loading,
  base = '#6366f1',
  min,
  max,
  valueFormatter = (v) => formatCount(v),
  emptyMessage,
  height = CHART_HEIGHT,
  legend = true,
}: HeatmapProps) {
  let body: ReactNode

  if (loading) {
    body = <ChartSkeleton height={height} />
  } else if (!rows || rows.length === 0) {
    body = <ChartEmpty height={height} message={emptyMessage} />
  } else {
    const columns: string[] = []
    for (const row of rows) for (const c of row.cells) if (!columns.includes(c.x)) columns.push(c.x)
    const values = rows.flatMap((r) => r.cells.map((c) => c.value))
    const lo = min ?? 0
    const hi = max ?? (values.length ? Math.max(...values) : 0)

    body = (
      <div style={{ height }} className="flex flex-col">
        <div
          className="grid flex-1 gap-1"
          style={{
            gridTemplateColumns: `minmax(76px, auto) repeat(${columns.length}, minmax(0, 1fr))`,
            gridTemplateRows: `auto repeat(${rows.length}, minmax(0, 1fr))`,
          }}
        >
          <div />
          {columns.map((c) => (
            <div
              key={c}
              className="flex items-center justify-center pb-1 text-[11px] font-medium text-gray-400 dark:text-gray-500"
            >
              {c}
            </div>
          ))}
          {rows.map((row) => (
            <Fragment key={row.id}>
              <div className="flex items-center pr-2 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                {row.id}
              </div>
              {columns.map((col) => {
                const cell = row.cells.find((c) => c.x === col)
                const v = cell?.value ?? 0
                const t = hi <= lo ? 0 : (v - lo) / (hi - lo)
                return (
                  <div
                    key={col}
                    title={`${row.id} · ${col}: ${valueFormatter(v)}`}
                    className="flex items-center justify-center rounded-md text-xs tabular-nums"
                    style={{ backgroundColor: heatmapColor(v, lo, hi, base), color: t > 0.55 ? '#fff' : '#475569' }}
                  >
                    {cell ? valueFormatter(v) : ''}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>

        {legend && (
          <div className="mt-3 flex items-center justify-end gap-2 text-[11px] text-gray-400 dark:text-gray-500">
            <span>{valueFormatter(lo)}</span>
            <span
              className="h-2 w-24 rounded-full"
              style={{
                background: `linear-gradient(to right, ${heatmapColor(lo, lo, hi, base)}, ${heatmapColor(hi, lo, hi, base)})`,
              }}
            />
            <span>{valueFormatter(hi)}</span>
          </div>
        )}
      </div>
    )
  }

  return <ChartCard title={title}>{body}</ChartCard>
}
