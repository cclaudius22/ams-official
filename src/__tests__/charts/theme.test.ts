import { describe, it, expect } from 'vitest'
import {
  CHART_PALETTE,
  CHART_INK,
  INK_RAMP,
  inkStep,
  seriesColor,
  statusColor,
  recommendationColor,
  visaTypeColor,
  SEMANTIC_COLORS,
} from '@/components/charts/theme'
import { VISA_TYPES } from '@/api-contracts/queue-contract'

const HEX = /^#[0-9a-fA-F]{6}$/

describe('chart theme', () => {
  it('exposes a categorical palette of >=6 hex colours', () => {
    expect(CHART_PALETTE.length).toBeGreaterThanOrEqual(6)
    for (const c of CHART_PALETTE) expect(c).toMatch(HEX)
  })

  it('seriesColor cycles through the palette by index, wrapping and deterministic', () => {
    expect(seriesColor(0)).toBe(CHART_PALETTE[0])
    expect(seriesColor(1)).toBe(CHART_PALETTE[1])
    expect(seriesColor(CHART_PALETTE.length)).toBe(CHART_PALETTE[0]) // wraps
    expect(seriesColor(-1)).toMatch(HEX) // negative never throws
    expect(seriesColor(2)).toBe(seriesColor(2)) // stable
  })

  it('recommendationColor maps each canonical outcome to a distinct semantic colour', () => {
    const approve = recommendationColor('RECOMMEND_APPROVE')
    const reject = recommendationColor('RECOMMEND_REJECT')
    const manual = recommendationColor('MANUAL_REVIEW')
    expect([approve, reject, manual].every((c) => HEX.test(c))).toBe(true)
    expect(new Set([approve, reject, manual]).size).toBe(3)
  })

  it('statusColor returns a colour for known queue statuses and a safe fallback otherwise', () => {
    expect(statusColor('In Progress')).toMatch(HEX)
    expect(statusColor('Decided')).toMatch(HEX)
    expect(statusColor('Awaiting Allocation')).toMatch(HEX)
    expect(statusColor('a-status-we-have-never-seen')).toMatch(HEX) // fallback, no throw
  })

  it('visaTypeColor renders EVERY visa type in the single chart ink (quiet-estate rule)', () => {
    // Chris, 3 Jul: visa types are all one colour — identity comes from labels, not hue.
    for (const v of VISA_TYPES) expect(visaTypeColor(v.key)).toBe(CHART_INK)
    // unknown keys get the same ink; nothing throws, nothing rainbows
    expect(visaTypeColor('totally_unknown_visa')).toBe(CHART_INK)
  })

  it('anchors the chart ink on the deep ink blue as slot 1', () => {
    // Chris, 3 Jul (after seeing indigo and blue live): the deep ink blue is the estate ink.
    expect(CHART_INK).toBe('#2d5a9e')
    expect(CHART_PALETTE[0]).toBe(CHART_INK)
  })

  it('uses the muted validated semantic set (no Tailwind-500 primaries)', () => {
    expect(SEMANTIC_COLORS.positive).toBe('#1f5f40')
    expect(SEMANTIC_COLORS.negative).toBe('#7f2422')
    expect(SEMANTIC_COLORS.warning).toBe('#d47a16')
    expect(SEMANTIC_COLORS.info).toBe('#6b93c4')
    expect(SEMANTIC_COLORS.neutral).toBe('#94a3b8')
  })

  it('inkStep spreads n ordinal categories across the validated ink ramp, dark-first', () => {
    expect(INK_RAMP).toHaveLength(5)
    for (const c of INK_RAMP) expect(c).toMatch(HEX)
    // first category gets the darkest step, last the lightest
    expect(inkStep(0, 5)).toBe(INK_RAMP[4])
    expect(inkStep(4, 5)).toBe(INK_RAMP[0])
    // two categories span the full ramp
    expect(inkStep(0, 2)).toBe(INK_RAMP[4])
    expect(inkStep(1, 2)).toBe(INK_RAMP[0])
    // out-of-range indices clamp instead of throwing
    expect(inkStep(99, 5)).toBe(INK_RAMP[0])
    expect(inkStep(-1, 5)).toBe(INK_RAMP[4])
  })
})
