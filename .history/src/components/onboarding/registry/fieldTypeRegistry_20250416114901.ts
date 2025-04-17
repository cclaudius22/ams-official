// src/components/onboarding/registry/fieldTypeRegistry.ts
import { ComponentType } from 'react';

export interface FieldTypeDefinition {
  // Core metadata
  id: string;
  name: string;
  category: string;
  description: string;
  icon: ComponentType<any>; // Icon for the component library
  
  // Components
  formComponent: ComponentType<any>;   // For the actual form
  previewComponent: ComponentType<any>; // For the preview
  
  // Properties
  defaultProps: Record<string, any>;
  
  // Features
  hasOptions?: boolean;
  hasConditionalLogic?: boolean;
  hasCustomValidation?: boolean;
}

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