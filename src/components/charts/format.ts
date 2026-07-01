/**
 * Chart value formatters — pure, locale-stable.
 *
 * Centralises the ad-hoc `${value}%` / sign / thousands formatting that was
 * inlined across chart components, so number presentation is consistent.
 */

/** `95` → `'95%'`; `formatPercent(94.8, 1)` → `'94.8%'`. Value is already a percentage (0–100). */
export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`
}

/** `1234` → `'1,234'`. Forces en-US grouping so output is deterministic across environments. */
export function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}

/** Trend with an explicit sign: `5` → `'+5%'`, `-12` → `'-12%'`, `0` → `'0%'`. */
export function formatSignedPercent(value: number, digits = 0): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}
