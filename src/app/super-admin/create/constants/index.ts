// src/app/super-admin/create/constants/index.ts
// Country and department configuration for organization setup

export interface Department {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
  flag: string;
  departments: Department[];
}

export const COUNTRIES: Country[] = [
  {
    id: 'UK',
    name: 'United Kingdom',
    flag: 'gb',
    departments: [
      { id: 'HOME_OFFICE', name: 'Home Office' },
      { id: 'FCDO', name: 'Foreign, Commonwealth & Development Office (FCDO)' },
      { id: 'MOD', name: 'Ministry of Defence (MOD)' },
    ],
  },
  {
    id: 'DE',
    name: 'Germany',
    flag: 'de',
    departments: [
      { id: 'BMI', name: 'Federal Ministry of the Interior (BMI)' },
      { id: 'AA', name: 'Federal Foreign Office (AA)' },
      { id: 'BMVG', name: 'Federal Ministry of Defence (BMVG)' },
    ],
  },
  {
    id: 'CA',
    name: 'Canada',
    flag: 'ca',
    departments: [
      { id: 'IRCC', name: 'Immigration, Refugees and Citizenship Canada (IRCC)' },
      { id: 'CBSA', name: 'Canada Border Services Agency (CBSA)' },
      { id: 'GAC', name: 'Global Affairs Canada (GAC)' },
    ],
  },
];

export const CLEARANCE_LEVELS = [
  { id: 'NONE', name: 'None required' },
  { id: 'BASIC', name: 'Basic Check' },
  { id: 'STANDARD', name: 'Standard Clearance' },
  { id: 'ENHANCED', name: 'Enhanced Clearance' },
  { id: 'TOP_SECRET', name: 'Top Secret' },
];

export const SESSION_DURATIONS = [
  { value: 1, label: '1 hour' },
  { value: 4, label: '4 hours' },
  { value: 8, label: '8 hours (recommended)' },
  { value: 24, label: '24 hours' },
];

export const MFA_METHODS = [
  { id: 'TOTP', name: 'Authenticator App (TOTP)', description: 'Use Google Authenticator, Authy, or similar' },
  { id: 'SMS', name: 'SMS Code', description: 'Receive code via text message' },
  { id: 'EMAIL', name: 'Email Code', description: 'Receive code via email' },
];

// Helper to get departments by country ID
export function getDepartmentsByCountry(countryId: string): Department[] {
  const country = COUNTRIES.find((c) => c.id === countryId);
  return country?.departments || [];
}

// Helper to get country by ID
export function getCountryById(countryId: string): Country | undefined {
  return COUNTRIES.find((c) => c.id === countryId);
}

// Helper to get department name
export function getDepartmentName(countryId: string, departmentId: string): string {
  const departments = getDepartmentsByCountry(countryId);
  const department = departments.find((d) => d.id === departmentId);
  return department?.name || departmentId;
}
