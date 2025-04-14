// src/super-admin/create/SuperAdminForm.tsx
'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  ChevronRight, 
  ChevronLeft,
  Check,
  AlertTriangle
} from 'lucide-react';

import { IdentityGovernmentStep } from './steps/IdentityGovernmentStep';
import { SecurityClearanceStep } from './steps/SecurityClearanceStep';
import { AccessEmergencyStep } from './steps/AccessEmergencyStep';
import { useSuperAdminForm } from './hooks/useSuperAdminForm';

const SuperAdminForm: React.FC = () => {
  const { 
    currentStep, 
    errors, 
    formMethods, 
    handleNext, 
    handlePrevious, 
    handleSubmit, 
    validateCurrentStep
  } = useSuperAdminForm();

  // Step renderer
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <IdentityGovernmentStep />
        );
      case 2:
        return (
          <SecurityClearanceStep />
        );
      case 3:
        return (
          <AccessEmergencyStep />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <CardTitle>Super Admin Security Profile Setup</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Step {currentStep} of 3</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <FormProvider {...formMethods}>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`flex items-center ${
                      step < currentStep ? 'text-green-600' : 
                      step === currentStep ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2
                      ${step < currentStep ? 'border-green-600 bg-green-50' : 
                        step === currentStep ? 'border-blue-600 bg-blue-50' : 
                        'border-gray-300 bg-gray-50'}
                    `}>
                      {step < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span>{step}</span>
                      )}
                    </div>
                    {step < 3 && (
                      <div className={`w-full h-1 mx-4 ${
                        step < currentStep ? 'bg-green-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm">
                <span>Identity & Government</span>
                <span>Security & Clearance</span>
                <span>Access & Emergency</span>
              </div>
            </div>

            {/* Error Display */}
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-600 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <h4 className="font-medium">Please correct the following errors:</h4>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">
                      {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Step Content */}
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  Complete Setup
                  <Check className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminForm;