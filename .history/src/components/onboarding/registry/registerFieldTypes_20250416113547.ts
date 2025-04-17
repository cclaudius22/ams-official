// src/components/onboarding/registry/registerFieldTypes.ts
import fieldTypeRegistry, { registerFieldType } from './fieldTypeRegistry';

// Import your existing field components
import RenderTextInput from '../renderer/fields/RenderTextInput';
import RenderTextArea from '../renderer/fields/RenderTextArea';
import RenderDatePicker from '../renderer/fields/RenderDatePicker';
import RenderSelectInput from '../renderer/fields/RenderSelectInput';
import RenderCheckbox from '../renderer/fields/RenderCheckbox';
import MockIdentityScan from '../renderer/fields/MockIdentityScan';
import MockKycTrigger from '../renderer/fields/MockKycTrigger';

// Register basic fields
registerFieldType({
  id: 'text',
  name: 'Text Input',
  category: 'basic',
  description: 'Single line text entry',
  formComponent: RenderTextInput,
  previewComponent: RenderTextInput, // Use same component for preview
  defaultProps: {
    label: 'Text Input',
    placeholder: 'Enter text',
    isRequired: false
  }
});

registerFieldType({
  id: 'textarea',
  name: 'Text Area',
  category: 'basic',
  description: 'Multi-line text entry',
  formComponent: RenderTextArea,
  previewComponent: RenderTextArea,
  defaultProps: {
    label: 'Text Area',
    placeholder: 'Enter longer text',
    isRequired: false
  }
});

registerFieldType({
  id: 'date',
  name: 'Date Picker',
  category: 'basic',
  description: 'Select a date',
  formComponent: RenderDatePicker,
  previewComponent: RenderDatePicker,
  defaultProps: {
    label: 'Date',
    isRequired: false
  }
});

registerFieldType({
  id: 'select',
  name: 'Dropdown Select',
  category: 'basic',
  description: 'Select from a list of options',
  formComponent: RenderSelectInput,
  previewComponent: RenderSelectInput,
  defaultProps: {
    label: 'Select',
    options: [],
    isRequired: false
  }
});

registerFieldType({
  id: 'checkbox',
  name: 'Checkbox',
  category: 'basic',
  description: 'Boolean checkbox selection',
  formComponent: RenderCheckbox,
  previewComponent: RenderCheckbox,
  defaultProps: {
    label: 'Checkbox',
    isRequired: false
  }
});

// Register specialized fields
registerFieldType({
  id: 'identityDocumentScan',
  name: 'ID Verification',
  category: 'identity',
  description: 'Scan and verify government-issued ID documents',
  formComponent: MockIdentityScan,
  previewComponent: MockIdentityScan,
  defaultProps: {
    label: 'Identity Document',
    helpText: 'Please upload a valid government-issued ID',
    isRequired: false
  }
});

registerFieldType({
  id: 'kycComponent',
  name: 'KYC Component',
  category: 'identity',
  description: 'Verify identity through KYC process',
  formComponent: MockKycTrigger, // Use your existing component
  previewComponent: MockKycTrigger,
  defaultProps: {
    label: 'Identity Verification',
    helpText: 'Complete identity verification to continue',
    isRequired: false
  }
});

// Initialize the registry
export default function initializeFieldRegistry() {
  console.log('Field registry initialized with', Object.keys(fieldTypeRegistry).length, 'field types');
  return fieldTypeRegistry;
}