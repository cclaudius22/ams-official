// src/components/onboarding/configurator/StepEditorPanel.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react'; // Added useMemo
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LayoutPanelTop, Plus } from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import SortableFieldItem from './SortableFieldItem'; // Ensure this is imported
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Define Props
interface StepEditorPanelProps {
    openFieldSettings: (stepId: string, fieldId: string) => void; // Function prop
}

const StepEditorPanel = ({ openFieldSettings }: StepEditorPanelProps ) => { // Destructure prop
  const { state, dispatch } = useConfigurator();
  const { configuration, activeStepId } = state;

  // Use useMemo for potentially expensive find operations
  const activeStep = useMemo(
      () => configuration.steps.find(step => step.id === activeStepId),
      [configuration.steps, activeStepId]
  );

  const fieldIds = useMemo(() => activeStep?.fields.map(f => f.id) || [], [activeStep]);

  const [localTitle, setLocalTitle] = useState(activeStep?.title || '');
  const [localDescription, setLocalDescription] = useState(activeStep?.description || '');

  useEffect(() => {
    setLocalTitle(activeStep?.title || '');
    setLocalDescription(activeStep?.description || '');
  }, [activeStep]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setLocalTitle(e.target.value); };
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setLocalDescription(e.target.value); };

  const updateStepDetails = () => { /* ... (same as before) ... */
      if (activeStep && (localTitle !== activeStep.title || localDescription !== (activeStep.description || ''))) {
        dispatch({ type: 'UPDATE_STEP', payload: { stepId: activeStep.id, updates: { title: localTitle, description: localDescription } } });
      }
  };
  const handleAddFieldClick = () => { /* ... (same as before) ... */ alert("Select field from Library panel."); }


  if (!activeStep) { /* ... (placeholder rendering) ... */
      return (<Card className="h-full flex items-center justify-center bg-transparent border-none shadow-none"><CardContent className="text-center"><p className="text-muted-foreground">Select or add a step.</p></CardContent></Card>);
   }

  return (
    <div className="h-full flex flex-col">
      <Card className="flex-1 flex flex-col shadow-sm">
        <CardHeader className="pb-4 border-b">
            {/* ... Input/Textarea for title/desc with onBlur={updateStepDetails} ... */}
             <Label htmlFor="step-title" className="sr-only">Title</Label>
             <Input id="step-title" value={localTitle} onChange={handleTitleChange} onBlur={updateStepDetails} className="text-lg font-semibold ..." placeholder="Step Title"/>
             <Label htmlFor="step-desc" className="sr-only">Description</Label>
             <Textarea id="step-desc" value={localDescription} onChange={handleDescriptionChange} onBlur={updateStepDetails} className="text-sm ..." placeholder="Step description (optional)" rows={1}/>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
            <h3 className="text-base font-medium mb-3">Fields in this Step</h3>
            <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
                {activeStep.fields.length === 0 ? ( /* ... placeholder ... */
                    <div className="border border-dashed ..."><LayoutPanelTop/><p>No fields added.</p><Button onClick={handleAddFieldClick}><Plus/> Add Field</Button></div>
                 ) : (
                    activeStep.fields
                        .sort((a,b) => a.order - b.order) // Render based on current order
                        .map((field) => (
                         <SortableFieldItem
                            key={field.id}
                            field={field}
                            stepId={activeStep.id}
                            // *** PASS THE PROP DOWN ***
                            onOpenSettings={() => openFieldSettings(activeStep.id, field.id)}
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
