// src/components/onboarding/field-types/identity/AddressField.tsx
import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface AddressFieldProps {
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
    addressFormat?: 'simple' | 'detailed';
  };
  disabled?: boolean;
}

export const AddressField: React.FC<AddressFieldProps> = ({ 
  field, 
  disabled = false 
}) => {
  const { control } = useFormContext();
  
  // Create validation rules
  const validationRules: Record<string, any> = {};
  
  if (field.isRequired) {
    validationRules.required = 'Address is required';
  }
  
  // Add any custom validation rules
  field.validationRules?.forEach(rule => {
    if (rule.type === 'required') {
      validationRules.required = rule.message || 'Address is required';
    } else if (rule.type === 'minLength') {
      validationRules.minLength = {
        value: rule.value,
        message: rule.message || `Address must be at least ${rule.value} characters`,
      };
    }
  });
  
  // Determine if we're using simple (single textarea) or detailed (multiple fields) format
  const isDetailedFormat = field.addressFormat === 'detailed';
  
  if (isDetailedFormat) {
    // Detailed address format with multiple fields
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <Label className={field.isRequired ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
            {field.label}
          </Label>
        </div>
        
        {field.helpText && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
        
        <div className="space-y-3">
          {/* Street Address */}
          <div>
            <Label htmlFor={`${field.fieldName}.street`}>Street Address</Label>
            <Controller
              name={`${field.fieldName}.street`}
              control={control}
              rules={{ required: field.isRequired ? 'Street address is required' : false }}
              defaultValue=""
              render={({ field: formField, fieldState }) => (
                <>
                  <Input
                    id={`${field.fieldName}.street`}
                    placeholder="123 Main St"
                    className={fieldState.error ? 'border-destructive' : ''}
                    {...formField}
                    disabled={disabled}
                  />
                  {fieldState.error && (
                    <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>
                  )}
                </>
              )}
            />
          </div>
          
          {/* City, State/Province */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`${field.fieldName}.city`}>City</Label>
              <Controller
                name={`${field.fieldName}.city`}
                control={control}
                rules={{ required: field.isRequired ? 'City is required' : false }}
                defaultValue=""
                render={({ field: formField, fieldState }) => (
                  <>
                    <Input
                      id={`${field.fieldName}.city`}
                      placeholder="City"
                      className={fieldState.error ? 'border-destructive' : ''}
                      {...formField}
                      disabled={disabled}
                    />
                    {fieldState.error && (
                      <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>
                    )}
                  </>
                )}
              />
            </div>
            
            <div>
              <Label htmlFor={`${field.fieldName}.state`}>State/Province</Label>
              <Controller
                name={`${field.fieldName}.state`}
                control={control}
                rules={{ required: field.isRequired ? 'State/Province is required' : false }}
                defaultValue=""
                render={({ field: formField, fieldState }) => (
                  <>
                    <Input
                      id={`${field.fieldName}.state`}
                      placeholder="State/Province"
                      className={fieldState.error ? 'border-destructive' : ''}
                      {...formField}
                      disabled={disabled}
                    />
                    {fieldState.error && (
                      <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>
                    )}
                  </>
                )}
              />
            </div>
          </div>
          
          {/* Postal Code, Country */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`${field.fieldName}.postalCode`}>Postal Code</Label>
              <Controller
                name={`${field.fieldName}.postalCode`}
                control={control}
                rules={{ required: field.isRequired ? 'Postal code is required' : false }}
                defaultValue=""
                render={({ field: formField, fieldState }) => (
                  <>
                    <Input
                      id={`${field.fieldName}.postalCode`}
                      placeholder="Postal/ZIP Code"
                      className={fieldState.error ? 'border-destructive' : ''}
                      {...formField}
                      disabled={disabled}
                    />
                    {fieldState.error && (
                      <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>
                    )}
                  </>
                )}
              />
            </div>
            
            <div>
              <Label htmlFor={`${field.fieldName}.country`}>Country</Label>
              <Controller
                name={`${field.fieldName}.country`}
                control={control}
                rules={{ required: field.isRequired ? 'Country is required' : false }}
                defaultValue=""
                render={({ field: formField, fieldState }) => (
                  <>
                    <Input
                      id={`${field.fieldName}.country`}
                      placeholder="Country"
                      className={fieldState.error ? 'border-destructive' : ''}
                      {...formField}
                      disabled={disabled}
                    />
                    {fieldState.error && (
                      <p className="text-xs text-destructive mt-1">{fieldState.error.message}</p>
                    )}
                  </>
                )}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // Simple address format (single textarea)
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
              <div className="absolute left-3 top-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
              </div>
              <Textarea
                id={field.fieldName}
                placeholder={field.placeholder}
                className={`pl-9 min-h-[100px] ${fieldState.error ? 'border-destructive' : ''}`}
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
  }
};

// Preview component for the builder
export const AddressFieldPreview: React.FC<AddressFieldProps> = ({ field }) => {
  // Determine if we're using simple or detailed format
  const isDetailedFormat = field.addressFormat === 'detailed';
  
  if (isDetailedFormat) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <Label className={field.isRequired ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
            {field.label}
          </Label>
        </div>
        
        {field.helpText && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
        
        <Card className="border border-dashed">
          <CardContent className="p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="col-span-2">
                <p className="font-medium text-xs text-muted-foreground">Street Address</p>
                <div className="h-8 bg-muted/40 rounded mt-1"></div>
              </div>
              <div>
                <p className="font-medium text-xs text-muted-foreground">City</p>
                <div className="h-8 bg-muted/40 rounded mt-1"></div>
              </div>
              <div>
                <p className="font-medium text-xs text-muted-foreground">State/Province</p>
                <div className="h-8 bg-muted/40 rounded mt-1"></div>
              </div>
              <div>
                <p className="font-medium text-xs text-muted-foreground">Postal Code</p>
                <div className="h-8 bg-muted/40 rounded mt-1"></div>
              </div>
              <div>
                <p className="font-medium text-xs text-muted-foreground">Country</p>
                <div className="h-8 bg-muted/40 rounded mt-1"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } else {
    return (
      <div className="space-y-2">
        <Label 
          htmlFor={`preview-${field.fieldName}`}
          className={field.isRequired ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
        >
          {field.label}
        </Label>
        
        <div className="relative">
          <div className="absolute left-3 top-3 text-muted-foreground">
            <MapPin className="h-4 w-4" />
          </div>
          <Textarea
            id={`preview-${field.fieldName}`}
            placeholder={field.placeholder}
            className="pl-9 min-h-[100px]"
            disabled
          />
        </div>
        
        {field.helpText && (
          <p className="text-xs text-muted-foreground">{field.helpText}</p>
        )}
      </div>
    );
  }
};

// Default props for this field type
export const addressFieldDefaultProps = {
  label: 'Address',
  placeholder: 'Enter your full address',
  helpText: '',
  isRequired: true,
  addressFormat: 'simple',
  validationRules: [
    {
      type: 'minLength',
      value: 10,
      message: 'Please enter a complete address'
    }
  ]
};

// The icon for the component library
export const AddressFieldIcon = MapPin;