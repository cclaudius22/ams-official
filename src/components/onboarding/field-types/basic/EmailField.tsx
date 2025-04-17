// src/components/onboarding/field-types/basic/EmailField.tsx
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';

export interface EmailFieldProps {
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
  };
  disabled?: boolean;
}

export const EmailField: React.FC<EmailFieldProps> = ({ 
  field, 
  disabled = false 
}) => {
  const { control } = useFormContext();
  
  // Email validation pattern
  const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  
  // Create validation rules
  const validationRules: Record<string, any> = {
    pattern: {
      value: emailPattern,
      message: 'Please enter a valid email address'
    }
  };
  
  if (field.isRequired) {
    validationRules.required = 'Email address is required';
  }
  
  // Add any custom validation rules
  field.validationRules?.forEach(rule => {
    if (rule.type === 'required') {
      validationRules.required = rule.message || 'Email address is required';
    } else if (rule.type === 'pattern') {
      validationRules.pattern = {
        value: new RegExp(rule.value || emailPattern),
        message: rule.message || 'Please enter a valid email address',
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
              <Mail className="h-4 w-4" />
            </div>
            <Input
              id={field.fieldName}
              type="email"
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
export const EmailFieldPreview: React.FC<EmailFieldProps> = ({ field }) => {
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
          <Mail className="h-4 w-4" />
        </div>
        <Input
          id={`preview-${field.fieldName}`}
          type="email"
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
export const emailFieldDefaultProps = {
  label: 'Email Address',
  placeholder: 'name@example.com',
  helpText: '',
  isRequired: true,
  validationRules: [
    {
      type: 'pattern',
      value: '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$',
      message: 'Please enter a valid email address'
    }
  ]
};

// The icon for the component library
export const EmailFieldIcon = Mail;