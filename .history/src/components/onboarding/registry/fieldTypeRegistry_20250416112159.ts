// src/components/onboarding/registry/fieldTypeRegistry.ts

// The core registry that maps field types to their implementations
const fieldTypeRegistry = {};

// Registration function to add field types to the registry
export function registerFieldType(fieldType) {
  fieldTypeRegistry[fieldType.id] = fieldType;
}

// Getter functions to access the registry
export function getFieldType(id) {
  return fieldTypeRegistry[id];
}

export function getAllFieldTypes() {
  return Object.values(fieldTypeRegistry);
}

export function getFieldTypesByCategory(category) {
  return Object.values(fieldTypeRegistry).filter(ft => ft.category === category);
}