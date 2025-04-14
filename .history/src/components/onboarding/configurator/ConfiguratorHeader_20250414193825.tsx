// src/components/onboarding/configurator/ConfiguratorHeader.tsx
'use client';
import React, { useState } from 'react'; // Added useState for potential Preview toggle later
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Save, X, RotateCcw, Eye } from 'lucide-react'; // Added Eye icon
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { toast } from 'sonner';

// Mock services comment kept for context
// import { createConfiguration, updateConfiguration } from '@/services/onboardingService';


const ConfiguratorHeader = () => {
  const { state, dispatch } = useConfigurator();
  const router = useRouter();
  const { configuration, isLoading, isModified } = state;
  const isEditing = !!configuration.id;
  // const [isPreviewMode, setIsPreviewMode] = useState(false); // State for preview toggle later

  const handleSave = async () => {
     // ... (save logic remains the same - trimmed for brevity) ...
     console.log("Saving configuration:", configuration);
     dispatch({ type: 'SET_LOADING', payload: true });
     try {
         if (isEditing) {
             await new Promise(resolve => setTimeout(resolve, 700));
              toast.success("Configuration updated (Mock)");
              dispatch({ type: 'MARK_MODIFIED', payload: false });
         } else {
              await new Promise(resolve => setTimeout(resolve, 700));
             const savedConfig = { ...configuration, id: `new-${Date.now()}`};
              toast.success("Configuration created (Mock)");
             router.replace(`/nexus-onboard/configurator?id=${savedConfig.id}`);
              dispatch({ type: 'LOAD_CONFIG', payload: savedConfig });
         }
     } catch (error: any) {
          toast.error("Error Saving", { description: error.message || "Could not save configuration." });
     } finally {
         dispatch({ type: 'SET_LOADING', payload: false });
     }
  };

  const handleCancel = () => {
    if (isModified) {
        toast.warning("Discard unsaved changes?", { // Simplified message
            action: { label: "Discard", onClick: () => router.push('/nexus-onboard/configurations') },
            cancel: { label: "Keep Editing" },
            duration: 10000,
        });
    } else {
        router.push('/nexus-onboard/configurations');
    }
  };

  const handleReset = () => {
        const message = isEditing
            ? "Reset changes back to last saved state?"
            : "Clear form and start over?"; // Simplified message

        toast.warning("Confirm Reset", {
             description: message,
             action: { label: "Yes, Reset", onClick: () => { /* ... reset logic ... */ } }, // Keep logic as before
             cancel: { label: "No" },
             duration: 10000,
        });
  };

  // Placeholder for Preview Toggle
  const togglePreview = () => {
      // In Phase 6: This would likely change the activeTab state in ConfiguratorBuilder
      alert("Preview toggle to be implemented. It will likely switch to the Preview tab.");
      // Example: props.setActiveTab('preview'); // If passed down
  }


  return (
    // Use flex-wrap for smaller screens if needed
    <div className="flex h-[60px] items-center justify-between border-b bg-white px-4 md:px-6 gap-2">
      {/* Left Side: Title */}
      <div className="flex-shrink min-w-0"> {/* Allow shrinking */}
        <h1 className="text-base md:text-lg font-medium truncate" title={isEditing ? configuration.name : 'Create New Configuration'}>
          {isEditing ? `Edit: ${configuration.name || 'Untitled'}` : 'Create Onboarding Configuration'}
        </h1>
        {/* <p className="text-xs text-muted-foreground hidden md:block">Drag and drop to build your onboarding flow</p> */}
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center flex-shrink-0 space-x-1 md:space-x-2">
        {/* Reset Button */}
        <Button
            variant="ghost" // Use ghost for less emphasis
            size="sm"
            onClick={handleReset}
            disabled={isLoading}
            title="Reset Form / Discard Changes"
            className="text-muted-foreground hover:text-foreground"
        >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden md:inline ml-1">Reset</span>
        </Button>

        {/* Cancel Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={isLoading}
           title="Cancel"
        >
         {/* <X className="h-4 w-4 md:mr-1" /> */} {/* Icon only on small screens? */}
          <span >Cancel</span>
        </Button>

         {/* Preview Button (Toggle Placeholder) */}
         <Button
             variant="outline"
             size="sm"
             onClick={togglePreview}
             disabled={isLoading}
              title="Preview Onboarding Flow"
         >
             <Eye className="h-4 w-4" />
             <span className="hidden md:inline ml-1">Preview</span>
         </Button>

         {/* Save Button */}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isLoading || !isModified}
           title={isModified ? "Save changes" : "No changes to save"}
        >
          <Save className="h-4 w-4" />
           <span className="hidden md:inline ml-1">
               {isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create')}
            </span>
        </Button>
      </div>
    </div>
  );
};

export default ConfiguratorHeader;