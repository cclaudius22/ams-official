// src/components/onboarding/renderer/RenderFieldSwitch.tsx
'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path if needed

// Import ALL the specific field rendering components
// Basic Inputs
import RenderTextInput from './fields/RenderTextInput';
import RenderTextArea from './fields/RenderTextArea';
import RenderSelectInput from './fields/RenderSelectInput';
import RenderCheckbox from './fields/RenderCheckbox';
import RenderDatePicker from './fields/RenderDatePicker';
import RenderPhoneInput from './fields/RenderPhoneInput'; 

// Complex / Mocked Inputs
import RenderFieldArrayComponent from './fields/RenderFieldArrayComponent'; // For repeater
import MockFileUpload from './fields/MockFileUpload';
import MockIdentityScan from './fields/MockIdentityScan';
import MockKycTrigger from './fields/MockKycTrigger';

// Display Only
import RenderInfoBlock from './fields/RenderInfoBlock'; // Assuming this will be created

// Props definition
interface RenderFieldSwitchProps {
  fieldConfig: FieldConfig;
  // No need to pass control, register, errors down explicitly if using useFormContext
}

const RenderFieldSwitch = ({ fieldConfig }: RenderFieldSwitchProps) => {
  // Get RHF methods and state via context.
  // This assumes RenderFieldSwitch is always rendered inside a FormProvider
  const { control, formState: { errors } } = useFormContext();

  // Helper function to get nested error messages
  const getErrorMessage = (fieldName: string): string | undefined => {
    let error = errors;
    try { // Add try-catch for safety when traversing potentially undefined paths
        const keys = fieldName.split('.');
        for (const key of keys) {
            if (error && typeof error === 'object' && key in error) {
                 error = (error as any)[key];
             } else {
                 return undefined; // No error found at this path
             }
         }
         // Ensure the final value has a 'message' property
         return (error && typeof error === 'object' && 'message' in error) ? error.message as string : undefined;
    } catch (e) {
        console.error("Error accessing nested error:", e);
        return undefined;
    }
  }

  // Get the specific error message for *this* field
  const errorMessage = getErrorMessage(fieldConfig.fieldName);

  // --- Switch based on field type ---
  switch (fieldConfig.type) {
    case 'text':
    case 'email': // Group simple text-based inputs
      return <RenderTextInput fieldConfig={fieldConfig} control={control} errorMessage={errorMessage} />;

      case 'phone': 
      return <RenderPhoneInput fieldConfig={fieldConfig} control={control} errorMessage={errorMessage} />;

    case 'textarea':
      return <RenderTextArea fieldConfig={fieldConfig} control={control} errorMessage={errorMessage} />;

    case 'select':
      // Ensure options are passed correctly in fieldConfig for RenderSelectInput
      return <RenderSelectInput fieldConfig={fieldConfig} control={control} errorMessage={errorMessage} />;

    case 'checkbox':
      return <RenderCheckbox fieldConfig={fieldConfig} control={control} errorMessage={errorMessage} />;

    case 'date':
      return <RenderDatePicker fieldConfig={fieldConfig} control={control} errorMessage={errorMessage} />;

    case 'repeater':
      return <RenderFieldArrayComponent fieldConfig={fieldConfig} control={control} /* pass other RHF props if needed by sub-fields */ />;

    case 'documentSelectUpload':
      return <MockFileUpload fieldConfig={fieldConfig} />; // Mocks might not need control/errors directly

    case 'identityDocumentScan':
      return <MockIdentityScan fieldConfig={fieldConfig} />; // Mock

    case 'kycTrigger':
      return <MockKycTrigger fieldConfig={fieldConfig} />; // Mock

    case 'infoBlock':
      return <RenderInfoBlock fieldConfig={fieldConfig} />; // Display-only component

    // Add cases for 'heading', 'paragraph', etc. if you create them

    default:
      // Log error and render a fallback UI for unsupported types
      console.warn(`Unsupported field type encountered in RenderFieldSwitch: ${fieldConfig.type}`);
      return (
        <div className="text-destructive bg-destructive/10 p-2 border border-destructive/30 rounded text-xs">
          <strong>Unsupported Field Type:</strong> "{fieldConfig.type}" for field "{fieldConfig.label}". Please check configuration.
        </div>
      );
  }
};

export default RenderFieldSwitch;