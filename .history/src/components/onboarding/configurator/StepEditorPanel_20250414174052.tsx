// src/components/onboarding/configurator/StepEditorPanel.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Use Textarea for description
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LayoutPanelTop, Plus } from 'lucide-react'; // Import icon for placeholder
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import SortableFieldItem from './SortableFieldItem'; // Basic version for now
// DND Context for fields will go here later
// import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const StepEditorPanel = () => {
  const { state, dispatch } = useConfigurator();
  const { configuration, activeStepId } = state;

  // Find the active step based on activeStepId
  const activeStep = React.useMemo(
      () => configuration.steps.find(step => step.id === activeStepId),
      [configuration.steps, activeStepId]
  );

  // Local state for debounced input updates (optional, but good for performance)
  const [localTitle, setLocalTitle] = useState(activeStep?.title || '');
  const [localDescription, setLocalDescription] = useState(activeStep?.description || '');

  // Update local state when activeStep changes
  useEffect(() => {
    setLocalTitle(activeStep?.title || '');
    setLocalDescription(activeStep?.description || '');
  }, [activeStep]);

  // Update global state on blur or with debounce
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalDescription(e.target.value);
  };

  const updateStepDetails = () => {
    if (activeStep && (localTitle !== activeStep.title || localDescription !== (activeStep.description || ''))) {
      dispatch({
        type: 'UPDATE_STEP',
        payload: { stepId: activeStep.id, updates: { title: localTitle, description: localDescription } }
      });
    }
  };

   // Placeholder Add Field function - link to Library panel later
   const handleAddFieldClick = () => {
     alert("Select a field from the Component Library panel on the right to add it here.");
     // In future: dispatch({ type: 'ADD_FIELD', payload: { stepId: activeStepId, fieldType: 'text' } });
   }


  if (!activeStep) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Select a step from the left panel to edit it, or add a new step.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col"> {/* Allow card to grow */}
        {/* Step Header */}
        <CardHeader className="pb-4 border-b">
          <div className="space-y-1">
             <Label htmlFor={`step-title-${activeStep.id}`} className="sr-only">Step Title</Label>
             <Input
                id={`step-title-${activeStep.id}`}
                value={localTitle}
                onChange={handleTitleChange}
                onBlur={updateStepDetails} // Update on blur
                className="text-lg font-semibold border-0 shadow-none p-0 h-auto focus-visible:ring-0"
                placeholder="Enter Step Title"
             />
             <Label htmlFor={`step-desc-${activeStep.id}`} className="sr-only">Step Description</Label>
             <Textarea
                id={`step-desc-${activeStep.id}`}
                value={localDescription}
                onChange={handleDescriptionChange}
                onBlur={updateStepDetails} // Update on blur
                className="text-sm text-muted-foreground border-0 shadow-none p-0 h-auto resize-none focus-visible:ring-0"
                placeholder="Enter step description (optional)"
                rows={1} // Start small, auto-expand if needed via CSS potentially
            />
          </div>
        </CardHeader>

        {/* Fields Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            <h3 className="text-base font-medium mb-3">Fields in this Step</h3>
            {/* DND Context for fields will go here */}
             {/* <SortableContext items={activeStep.fields.map(f => f.id)} strategy={verticalListSortingStrategy}> */}
                {activeStep.fields.length === 0 ? (
                    <div className="border border-dashed rounded-md p-8 text-center text-muted-foreground">
                        <LayoutPanelTop className="h-8 w-8 mx-auto mb-2" />
                        <p className="mb-4 text-sm">No fields added yet.</p>
                        <Button variant="secondary" size="sm" onClick={handleAddFieldClick}>
                             <Plus className="h-4 w-4 mr-2"/> Add Field from Library
                         </Button>
                    </div>
                 ) : (
                    activeStep.fields
                        .sort((a,b) => a.order - b.order) // Ensure render respects order
                        .map((field) => (
                         // Replace with SortableFieldItem later
                         <div key={field.id} className="p-3 border rounded bg-white flex justify-between items-center">
                            <span>{field.label || 'Untitled Field'} ({field.type})</span>
                            <span className="text-xs text-muted-foreground">ID: {field.id}</span>
                         </div>
                     ))
                 )}
            {/* </SortableContext> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default StepEditorPanel;