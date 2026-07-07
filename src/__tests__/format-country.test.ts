import { describe, it, expect } from 'vitest'
import { formatCountry } from '@/lib/formatCountry'

// Task 4f — officers shouldn't decode ISO codes; rows and filter labels show
// "Pakistan", not "PK". formatCountry() is the display-only conversion layer
// (data stays raw codes — see src/lib/formatCountry.ts and livequeue/page.tsx).
describe('formatCountry', () => {
  it('resolves a valid ISO 3166-1 alpha-2 code to its English name', () => {
    expect(formatCountry('PK')).toBe('Pakistan')
    expect(formatCountry('IN')).toBe('India')
    expect(formatCountry('GB')).toBe('United Kingdom')
  })

  it('passes through alpha-3 codes unchanged (Intl.DisplayNames region type does not support alpha-3)', () => {
    expect(formatCountry('GBR')).toBe('GBR')
  })

  it('passes through the "Unknown" sentinel unchanged', () => {
    expect(formatCountry('Unknown')).toBe('Unknown')
  })

  it('passes through an empty string unchanged', () => {
    expect(formatCountry('')).toBe('')
  })

  it('pins the actual Intl.DisplayNames behavior for "ZZ" (valid-but-unassigned region code)', () => {
    // "ZZ" is syntactically a valid ISO region code but has no assigned
    // country — CLDR resolves it to "Unknown Region" rather than throwing.
    expect(formatCountry('ZZ')).toBe('Unknown Region')
  })

  it('passes through garbage input unchanged (malformed region subtag throws RangeError)', () => {
    expect(formatCountry('!!')).toBe('!!')
  })
})
