// src/components/onboarding/renderer/RenderFieldSwitch.tsx

import React from 'react';
import { getFieldType } from '../registry/fieldTypeRegistry';

// Import your existing field components as fallbacks
import RenderTextInput from './fields/RenderTextInput';
import RenderTextArea from './fields/RenderTextArea';
import RenderDatePicker from './fields/RenderDatePicker';
import RenderSelectInput from './fields/RenderSelectInput';
import RenderCheckbox from './fields/RenderCheckbox';
import RenderFieldArrayComponent from './fields/RenderFieldArrayComponent';
import RenderInfoBlock from './fields/RenderInfoBlock';
import RenderPhoneInput from './fields/RenderPhoneInput';
import MockIdentityScan from './fields/MockIdentityScan';
import MockKycTrigger from './fields/MockKycTrigger';
import MockFileUpload from './fields/MockFileUpload';

// This is a fallback map for backwards compatibility
const LEGACY_FIELD_MAP: Record<string, React.ComponentType<any>> = {
  'text': RenderTextInput,
  'textarea': RenderTextArea,
  'date': RenderDatePicker,
  'select': RenderSelectInput,
  'checkbox': RenderCheckbox,
  'repeater': RenderFieldArrayComponent,
  'info': RenderInfoBlock,
  'phone': RenderPhoneInput,
  'identityDocumentScan': MockIdentityScan,
  'kycComponent': MockKycTrigger,
  'file': MockFileUpload,
};

// Props are intentionally loose: callers pass heterogeneous legacy shapes
// (FieldRenderer passes `field`; RenderFieldArrayComponent passes `fieldConfig` only)
interface RenderFieldSwitchProps {
  field?: any;
  [key: string]: any;
}

// This component renders a field based on its type
const RenderFieldSwitch = ({ field, ...props }: RenderFieldSwitchProps) => {
  // Try to get field type from registry first
  const fieldType = getFieldType(field.type);
  
  if (fieldType) {
    // If found in registry, use the registry component
    const Component = fieldType.formComponent;
    return <Component field={field} {...props} />;
  } else {
    // Fall back to legacy field map for backward compatibility
    const FallbackComponent = LEGACY_FIELD_MAP[field.type];
    
    if (FallbackComponent) {
      return <FallbackComponent field={field} {...props} />;
    }
    
    // If still not found, show error state
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50">
        <p className="text-red-500">Unknown field type: {field.type}</p>
      </div>
    );
  }
};

export default RenderFieldSwitch;