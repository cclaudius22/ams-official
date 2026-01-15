// src/components/onboarding/field-types/basic/DatePickerField.tsx
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DatePickerFieldProps {
  field: {
    id: string;
    fieldName: string;
    label: string;
    helpText?: string;
    placeholder?: string;
    isRequired?: boolean;
    validationRules?: Array<{
      type: string;
      value?: any;
      message?: string;
    }>;
    minDate?: Date;
    maxDate?: Date;
  };
  disabled?: boolean;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({ field, disabled = false }) => {
  const { control, formState } = useFormContext();
  
  // Create validation rules
  const validationRules: Record<string, any> = {};
  if (field.isRequired) {
    validationRules.required = 'This field is required';
  }
  
  // Add custom validation rules
  field.validationRules?.forEach(rule => {
    if (rule.type === 'required') {
      validationRules.required = rule.message || 'This field is required';
    }
  });
  
  return (
    <div className="space-y-2">
      <Label 
        htmlFor={field.fieldName}
        className={field.isRequired ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
      >
        {field.label}
      </Label>
      
      <Controller
        name={field.fieldName}
        control={control}
        rules={validationRules}
        render={({ field: formField, fieldState }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={field.fieldName}
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formField.value && "text-muted-foreground",
                  fieldState.error && "border-destructive"
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formField.value ? (
                  format(new Date(formField.value), "PPP")
                ) : (
                  <span>{field.placeholder || "Select a date"}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formField.value ? new Date(formField.value) : undefined}
                onSelect={formField.onChange}
                disabled={disabled}
                fromDate={field.minDate}
                toDate={field.maxDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )}
      />
      
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      
      {formState.errors[field.fieldName] && (
        <p className="text-xs text-destructive">
          {formState.errors[field.fieldName]?.message?.toString()}
        </p>
      )}
    </div>
  );
};

// Preview component for the builder
export const DatePickerFieldPreview: React.FC<DatePickerFieldProps> = ({ field }) => {
  return (
    <div className="space-y-2">
      <Label 
        htmlFor={`preview-${field.fieldName}`}
        className={field.isRequired ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
      >
        {field.label}
      </Label>
      
      <Button
        id={`preview-${field.fieldName}`}
        variant="outline"
        className="w-full justify-start text-left font-normal text-muted-foreground"
        disabled
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        <span>{field.placeholder || "Select a date"}</span>
      </Button>
      
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
};

// Default props
export const datePickerFieldDefaultProps = {
  label: 'Date',
  placeholder: 'Select a date',
  helpText: '',
  isRequired: false,
  validationRules: []
};

// Icon for the component library
export const DatePickerFieldIcon = CalendarIcon;