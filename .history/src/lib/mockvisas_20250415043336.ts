// lib/mockvisas.ts
export type VisaType = {
  id: string;
  name: string;
};

export const ukVisaTypes: VisaType[] = [
  { id: 'standard_visitor_visa', name: 'Standard Visitor Visa' },
  { id: 'skilled_worker_visa', name: 'Skilled Worker Visa' },
  { id: 'global_talent_visa', name: 'Global Talent Visa' },
  { id: 'student_visa', name: 'Student Visa' },
  { id: 'spouse_partner_visa', name: 'Spouse or Partner Visa (also referred to as Appendix FM Partner)' },
  { id: 'ilr', name: 'Indefinite Leave to Remain (ILR)' },
  { id: 'eta', name: 'Electronic Travel Authorisation (ETA)' },
  { id: 'health_care_worker_visa', name: 'Health and Care Worker Visa' },
  { id: 'innovator_founder_visa', name: 'Innovator Founder Visa' },
  { id: 'short_term_study_visa', name: 'Short-term Study Visa' },
];
