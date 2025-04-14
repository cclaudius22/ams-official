// src/components/onboarding/configurator/ConfiguratorBuilder.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from '@/components/ui/sonner'; // Or sonner

import { ConfiguratorProvider, useConfigurator } from '@/contexts/ConfiguratorContext';
import ConfiguratorHeader from './ConfiguratorHeader';
import ConfigurationDetailsForm from './ConfigurationDetailsForm';
import StepsListPanel from './StepsListPanel';
import StepEditorPanel from './StepEditorPanel';
import ComponentLibraryPanel from './ComponentLibraryPanel';
//import PreviewPanel from './PreviewPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnboardingConfiguration } from './types';
// Mock service call - replace with actual service
// import { getConfiguration } from '@/services/onboardingService';

// Mock fetch function - replace with your actual service call
const getConfiguration = async (id: string): Promise<OnboardingConfiguration> => {
  console.log(`MOCK: Fetching configuration ${id}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  // Return a sample configuration for testing editing mode
  const sampleStepId1 = 'step-sample-1';
  const sampleStepId2 = 'step-sample-2';
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
            { id: 'field-sample-1', type: 'text', label: 'Full Name', fieldName: 'fullName', isRequired: true, order: 0 },
            { id: 'field-sample-2', type: 'email', label: 'Work Email', fieldName: 'workEmail', isRequired: true, order: 1 },
        ]
      },
      {
        id: sampleStepId2,
        title: 'Address Information',
        description: 'Where the user works.',
        order: 1,
        fields: [
             { id: 'field-sample-3', type: 'text', label: 'Street Address', fieldName: 'address.street', isRequired: false, order: 0 },
        ]
      }
    ]
  };
};


// Inner component rendered inside the Provider to access context
function ConfiguratorUI() {
  const { state, dispatch } = useConfigurator();
  const [activeTab, setActiveTab] = useState('builder'); // Default tab

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // Adjust distance if needed
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // DND Handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeDataType = active.data.current?.type;
      const overDataType = over.data.current?.type;

      console.log(`Drag End: Active (${active.id}, type=${activeDataType}), Over (${over.id}, type=${overDataType})`);

      if (activeDataType === 'step' && overDataType === 'step') {
        // TODO: Dispatch REORDER_STEPS action
        // dispatch({ type: 'REORDER_STEPS', payload: { activeId: String(active.id), overId: String(over.id) } });
        console.log("Dispatch REORDER_STEPS (Not Implemented Yet)");
         toast({ title: "Step Reordering (Not Implemented)", description: "Reducer action needs implementation."});
      } else if (activeDataType === 'field' && overDataType === 'field') {
        const activeStepId = active.data.current?.stepId;
        const overStepId = over.data.current?.stepId;
        if (activeStepId && activeStepId === overStepId && activeStepId === state.activeStepId) {
          // TODO: Dispatch REORDER_FIELDS action
          // dispatch({ type: 'REORDER_FIELDS', payload: { stepId: activeStepId, activeId: String(active.id), overId: String(over.id) } });
          console.log("Dispatch REORDER_FIELDS (Not Implemented Yet)");
           toast({ title: "Field Reordering (Not Implemented)", description: "Reducer action needs implementation."});
        } else {
           console.warn("Field drag across steps or inactive step is not supported yet.");
        }
      }
    }
  };

  if (state.isLoading && !state.configuration.id) {
      // Show loading only when actively fetching an existing config
       return <div className="p-10 text-center">Loading configuration...</div>; // Replace with Skeleton loader
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-gray-50"> {/* Changed background */}
        <ConfiguratorHeader />

        <div className="flex-1 overflow-hidden border-t border-gray-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            {/* Tabs Navigation - Place above content areas */}
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
                     <StepEditorPanel key={state.activeStepId || 'no-step'} /> {/* Key change forces remount on step change */}
                  </div>
                  {/* Right Panel: Component Library */}
                  <div className="col-span-12 md:col-span-3 bg-white overflow-y-auto p-4">
                    <ComponentLibraryPanel />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="h-full overflow-y-auto p-6">
                <PreviewPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </DndContext>
  );
}


// Main component that sets up the Provider
export default function ConfiguratorBuilder({ configId }: { configId?: string }) {
  const [initialConfigData, setInitialConfigData] = useState<OnboardingConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(!!configId); // Only true initially if editing

  useEffect(() => {
    let isMounted = true;
    if (configId) {
      setIsLoading(true);
      getConfiguration(configId)
        .then(data => {
          if (isMounted) {
            setInitialConfigData(data);
          }
        })
        .catch(err => {
          console.error("Failed to load config", err);
          toast({ title: "Error Loading Configuration", description: err.message || 'Could not fetch data.', variant: "destructive" });
          // Maybe redirect or show an error component
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });
    } else {
        // If creating new, no initial loading needed, Provider will use default state
        setIsLoading(false);
    }

    return () => { isMounted = false }; // Cleanup function
  }, [configId]);

  // Display loading state only when fetching an existing config
  if (isLoading && configId) {
     return <div className="p-10 text-center">Loading configuration...</div>; // Use a proper Skeleton loader here
  }

  // Render the Provider and UI once loading is complete or if creating new
  // Pass initialConfigData which might be null (for new) or the fetched data (for edit)
  return (
    <ConfiguratorProvider initialConfig={initialConfigData || undefined}>
      <ConfiguratorUI />
    </ConfiguratorProvider>
  );
}