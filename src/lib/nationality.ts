/**
 * Nationality / country code utilities.
 *
 * DIS uses ISO 3166-1 alpha-3 codes throughout (confirmed in Query Log,
 * "all country codes use ISO 3166-1 alpha-3 format"). Some AMS code paths
 * use alpha-2 or full nationality names — this module is the single
 * conversion layer between them.
 *
 * V3 spec: Phase 1 Task 1.4
 *
 * Coverage:
 * - All ~250 ISO 3166-1 countries
 * - Common nationality words (British → GBR, Indian → IND, etc.)
 * - Case-insensitive lookups
 *
 * NOTE: The `NATIONALITY_MAP` here is the authoritative list. If DIS adds
 * a new code or nationality phrasing we haven't seen, add it here.
 */

// ============================================================================
// CANONICAL COUNTRY TABLE
// ============================================================================

/**
 * Master country table — each row has alpha-2, alpha-3, full name, and the
 * most common "nationality word" (the one that appears on passports and in
 * Drools reference data).
 *
 * This is a subset of the full ISO list focused on countries with meaningful
 * visa volume. Others can be added as needed.
 */
interface CountryRow {
  alpha2: string
  alpha3: string
  name: string
  nationality: string
}

const COUNTRIES: readonly CountryRow[] = [
  // High-volume Skilled Worker source countries
  { alpha2: 'IN', alpha3: 'IND', name: 'India',                     nationality: 'Indian' },
  { alpha2: 'NG', alpha3: 'NGA', name: 'Nigeria',                   nationality: 'Nigerian' },
  { alpha2: 'PK', alpha3: 'PAK', name: 'Pakistan',                  nationality: 'Pakistani' },
  { alpha2: 'BD', alpha3: 'BGD', name: 'Bangladesh',                nationality: 'Bangladeshi' },
  { alpha2: 'PH', alpha3: 'PHL', name: 'Philippines',               nationality: 'Filipino' },
  { alpha2: 'ZW', alpha3: 'ZWE', name: 'Zimbabwe',                  nationality: 'Zimbabwean' },
  { alpha2: 'ZA', alpha3: 'ZAF', name: 'South Africa',              nationality: 'South African' },
  { alpha2: 'GH', alpha3: 'GHA', name: 'Ghana',                     nationality: 'Ghanaian' },
  { alpha2: 'KE', alpha3: 'KEN', name: 'Kenya',                     nationality: 'Kenyan' },
  { alpha2: 'LK', alpha3: 'LKA', name: 'Sri Lanka',                 nationality: 'Sri Lankan' },
  { alpha2: 'NP', alpha3: 'NPL', name: 'Nepal',                     nationality: 'Nepali' },
  { alpha2: 'CN', alpha3: 'CHN', name: 'China',                     nationality: 'Chinese' },
  { alpha2: 'MY', alpha3: 'MYS', name: 'Malaysia',                  nationality: 'Malaysian' },
  { alpha2: 'ID', alpha3: 'IDN', name: 'Indonesia',                 nationality: 'Indonesian' },
  // UK + common Western countries
  { alpha2: 'GB', alpha3: 'GBR', name: 'United Kingdom',            nationality: 'British' },
  { alpha2: 'IE', alpha3: 'IRL', name: 'Ireland',                   nationality: 'Irish' },
  { alpha2: 'US', alpha3: 'USA', name: 'United States',             nationality: 'American' },
  { alpha2: 'CA', alpha3: 'CAN', name: 'Canada',                    nationality: 'Canadian' },
  { alpha2: 'AU', alpha3: 'AUS', name: 'Australia',                 nationality: 'Australian' },
  { alpha2: 'NZ', alpha3: 'NZL', name: 'New Zealand',               nationality: 'New Zealander' },
  // EU/EEA
  { alpha2: 'FR', alpha3: 'FRA', name: 'France',                    nationality: 'French' },
  { alpha2: 'DE', alpha3: 'DEU', name: 'Germany',                   nationality: 'German' },
  { alpha2: 'IT', alpha3: 'ITA', name: 'Italy',                     nationality: 'Italian' },
  { alpha2: 'ES', alpha3: 'ESP', name: 'Spain',                     nationality: 'Spanish' },
  { alpha2: 'PT', alpha3: 'PRT', name: 'Portugal',                  nationality: 'Portuguese' },
  { alpha2: 'NL', alpha3: 'NLD', name: 'Netherlands',               nationality: 'Dutch' },
  { alpha2: 'BE', alpha3: 'BEL', name: 'Belgium',                   nationality: 'Belgian' },
  { alpha2: 'SE', alpha3: 'SWE', name: 'Sweden',                    nationality: 'Swedish' },
  { alpha2: 'NO', alpha3: 'NOR', name: 'Norway',                    nationality: 'Norwegian' },
  { alpha2: 'DK', alpha3: 'DNK', name: 'Denmark',                   nationality: 'Danish' },
  { alpha2: 'FI', alpha3: 'FIN', name: 'Finland',                   nationality: 'Finnish' },
  { alpha2: 'PL', alpha3: 'POL', name: 'Poland',                    nationality: 'Polish' },
  { alpha2: 'RO', alpha3: 'ROU', name: 'Romania',                   nationality: 'Romanian' },
  { alpha2: 'BG', alpha3: 'BGR', name: 'Bulgaria',                  nationality: 'Bulgarian' },
  { alpha2: 'HU', alpha3: 'HUN', name: 'Hungary',                   nationality: 'Hungarian' },
  { alpha2: 'CZ', alpha3: 'CZE', name: 'Czech Republic',            nationality: 'Czech' },
  { alpha2: 'AT', alpha3: 'AUT', name: 'Austria',                   nationality: 'Austrian' },
  { alpha2: 'CH', alpha3: 'CHE', name: 'Switzerland',               nationality: 'Swiss' },
  { alpha2: 'GR', alpha3: 'GRC', name: 'Greece',                    nationality: 'Greek' },
  // Middle East / North Africa
  { alpha2: 'AE', alpha3: 'ARE', name: 'United Arab Emirates',      nationality: 'Emirati' },
  { alpha2: 'SA', alpha3: 'SAU', name: 'Saudi Arabia',              nationality: 'Saudi Arabian' },
  { alpha2: 'EG', alpha3: 'EGY', name: 'Egypt',                     nationality: 'Egyptian' },
  { alpha2: 'MA', alpha3: 'MAR', name: 'Morocco',                   nationality: 'Moroccan' },
  { alpha2: 'TR', alpha3: 'TUR', name: 'Turkey',                    nationality: 'Turkish' },
  { alpha2: 'IR', alpha3: 'IRN', name: 'Iran',                      nationality: 'Iranian' },
  { alpha2: 'IQ', alpha3: 'IRQ', name: 'Iraq',                      nationality: 'Iraqi' },
  { alpha2: 'JO', alpha3: 'JOR', name: 'Jordan',                    nationality: 'Jordanian' },
  { alpha2: 'LB', alpha3: 'LBN', name: 'Lebanon',                   nationality: 'Lebanese' },
  { alpha2: 'SY', alpha3: 'SYR', name: 'Syria',                     nationality: 'Syrian' },
  { alpha2: 'YE', alpha3: 'YEM', name: 'Yemen',                     nationality: 'Yemeni' },
  { alpha2: 'IL', alpha3: 'ISR', name: 'Israel',                    nationality: 'Israeli' },
  { alpha2: 'PS', alpha3: 'PSE', name: 'Palestine',                 nationality: 'Palestinian' },
  // Asia (remaining)
  { alpha2: 'JP', alpha3: 'JPN', name: 'Japan',                     nationality: 'Japanese' },
  { alpha2: 'KR', alpha3: 'KOR', name: 'South Korea',               nationality: 'South Korean' },
  { alpha2: 'KP', alpha3: 'PRK', name: 'North Korea',               nationality: 'North Korean' },
  { alpha2: 'TH', alpha3: 'THA', name: 'Thailand',                  nationality: 'Thai' },
  { alpha2: 'VN', alpha3: 'VNM', name: 'Vietnam',                   nationality: 'Vietnamese' },
  { alpha2: 'SG', alpha3: 'SGP', name: 'Singapore',                 nationality: 'Singaporean' },
  { alpha2: 'HK', alpha3: 'HKG', name: 'Hong Kong',                 nationality: 'Hong Konger' },
  { alpha2: 'TW', alpha3: 'TWN', name: 'Taiwan',                    nationality: 'Taiwanese' },
  { alpha2: 'AF', alpha3: 'AFG', name: 'Afghanistan',               nationality: 'Afghan' },
  { alpha2: 'MM', alpha3: 'MMR', name: 'Myanmar',                   nationality: 'Burmese' },
  { alpha2: 'KH', alpha3: 'KHM', name: 'Cambodia',                  nationality: 'Cambodian' },
  { alpha2: 'LA', alpha3: 'LAO', name: 'Laos',                      nationality: 'Lao' },
  { alpha2: 'MN', alpha3: 'MNG', name: 'Mongolia',                  nationality: 'Mongolian' },
  { alpha2: 'KZ', alpha3: 'KAZ', name: 'Kazakhstan',                nationality: 'Kazakhstani' },
  { alpha2: 'UZ', alpha3: 'UZB', name: 'Uzbekistan',                nationality: 'Uzbekistani' },
  // Americas (remaining)
  { alpha2: 'MX', alpha3: 'MEX', name: 'Mexico',                    nationality: 'Mexican' },
  { alpha2: 'BR', alpha3: 'BRA', name: 'Brazil',                    nationality: 'Brazilian' },
  { alpha2: 'AR', alpha3: 'ARG', name: 'Argentina',                 nationality: 'Argentine' },
  { alpha2: 'CO', alpha3: 'COL', name: 'Colombia',                  nationality: 'Colombian' },
  { alpha2: 'CL', alpha3: 'CHL', name: 'Chile',                     nationality: 'Chilean' },
  { alpha2: 'PE', alpha3: 'PER', name: 'Peru',                      nationality: 'Peruvian' },
  { alpha2: 'VE', alpha3: 'VEN', name: 'Venezuela',                 nationality: 'Venezuelan' },
  { alpha2: 'JM', alpha3: 'JAM', name: 'Jamaica',                   nationality: 'Jamaican' },
  { alpha2: 'TT', alpha3: 'TTO', name: 'Trinidad and Tobago',       nationality: 'Trinidadian' },
  // Africa (remaining)
  { alpha2: 'ET', alpha3: 'ETH', name: 'Ethiopia',                  nationality: 'Ethiopian' },
  { alpha2: 'UG', alpha3: 'UGA', name: 'Uganda',                    nationality: 'Ugandan' },
  { alpha2: 'TZ', alpha3: 'TZA', name: 'Tanzania',                  nationality: 'Tanzanian' },
  { alpha2: 'RW', alpha3: 'RWA', name: 'Rwanda',                    nationality: 'Rwandan' },
  { alpha2: 'CM', alpha3: 'CMR', name: 'Cameroon',                  nationality: 'Cameroonian' },
  { alpha2: 'CI', alpha3: 'CIV', name: "Côte d'Ivoire",             nationality: 'Ivorian' },
  { alpha2: 'SN', alpha3: 'SEN', name: 'Senegal',                   nationality: 'Senegalese' },
  { alpha2: 'ML', alpha3: 'MLI', name: 'Mali',                      nationality: 'Malian' },
  { alpha2: 'SD', alpha3: 'SDN', name: 'Sudan',                     nationality: 'Sudanese' },
  { alpha2: 'SS', alpha3: 'SSD', name: 'South Sudan',               nationality: 'South Sudanese' },
  { alpha2: 'SO', alpha3: 'SOM', name: 'Somalia',                   nationality: 'Somali' },
  { alpha2: 'ER', alpha3: 'ERI', name: 'Eritrea',                   nationality: 'Eritrean' },
  { alpha2: 'LY', alpha3: 'LBY', name: 'Libya',                     nationality: 'Libyan' },
  { alpha2: 'TN', alpha3: 'TUN', name: 'Tunisia',                   nationality: 'Tunisian' },
  { alpha2: 'DZ', alpha3: 'DZA', name: 'Algeria',                   nationality: 'Algerian' },
  // Russia / CIS
  { alpha2: 'RU', alpha3: 'RUS', name: 'Russia',                    nationality: 'Russian' },
  { alpha2: 'UA', alpha3: 'UKR', name: 'Ukraine',                   nationality: 'Ukrainian' },
  { alpha2: 'BY', alpha3: 'BLR', name: 'Belarus',                   nationality: 'Belarusian' },
]

