// src/components/onboarding/renderer/fields/RenderDatePicker.tsx
'use client';

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { format } from "date-fns"; // For formatting the displayed date
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils"; // Your utility function for classnames
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { FieldConfig } from '@/components/onboarding/configurator/types';

interface RenderDatePickerProps {
  fieldConfig: FieldConfig;
  control: any; // Control object from react-hook-form
  errorMessage?: string;
}

const RenderDatePicker = ({ fieldConfig, control, errorMessage }: RenderDatePickerProps) => {
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
        // rules={{ required: isRequired ? 'This date is required' : false }}
        render={({ field }) => ( // field contains { onChange, value, ref, name }
          <Popover>
            <PopoverTrigger asChild>
              {/* It's important to pass RHF's ref here if PopoverTrigger needs it */}
              <Button
                variant={"outline"}
                id={fieldName} // Link button to label
                ref={field.ref} // Pass ref here
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !field.value && "text-muted-foreground", // Style placeholder text
                   errorMessage ? 'border-destructive focus-visible:ring-destructive' : '' // Error styling
                )}
                 aria-invalid={!!errorMessage}
                 aria-describedby={errorMessage ? `${fieldName}-error` : undefined}
                // onBlur={field.onBlur} // onBlur might close the popover unexpectedly, handle carefully
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {/* Display formatted date if value exists, otherwise placeholder */}
                {field.value ? format(new Date(field.value), "PPP") : <span>{placeholder || "Pick a date"}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single" // Select only one date
                selected={field.value ? new Date(field.value) : undefined} // Controlled selected date
                onSelect={field.onChange} // Call RHF's onChange when a date is selected
                initialFocus // Focus the calendar when opened
                // disabled={(date) => date < new Date("1900-01-01")} // Example: disable past dates
              />
            </PopoverContent>
          </Popover>
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

export default RenderDatePicker;