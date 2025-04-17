// src/components/onboarding/registry/registerFieldTypes.ts

import fieldTypeRegistry, { registerFieldType } from './fieldTypeRegistry';
import { z } from 'zod';

// Import built-in field types
import { 
  TextFieldConfigurator, 
  TextField, 
  TextFieldPreview
} from '../fields/basic/TextField';

// Import custom field types
import {
  IdentityDocumentScanField,
  IdentityDocumentScanPreview,
  identityDocumentScanValidation,
  identityDocumentScanDefaultProps
} from '../fields/identity/IdentityDocumentScan';

import {
  KycTriggerField,
  KycTriggerPreview,
  kycTriggerValidation,
  kycTriggerDefaultProps
} from '../fields/identity/KycTrigger';

// Register Text Field
registerFieldType({
  id: 'text',
  name: 'Text Input',
  category: 'basic',
  description: 'Single line text entry',
  configuratorComponent: TextFieldConfigurator,
  formComponent: TextField,
  previewComponent: TextFieldPreview,
  defaultValidation: z.string(),
  defaultProps: {
    label: 'Text Input',
    placeholder: 'Enter text',
    isRequired: false,
    validationRules: []
  },
  hasOptions: false,
  hasConditionalLogic: true,
  hasCustomValidation: true
});

// Register Identity Document Scan Field
registerFieldType({
  id: 'identityDocumentScan',
  name: 'ID Verification',
  category: 'identity',
  description: 'Scan and verify government-issued ID documents',
  // For simplicity we're using the same component for preview and form in this example
  configuratorComponent: TextFieldConfigurator, // Reuse for now, ideally create custom configurator
  formComponent: IdentityDocumentScanField,
  previewComponent: IdentityDocumentScanPreview,
  defaultValidation: identityDocumentScanValidation,
  defaultProps: identityDocumentScanDefaultProps,
  hasOptions: false,
  hasConditionalLogic: true,
  hasCustomValidation: false
});

// Register KYC Trigger Field
registerFieldType({
  id: 'kycTrigger',
  name: 'KYC/Identity Check',
  category: 'identity',
  description: 'Verify identity through KYC process',
  configuratorComponent: TextFieldConfigurator, // Reuse for now, ideally create custom configurator
  formComponent: KycTriggerField,
  previewComponent: KycTriggerPreview,
  defaultValidation: kycTriggerValidation,
  defaultProps: kycTriggerDefaultProps,
  hasOptions: false,
  hasConditionalLogic: true,
  hasCustomValidation: false
});

// Initialize the registry with all field types
export default function initializeFieldRegistry() {
  // This function can be called from your app initialization
  console.log('Field registry initialized with', Object.keys(fieldTypeRegistry).length, 'field types');
  return fieldTypeRegistry;
}