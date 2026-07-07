/**
 * Display-only country name formatting (Task 4f).
 *
 * Product-owner decision: officers shouldn't have to decode ISO codes —
 * rows and filter labels in the live queue show "Pakistan", not "PK". This
 * util is purely presentational; it never touches the underlying data
 * (`LiveApplication.country` etc. stay raw codes end-to-end).
 *
 * Uses the browser/Node-native `Intl.DisplayNames` API. The instance is
 * built once at module load (constructing it repeatedly per-render/per-row
 * is unnecessary overhead) and reused for every call.
 *
 * NOTE: `Intl.DisplayNames` with `type: 'region'` only resolves ISO 3166-1
 * alpha-2 codes (and UN M49 numeric codes) — it does NOT support alpha-3
 * ("GBR" throws a RangeError). If/when this corpus moves to alpha-3 canon
 * (see src/lib/nationality.ts, which already speaks alpha-3), this util
 * will need an alpha-3 -> alpha-2 mapping step before calling `.of()`.
 * Until then, alpha-3 input gracefully degrades to showing the raw code
 * unchanged rather than crashing the row render.
 */

const regionDisplayNames = new Intl.DisplayNames(['en'], { type: 'region' })

/**
 * Convert an ISO 3166-1 alpha-2 country code to its English display name.
 *
 * Anything unresolvable — an empty string, the `'Unknown'` sentinel, an
 * alpha-3 code, or plain garbage — is returned unchanged rather than
 * throwing, so callers can render the result directly without a fallback.
 */
export function formatCountry(code: string): string {
  if (!code) return code

  try {
    // Intl.DisplayNames#of throws a RangeError on malformed/unsupported
    // input (e.g. alpha-3 codes, the "Unknown" sentinel, empty string).
    const name = regionDisplayNames.of(code)
    return name ?? code
  } catch {
    return code
  }
}
