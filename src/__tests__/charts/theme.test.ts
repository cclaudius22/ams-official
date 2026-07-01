import { describe, it, expect } from 'vitest'
import { CHART_PALETTE, seriesColor, statusColor, recommendationColor, visaTypeColor } from '@/components/charts/theme'
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

  it('visaTypeColor gives every registered type a stable, distinct colour and survives unknowns', () => {
    // same colour everywhere for the same type (the "skilled_worker is one colour" rule)
    expect(visaTypeColor('skilled_worker_visa')).toBe(visaTypeColor('skilled_worker_visa'))
    // every canonical registry key resolves to a hex colour...
    for (const v of VISA_TYPES) expect(visaTypeColor(v.key)).toMatch(HEX)
    // ...and the registered set is fully distinct (no two types share a colour)
    const colours = VISA_TYPES.map((v) => visaTypeColor(v.key))
    expect(new Set(colours).size).toBe(VISA_TYPES.length)
    // unknown key falls back deterministically without throwing
    expect(visaTypeColor('totally_unknown_visa')).toMatch(HEX)
    expect(visaTypeColor('totally_unknown_visa')).toBe(visaTypeColor('totally_unknown_visa'))
  })
})
