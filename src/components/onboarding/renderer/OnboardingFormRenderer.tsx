// src/components/onboarding/renderer/OnboardingFormRenderer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form'; // Import FormProvider
import { zodResolver } from '@hookform/resolvers/zod'; // Optional: for Zod schema validation
import * as z from 'zod'; // Optional: if using Zod
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { OnboardingConfiguration, StepConfig } from '@/components/onboarding/configurator/types'; // Adjust path
import RenderStepWrapper from './RenderStepWrapper'; // We'll create this next
import { toast } from 'sonner';

interface OnboardingFormRendererProps {
  configuration: OnboardingConfiguration;
  initialData?: Record<string, any>; // Optional initial form data (e.g., from session)
  onSubmit: (data: Record<string, any>) => void; // Function to call on final submit
}

// Optional: Define a base Zod schema if you want schema validation
// This is complex to generate dynamically from config, so start without it or use basic validation
// const formSchema = z.object({ /* ... Define schema based on config ... */ });

const OnboardingFormRenderer = ({
  configuration,
  initialData = {},
  onSubmit
}: OnboardingFormRendererProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Sort steps by order just in case config isn't pre-sorted
  const sortedSteps = React.useMemo(
      () => [...configuration.steps].sort((a, b) => a.order - b.order),
      [configuration.steps]
  );

  const activeStepConfig = sortedSteps[currentStepIndex];
  const isLastStep = currentStepIndex === sortedSteps.length - 1;

  // --- React Hook Form Setup ---
  const methods = useForm<Record<string, any>>({
    // resolver: zodResolver(formSchema), // Optional Zod resolver
    defaultValues: initialData, // Load initial data if provided
    mode: 'onBlur', // Validate on blur
  });
  const { handleSubmit, trigger, formState: { errors, isValid } } = methods;
  // --- End RHF Setup ---


  // --- Navigation Logic ---
  const handleNext = async () => {
    // Validate fields ONLY for the current step before proceeding
    const fieldsToValidate = activeStepConfig.fields.map(f => f.fieldName); // Get field names for current step
    const isValidStep = await trigger(fieldsToValidate); // Trigger validation for current step fields

    if (isValidStep && currentStepIndex < sortedSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      window.scrollTo(0, 0); // Scroll to top on step change
    } else if (!isValidStep) {
       toast.error("Validation Error", { description: "Please fix the errors before proceeding." });
       console.log("Step Validation Errors:", errors);
    }
     // If it's the last step, the main submit button handles the final submission
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      window.scrollTo(0, 0); // Scroll to top
    }
  };

  // Handle final form submission
  const onFinalSubmit = (data: Record<string, any>) => {
    console.log('Final Form Data:', data);
    toast.success("Onboarding Submitted!", { description: "Data logged to console." });
    onSubmit(data); // Call the passed onSubmit function
  };

  const onFinalSubmitError = (errs: any) => {
     console.error("Final Submission Errors:", errs);
     toast.error("Submission Failed", { description: "Please review the form for errors." });
  }
  // --- End Navigation Logic ---


  return (
    // Provide RHF methods to all children via FormProvider
    <FormProvider {...methods}>
       {/* Use form tag for semantics and potential native browser features */}
      <form onSubmit={handleSubmit(onFinalSubmit, onFinalSubmitError)} className="space-y-6">
        {/* Optional: Progress Indicator */}
        <div className="text-center text-sm text-muted-foreground mb-4">
          Step {currentStepIndex + 1} of {sortedSteps.length}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{activeStepConfig.title}</CardTitle>
            {activeStepConfig.description && (
              <CardDescription>{activeStepConfig.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {/* Render the content for the active step */}
             <RenderStepWrapper
                stepConfig={activeStepConfig}
                // Pass RHF methods/state if needed by wrapper or switch
                // control={methods.control}
                // register={methods.register}
                // errors={errors}
             />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button" // Prevent default form submission
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {isLastStep ? (
            <Button type="submit"> {/* Default type is submit */}
              Submit Onboarding
              <Send className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Next Step
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default OnboardingFormRenderer;