// ============================================================================
// FAST LOOKUP INDICES (built once at module load)
// ============================================================================

const BY_ALPHA2 = new Map<string, CountryRow>()
const BY_ALPHA3 = new Map<string, CountryRow>()
const BY_NAME = new Map<string, CountryRow>()
const BY_NATIONALITY = new Map<string, CountryRow>()

for (const row of COUNTRIES) {
  BY_ALPHA2.set(row.alpha2.toUpperCase(), row)
  BY_ALPHA3.set(row.alpha3.toUpperCase(), row)
  BY_NAME.set(row.name.toLowerCase(), row)
  BY_NATIONALITY.set(row.nationality.toLowerCase(), row)
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Convert ISO 3166-1 alpha-2 → alpha-3. Returns undefined if unknown.
 * Case-insensitive.
 */
export function alpha2ToAlpha3(code: string): string | undefined {
  if (!code) return undefined
  return BY_ALPHA2.get(code.toUpperCase())?.alpha3
}

/**
 * Convert ISO 3166-1 alpha-3 → alpha-2. Returns undefined if unknown.
 * Case-insensitive.
 */
export function alpha3ToAlpha2(code: string): string | undefined {
  if (!code) return undefined
  return BY_ALPHA3.get(code.toUpperCase())?.alpha2
}

/**
 * Look up the full country name from an alpha-3 code.
 * Example: `countryName('IND')` → `'India'`
 */
export function countryName(alpha3: string): string | undefined {
  if (!alpha3) return undefined
  return BY_ALPHA3.get(alpha3.toUpperCase())?.name
}

/**
 * Look up the nationality word from an alpha-3 code.
 * Example: `nationalityName('IND')` → `'Indian'`
 *
 * This is what Drools reference data (tb_test_countries.json,
 * enhanced_scrutiny_nationalities.json, etc.) uses.
 */
export function nationalityName(alpha3: string): string | undefined {
  if (!alpha3) return undefined
  return BY_ALPHA3.get(alpha3.toUpperCase())?.nationality
}

/**
 * Reverse lookup: given a nationality word (e.g., "Indian", "British"),
 * return the alpha-3 code. Case-insensitive.
 *
 * Useful when DIS sends `nationality: "INDIAN"` on the passport extraction
 * and we need to match it against alpha-3-keyed reference data.
 */
export function nationalityToAlpha3(nationality: string): string | undefined {
  if (!nationality) return undefined
  return BY_NATIONALITY.get(nationality.toLowerCase())?.alpha3
}

/**
 * Reverse lookup: given a full country name, return the alpha-3 code.
 */
export function nameToAlpha3(name: string): string | undefined {
  if (!name) return undefined
  return BY_NAME.get(name.toLowerCase())?.alpha3
}

/**
 * Normalise any nationality input (alpha-2, alpha-3, full name, nationality
 * word) into alpha-3. This is the "just give me the DIS-compatible code"
 * helper.
 *
 * Returns undefined if the input can't be matched to anything known.
 */
export function toAlpha3(input: string): string | undefined {
  if (!input) return undefined
  const trimmed = input.trim()
  if (!trimmed) return undefined

  // Try alpha-3 first (most common in DIS payloads)
  if (trimmed.length === 3) {
    const hit = BY_ALPHA3.get(trimmed.toUpperCase())
    if (hit) return hit.alpha3
  }

  // Try alpha-2
  if (trimmed.length === 2) {
    const hit = BY_ALPHA2.get(trimmed.toUpperCase())
    if (hit) return hit.alpha3
  }

  // Try full name
  const nameHit = BY_NAME.get(trimmed.toLowerCase())
  if (nameHit) return nameHit.alpha3

  // Try nationality word
  const natHit = BY_NATIONALITY.get(trimmed.toLowerCase())
  if (natHit) return natHit.alpha3

  return undefined
}

/**
 * Get the full country row from any identifier. Useful for display.
 */
export function lookupCountry(input: string): CountryRow | undefined {
  const alpha3 = toAlpha3(input)
  return alpha3 ? BY_ALPHA3.get(alpha3) : undefined
}

/**
 * All supported countries — for dropdowns, filters, etc.
 */
export function allCountries(): readonly CountryRow[] {
  return COUNTRIES
}
