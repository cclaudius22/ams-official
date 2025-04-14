// src/components/onboarding/renderer/fields/RenderTextArea.tsx
'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { Label } from "@/components/ui/label";
import { FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path

interface RenderTextAreaProps {
  fieldConfig: FieldConfig;
  control: any; // Control object from react-hook-form
  errorMessage?: string;
}

const RenderTextArea = ({ fieldConfig, control, errorMessage }: RenderTextAreaProps) => {
  const { fieldName, label, isRequired, placeholder, helpText } = fieldConfig;

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName}>
        {label || fieldName}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        name={fieldName}
        control={control}
        // Add rules here based on fieldConfig if needed (e.g., minLength, maxLength)
        // rules={{ required: isRequired ? 'This field is required' : false, ... }}
        render={({ field }) => ( // field contains { onChange, onBlur, value, ref }
          <Textarea
            id={fieldName}
            placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
            required={isRequired} // HTML5 required attribute (optional)
            {...field} // Spread RHF props (onChange, onBlur, value, ref)
            aria-invalid={!!errorMessage}
            aria-describedby={errorMessage ? `${fieldName}-error` : undefined}
            className={errorMessage ? 'border-destructive focus-visible:ring-destructive' : ''} // Highlight if error
            rows={4} // Default number of rows, could be configurable later
          />
        )}
      />
      {/* Display Help Text if provided */}
      {helpText && (
         <p className="text-xs text-muted-foreground">{helpText}</p>
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

export default RenderTextArea;