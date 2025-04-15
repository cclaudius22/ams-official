// src/components/onboarding/configurator/types.ts

import React from 'react'; // Import React for React.ElementType

export type ValidationRule = {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message?: string;
};

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
  type: FieldType | 'heading'; // 'heading' is special case for section headers
  label: string;
  fieldName: string;
  isRequired: boolean;
  placeholder?: string;
  helpText?: string;
  order: number;
  layoutHint?: 'fullWidth' | 'halfWidth';
  conditionalLogic?: ConditionalLogic;
  validationRules?: ValidationRule[];
  options?: {value: string, label: string}[]; // For select/multiselect fields
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

export type FieldType = 
  | 'text'
  | 'email'
  | 'number'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'file'
  | 'password'
  | 'multiselect'
  | 'info'
  | 'array'
  | 'biometric'
  | 'device'
  | 'objectGroup'
  | 'phone'
  | 'repeater'
  | 'documentSelectUpload'
  | 'identityDocumentScan'
  | 'kycTrigger'
  | 'infoBlock'
  | 'heading';

export interface FieldComponentDefinition {
  id: string;
  name: string;
  description: string;
  icon?: React.ElementType;
  preview: React.ReactNode;
  type: FieldType;
  supportsValidation?: boolean;
  supportsConditionalLogic?: boolean;
}
