// src/components/onboarding/configurator/ConfiguratorBuilder.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from 'sonner';

// Import Provider and Hook from context file
import { ConfiguratorProvider, useConfigurator } from '@/contexts/ConfiguratorContext';

// Import Child Components
import ConfiguratorHeader from './ConfiguratorHeader';
import ConfigurationDetailsForm from './ConfigurationDetailsForm';
import StepsListPanel from './StepsListPanel';
import StepEditorPanel from './StepEditorPanel';
import ComponentLibraryPanel from './ComponentLibraryPanel';
import FieldSettingsModal from './FieldSettingsModal';

// Import UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Layers, Settings, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
  const { state, dispatch } = useConfigurator();
  const [activeTab, setActiveTab] = useState('builder');

  // --- State for Field Settings Modal ---
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingFieldInfo, setEditingFieldInfo] = useState<{ stepId: string; fieldId: string } | null>(null);

  // Function to open the modal - passed down via props
  const openFieldSettings = (stepId: string, fieldId: string) => {
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
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-background/50">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Loading configurator...</p>
        </div>
      );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-background">
        <ConfiguratorHeader />
        
        <div className="flex-1 overflow-hidden border-t">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            {/* Enhanced Tabs Navigation */}
            <div className="px-6 pt-4 pb-0 border-b bg-background shadow-sm">
              <div className="flex items-center justify-between max-w-screen-2xl mx-auto w-full">
                <TabsList className="h-12">
                  <TabsTrigger value="details" className="flex items-center gap-2 px-4 h-10 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold">
                    <Settings className="h-4 w-4" />
                    <span>Configuration Details</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="builder" 
                    className="flex items-center gap-2 px-4 h-10 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold"
                    disabled={!state.detailsValidated}
                  >
                    <Layers className="h-4 w-4" />
                    <span>Form Builder</span>
                    {!state.detailsValidated && (
                      <span className="ml-1 text-xs text-muted-foreground">(Complete details first)</span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preview" 
                    className="flex items-center gap-2 px-4 h-10 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold"
                    disabled={!state.detailsValidated}
                  >
                    <Eye className="h-4 w-4" />
                    <span>Preview</span>
                    {!state.detailsValidated && (
                      <span className="ml-1 text-xs text-muted-foreground">(Complete details first)</span>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                {/* This space could be used for additional contextual actions based on active tab */}
                <div className="flex items-center gap-2">
                  {activeTab === 'builder' && (
                    <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {state.activeStepId ? `Editing: ${state.configuration.steps.find(s => s.id === state.activeStepId)?.title || 'Step'}` : 'No step selected'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="details" className="h-full overflow-y-auto p-0 m-0">
                <div className="max-w-3xl mx-auto py-8 px-4 md:px-8">
                  <h2 className="text-2xl font-semibold mb-6">Configuration Details</h2>
                  <div className="bg-card rounded-xl border shadow-sm p-6">
                    <ConfigurationDetailsForm />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="builder" className="h-full p-0 m-0 overflow-hidden">
                {/* Enhanced Builder Layout using Grid */}
                <div className="grid grid-cols-12 gap-0 h-full">
                  {/* Left Panel: Steps List with improved styling */}
                  <div className="col-span-12 md:col-span-3 border-r bg-card overflow-y-auto">
                    <div className="p-5 sticky top-0 bg-card z-10 border-b">
                      <h2 className="font-medium text-lg">Onboarding Steps</h2>
                      <p className="text-sm text-muted-foreground mt-1">Create and organize your workflow steps</p>
                    </div>
                    <div className="p-4">
                      <StepsListPanel />
                    </div>
                  </div>
                  
                  {/* Center Panel: Step Editor with improved styling */}
                  <div className="col-span-12 md:col-span-6 border-r bg-muted/30 overflow-y-auto">
                    <div className="p-5 sticky top-0 bg-muted/50 z-10 border-b backdrop-blur-sm">
                      <h2 className="font-medium text-lg">Step Editor</h2>
                      <p className="text-sm text-muted-foreground mt-1">Configure fields and layout for the selected step</p>
                    </div>
                    <div className="p-4">
                      <StepEditorPanel
                        key={state.activeStepId || 'no-active-step-selected'}
                        openFieldSettings={openFieldSettings}
                      />
                    </div>
                  </div>
                  
                  {/* Right Panel: Component Library with improved styling */}
                  <div className="col-span-12 md:col-span-3 bg-card overflow-y-auto">
                    <div className="p-5 sticky top-0 bg-card z-10 border-b">
                      <h2 className="font-medium text-lg">Component Library</h2>
                      <p className="text-sm text-muted-foreground mt-1">Drag and drop fields onto your form</p>
                    </div>
                    <div className="p-4">
                      <ComponentLibraryPanel />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="h-full overflow-y-auto p-0 m-0">
                <div className="max-w-screen-lg mx-auto py-8 px-4">
                  <h2 className="text-2xl font-semibold mb-6">Form Preview</h2>
                  <div className="bg-card rounded-xl border shadow-sm p-8 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="text-center p-8">
                      <div className="bg-muted/50 rounded-full p-4 inline-flex mb-4">
                        <Eye className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Preview Coming Soon</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        The preview functionality will be implemented in Phase 6. You'll be able to see a live version of your form here.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Field Settings Modal - Rendered conditionally */}
        {editingFieldInfo && (
          <FieldSettingsModal
            isOpen={isSettingsModalOpen}
            onOpenChange={(open) => {
              if (!open) {
                setEditingFieldInfo(null);
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
  const [isLoading, setIsLoading] = useState(!!configId);

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
      setIsLoading(false);
      setInitialConfigData(null);
    }

    return () => { isMounted = false };
  }, [configId]);

  // Show enhanced loading state
  if (isLoading && configId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
        <p className="text-lg font-medium">Loading Configuration...</p>
        <p className="text-sm text-muted-foreground mt-2">Preparing your form builder experience</p>
      </div>
    );
  }

  return (
    <ConfiguratorProvider initialConfig={initialConfigData || undefined}>
      <ConfiguratorUI />
    </ConfiguratorProvider>
  );
}
