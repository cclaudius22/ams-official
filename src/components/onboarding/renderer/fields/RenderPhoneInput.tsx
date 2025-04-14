// src/components/onboarding/renderer/fields/RenderPhoneInput.tsx
'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path

interface RenderPhoneInputProps {
  fieldConfig: FieldConfig;
  control: any; // Control object from react-hook-form
  errorMessage?: string;
}

const RenderPhoneInput = ({ fieldConfig, control, errorMessage }: RenderPhoneInputProps) => {
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
        // Add phone-specific validation rules later using 'pattern' or a custom validation function
        // rules={{
        //   required: isRequired ? 'Phone number is required' : false,
        //   pattern: {
        //     value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, // Basic international pattern - refine as needed
        //     message: "Invalid phone number format"
        //   }
        // }}
        render={({ field }) => (
          <Input
            id={fieldName}
            type="tel" // Use 'tel' type for semantic meaning and potential mobile optimizations
            placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
            required={isRequired} // HTML5 required
            {...field} // Spread RHF props
            aria-invalid={!!errorMessage}
            aria-describedby={errorMessage ? `${fieldName}-error` : undefined}
            className={errorMessage ? 'border-destructive focus-visible:ring-destructive' : ''}
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

export default RenderPhoneInput;