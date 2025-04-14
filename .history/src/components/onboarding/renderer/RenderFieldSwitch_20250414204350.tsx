// src/components/onboarding/renderer/RenderFieldSwitch.tsx
'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path

// Import the actual field rendering components (create these files next)
import RenderTextInput from './fields/RenderTextInput';
import RenderSelectInput from './fields/RenderSelectInput';
import RenderCheckbox from './fields/RenderCheckbox';
import RenderDatePicker from './fields/RenderDatePicker';
import RenderTextArea from './fields/RenderTextArea'; // Added
import RenderFieldArrayComponent from './fields/RenderFieldArrayComponent'; // For repeater
import MockFileUpload from './fields/MockFileUpload'; // Mock
import MockIdentityScan from './fields/MockIdentityScan'; // Mock
import MockKycTrigger from './fields/MockKycTrigger'; // Mock
import RenderInfoBlock from './fields/RenderInfoBlock'; // For non-input blocks
import RenderPhoneInput from './fields/RenderPhoneInput'; // Added

interface RenderFieldSwitchProps {
  fieldConfig: FieldConfig;
}

const RenderFieldSwitch = ({ fieldConfig }: RenderFieldSwitchProps) => {
  // Get RHF methods via context (available because of FormProvider in the parent)
  const { control, register, formState: { errors } } = useFormContext();

  // Determine the specific error message for this field (using fieldName)
  // This handles nested names like 'basicInfo.fullName'
  const getErrorMessage = (fieldName: string) => {
      const keys = fieldName.split('.');
      let error = errors;
      for (const key of keys) {
          if (error && typeof error === 'object' && key in error) {
              error = (error as any)[key];
          } else {
              return undefined; // No error found at this path
          }
      }
      return error?.message as string | undefined;
  }
  const errorMessage = getErrorMessage(fieldConfig.fieldName);


  // Render the appropriate component based on field type
  switch (fieldConfig.type) {
    case 'text':
    case 'email': // Often handled similarly to text, validation is separate
      return (
        <RenderTextInput
          fieldConfig={fieldConfig}
          control={control} // Pass control for Controller component
          errorMessage={errorMessage}
        />
      );
    case 'phone': // Added Phone
       return (
         <RenderPhoneInput
           fieldConfig={fieldConfig}
           control={control}
           errorMessage={errorMessage}
         />
       );
    case 'textarea': // Added TextArea
       return (
         <RenderTextArea
           fieldConfig={fieldConfig}
           control={control}
           errorMessage={errorMessage}
         />
       );
    case 'select':
      return (
        <RenderSelectInput
          fieldConfig={fieldConfig}
          control={control}
          errorMessage={errorMessage}
        />
      );
    case 'checkbox':
      return (
        <RenderCheckbox
          fieldConfig={fieldConfig}
          control={control} // Checkbox often uses Controller
          errorMessage={errorMessage}
        />
      );
    case 'date':
      return (
        <RenderDatePicker
          fieldConfig={fieldConfig}
          control={control} // Date pickers usually need Controller
          errorMessage={errorMessage}
        />
      );

    // --- Complex / Mocked Types ---
    case 'repeater':
       return (
          <RenderFieldArrayComponent
             fieldConfig={fieldConfig}
             control={control} // Field array needs control
             // register={register} // Register might be needed for subfields
             // errors={errors} // Pass errors down if needed for subfield display
          />
       );
    case 'documentSelectUpload':
      return <MockFileUpload fieldConfig={fieldConfig} />;
    case 'identityDocumentScan':
      return <MockIdentityScan fieldConfig={fieldConfig} />;
    case 'kycTrigger':
      return <MockKycTrigger fieldConfig={fieldConfig} />;

    // --- Display Only Types ---
     case 'infoBlock':
        return <RenderInfoBlock fieldConfig={fieldConfig} />;
    // Add cases for 'heading', 'paragraph' etc. if needed

    default:
      console.warn(`Unsupported field type: ${fieldConfig.type}`);
      return (
        <div className="text-red-600 bg-red-100 p-2 border border-red-300 rounded">
          Unsupported Field Type: "{fieldConfig.type}" for field "{fieldConfig.label}"
        </div>
      );
  }
};

export default RenderFieldSwitch;