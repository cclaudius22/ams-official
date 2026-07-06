// src/components/onboarding/form/PreviewRenderer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { OnboardingConfiguration, OnboardingStep } from '@/types/onboarding';
import RenderStepWrapper from '../renderer/RenderStepWrapper';
import type { StepConfig } from '../configurator/types';

// Progress indicator component
interface ProgressIndicatorProps {
  steps: OnboardingStep[];
  currentStep: number;
  onStepChange: (stepIndex: number) => void;
}

const ProgressIndicator = ({ steps, currentStep, onStepChange }: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id || index}>
          <button
            type="button"
            onClick={() => onStepChange(index)}
            className={`flex flex-col items-center ${
              index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
            }`}
            disabled={index > currentStep}
          >
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center mb-2 ${
                index < currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : index === currentStep 
                    ? 'bg-primary/90 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className={`text-xs ${
              index === currentStep ? 'font-medium' : 'text-muted-foreground'
            }`}>
              {step.title}
            </span>
          </button>
          
          {index < steps.length - 1 && (
            <div className={`h-[1px] flex-1 mx-2 ${
              index < currentStep ? 'bg-primary' : 'bg-muted'
            }`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

interface PreviewRendererProps {
  configuration: OnboardingConfiguration;
  mode?: 'preview' | 'live';
  className?: string;
}

const PreviewRenderer: React.FC<PreviewRendererProps> = ({ 
  configuration, 
  mode = 'preview',
  className = '' 
}) => {
  console.log("PreviewRenderer received configuration:", configuration);
  
  const [currentStep, setCurrentStep] = useState(0);
  
  // Setup form context with react-hook-form
  const methods = useForm();
  const { handleSubmit, watch, reset } = methods;
  const formData = watch();
  
  // Reset form when configuration changes
  useEffect(() => {
    console.log("Configuration changed, resetting form");
    reset();
  }, [configuration, reset]);
  
  // Safety check for valid configuration
  if (!configuration || !configuration.steps || !Array.isArray(configuration.steps)) {
    console.error("Invalid configuration:", configuration);
    return (
      <div className="p-6 bg-destructive/10 rounded-lg border border-destructive">
        <h3 className="text-lg font-medium text-destructive">Configuration Error</h3>
        <p className="mt-2">The form configuration is invalid or missing steps.</p>
      </div>
    );
  }
  
  // Filter steps based on conditions
  const visibleSteps = configuration.steps.filter(step => {
    // Add conditional logic here when needed
    return true;
  });
  
  console.log(`Configuration has ${visibleSteps.length} visible steps out of ${configuration.steps.length} total`);
  
  // Handle step navigation
  const goToNextStep = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
    // In a real app, this would submit the onboarding data
  };
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className={`${className} p-6`}>
        {visibleSteps.length > 0 ? (
          <>
            <ProgressIndicator 
              steps={visibleSteps} 
              currentStep={currentStep} 
              onStepChange={setCurrentStep} 
            />
            
            {/* Use our registry-enabled RenderStepWrapper */}
            {/* Legacy shape mismatch (OnboardingStep vs StepConfig); cast preserves existing runtime behavior */}
            <RenderStepWrapper
              stepConfig={visibleSteps[currentStep] as unknown as StepConfig}
              mode="preview"
            />
            
            <div className="mt-8 pt-4 border-t flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Step
              </Button>
              
              {currentStep < visibleSteps.length - 1 ? (
                <Button
                  type="button"
                  onClick={goToNextStep}
                >
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit">
                  Complete Onboarding
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">No visible steps to display. Check your configuration.</p>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default PreviewRenderer;