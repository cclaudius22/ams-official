// src/components/onboarding/field-types/identity/KycComponent.tsx

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CheckCircle } from 'lucide-react';

// Form Component (used in actual forms)
export const KycComponentField = ({ field, disabled = false }) => {
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
            <Card className="p-6 border-dashed border-2 hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center text-center">
                <ShieldCheck className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Verify Your Identity</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We need to verify your identity to comply with regulations
                </p>
                <Button 
                  variant="default"
                  disabled={disabled}
                  onClick={() => {
                    // In a real implementation, this would start KYC process
                    console.log('Starting KYC verification...');
                    // Mock a successful verification for demo
                    setTimeout(() => {
                      controllerField.onChange('kyc-verification-completed-123');
                    }, 1000);
                  }}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Start Verification
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 border-2 border-green-500/50 bg-green-50/50">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">Identity Verified</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your identity has been successfully verified
                </p>
                {!disabled && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => controllerField.onChange('')}
                  >
                    Redo Verification
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
export const KycComponentPreview = ({ field }) => {
  return (
    <div className="space-y-2">
      <div className="font-medium text-sm">{field.label}</div>
      {field.helpText && (
        <p className="text-sm text-muted-foreground">{field.helpText}</p>
      )}
      <Card className="p-4 border-dashed border-2">
        <div className="flex flex-col items-center text-center">
          <ShieldCheck className="h-6 w-6 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Identity Verification (KYC)
          </p>
        </div>
      </Card>
    </div>
  );
};

// Default props
export const kycComponentDefaultProps = {
  label: 'Identity Verification',
  helpText: 'Complete identity verification to continue',
  isRequired: false,
  validationRules: []
};
