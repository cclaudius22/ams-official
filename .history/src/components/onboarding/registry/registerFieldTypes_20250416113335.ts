// src/components/onboarding/registry/registerFieldTypes.ts

import fieldTypeRegistry, { registerFieldType } from './fieldTypeRegistry';

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
  identityDocumentScanDefaultProps
} from '../fields/identity/IdentityDocumentScan';

import {
  KycComponentField,
  KycComponentPreview,
  kycComponentDefaultProps
} from '../fields/identity/KycComponent';


// Register Text Field
registerFieldType({
  id: 'text',
  name: 'Text Input',
  category: 'basic',
  description: 'Single line text entry',
  configuratorComponent: TextFieldConfigurator,
  formComponent: TextField,
  previewComponent: TextFieldPreview,
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
  configuratorComponent: TextFieldConfigurator, // Reuse for now
  formComponent: IdentityDocumentScanField,
  previewComponent: IdentityDocumentScanPreview,
  defaultProps: identityDocumentScanDefaultProps,
  hasOptions: false,
  hasConditionalLogic: true,
  hasCustomValidation: false
});

// Register KYC Component
registerFieldType({
  id: 'kycComponent',
  name: 'KYC/Identity Check',
  category: 'identity',
  description: 'Verify identity through KYC process',
  configuratorComponent: TextFieldConfigurator, // Reuse for now, ideally create custom configurator
  formComponent: KycComponentField,
  previewComponent: KycComponentPreview,
  defaultProps: kycComponentDefaultProps,
  hasOptions: false,
  hasConditionalLogic: true,
  hasCustomValidation: false
});

// Register more field types...

// Initialize the registry
export default function initializeFieldRegistry() {
  console.log('Field registry initialized with', Object.keys(fieldTypeRegistry).length, 'field types');
  return fieldTypeRegistry;
}