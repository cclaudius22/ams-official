// src/components/onboarding/configurator/StepEditorPanel.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Removed unused imports
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LayoutPanelTop, Plus } from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import SortableFieldItem from './SortableFieldItem';
// Import DND components for fields
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const StepEditorPanel = () => {
  const { state, dispatch } = useConfigurator();
  const { configuration, activeStepId } = state;

  const activeStep = React.useMemo(
      () => configuration.steps.find(step => step.id === activeStepId),
      [configuration.steps, activeStepId]
  );

  // Get field IDs for SortableContext, only if activeStep exists
  const fieldIds = React.useMemo(() => activeStep?.fields.map(f => f.id) || [], [activeStep]);


  const [localTitle, setLocalTitle] = useState(activeStep?.title || '');
  const [localDescription, setLocalDescription] = useState(activeStep?.description || '');

  useEffect(() => {
    setLocalTitle(activeStep?.title || '');
    setLocalDescription(activeStep?.description || '');
  }, [activeStep]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
     // Optional: Dispatch immediately or use debounce
     // dispatch({ type: 'MARK_MODIFIED' }); // Mark modified immediately on change
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalDescription(e.target.value);
    // dispatch({ type: 'MARK_MODIFIED' }); // Mark modified immediately
  };

  const updateStepDetails = () => {
    if (activeStep && (localTitle !== activeStep.title || localDescription !== (activeStep.description || ''))) {
      dispatch({
        type: 'UPDATE_STEP',
        payload: { stepId: activeStep.id, updates: { title: localTitle, description: localDescription } }
      });
    }
  };

   const handleAddFieldClick = () => {
     alert("Select a field from the Component Library panel on the right to add it here.");
   }


  if (!activeStep) {
    return (
      <Card className="h-full flex items-center justify-center bg-transparent border-none shadow-none">
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
      <Card className="flex-1 flex flex-col shadow-sm">
        {/* Step Header */}
        <CardHeader className="pb-4 border-b">
           <div className="space-y-1">
             <Label htmlFor={`step-title-${activeStep.id}`} className="sr-only">Step Title</Label>
             <Input
                id={`step-title-${activeStep.id}`}
                value={localTitle}
                onChange={handleTitleChange}
                onBlur={updateStepDetails}
                className="text-lg font-semibold border-0 shadow-none p-0 h-auto focus-visible:ring-0"
                placeholder="Enter Step Title"
             />
             <Label htmlFor={`step-desc-${activeStep.id}`} className="sr-only">Step Description</Label>
             <Textarea
                id={`step-desc-${activeStep.id}`}
                value={localDescription}
                onChange={handleDescriptionChange}
                onBlur={updateStepDetails}
                className="text-sm text-muted-foreground border-0 shadow-none p-0 h-auto resize-none focus-visible:ring-0 mt-1"
                placeholder="Enter step description (optional)"
                rows={1}
            />
          </div>
        </CardHeader>

        {/* Fields Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            <h3 className="text-base font-medium mb-3">Fields in this Step</h3>
            {/* Wrap field list in SortableContext */}
            <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
                {activeStep.fields.length === 0 ? (
                    <div className="border border-dashed rounded-md p-8 text-center text-muted-foreground bg-white">
                        <LayoutPanelTop className="h-8 w-8 mx-auto mb-2" />
                        <p className="mb-4 text-sm">No fields added yet.</p>
                        <Button variant="secondary" size="sm" onClick={handleAddFieldClick}>
                             <Plus className="h-4 w-4 mr-2"/> Add Field from Library
                         </Button>
                    </div>
                 ) : (
                    activeStep.fields
                        // No need to sort here, DND handles visual order
                        .map((field) => (
                         <SortableFieldItem
                            key={field.id} // Key must be here for SortableContext
                            field={field}
                            stepId={activeStep.id}
                         />
                     ))
                 )}
            </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
};

export default StepEditorPanel;