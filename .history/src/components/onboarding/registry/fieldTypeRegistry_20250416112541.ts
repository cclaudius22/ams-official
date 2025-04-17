// src/components/onboarding/registry/fieldTypeRegistry.ts

import { ComponentType } from 'react';
import { z } from 'zod'; // For validation schemas

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
  
  // Validation and behavior
  defaultValidation: z.ZodTypeAny;           // Default Zod validation schema
  defaultProps: Record<string, any>;         // Default properties
  
  // Optional capabilities
  hasOptions?: boolean;                      // Whether this field has options (dropdown, etc)
  hasConditionalLogic?: boolean;             // Whether this field supports conditional display
  hasCustomValidation?: boolean;             // Whether this supports custom validation rules
  
  // Feature flags
  experimental?: boolean;                    // Mark as experimental/beta
}

// The actual registry
const fieldTypeRegistry: Record<string, FieldTypeDefinition> = {};

// Registration function
export function registerFieldType(fieldType: FieldTypeDefinition) {
  fieldTypeRegistry[fieldType.id] = fieldType;
}

// Getter function
export function getFieldType(id: string): FieldTypeDefinition | undefined {
  return fieldTypeRegistry[id];
}

// Get all registered field types
export function getAllFieldTypes(): FieldTypeDefinition[] {
  return Object.values(fieldTypeRegistry);
}

// Get field types by category
export function getFieldTypesByCategory(category: string): FieldTypeDefinition[] {
  return Object.values(fieldTypeRegistry).filter(ft => ft.category === category);
}

export default fieldTypeRegistry;