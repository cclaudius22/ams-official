// src/app/nexus-onboard/demo/page.tsx
'use client'; // Essential for using hooks and rendering the form renderer

import React from 'react';
import OnboardingFormRenderer from '@/components/onboarding/renderer/OnboardingFormRenderer'; // Adjust path if needed

// Import the static configuration directly
// Make sure the path is correct relative to this file
import sampleConfigJson from '@/lib/sample-onboarding-config.json';
import { OnboardingConfiguration } from '@/components/onboarding/configurator/types'; 
import { toast } from 'sonner'; // For showing submission feedback

// Type assertion to ensure the imported JSON matches our type
const sampleConfig: OnboardingConfiguration = sampleConfigJson as OnboardingConfiguration;

export default function OnboardingDemoPage() {

  // Function to handle the final submission from the renderer
  const handleDemoSubmit = (formData: Record<string, any>) => {
    console.log("--- Onboarding Demo Submission ---");
    console.log(JSON.stringify(formData, null, 2)); // Pretty print the data
    console.log("---------------------------------");

    toast.success("Demo Form Submitted!", {
       description: "Check the browser console for the final form data.",
       duration: 5000, // Keep toast longer
    });

    // In a real scenario, you might send this data to an API endpoint
    // or update some client-side state.
  };

  // Basic error handling if config somehow fails to load
  if (!sampleConfig || !sampleConfig.steps || sampleConfig.steps.length === 0) {
     return (
        <div className="container mx-auto p-6 text-center text-destructive">
           Error: Failed to load or parse the sample onboarding configuration. Please check `src/lib/sample-onboarding-config.json`.
        </div>
     );
  }


  return (
    <div className="container mx-auto max-w-3xl py-8 px-4 md:px-0"> {/* Center content */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-semibold">Onboarding Demo</h1>
        <p className="text-muted-foreground">
           Rendering flow defined in: <code className="text-xs bg-muted px-1 py-0.5 rounded">{sampleConfig.name} ({sampleConfig.key})</code>
        </p>
      </div>

      {/* Render the form renderer with the static configuration */}
      <OnboardingFormRenderer
        configuration={sampleConfig}
        onSubmit={handleDemoSubmit}
        // Optionally pass initialData={} if needed for testing
      />
    </div>
  );
}