// src/components/onboarding/registry/fieldTypeRegistry.ts

import { ComponentType } from 'react';

export interface FieldTypeDefinition {
  // Basic metadata
  id: string;
  name: string;
  category: string;
  description: string;
  
  // Components
  configuratorComponent: ComponentType<any>; // Component for the configurator UI
  formComponent: ComponentType<any>;         // Component for the actual form
  previewComponent: ComponentType<any>;      // Component for the preview renderer
  
  // Default properties and validation rules (React Hook Form style)
  defaultProps: {
    label: string;
    helpText?: string;
    isRequired?: boolean;
    placeholder?: string;
    validationRules?: Array<{
      rule: string;
      value?: any;
      message?: string;
    }>;
    [key: string]: any;
  };
  
  // Optional capabilities flags
  hasOptions?: boolean;
  hasConditionalLogic?: boolean;
  hasCustomValidation?: boolean;
}

// The registry and accessor functions
const fieldTypeRegistry: Record<string, FieldTypeDefinition> = {};

export function registerFieldType(fieldType: FieldTypeDefinition) {
  fieldTypeRegistry[fieldType.id] = fieldType;
}

export function getFieldType(id: string): FieldTypeDefinition | undefined {
  return fieldTypeRegistry[id];
}

export function getAllFieldTypes(): FieldTypeDefinition[] {
  return Object.values(fieldTypeRegistry);
}

export function getFieldTypesByCategory(category: string): FieldTypeDefinition[] {
  return Object.values(fieldTypeRegistry).filter(ft => ft.category === category);
}

export default fieldTypeRegistry;