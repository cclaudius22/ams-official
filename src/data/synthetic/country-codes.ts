/**
 * Nationality to ISO 3166-1 alpha-2 country code mapping
 * Used to convert synthetic data nationality strings to dashboard country codes
 */

export const NATIONALITY_TO_ISO: Record<string, string> = {
  // Major source countries (from synthetic data)
  'India': 'in',
  'China': 'cn',
  'Nigeria': 'ng',
  'Pakistan': 'pk',
  'United States': 'us',
  'Philippines': 'ph',
  'Bangladesh': 'bd',
  'South Africa': 'za',
  'Brazil': 'br',
  'Turkey': 'tr',
  'Iran': 'ir',
  'Afghanistan': 'af',
  'Syria': 'sy',
  'Eritrea': 'er',

  // Other countries (fallback nationalities)
  'Japan': 'jp',
  'Germany': 'de',
  'France': 'fr',
  'Italy': 'it',
  'Spain': 'es',
  'Australia': 'au',
  'Canada': 'ca',
  'United Kingdom': 'gb',
  'Netherlands': 'nl',
  'Poland': 'pl',
  'Russia': 'ru',
  'Ukraine': 'ua',
  'Mexico': 'mx',
  'Argentina': 'ar',
  'South Korea': 'kr',
  'Indonesia': 'id',
  'Vietnam': 'vn',
  'Thailand': 'th',
  'Malaysia': 'my',
  'Singapore': 'sg',
  'Egypt': 'eg',
  'Kenya': 'ke',
  'Ghana': 'gh',
  'Morocco': 'ma',
  'Saudi Arabia': 'sa',
  'United Arab Emirates': 'ae',
  'Iraq': 'iq',
  'Sudan': 'sd',
  'Ethiopia': 'et',
  'Yemen': 'ye',
  'Albania': 'al',
  'Romania': 'ro',
  'Bulgaria': 'bg',
  'Hungary': 'hu',
  'Czech Republic': 'cz',
  'Portugal': 'pt',
  'Greece': 'gr',
  'Sweden': 'se',
  'Norway': 'no',
  'Denmark': 'dk',
  'Finland': 'fi',
  'Ireland': 'ie',
  'Belgium': 'be',
  'Austria': 'at',
  'Switzerland': 'ch',
  'New Zealand': 'nz',
  'Colombia': 'co',
  'Chile': 'cl',
  'Peru': 'pe',
  'Venezuela': 've',
};

/**
 * Get ISO country code from nationality string
 * @param nationality - The nationality string (e.g., "India", "Nigeria")
 * @returns ISO 3166-1 alpha-2 code (lowercase) or 'xx' for unknown
 */
export function getCountryCode(nationality: string): string {
  return NATIONALITY_TO_ISO[nationality] || 'xx';
}

/**
 * Get country name from ISO code
 * @param code - ISO 3166-1 alpha-2 code
 * @returns Country name or the code itself if not found
 */
export function getCountryName(code: string): string {
  const entry = Object.entries(NATIONALITY_TO_ISO).find(([, c]) => c === code.toLowerCase());
  return entry ? entry[0] : code.toUpperCase();
}

/**
 * Visa type display names
 */
export const VISA_TYPE_DISPLAY_NAMES: Record<string, string> = {
  'student_visa': 'Student Visa',
  'skilled_worker_visa': 'Skilled Worker Visa',
  'senior_specialist_worker_visa': 'Senior Specialist Worker Visa',
  'global_talent_visa': 'Global Talent Visa',
  'spouse_partner_visa': 'Spouse/Partner Visa',
  'innovator_founder_visa': 'Innovator Founder Visa',
};

/**
 * Visa type categories (for filtering/grouping)
 */
export const VISA_TYPE_CATEGORIES: Record<string, string> = {
  'student_visa': 'Student',
  'skilled_worker_visa': 'Work',
  'senior_specialist_worker_visa': 'Work',
  'global_talent_visa': 'Work',
  'spouse_partner_visa': 'Family',
  'innovator_founder_visa': 'Business',
};

/**
 * Get formatted visa type display name
 */
export function getVisaTypeDisplayName(visaType: string): string {
  return VISA_TYPE_DISPLAY_NAMES[visaType] || visaType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Get visa category
 */
export function getVisaCategory(visaType: string): string {
  return VISA_TYPE_CATEGORIES[visaType] || 'Other';
}
