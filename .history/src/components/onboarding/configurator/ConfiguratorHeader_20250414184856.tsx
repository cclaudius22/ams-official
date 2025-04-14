// src/components/onboarding/configurator/ConfiguratorHeader.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Save, X, RotateCcw } from 'lucide-react'; // Removed Eye/Edit for now
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { toast } from 'sonner'; // Use sonner

// Mock services comment kept for context
// import { createConfiguration, updateConfiguration } from '@/services/onboardingService';


const ConfiguratorHeader = () => {
  const { state, dispatch } = useConfigurator();
  const router = useRouter();
  const { configuration, isLoading, isModified } = state;
  const isEditing = !!configuration.id; // Check if we have an ID (i.e., editing existing)

  const handleSave = async () => {
     // ... (save logic remains the same) ...
     console.log("Saving configuration:", configuration);
     dispatch({ type: 'SET_LOADING', payload: true });

     try {
         if (isEditing) {
             // await updateConfiguration(configuration.id!, configuration);
             await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call
              toast.success("Configuration updated (Mock)");
              dispatch({ type: 'MARK_MODIFIED', payload: false }); // Reset modified after save
         } else {
             // const savedConfig = await createConfiguration(configuration);
              await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call
             const savedConfig = { ...configuration, id: `new-${Date.now()}`}; // Mock response
              toast.success("Configuration created (Mock)");
             // Navigate to edit mode for the newly created config
             router.replace(`/nexus-onboard/configurator?id=${savedConfig.id}`);
              dispatch({ type: 'LOAD_CONFIG', payload: savedConfig }); // Load the saved config with ID into state
         }
     } catch (error: any) {
          toast.error("Error Saving", { description: error.message || "Could not save configuration." });
     } finally {
         dispatch({ type: 'SET_LOADING', payload: false });
     }
  };

  const handleCancel = () => {
    if (isModified) {
        toast.warning("You have unsaved changes. Are you sure you want to cancel?", {
            action: {
                label: "Yes, Cancel",
                onClick: () => router.push('/nexus-onboard/configurations'), // Navigate back
            },
            cancel: {
                label: "No",
            },
            duration: 10000, // Keep toast longer for confirmation
        });
    } else {
        router.push('/nexus-onboard/configurations');
    }
  };

  // Verify this reset logic
  const handleReset = () => {
        const message = isEditing
            ? "Reset all changes made in this session back to the last saved state?"
            : "Clear the entire form and start creating a new configuration from scratch?";

        toast.warning("Confirm Reset", {
             description: message,
             action: {
                 label: "Yes, Reset",
                 onClick: () => {
                    if (isEditing) {
                         // Option A: Reload the page to refetch the original data
                         window.location.reload();
                         // Option B (More complex, not implemented):
                         // Need to store originalConfig on load and dispatch an action
                         // dispatch({ type: 'RESET_TO_ORIGINAL', payload: originalConfig });
                     } else {
                         // Dispatch RESET_CONFIG for a new configuration
                         dispatch({ type: 'RESET_CONFIG' });
                     }
                     toast.info("Configuration reset.");
                 }
             },
             cancel: {
                 label: "No"
             },
             duration: 10000,
        });
  };

  return (
    <div className="flex h-[60px] items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-lg font-medium">
          {isEditing ? `Edit Configuration: ${configuration.name || 'Untitled'}` : 'Create New Onboarding Configuration'}
        </h1>
      </div>
      <div className="space-x-2 flex items-center">
        {/* Use sonner style confirmation for Reset */}
        <Button
            variant="outline"
            size="sm"
            onClick={handleReset} // Calls the refined handler
            disabled={isLoading}
            title="Reset Form"
        >
            <RotateCcw className="h-4 w-4" />
        </Button>
        {/* Use sonner style confirmation for Cancel */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel} // Calls the refined handler
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isLoading || !isModified} // Disable if loading or no changes made
        >
          <Save className="h-4 w-4 mr-1" />
          {isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Configuration')}
        </Button>
      </div>
    </div>
  );
};

export default ConfiguratorHeader;