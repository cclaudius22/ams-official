// src/components/onboarding/configurator/types.ts

import React from 'react'; // Import React for React.ElementType

export interface FieldConfig {
  id: string;
  type: string;
  label: string;
  fieldName: string; // Added back based on reducer logic example
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  order: number;
  layoutHint?: 'fullWidth' | 'halfWidth';
  // Future properties: options, subFields, validationRules, conditionalLogic, fileUploadConfig, etc.
}

export interface StepConfig {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FieldConfig[];
}

export interface OnboardingConfiguration {
  id?: string;
  name: string;
  key: string;
  targetUserType: string;
  targetOrgType: string;
  version: number;
  isActive: boolean;
  securityLevel: string;
  steps: StepConfig[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FieldComponentDefinition {
    id: string;
    name: string;
    description: string;
    icon?: React.ElementType; // Corrected type
    preview: React.ReactNode;
}