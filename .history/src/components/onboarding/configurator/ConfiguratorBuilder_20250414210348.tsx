// src/components/onboarding/configurator/ConfiguratorBuilder.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from 'sonner'; // Use sonner

// Import Provider and Hook from context file
import { ConfiguratorProvider, useConfigurator } from '@/contexts/ConfiguratorContext'; // Adjust path if needed

// Import Child Components
import ConfiguratorHeader from './ConfiguratorHeader';
import ConfigurationDetailsForm from './ConfigurationDetailsForm';
import StepsListPanel from './StepsListPanel';
import StepEditorPanel from './StepEditorPanel';
import ComponentLibraryPanel from './ComponentLibraryPanel';
import FieldSettingsModal from './FieldSettingsModal'; // Import the modal
// import PreviewPanel from './PreviewPanel'; // PreviewPanel not yet implemented

// Import UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import Types
import { OnboardingConfiguration } from './types';

// --- Mock fetch function - Replace with your actual API service call ---
const getConfiguration = async (id: string): Promise<OnboardingConfiguration> => {
  console.log(`MOCK: Fetching configuration ${id}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  // Return a more detailed sample configuration for testing editing mode
  const sampleStepId1 = `step-sample-${id}-1`;
  const sampleStepId2 = `step-sample-${id}-2`;
  return {
    id: id,
    name: `Loaded Config ${id}`,
    key: `loaded-config-${id}`,
    targetUserType: 'admin',
    targetOrgType: 'enterprise',
    version: 2,
    isActive: true,
    securityLevel: 'enhanced',
    steps: [
      {
        id: sampleStepId1,
        title: 'User Profile',
        description: 'Basic user identification.',
        order: 0,
        fields: [
            { id: `field-sample-${id}-1`, type: 'text', label: 'Full Name', fieldName: 'fullName', isRequired: true, order: 0 },
            { id: `field-sample-${id}-2`, type: 'email', label: 'Work Email', fieldName: 'workEmail', isRequired: true, order: 1, placeholder: 'Enter work email' },
        ]
      },
      {
        id: sampleStepId2,
        title: 'Contact Information',
        description: 'How to reach the user.',
        order: 1,
        fields: [
             { id: `field-sample-${id}-3`, type: 'phone', label: 'Mobile Phone', fieldName: 'mobilePhone', isRequired: false, order: 0 },
             { id: `field-sample-${id}-4`, type: 'text', label: 'Office Extension', fieldName: 'officeExt', isRequired: false, order: 1 },
        ]
      }
    ]
  };
};
// --- End Mock Fetch ---


// --- Inner UI Component ---
// Renders the actual UI and uses the context provided by ConfiguratorBuilder
function ConfiguratorUI() {
  const { state, dispatch } = useConfigurator(); // Hook works because this runs inside the Provider
  const [activeTab, setActiveTab] = useState('builder'); // Default tab

  // --- State for Field Settings Modal ---
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingFieldInfo, setEditingFieldInfo] = useState<{ stepId: string; fieldId: string } | null>(null);

  // Function to open the modal - passed down via props
  const openFieldSettings = (stepId: string, fieldId: string) => {
      // Ensure the step and field actually exist before trying to open settings
       const stepExists = state.configuration.steps.find(s => s.id === stepId);
       const fieldExists = stepExists?.fields.find(f => f.id === fieldId);
       if (stepExists && fieldExists) {
           setEditingFieldInfo({ stepId, fieldId });
           setIsSettingsModalOpen(true);
       } else {
           console.error("Attempted to open settings for non-existent step/field:", stepId, fieldId);
            toast.error("Error", { description: "Could not find the field to edit." });
       }
  };
  // --- End Modal State ---


  // --- DND Setup ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const activeDataType = active.data.current?.type;
      const overDataType = over.data.current?.type;

      if (activeDataType === 'step' && overDataType === 'step') {
        dispatch({ type: 'REORDER_STEPS', payload: { activeId: String(active.id), overId: String(over.id) } });
      } else if (activeDataType === 'field' && overDataType === 'field') {
        const activeStepId = active.data.current?.stepId;
        const overStepId = over.data.current?.stepId;
        if (activeStepId && activeStepId === overStepId && activeStepId === state.activeStepId) {
           dispatch({ type: 'REORDER_FIELDS', payload: { stepId: activeStepId, activeId: String(active.id), overId: String(over.id) } });
        } else {
           toast.error("Cannot Move Field", { description: "Fields can only be reordered within the same active step."});
        }
      }
    }
  };
  // --- End DND Setup ---

  // Render loading indicator from context state
  if (state.isLoading) {
       return <div className="p-10 text-center">Loading...</div>; // Simple loading text
  }

  return (
    // DND Context wraps the entire interactive area
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-background"> {/* Use theme background */}
        <ConfiguratorHeader />

        <div className="flex-1 overflow-hidden border-t"> {/* Use theme border */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            {/* Tabs Navigation */}
            <div className="px-6 pt-4 border-b bg-card"> {/* Use theme card background */}
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="builder">Builder</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="details" className="h-full overflow-y-auto p-6">
                <ConfigurationDetailsForm />
              </TabsContent>

              <TabsContent value="builder" className="h-full p-0 m-0 overflow-hidden">
                {/* Builder Layout using Grid */}
                <div className="grid grid-cols-12 gap-0 h-full">
                  {/* Left Panel: Steps List */}
                  <div className="col-span-12 md:col-span-3 border-r bg-card overflow-y-auto p-4"> {/* Theme border/bg */}
                    <StepsListPanel />
                  </div>
                  {/* Center Panel: Step Editor */}
                  <div className="col-span-12 md:col-span-6 border-r bg-muted/40 overflow-y-auto p-4"> {/* Theme border/bg */}
                     {/* Key prop helps reset internal state of editor if active step changes */}
                     <StepEditorPanel
                        key={state.activeStepId || 'no-active-step-selected'}
                        openFieldSettings={openFieldSettings} // Pass function to open modal
                     />
                  </div>
                  {/* Right Panel: Component Library */}
                  <div className="col-span-12 md:col-span-3 bg-card overflow-y-auto p-4"> {/* Theme bg */}
                    <ComponentLibraryPanel />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="h-full overflow-y-auto p-6">
                 <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
                    Preview Panel - To be implemented in Phase 6.
                 </div>
                 {/* <PreviewPanel /> */} {/* Placeholder for future preview component */}
              </TabsContent>
            </div>
          </Tabs>
        </div>

         {/* Field Settings Modal - Rendered conditionally */}
         {editingFieldInfo && (
             <FieldSettingsModal
                isOpen={isSettingsModalOpen}
                onOpenChange={(open) => { // Handle external close events (overlay, X button)
                    if (!open) {
                        setEditingFieldInfo(null); // Clear info when modal closes externally
                    }
                    setIsSettingsModalOpen(open);
                }}
                stepId={editingFieldInfo.stepId}
                fieldId={editingFieldInfo.fieldId}
             />
         )}

      </div>
    </DndContext>
  );
}


// --- Main Exported Component ---
// Fetches data (if editing) and sets up the Context Provider
export default function ConfiguratorBuilder({ configId }: { configId?: string }) {
  const [initialConfigData, setInitialConfigData] = useState<OnboardingConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(!!configId); // True only if configId is provided initially

  useEffect(() => {
    let isMounted = true;
    if (configId) {
      setIsLoading(true);
      getConfiguration(configId) // Replace with your actual API call
        .then(data => {
          if (isMounted) {
            setInitialConfigData(data);
          }
        })
        .catch(err => {
          console.error("Failed to load config", err);
          if (isMounted) {
             toast.error("Error Loading Configuration", { description: err.message || 'Could not fetch data.' });
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    } else {
        // No ID, creating new, set loading to false immediately
        setIsLoading(false);
        setInitialConfigData(null); // Ensure no stale data if navigating from edit to new
    }

    return () => { isMounted = false }; // Cleanup on unmount
  }, [configId]); // Re-run effect if configId changes

  // Show loading state *only* when fetching an existing config
  if (isLoading && configId) {
     // Use a more robust loading indicator if available (e.g., from shadcn)
     return <div className="flex justify-center items-center h-screen"><p>Loading Configuration...</p></div>;
  }

  // Render Provider and UI. initialConfig prop will be null/undefined for new, or data for edit.
  return (
    <ConfiguratorProvider initialConfig={initialConfigData || undefined}>
      <ConfiguratorUI />
    </ConfiguratorProvider>
  );
}