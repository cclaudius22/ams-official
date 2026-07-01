/**
 * Officer seed data with visa type specializations
 */

import type { ConsulateOfficial } from '@/api-contracts/users';

export type VisaTypeSpecialization =
  | 'student_visa'
  | 'skilled_worker_visa'
  | 'senior_specialist_worker_visa'
  | 'global_talent_visa'
  | 'spouse_partner_visa'
  | 'innovator_founder_visa';

/**
 * Default officers with their visa type specializations
 */
export const defaultOfficers: ConsulateOfficial[] = [
  {
    id: 'officer-demo',
    firstName: 'Rachel',
    lastName: 'Johnson',
    email: 'rachel.johnson@homeoffice.gov.uk',
    role: 'senior_officer',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    activeApplications: 4,
    completedToday: 8,
    completedThisWeek: 42,
    avgProcessingTime: 30,
    slaCompliance: 98,
    specializations: ['student_visa', 'skilled_worker_visa', 'global_talent_visa'],
  },
  {
    id: 'officer-1',
    firstName: 'Uma',
    lastName: 'Mirza',
    email: 'uma.mirza@homeoffice.gov.uk',
    role: 'senior_officer',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    activeApplications: 2,
    completedToday: 5,
    completedThisWeek: 28,
    avgProcessingTime: 35,
    slaCompliance: 96,
    specializations: ['student_visa', 'skilled_worker_visa'],
  },
  {
    id: 'officer-2',
    firstName: 'Ricardo',
    lastName: 'Martinez',
    email: 'ricardo.martinez@homeoffice.gov.uk',
    role: 'officer',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    activeApplications: 5,
    completedToday: 3,
    completedThisWeek: 22,
    avgProcessingTime: 42,
    slaCompliance: 91,
    specializations: ['skilled_worker_visa', 'senior_specialist_worker_visa'],
  },
  {
    id: 'officer-3',
    firstName: 'Ken',
    lastName: 'Scott',
    email: 'ken.scott@homeoffice.gov.uk',
    role: 'officer',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    activeApplications: 3,
    completedToday: 4,
    completedThisWeek: 25,
    avgProcessingTime: 38,
    slaCompliance: 94,
    specializations: ['spouse_partner_visa', 'global_talent_visa'],
  },
  {
    id: 'officer-4',
    firstName: 'Marie',
    lastName: 'Lovett',
    email: 'marie.lovett@homeoffice.gov.uk',
    role: 'officer',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    activeApplications: 4,
    completedToday: 6,
    completedThisWeek: 31,
    avgProcessingTime: 32,
    slaCompliance: 98,
    specializations: ['student_visa'],
  },
  {
    id: 'officer-5',
    firstName: 'Kerry',
    lastName: 'Henderson',
    email: 'kerry.henderson@homeoffice.gov.uk',
    role: 'senior_officer',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    activeApplications: 2,
    completedToday: 7,
    completedThisWeek: 35,
    avgProcessingTime: 28,
    slaCompliance: 99,
    specializations: ['global_talent_visa', 'innovator_founder_visa'],
  },
  {
    id: 'officer-6',
    firstName: 'Belinda',
    lastName: "O'Reilly",
    email: 'belinda.oreilly@homeoffice.gov.uk',
    role: 'officer',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    activeApplications: 3,
    completedToday: 4,
    completedThisWeek: 24,
    avgProcessingTime: 40,
    slaCompliance: 92,
    specializations: ['spouse_partner_visa', 'student_visa'],
  },
  {
    id: 'officer-7',
    firstName: 'Evica',
    lastName: 'Key',
    email: 'evica.key@homeoffice.gov.uk',
    role: 'specialist', // Trainee
    isActive: true,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    activeApplications: 1,
    completedToday: 2,
    completedThisWeek: 12,
    avgProcessingTime: 55,
    slaCompliance: 85,
    specializations: [], // Trainee handles overflow - no specialization
  },
];

/**
 * Get officers who specialize in a given visa type
 */
export function getOfficersByVisaType(visaType: string): ConsulateOfficial[] {
  const result = defaultOfficers.filter(
    officer =>
      officer.specializations?.includes(visaType) ||
      (officer.specializations?.length === 0) // Include trainees for overflow
  );

  // Debug: Log which officers match
  console.log(`[Officers] getOfficersByVisaType("${visaType}"): found ${result.length} officers`);
  if (result.length === 0) {
    console.log(`[Officers] Available specializations:`,
      defaultOfficers.map(o => ({
        name: `${o.firstName} ${o.lastName}`,
        specs: o.specializations
      })));
  }

  return result;
}

/**
 * Get officer by ID
 */
export function getOfficerById(id: string): ConsulateOfficial | undefined {
  return defaultOfficers.find(officer => officer.id === id);
}

/**
 * Get specialization display name
 */
export function getSpecializationDisplayName(spec: string): string {
  const names: Record<string, string> = {
    'student_visa': 'Student',
    'skilled_worker_visa': 'Skilled Worker',
    'senior_specialist_worker_visa': 'Senior Specialist',
    'global_talent_visa': 'Global Talent',
    'spouse_partner_visa': 'Family',
    'innovator_founder_visa': 'Innovator',
  };
  return names[spec] || spec;
}
