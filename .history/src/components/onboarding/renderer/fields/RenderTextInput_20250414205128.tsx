// src/components/onboarding/renderer/fields/RenderTextInput.tsx
'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path

interface RenderTextInputProps {
  fieldConfig: FieldConfig;
  control: any; // Control object from react-hook-form
  errorMessage?: string;
}

const RenderTextInput = ({ fieldConfig, control, errorMessage }: RenderTextInputProps) => {
  const { fieldName, label, isRequired, placeholder, type } = fieldConfig; // Destructure common props

  // Determine input type attribute (text, email, password, etc.)
  // Default to 'text' if type is not explicitly handled as a different HTML input type
  const inputType = (type === 'email' || type === 'password') ? type : 'text';

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName}>
        {label || fieldName}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        name={fieldName} // The key for this field in the form data
        control={control} // The control object from useForm
        // Add rules here based on fieldConfig if needed (e.g., minLength, pattern)
        // rules={{ required: isRequired ? 'This field is required' : false, ... }}
        render={({ field }) => ( // 'field' contains { onChange, onBlur, value, ref }
          <Input
            id={fieldName}
            type={inputType} // Use text, email, password etc.
            placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
            required={isRequired} // HTML5 required attribute (optional, RHF handles validation)
            {...field} // Spread RHF props (onChange, onBlur, value, ref)
            aria-invalid={!!errorMessage} // Accessibility: mark as invalid if error exists
            aria-describedby={errorMessage ? `${fieldName}-error` : undefined}
            className={errorMessage ? 'border-destructive focus-visible:ring-destructive' : ''} // Highlight if error
          />
        )}
      />
      {/* Display Help Text if provided */}
      {fieldConfig.helpText && (
         <p className="text-xs text-muted-foreground">{fieldConfig.helpText}</p>
      )}
      {/* Display Error Message */}
      {errorMessage && (
         <p id={`${fieldName}-error`} className="text-xs text-destructive font-medium">
             {errorMessage}
         </p>
      )}
    </div>
  );
};

export default RenderTextInput;