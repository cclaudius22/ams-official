'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LayoutPanelTop, Plus, Settings } from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import SortableFieldItem from './SortableFieldItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Badge } from '@/components/ui/badge';

interface StepEditorPanelProps {
    openFieldSettings: (stepId: string, fieldId: string) => void;
}

const StepEditorPanel = ({ openFieldSettings }: StepEditorPanelProps) => {
  const { state, dispatch } = useConfigurator();
  const { configuration, activeStepId } = state;

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
        payload: { 
          stepId: activeStep.id, 
          updates: { title: localTitle, description: localDescription } 
        } 
      });
    }
  };

export default StepEditorPanel;
  if (!activeStep) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6 max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <LayoutPanelTop className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No step selected</h3>
          <p className="text-muted-foreground mb-4">
            Select a step from the left panel to begin editing
          </p>
          <Button variant="outline" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create new step
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <Card className="shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Step Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="step-title">Title</Label>
            <Input
              id="step-title"
              value={localTitle}
              onChange={handleTitleChange}
              onBlur={updateStepDetails}
              className="text-base"
              placeholder="Enter step title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="step-desc">Description</Label>
            <Textarea
              id="step-desc"
              value={localDescription}
              onChange={handleDescriptionChange}
              onBlur={updateStepDetails}
              className="min-h-[80px]"
              placeholder="Enter step description (optional)"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Step Fields</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-2 py-1 text-xs font-medium">
                {activeStep.fields.length} {activeStep.fields.length === 1 ? 'Field' : 'Fields'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => alert("Select field from Library panel.")}
                className="h-8 gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Field
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4">
          <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
            {activeStep.fields.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <LayoutPanelTop className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1.5">No fields yet</h3>
                <p className="text-muted-foreground text-center mb-4 max-w-[280px]">
                  Drag fields from the component library or click the button above
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeStep.fields
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <SortableFieldItem
                      key={field.id}
                      field={field}
                      stepId={activeStep.id}
                      onOpenSettings={() => openFieldSettings(activeStep.id, field.id)}
                    />
                  ))}
              </div>
            )}
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
};
