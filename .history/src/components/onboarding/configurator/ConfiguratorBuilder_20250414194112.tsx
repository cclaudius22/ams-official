// src/components/onboarding/configurator/ConfiguratorBuilder.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react'; // Added useMemo
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from '@/components/ui/sonner'; // Or sonner

// *** PROVIDER IMPORT AT TOP LEVEL ***
import { ConfiguratorProvider, useConfigurator } from '@/contexts/ConfiguratorContext'; // Correct context path? Check your folder structure

import ConfigurationDetailsForm from './ConfigurationDetailsForm';
import StepsListPanel from './StepsListPanel';
import StepEditorPanel from './StepEditorPanel';
import ComponentLibraryPanel from './ComponentLibraryPanel';
// import PreviewPanel from './PreviewPanel'; // Still commented out for now
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnboardingConfiguration } from './types';
// Mock service call - replace with actual service
// import { getConfiguration } from '@/services/onboardingService';

// --- Mock fetch function - replace with your actual service call ---
const getConfiguration = async (id: string): Promise<OnboardingConfiguration> => {
  console.log(`MOCK: Fetching configuration ${id}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
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
        title: 'Initial Details',
        description: 'Basic info collected first.',
        order: 0,
        fields: [
            { id: `field-sample-${id}-1`, type: 'text', label: 'Full Name', fieldName: 'fullName', isRequired: true, order: 0 },
            { id: `field-sample-${id}-2`, type: 'email', label: 'Work Email', fieldName: 'workEmail', isRequired: true, order: 1 },
        ]
      },
      {
        id: sampleStepId2,
        title: 'Address Information',
        description: 'Where the user works.',
        order: 1,
        fields: [
             { id: `field-sample-${id}-3`, type: 'text', label: 'Street Address', fieldName: 'address.street', isRequired: false, order: 0 },
        ]
      }
    ]
  };
};
// --- End Mock Fetch ---


// --- Inner UI Component ---
// This component renders the actual UI and assumes it's running INSIDE the ConfiguratorProvider
function ConfiguratorUI() {
  const { state, dispatch } = useConfigurator();
  const [activeTab, setActiveTab] = useState('builder');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Verify this handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeDataType = active.data.current?.type;
      const overDataType = over.data.current?.type; // Type of the item being dropped onto

      console.log(`Drag End: Active (${active.id}, type=${activeDataType}), Over (${over.id}, type=${overDataType})`);

      // Check if dragging a STEP over another STEP
      if (activeDataType === 'step' && overDataType === 'step') {
        dispatch({ type: 'REORDER_STEPS', payload: { activeId: String(active.id), overId: String(over.id) } });
      }
      // Check if dragging a FIELD over another FIELD
      else if (activeDataType === 'field' && overDataType === 'field') {
        const activeStepId = active.data.current?.stepId;
        const overStepId = over.data.current?.stepId; // The step the target field belongs to

        // Crucial check: Ensure both fields belong to the SAME step AND that step is the currently active one
        // (Prevents accidental cross-step reordering if UI structure allowed it)
        if (activeStepId && activeStepId === overStepId && activeStepId === state.activeStepId) {
           dispatch({ type: 'REORDER_FIELDS', payload: { stepId: activeStepId, activeId: String(active.id), overId: String(over.id) } });
        } else {
           console.warn("Attempted field drag operation across different steps or into an inactive step context.");
           toast({ title: "Cannot Move Field", description: "Fields can only be reordered within the same active step.", variant: "destructive"})
        }
      }
       else {
         console.log("Drag operation ignored - items are not of compatible types or not moved over a sortable item of the same type.");
       }
    } else {
        console.log("Drag ended without moving or over a valid target.");
    }
  };


  // Render loading state based on context (if loading an existing config)
  if (state.isLoading && state.configuration.id) {
       return <div className="p-10 text-center">Loading configuration...</div>;
  }

  return (
    // DND Context wraps the entire draggable/droppable area
    <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header is outside the main scrollable content usually */}
        <ConfiguratorHeader />

        {/* Main Content Area with Tabs */}
        <div className="flex-1 overflow-hidden border-t border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            {/* Tabs Navigation */}
            <div className="px-6 pt-4 border-b bg-white">
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
                  <div className="col-span-12 md:col-span-3 border-r border-gray-200 bg-white overflow-y-auto p-4">
                    <StepsListPanel />
                  </div>
                  {/* Center Panel: Step Editor */}
                  <div className="col-span-12 md:col-span-6 border-r border-gray-200 bg-gray-50 overflow-y-auto p-4">
                     {/* Add key to force re-render/reset internal state if activeStep changes significantly */}
                     <StepEditorPanel key={state.activeStepId || 'no-active-step'} />
                  </div>
                  {/* Right Panel: Component Library */}
                  <div className="col-span-12 md:col-span-3 bg-white overflow-y-auto p-4">
                    <ComponentLibraryPanel />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="h-full overflow-y-auto p-6">
                 <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
                    Preview Panel - To be implemented in Phase 6.
                 </div>
                 {/* <PreviewPanel /> */}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </DndContext>
  );
}


// --- Main Exported Component ---
// This component fetches data and sets up the Provider
export default function ConfiguratorBuilder({ configId }: { configId?: string }) {
  const [initialConfigData, setInitialConfigData] = useState<OnboardingConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(!!configId); // True only if configId is provided

  useEffect(() => {
    let isMounted = true;
    if (configId) {
      setIsLoading(true); // Ensure loading state is true when fetching
      getConfiguration(configId)
        .then(data => {
          if (isMounted) {
            setInitialConfigData(data);
          }
        })
        .catch(err => {
          console.error("Failed to load config", err);
          toast({ title: "Error Loading Configuration", description: err.message || 'Could not fetch data.', variant: "destructive" });
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false); // Set loading false once fetch completes (success or error)
          }
        });
    } else {
        // If no configId, we are creating new, no initial fetch needed
        setIsLoading(false);
    }

    return () => { isMounted = false };
  }, [configId]);

  // Show global loading indicator ONLY when fetching existing data
  if (isLoading && configId) {
     return <div className="p-10 text-center">Loading configuration...</div>; // Use a proper Skeleton loader here
  }

  // Render Provider and UI. Pass null if creating new, or fetched data if editing.
  // The Provider handles the initial state logic based on initialConfig prop.
  return (
    // *** PROVIDER WRAPS THE UI ***
    <ConfiguratorProvider initialConfig={initialConfigData || undefined}>
      <ConfiguratorUI />
    </ConfiguratorProvider>
  );
}