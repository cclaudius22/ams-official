/** Shared internals for chart wrappers (not part of the public barrel). */
import { seriesColor } from './theme'

/** A colour can be a fixed string, a per-datum resolver, or omitted (palette by index). */
export type ColorResolver<T> = string | ((entry: T, index: number) => string)

export function resolveColor<T>(color: ColorResolver<T> | undefined, entry: T, index: number): string {
  if (typeof color === 'function') return color(entry, index)
  if (typeof color === 'string') return color
  return seriesColor(index)
}

/** A named series within a multi-series chart (area / stacked bar). */
export interface ChartSeries {
  key: string
  label?: string
  color?: string
}

export type ChartDatum = Record<string, string | number | boolean | undefined>
