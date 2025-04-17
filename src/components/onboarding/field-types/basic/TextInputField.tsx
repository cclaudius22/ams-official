// src/components/onboarding/field-types/basic/TextInputField.tsx
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextCursorInput } from 'lucide-react';

export interface TextInputFieldProps {
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

export const TextInputField: React.FC<TextInputFieldProps> = ({ 
  field, 
  disabled = false 
}) => {
  const { control } = useFormContext();
  
  // Create validation rules from field props
  const validationRules: Record<string, any> = {};
  
  if (field.isRequired) {
    validationRules.required = 'This field is required';
  }
  
  // Add any custom validation rules
  field.validationRules?.forEach(rule => {
    if (rule.type === 'required') {
      validationRules.required = rule.message || 'This field is required';
    } else if (rule.type === 'minLength') {
      validationRules.minLength = {
        value: rule.value,
        message: rule.message || `Minimum length is ${rule.value} characters`,
      };
    } else if (rule.type === 'maxLength') {
      validationRules.maxLength = {
        value: rule.value,
        message: rule.message || `Maximum length is ${rule.value} characters`,
      };
    } else if (rule.type === 'pattern') {
      validationRules.pattern = {
        value: new RegExp(rule.value),
        message: rule.message || 'Invalid format',
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
          <>
            <Input
              id={field.fieldName}
              placeholder={field.placeholder}
              {...formField}
              disabled={disabled}
              className={fieldState.error ? 'border-destructive' : ''}
            />
            
            {field.helpText && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
              
              {fieldState.error && (
                <p className="text-xs text-destructive">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
      </div>
    );
  };
  
  // Preview component for the builder
  export const TextInputPreview: React.FC<TextInputFieldProps> = ({ field }) => {
    return (
      <div className="space-y-2">
        <Label 
          htmlFor={`preview-${field.fieldName}`}
          className={field.isRequired ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
        >
          {field.label}
        </Label>
        
        <Input
          id={`preview-${field.fieldName}`}
          placeholder={field.placeholder}
          disabled
        />
        
        {field.helpText && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
      </div>
    );
  };
  
  // For configurator component, we can temporarily use a placeholder:
  export const TextFieldConfigurator: React.FC<any> = () => {
    return <div>Text Field Configurator</div>;
  };
  
  // Default props for this field type
  export const textInputDefaultProps = {
    label: 'Text Input',
    placeholder: 'Enter text',
    helpText: '',
    isRequired: false,
    validationRules: []
  };
  
  // The icon for the component library
  export const TextInputIcon = TextCursorInput;