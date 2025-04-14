// types/onboarding.ts

// Basic interfaces for validation rules, options, and conditional visibility
export interface ValidationRule {
    rule: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'number' | 'dateRange' | 'custom';
    value?: any;
    message?: string;
  }
  
  export interface FieldOption {
    label: string;
    value: any;
  }
  
  export interface ConditionalVisibility {
    dependsOn: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'isEmpty' | 'isNotEmpty';
    value: any;
  }
  
  export interface UIHints {
    width?: 'full' | 'half' | 'third' | 'quarter';
    variant?: 'default' | 'bordered' | 'ghost' | 'underlined';
    icon?: string;
    layout?: 'default' | 'card' | 'panel';
    severity?: 'info' | 'warning' | 'error' | 'success';
    grid?: {
      columns?: number;
      colSpan?: number;
    };
  }
  
  export interface ArrayConfig {
    minItems?: number;
    maxItems?: number;
    addButtonLabel?: string;
    removeButtonLabel?: string;
    itemTemplate: FormField;
  }
  
  // Form field interface
  export interface FormField {
    fieldName: string;
    label: string;
    fieldType: 'text' | 'textarea' | 'email' | 'password' | 'number' | 'date' | 
                'select' | 'multiselect' | 'checkbox' | 'radio' | 'file' | 
                'info' | 'heading' | 'array' | 'biometric' | 'device' | 'objectGroup';
    dataType?: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    order: number;
    placeholder?: string;
    helpText?: string;
    validationRules?: ValidationRule[];
    options?: FieldOption[];
    conditionalVisibility?: ConditionalVisibility;
    uiHints?: UIHints;
    arrayConfig?: ArrayConfig;
    children?: FormField[];
  }
  
  // Onboarding step interface
  export interface OnboardingStep {
    key: string;
    title: string;
    description?: string;
    order: number;
    conditionalVisibility?: ConditionalVisibility;
    fields: FormField[];
  }
  
  // Main configuration interface
  export interface OnboardingConfiguration {
    id?: string;
    name: string;
    key: string;
    targetUserType: 'super-admin' | 'admin' | 'employee' | 'contractor';
    targetOrgType?: 'government' | 'enterprise' | 'bank' | 'all';
    version: number;
    isActive: boolean;
    securityLevel?: 'standard' | 'enhanced' | 'high';
    steps: OnboardingStep[];
    createdBy: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  // Session interface
  export interface OnboardingSession {
    id?: string;
    official: string;
    configuration: string | OnboardingConfiguration;
    configVersion: number;
    currentStep?: string;
    formData: Record<string, any>;
    completedSteps: string[];
    status: 'pending' | 'inProgress' | 'submitted' | 'completed' | 'failed';
    submittedAt?: string;
    completedAt?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  // Enhanced types for React Hook Form integration
  export interface FormContextType {
    register: any;
    control: any;
    formState: {
      errors: Record<string, any>;
      isSubmitting: boolean;
      isValid: boolean;
      isDirty: boolean;
    };
    watch: any;
    setValue: any;
    getValues: any;
    trigger: any;
    handleSubmit: any;
  }
  
  export interface FieldRendererProps {
    field: FormField;
    error?: any;
    formContext?: FormContextType;
  }
  
  export interface StepRendererProps {
    step: OnboardingStep;
    formContext?: FormContextType;
  }
  
  // Form state for validation error tracking
  export interface ValidationError {
    field: string;
    message: string;
    rule?: string;
  }
  
  // Interface for session update payload
  export interface SessionUpdatePayload {
    formData: Record<string, any>;
    currentStep?: string;
    completedSteps?: string[];
  }
  
  // API Response interfaces
  export interface ConfigurationResponse {
    configuration: OnboardingConfiguration;
  }
  
  export interface ConfigurationsResponse {
    configurations: OnboardingConfiguration[];
  }
  
  export interface SessionResponse {
    session: OnboardingSession;
    configuration: OnboardingConfiguration;
  }
  
  // Interface for common onboarding field types that need special handling
  export interface BiometricRegistrationData {
    registered: boolean;
    completedAt?: string;
    methods: string[];
  }
  
  export interface DeviceRegistrationData {
    id: string;
    type: 'workstation' | 'mobile' | 'token';
    name: string;
    registeredAt: string;
    approved: boolean;
  }
  
  export interface GovernmentIdentityData {
    employeeId: string;
    departmentId: string;
    positionTitle: string;
    clearanceLevel?: string;
  }
  
  // Interface to define step addition/editing in admin UI
  export interface StepFormData {
    title: string;
    description?: string;
    conditionalVisibility?: ConditionalVisibility;
  }
  
  // Interface to define field addition/editing in admin UI
  export interface FieldFormData {
    fieldName: string;
    label: string;
    fieldType: string;
    placeholder?: string;
    helpText?: string;
    validationRules?: ValidationRule[];
    options?: FieldOption[];
    conditionalVisibility?: ConditionalVisibility;
    uiHints?: UIHints;
  }