// src/app/super-admin/create/types/index.ts
// Types for the Super Admin setup wizard

// Step 1: Organization Setup
export interface OrganizationDetails {
  name: string;
  country: string;
  department: string;
}

// Step 2: Admin Account
export interface AccountDetails {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Step 3: Security Policies
export interface SecurityPolicies {
  requiredClearanceLevel: string;
  mfaRequired: boolean;
  sessionDurationHours: number;
  mfaMethod: string;
}

// Complete form data
export interface SuperAdminFormData {
  organization: OrganizationDetails;
  account: AccountDetails;
  security: SecurityPolicies;
  termsAccepted: boolean;
}

// Form validation errors
export interface ValidationError {
  step: number;
  field: string;
  message: string;
}

// Step configuration
export interface StepConfig {
  id: number;
  title: string;
  description: string;
}

export const WIZARD_STEPS: StepConfig[] = [
  {
    id: 1,
    title: 'Organization',
    description: 'Set up your organization details',
  },
  {
    id: 2,
    title: 'Admin Account',
    description: 'Create your admin credentials',
  },
  {
    id: 3,
    title: 'Security',
    description: 'Configure security policies',
  },
  {
    id: 4,
    title: 'Review',
    description: 'Review and complete setup',
  },
];

// API response types
export interface CreateOrganizationResponse {
  success: boolean;
  message?: string;
  organizationId?: string;
  userId?: string;
  error?: string;
}
