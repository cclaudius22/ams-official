// src/components/onboarding/configurator/types.ts

// Basic types for the configuration builder - these will expand significantly

/**
 * Represents a single configurable field within a step.
 */
export interface FieldConfig {
    id: string;         // Unique identifier for the field within the step (e.g., field-167...)
    type: string;       // Type of field (e.g., 'text', 'email', 'select', 'repeater', 'fileUpload')
    label: string;      // User-facing label for the field
    fieldName: string;  // Machine-readable name (used as key in formData, e.g., 'personalInfo.firstName') - TBD: How to generate/manage this well
    isRequired: boolean;
    placeholder?: string;
    helpText?: string;
    order: number;      // Display order within the step
    layoutHint?: 'fullWidth' | 'halfWidth'; // Optional layout hint
  
    // Type-specific properties will be added later, e.g.:
    // options?: { label: string; value: string }[]; // For select/radio
    // subFields?: FieldConfig[]; // For repeater type
    // validationRules?: any[]; // TBD structure
    // conditionalLogic?: any[]; // TBD structure
    // fileUploadConfig?: any; // TBD structure
  }
  
  /**
   * Represents a single step in the onboarding flow configuration.
   */
  export interface StepConfig {
    id: string;           // Unique identifier for the step (e.g., step-167...)
    title: string;        // User-facing title of the step
    description?: string; // Optional description shown below the title
    order: number;        // Order of the step in the flow
    fields: FieldConfig[]; // Array of fields within this step
    // conditionalLogic?: any[]; // TBD: Rules for showing/hiding the entire step
  }
  
  /**
   * Represents the entire onboarding configuration document.
   */
  export interface OnboardingConfiguration {
    id?: string;                // DB ID, present if editing an existing config
    name: string;               // User-friendly name (e.g., "Standard Employee Onboarding - Gov")
    key: string;                // Unique machine-readable key (e.g., 'employee_gov_v1') - used for fetching
    targetUserType: string;     // Target user role (e.g., 'employee', 'admin')
    targetOrgType: string;      // Target organization type (e.g., 'government', 'enterprise', 'all')
    version: number;            // Configuration version
    isActive: boolean;          // Is this the active version for the target criteria?
    securityLevel: string;      // Associated security level (e.g., 'standard') - Define enum later
    steps: StepConfig[];        // Ordered list of steps in the onboarding flow
    createdAt?: Date;           // DB timestamp
    updatedAt?: Date;           // DB timestamp
  }
  
  /**
   * Represents the structure of available field components in the library.
   */
  export interface FieldComponentDefinition {
      id: string;                 // Matches FieldConfig.type (e.g., 'text', 'select')
      name: string;               // Display name (e.g., 'Text Input')
      description: string;        // Short description
      icon?: React.ElementType;   // Optional icon component
      preview: React.ReactNode; // JSX preview of the component
  }