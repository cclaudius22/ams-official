// src/components/onboarding/renderer/RenderStepWrapper.tsx
'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form'; // Import to access form methods if needed later, though not strictly required here
import { StepConfig } from '@/components/onboarding/configurator/types'; // Adjust path
import RenderFieldSwitch from './RenderFieldSwitch'; // We will create this next

interface RenderStepWrapperProps {
  stepConfig: StepConfig;
  // We might pass down RHF methods if complex interactions are needed here,
  // but RenderFieldSwitch will get them directly via FormProvider context
}

const RenderStepWrapper = ({ stepConfig }: RenderStepWrapperProps) => {
  // Optional: Access form context if needed directly in the wrapper
  // const methods = useFormContext();

  // Sort fields by order defined in the configuration
  const sortedFields = React.useMemo(
    () => [...stepConfig.fields].sort((a, b) => a.order - b.order),
    [stepConfig.fields]
  );

  return (
    <div className="space-y-6"> {/* Add spacing between fields */}
      {/* Optionally re-display title/description if not in CardHeader */}
      {/*
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{stepConfig.title}</h2>
        {stepConfig.description && <p className="text-muted-foreground">{stepConfig.description}</p>}
      </div>
      */}

      {/* Render fields using a flexible layout (e.g., grid) */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2"> {/* Basic 2-column grid */}
        {sortedFields.map((fieldConfig) => {
           // Determine column span based on layout hint
           const colSpan = fieldConfig.layoutHint === 'fullWidth'
             ? 'md:col-span-2' // Span full width on medium screens and up
             : 'md:col-span-1'; // Default to half width

           return (
             <div key={fieldConfig.id} className={colSpan}>
               <RenderFieldSwitch
                 fieldConfig={fieldConfig}
                 // Pass down RHF methods from context automatically via FormProvider
                 // No need to pass register, control, errors explicitly here
               />
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default RenderStepWrapper;