// src/components/onboarding/registry/fieldTypeRegistry.ts
import { ComponentType } from 'react';

export interface FieldTypeDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any; // Making this more flexible for now
  formComponent: ComponentType<any>;
  previewComponent: ComponentType<any>;
  defaultProps: Record<string, any>;
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