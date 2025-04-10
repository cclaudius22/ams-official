export interface VisaType {
  id: string;
  name: string;
  description?: string; // Optional description
}

export const ukVisaTypes: VisaType[] = [
  { id: 'skilled-worker', name: 'Skilled Worker Visa' },
  { id: 'student', name: 'Student Visa' },
  { id: 'family', name: 'Family Visa' },
  { id: 'visitor', name: 'Standard Visitor Visa' },
  { id: 'global-talent', name: 'Global Talent Visa' },
  { id: 'graduate', name: 'Graduate Visa' },
  { id: 'health-care', name: 'Health and Care Worker Visa' },
  { id: 'innovator-founder', name: 'Innovator Founder Visa' },
  { id: 'high-potential', name: 'High Potential Individual (HPI) Visa' },
  { id: 'temporary-worker', name: 'Temporary Worker Visa' },
];
