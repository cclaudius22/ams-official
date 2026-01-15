// src/components/onboarding/field-types/identity/IdentityDocumentScan.tsx

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScanLine, Upload, Check } from 'lucide-react';

// Form Component (used in actual forms)
export const IdentityDocumentScanField = ({ field, disabled = false }) => {
  const { control } = useFormContext();
  
  return (
    <Controller
      name={field.fieldName}
      control={control}
      defaultValue=""
      rules={{
        required: field.isRequired ? 'This field is required' : false,
      }}
      render={({ field: controllerField, fieldState }) => (
        <div className="space-y-2">
          <div className="font-medium text-sm">{field.label}</div>
          {field.helpText && (
            <p className="text-sm text-muted-foreground">{field.helpText}</p>
          )}
          
          {!controllerField.value ? (
            <Card className="p-6 border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <ScanLine className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Upload ID Document</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a clear photo of your passport, driver's license, or national ID
                </p>
                <Button 
                  variant="outline"
                  disabled={disabled}
                  onClick={() => {
                    // Mock functionality for demo
                    console.log('Scanning document...');
                    // Simulate successful scan
                    setTimeout(() => {
                      controllerField.onChange('mock-document-scan-1234');
                    }, 1000);
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Select ID Document
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 border-2 border-primary/50">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-medium mb-2">ID Document Verified</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your ID document has been successfully uploaded and verified
                </p>
                {!disabled && (
                  <Button 
                    variant="outline" 
                    onClick={() => controllerField.onChange('')}
                  >
                    Replace Document
                  </Button>
                )}
              </div>
            </Card>
          )}
          {fieldState.error && (
            <p className="text-sm text-destructive">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
};

// Preview Component (used in preview mode - simplified version)
export const IdentityDocumentScanPreview = ({ field }) => {
  return (
    <div className="space-y-2">
      <div className="font-medium text-sm">{field.label}</div>
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
      <Card className="p-4 border-dashed border-2">
        <div className="flex flex-col items-center text-center">
          <ScanLine className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            ID Document Upload & Verification
          </p>
        </div>
      </Card>
    </div>
  );
};

// Default props
export const identityDocumentScanDefaultProps = {
  label: 'Identity Document',
  helpText: 'Please upload a valid government-issued ID',
  isRequired: false,
  validationRules: []
};

// Icon for registry
export const IdentityDocumentScanIcon = ScanLine;