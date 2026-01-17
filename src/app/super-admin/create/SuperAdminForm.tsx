// src/app/super-admin/create/SuperAdminForm.tsx
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
  AlertTriangle,
  Loader2,
} from 'lucide-react';

import { OrganizationStep } from './steps/OrganizationStep';
import { AccountStep } from './steps/AccountStep';
import { SecurityStep } from './steps/SecurityStep';
import { ReviewStep } from './steps/ReviewStep';
import { useSuperAdminForm } from './hooks/useSuperAdminForm';
import { WIZARD_STEPS } from './types';

const SuperAdminForm: React.FC = () => {
  const {
    currentStep,
    errors,
    formMethods,
    isSubmitting,
    submitError,
    handleNext,
    handlePrevious,
    handleSubmit,
    goToStep,
    totalSteps,
  } = useSuperAdminForm();

  // Step renderer
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OrganizationStep />;
      case 2:
        return <AccountStep />;
      case 3:
        return <SecurityStep />;
      case 4:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Organization Setup</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  Create your organization and admin account
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <FormProvider {...formMethods}>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                {WIZARD_STEPS.map((step, index) => (
                  <React.Fragment key={step.id}>
                    {/* Step Circle */}
                    <button
                      type="button"
                      onClick={() => goToStep(step.id)}
                      className={`
                        flex items-center justify-center
                        w-10 h-10 rounded-full
                        font-medium text-sm
                        transition-all duration-200
                        ${step.id < currentStep
                          ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600'
                          : step.id === currentStep
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
                      `}
                      disabled={step.id > currentStep}
                    >
                      {step.id < currentStep ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </button>

                    {/* Connecting Line */}
                    {index < WIZARD_STEPS.length - 1 && (
                      <div className="flex-1 h-1 mx-2 bg-gray-200 rounded">
                        <div
                          className="h-full bg-green-500 rounded transition-all duration-300"
                          style={{
                            width: step.id < currentStep ? '100%' : '0%',
                          }}
                        />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-1">
                {WIZARD_STEPS.map((step) => (
                  <span
                    key={step.id}
                    className={`text-center ${
                      step.id === currentStep ? 'text-blue-600 font-medium' : ''
                    }`}
                  >
                    {step.title}
                  </span>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {(errors.length > 0 || submitError) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-600 mb-2">
                  <AlertTriangle className="h-5 w-5" />
                  <h4 className="font-medium">
                    {submitError ? 'Submission Error' : 'Please correct the following errors:'}
                  </h4>
                </div>
                {submitError ? (
                  <p className="text-sm text-red-600">{submitError}</p>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-600">
                        {error.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Step Content */}
            <div className="min-h-[400px]">{renderStep()}</div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
                className="px-6"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-6"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Organization
                      <Check className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </FormProvider>
        </CardContent>
      </Card>

      {/* Already have an account link */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/" className="text-blue-600 hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SuperAdminForm;
