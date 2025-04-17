// src/components/onboarding/registry/registerFieldTypes.ts
import fieldTypeRegistry, { registerFieldType } from './fieldTypeRegistry';

// Import field components
import { 
  TextInputField, 
  TextInputPreview,
  textInputDefaultProps, 
  TextInputIcon 
} from '../field-types/basic/TextInputField';

import {
  EmailField,
  EmailFieldPreview,
  emailFieldDefaultProps,
  EmailFieldIcon
} from '../field-types/basic/EmailField';

import {
  PhoneField,
  PhoneFieldPreview,
  phoneFieldDefaultProps,
  PhoneFieldIcon
} from '../field-types/basic/PhoneField';

import {
  NameField,
  NameFieldPreview,
  firstNameFieldDefaultProps,
  lastNameFieldDefaultProps,
  NameFieldIcon
} from '../field-types/identity/NameField';

import {
  AddressField,
  AddressFieldPreview,
  addressFieldDefaultProps,
  AddressFieldIcon
} from '../field-types/identity/AddressField';

import {
  IdentityDocumentScanField,
  IdentityDocumentScanPreview,
  identityDocumentScanDefaultProps,
  IdentityDocumentScanIcon
} from '../field-types/identity/IdentityDocumentScan';

import {
  KycComponentField,
  KycComponentPreview,
  kycComponentDefaultProps,
  KycComponentIcon
} from '../field-types/identity/KycComponent';

// Register Text Input Field
registerFieldType({
  id: 'text',
  name: 'Text Input',
  category: 'basic',
  description: 'Single line text entry',
  icon: TextInputIcon,
  formComponent: TextInputField,
  previewComponent: TextInputPreview,
  defaultProps: textInputDefaultProps,
  hasOptions: false,
  hasConditionalLogic: true,
  hasCustomValidation: true
});

// Register Email Field
registerFieldType({
  id: 'email',
  name: 'Email Address',
  category: 'basic',
  description: 'Email input with validation',
  icon: EmailFieldIcon,
  formComponent: EmailField,
  previewComponent: EmailFieldPreview,
  defaultProps: emailFieldDefaultProps,
  hasOptions: false,
  hasConditionalLogic: true,
  hasCustomValidation: true
});

// Register Phone Field
registerFieldType({
  id: 'phone',
  name: 'Phone Number',
  category: 'basic',
  description: 'Phone number input with validation',
  icon: PhoneFieldIcon,
  formComponent: PhoneField,
  previewComponent: PhoneFieldPreview,
  defaultProps: phoneFieldDefaultProps,
  hasOptions: false,
  hasConditionalLogic: true,
  hasCustomValidation: true
});

// Register First Name Field
registerFieldType({
  id: 'firstName',
  name: 'First Name',
  category: 'identity',
  description: 'First/given name input',
  icon: NameFieldIcon,
  formComponent: NameField,
  previewComponent: NameFieldPreview,
  defaultProps: firstNameFieldDefaultProps,
  hasOptions: false,
  hasConditionalLogic: true,
  hasCustomValidation: true
});

// Register Last Name
// Register Last Name Field
registerFieldType({
  id: 'lastName',
  name: 'Last Name',
  category: 'identity',
  description: 'Last/surname name input',
  icon: NameFieldIcon,
  formComponent: NameField,
  previewComponent: NameFieldPreview,
  defaultProps: lastNameFieldDefaultProps,
  hasOptions: false,
  hasConditionalLogic: true,
  hasCustomValidation: true
});

// Register Address Field
registerFieldType({
  id: 'address',
  name: 'Address',
  category: 'identity',
  description: 'Full address input with formatting options',
  icon: AddressFieldIcon,
  formComponent: AddressField,
  previewComponent: AddressFieldPreview,
  defaultProps: addressFieldDefaultProps,
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
  icon: IdentityDocumentScanIcon,
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
  name: 'KYC Component',
  category: 'identity',
  description: 'Complete KYC identity verification',
  icon: KycComponentIcon,
  formComponent: KycComponentField,
  previewComponent: KycComponentPreview,
  defaultProps: kycComponentDefaultProps,
  hasOptions: false,
  hasConditionalLogic: true,
  hasCustomValidation: false
});

// Initialize the registry
export default function initializeFieldRegistry() {
  console.log('Field registry initialized with', Object.keys(fieldTypeRegistry).length, 'field types');
  return fieldTypeRegistry;
}