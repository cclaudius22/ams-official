// src/components/onboarding/field-types/basic/PhoneField.tsx
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';

export interface PhoneFieldProps {
  field: {
    id: string;
    fieldName: string;
    label: string;
    placeholder?: string;
    helpText?: string;
    isRequired?: boolean;
    validationRules?: Array<{
      type: string;
      value?: any;
      message?: string;
    }>;
    format?: string;
  };
  disabled?: boolean;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({ 
  field, 
  disabled = false 
}) => {
  const { control } = useFormContext();
  
  // Phone validation pattern (basic international format)
  const phonePattern = /^\+?[1-9]\d{1,14}$/;
  
  // Create validation rules
  const validationRules: Record<string, any> = {
    pattern: {
      value: phonePattern,
      message: 'Please enter a valid phone number'
    }
  };
  
  if (field.isRequired) {
    validationRules.required = 'Phone number is required';
  }
  
  // Add any custom validation rules
  field.validationRules?.forEach(rule => {
    if (rule.type === 'required') {
      validationRules.required = rule.message || 'Phone number is required';
    } else if (rule.type === 'pattern') {
      validationRules.pattern = {
        value: new RegExp(rule.value || phonePattern),
        message: rule.message || 'Please enter a valid phone number',
      };
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
        defaultValue=""
        render={({ field: formField, fieldState }) => (
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Phone className="h-4 w-4" />
            </div>
            <Input
              id={field.fieldName}
              type="tel"
              placeholder={field.placeholder}
              className={`pl-9 ${fieldState.error ? 'border-destructive' : ''}`}
              {...formField}
              disabled={disabled}
            />
          </div>
        )}
      />
      
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      
      {fieldState.error && (
        <p className="text-xs text-destructive">{fieldState.error.message}</p>
      )}
    </div>
  );
};

// Preview component for the builder
export const PhoneFieldPreview: React.FC<PhoneFieldProps> = ({ field }) => {
  return (
    <div className="space-y-2">
      <Label 
        htmlFor={`preview-${field.fieldName}`}
        className={field.isRequired ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
      >
        {field.label}
      </Label>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          <Phone className="h-4 w-4" />
        </div>
        <Input
          id={`preview-${field.fieldName}`}
          type="tel"
          placeholder={field.placeholder}
          className="pl-9"
          disabled
        />
      </div>
      
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
};

// Default props for this field type
export const phoneFieldDefaultProps = {
  label: 'Phone Number',
  placeholder: '+1 (123) 456-7890',
  helpText: 'Include country code, e.g. +1 for US',
  isRequired: false,
  validationRules: [
    {
      type: 'pattern',
      value: '^\\+?[1-9]\\d{1,14}$',
      message: 'Please enter a valid phone number'
    }
  ]
};

// The icon for the component library
export const PhoneFieldIcon = Phone;