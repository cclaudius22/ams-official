// src/components/onboarding/configurator/types.ts

import React from 'react'; // Import React for React.ElementType

export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'notContains';

export interface Condition {
  fieldId: string;
  operator: ConditionOperator;
  value: any;
}

export interface ConditionalLogic {
  conditions: Condition[];
  action: 'show' | 'hide' | 'enable' | 'disable';
}

export interface FieldConfig {
  id: string;
  type: string;
  label: string;
  fieldName: string;
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  order: number;
  layoutHint?: 'fullWidth' | 'halfWidth';
  conditionalLogic?: ConditionalLogic;
  validationRules?: ValidationRule[];
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
