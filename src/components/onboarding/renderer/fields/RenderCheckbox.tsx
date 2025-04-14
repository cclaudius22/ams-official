// src/components/onboarding/renderer/fields/RenderCheckbox.tsx
'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path

interface RenderCheckboxProps {
  fieldConfig: FieldConfig;
  control: any; // Control object from react-hook-form
  errorMessage?: string;
}

const RenderCheckbox = ({ fieldConfig, control, errorMessage }: RenderCheckboxProps) => {
  const { fieldName, label, isRequired, helpText } = fieldConfig;

  return (
    <div className="space-y-1"> {/* Reduce spacing if needed */}
      {/* We associate the label with the checkbox using htmlFor/id */}
      {/* The Controller wraps the actual interactive element */}
      <Controller
        name={fieldName}
        control={control}
        // Add rules if needed. 'required: true' means the checkbox MUST be checked.
        // rules={{ required: isRequired ? 'This confirmation is required' : false }}
        render={({ field }) => ( // field contains { onChange, value, ref, name }
           // Container for checkbox and label text, making the whole area clickable
          <div className="flex items-start space-x-2">
             <Checkbox
                id={fieldName} // Link to the label
                checked={!!field.value} // Control checked state based on RHF value (ensure boolean)
                onCheckedChange={field.onChange} // Pass RHF's onChange directly
                // onBlur={field.onBlur} // Typically not needed for checkbox blur
                ref={field.ref} // Pass RHF ref
                required={isRequired} // HTML5 required (optional)
                aria-invalid={!!errorMessage}
                aria-describedby={errorMessage ? `${fieldName}-error` : undefined}
             />
             {/* Label associated with the checkbox */}
             <Label
                htmlFor={fieldName} // Click on label toggles checkbox
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${errorMessage ? 'text-destructive' : ''}`}
             >
               {label || fieldName}
               {isRequired && <span className="text-destructive ml-1">*</span>}
             </Label>
           </div>
        )}
      />

       {/* Display Help Text if provided - Placed below the checkbox/label pair */}
       {helpText && (
         <p className="text-xs text-muted-foreground pt-1">{helpText}</p>
       )}
      {/* Display Error Message */}
      {errorMessage && (
         <p id={`${fieldName}-error`} className="text-xs text-destructive font-medium pt-1">
             {errorMessage}
         </p>
       )}
    </div>
  );
};

export default RenderCheckbox;