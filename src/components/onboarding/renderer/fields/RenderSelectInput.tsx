// src/components/onboarding/renderer/fields/RenderSelectInput.tsx
'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import shadcn Select components
import { Label } from "@/components/ui/label";
import { FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path

// Add 'options' to FieldConfig type if not already there
// interface FieldConfig {
//   // ... other properties
//   options?: { label: string; value: string }[];
// }


interface RenderSelectInputProps {
  fieldConfig: FieldConfig & { options?: { label: string; value: string }[] }; // Expect options in config
  control: any; // Control object from react-hook-form
  errorMessage?: string;
}

const RenderSelectInput = ({ fieldConfig, control, errorMessage }: RenderSelectInputProps) => {
  const { fieldName, label, isRequired, placeholder, options = [] } = fieldConfig; // Destructure props, provide default empty array for options

  // Ensure options array is valid
  const validOptions = Array.isArray(options) ? options : [];
    if (!Array.isArray(options)) {
        console.warn(`Options provided for field "${label}" (${fieldName}) is not an array. Defaulting to empty.`);
    }


  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName}>
        {label || fieldName}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Controller
        name={fieldName}
        control={control}
        // Add rules if needed, e.g., check if value is not the placeholder value
        // rules={{ required: isRequired ? 'This field is required' : false }}
        render={({ field }) => ( // field contains { onChange, value, ref, onBlur }
          <Select
            onValueChange={field.onChange} // Use RHF's onChange
            value={field.value || ""} // Control the value using RHF's value
            // defaultValue={field.value || ""} // Can also use defaultValue if needed
            required={isRequired}
          >
            <SelectTrigger
               id={fieldName}
               ref={field.ref} // Attach RHF ref if needed by SelectTrigger (often not)
               className={errorMessage ? 'border-destructive focus:ring-destructive' : ''} // Add error styling
               aria-invalid={!!errorMessage}
               aria-describedby={errorMessage ? `${fieldName}-error` : undefined}
               // onBlur={field.onBlur} // shadcn Select might not need onBlur propagation
            >
              {/* Display selected value, or placeholder if none */}
              <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {/* Optional: Add a disabled placeholder item if needed */}
              {/* {placeholder && <SelectItem value="" disabled>{placeholder}</SelectItem>} */}

              {/* Map over options from fieldConfig */}
              {validOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

export default RenderSelectInput;