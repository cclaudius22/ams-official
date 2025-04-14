// src/components/onboarding/configurator/ConfiguratorBuilder.tsx
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react'; // Added useCallback
import { DndContext, closestCenter, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from 'sonner';

import { ConfiguratorProvider, useConfigurator } from '@/contexts/ConfiguratorContext'; // Adjust path if needed
import ConfiguratorHeader from './ConfiguratorHeader';
import ConfigurationDetailsForm from './ConfigurationDetailsForm';
import StepsListPanel from './StepsListPanel';
import StepEditorPanel from './StepEditorPanel';
import ComponentLibraryPanel, { AVAILABLE_FIELD_COMPONENTS } from './ComponentLibraryPanel'; // Import constant too
import FieldSettingsModal from './FieldSettingsModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OnboardingConfiguration, FieldConfig, StepConfig } from './types';

// --- Mock fetch function - Replace with your actual API service call ---
const getConfiguration = async (id: string): Promise<OnboardingConfiguration> => { /* ... (same mock as before) ... */
    console.log(`MOCK: Fetching configuration ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const sampleStepId1 = `step-sample-${id}-1`;
    const sampleStepId2 = `step-sample-${id}-2`;
    return {
      id: id, name: `Loaded Config ${id}`, key: `loaded-config-${id}`, targetUserType: 'admin',
      targetOrgType: 'enterprise', version: 2, isActive: true, securityLevel: 'enhanced',
      steps: [
        { id: sampleStepId1, title: 'User Profile', description: 'Basic user identification.', order: 0,
          fields: [ { id: `field-sample-${id}-1`, type: 'text', label: 'Full Name', fieldName: 'fullName', isRequired: true, order: 0 }, { id: `field-sample-${id}-2`, type: 'email', label: 'Work Email', fieldName: 'workEmail', isRequired: true, order: 1, placeholder: 'Enter work email' }, ] },
        { id: sampleStepId2, title: 'Contact Information', description: 'How to reach the user.', order: 1,
          fields: [ { id: `field-sample-${id}-3`, type: 'phone', label: 'Mobile Phone', fieldName: 'mobilePhone', isRequired: false, order: 0 }, { id: `field-sample-${id}-4`, type: 'text', label: 'Office Extension', fieldName: 'officeExt', isRequired: false, order: 1 }, ] }
      ]
    };
};
// --- End Mock Fetch ---


// --- Inner UI Component ---
function ConfiguratorUI() {
  const { state, dispatch } = useConfigurator();
  const [activeTab, setActiveTab] = useState('builder');

  // --- State for Field Settings Modal ---
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<{ step: StepConfig | null; field: FieldConfig | null }>({ step: null, field: null });
  // --- End Modal State ---

  // --- Modal Handlers (using useCallback) ---
  const openFieldSettings = useCallback((stepId: string, fieldId: string) => {
      const step = state.configuration.steps.find(s => s.id === stepId);
      const field = step?.fields.find(f => f.id === fieldId);
      if (step && field) {
          setEditingField({ step, field });
          setIsSettingsModalOpen(true);
      } else {
          toast.error("Error", { description: "Could not find the field to edit." });
      }
  }, [state.configuration.steps]); // Dependency: steps array

  const handleFieldSettingsSave = useCallback((newLabel: string, newIsRequired: boolean) => {
     if (!editingField.step || !editingField.field) return;
     dispatch({
         type: 'UPDATE_FIELD',
         payload: {
             stepId: editingField.step.id, fieldId: editingField.field.id,
             updates: { label: newLabel, isRequired: newIsRequired, }
         }
     });
     setIsSettingsModalOpen(false); // Close modal after dispatch
     setEditingField({ step: null, field: null }); // Clear editing state
  }, [editingField, dispatch]);

  const handleModalOpenChange = useCallback((open: boolean) => {
       setIsSettingsModalOpen(open);
       if (!open) {
           setEditingField({ step: null, field: null }); // Clear state if closed externally
       }
  }, []);
  // --- End Modal Handlers ---


  // --- DND Setup ---
  const sensors = useSensors(/* ... (same as before) ... */
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const handleDragEnd = (event: DragEndEvent) => { /* ... (same as before) ... */
      const { active, over } = event;
      if (over && active.id !== over.id) {
          const activeDataType = active.data.current?.type; const overDataType = over.data.current?.type;
          if (activeDataType === 'step' && overDataType === 'step') {
              dispatch({ type: 'REORDER_STEPS', payload: { activeId: String(active.id), overId: String(over.id) } });
          } else if (activeDataType === 'field' && overDataType === 'field') {
              const activeStepId = active.data.current?.stepId; const overStepId = over.data.current?.stepId;
              if (activeStepId && activeStepId === overStepId && activeStepId === state.activeStepId) {
                 dispatch({ type: 'REORDER_FIELDS', payload: { stepId: activeStepId, activeId: String(active.id), overId: String(over.id) } });
              } else { toast.error("Cannot Move Field", { description: "Fields can only be reordered within the same active step."}); }
          }
      }
  };
  // --- End DND Setup ---

  // --- Helper Function ---
  const getFieldTypeDisplayName = (fieldType: string | undefined): string => {
      if (!fieldType) return 'Unknown';
      const def = AVAILABLE_FIELD_COMPONENTS.find(c => c.id === fieldType);
      return def?.name || fieldType;
  }
  // --- End Helper ---


  if (state.isLoading) { // Simplified loading check
       return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-background">
        <ConfiguratorHeader />
        <div className="flex-1 overflow-hidden border-t">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            {/* Tabs List */}
            <div className="px-6 pt-4 border-b bg-card"> <TabsList> {/* ... */} </TabsList> </div>

            {/* Tabs Content */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="details" className="h-full overflow-y-auto p-6"> <ConfigurationDetailsForm /> </TabsContent>
              <TabsContent value="builder" className="h-full p-0 m-0 overflow-hidden">
                <div className="grid grid-cols-12 gap-0 h-full">
                  <div className="col-span-12 md:col-span-3 border-r bg-card overflow-y-auto p-4"> <StepsListPanel /> </div>
                  <div className="col-span-12 md:col-span-6 border-r bg-muted/40 overflow-y-auto p-4">
                     <StepEditorPanel key={state.activeStepId || 'no-step'} openFieldSettings={openFieldSettings} />
                  </div>
                  <div className="col-span-12 md:col-span-3 bg-card overflow-y-auto p-4"> <ComponentLibraryPanel /> </div>
                </div>
              </TabsContent>
              <TabsContent value="preview" className="h-full overflow-y-auto p-6"> {/* ... Placeholder ... */} </TabsContent>
            </div>
          </Tabs>
        </div>

         {/* Field Settings Modal */}
         <FieldSettingsModal
            isOpen={isSettingsModalOpen}
            onOpenChange={handleModalOpenChange} // Use the new handler
            // Pass initial values based on the state `editingField`
            initialLabel={editingField.field?.label || ''}
            initialIsRequired={editingField.field?.isRequired || false}
            fieldTypeDisplay={getFieldTypeDisplayName(editingField.field?.type)}
            // Pass the save handler
            onSaveChanges={handleFieldSettingsSave}
         />
      </div>
    </DndContext>
  );
}

// --- Main Exported Component ---
export default function ConfiguratorBuilder({ configId }: { configId?: string }) {
  const [initialConfigData, setInitialConfigData] = useState<OnboardingConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(!!configId);

  useEffect(() => { /* ... (Data fetching logic remains the same) ... */
    let isMounted = true;
    if (configId) {
      setIsLoading(true);
      getConfiguration(configId) .then(data => isMounted && setInitialConfigData(data))
        .catch(err => isMounted && toast.error("Error Loading Configuration", { description: err.message || 'Could not fetch data.' }))
        .finally(() => isMounted && setIsLoading(false));
    } else { setIsLoading(false); setInitialConfigData(null); }
    return () => { isMounted = false };
  }, [configId]);

  if (isLoading && configId) { return <div className="flex justify-center items-center h-screen"><p>Loading Configuration...</p></div>; }

  return ( <ConfiguratorProvider initialConfig={initialConfigData || undefined}> <ConfiguratorUI /> </ConfiguratorProvider> );
}