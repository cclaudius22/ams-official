// src/components/onboarding/configurator/ConfiguratorHeader.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation'; // Use 'next/navigation' in App Router
import { Button } from '@/components/ui/button';
import { Save, X, Eye, Edit, RotateCcw } from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext';
// Mock services - replace with actual implementations
// import { createConfiguration, updateConfiguration } from '@/services/onboardingService';
import { toast } from '@/components/ui/sonner';

const ConfiguratorHeader = () => {
  const { state, dispatch } = useConfigurator();
  const router = useRouter();
  const { configuration, isLoading, isModified } = state;
  const isEditing = !!configuration.id;

  const handleSave = async () => {
    console.log("Saving configuration:", configuration);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
        if (isEditing) {
            // await updateConfiguration(configuration.id!, configuration);
            await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call
             toast({ title: "Success (Mock)", description: "Configuration updated." });
             // Optionally reset modified flag after successful save
             // dispatch({ type: 'MARK_MODIFIED', payload: false }); // Or reload config from response
        } else {
            // const savedConfig = await createConfiguration(configuration);
             await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call
            const savedConfig = { ...configuration, id: `new-${Date.now()}`}; // Mock response
             toast({ title: "Success (Mock)", description: "Configuration created." });
            // Navigate to edit mode for the newly created config
            router.replace(`/nexus-onboard/configurator?id=${savedConfig.id}`); // Use replace to avoid back button going to 'new' state
             dispatch({ type: 'LOAD_CONFIG', payload: savedConfig }); // Load the saved config with ID
        }
    } catch (error: any) {
         toast({
             title: "Error Saving",
             description: error.message || "Could not save configuration.",
             variant: "destructive",
        });
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleCancel = () => {
    // TODO: Add confirmation if isModified is true
    if (isModified) {
        if(confirm("You have unsaved changes. Are you sure you want to cancel?")) {
            router.push('/nexus-onboard/configurations'); // Navigate back to list or dashboard
        }
    } else {
        router.push('/nexus-onboard/configurations');
    }
  };

   const handleReset = () => {
        if(confirm("Are you sure you want to reset the form to its initial state? This cannot be undone for a new configuration.")) {
           if (isEditing) {
             // Re-fetch initial config if editing? Or just reset modified flag?
             // For simplicity now, just reload the page for editing mode to refetch
             window.location.reload();
           } else {
             dispatch({ type: 'RESET_CONFIG' });
           }
        }
   }

  return (
    <div className="flex h-[60px] items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-lg font-medium">
          {isEditing ? `Edit Configuration: ${configuration.name || 'Untitled'}` : 'Create New Onboarding Configuration'}
        </h1>
        {/* Optional: Add subtitle or breadcrumbs here */}
      </div>
      <div className="space-x-2 flex items-center">
        <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isLoading}
            title="Reset Form"
        >
            <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
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
        {/* Add Preview Toggle Button Later */}
        {/* <Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button> */}
      </div>
    </div>
  );
};

export default ConfiguratorHeader;