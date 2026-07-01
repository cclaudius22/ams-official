import { describe, it, expect } from 'vitest'
import { formatPercent, formatCount, formatSignedPercent } from '@/components/charts/format'

describe('chart formatters', () => {
  it('formatPercent appends % with configurable precision', () => {
    expect(formatPercent(95)).toBe('95%')
    expect(formatPercent(94.8, 1)).toBe('94.8%')
    expect(formatPercent(0)).toBe('0%')
  })

  it('formatCount groups thousands with a stable locale', () => {
    expect(formatCount(42)).toBe('42')
    expect(formatCount(1234)).toBe('1,234')
    expect(formatCount(1000000)).toBe('1,000,000')
  })

  it('formatSignedPercent shows an explicit + for gains and keeps the - for losses', () => {
    expect(formatSignedPercent(5)).toBe('+5%')
    expect(formatSignedPercent(-12)).toBe('-12%')
    expect(formatSignedPercent(0)).toBe('0%')
    expect(formatSignedPercent(1.2, 1)).toBe('+1.2%')
  })
})
