// src/components/onboarding/configurator/StepsListPanel.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import SortableStepItem from './SortableStepItem';
// Import DND components
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const StepsListPanel = () => {
  const { state, dispatch } = useConfigurator();
  const { configuration, activeStepId } = state;

  // Create an array of step IDs for SortableContext
  const stepIds = React.useMemo(() => configuration.steps.map(s => s.id), [configuration.steps]);

  const handleAddStep = () => {
    dispatch({ type: 'ADD_STEP' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Workflow Steps</h2>
        <p className="text-sm text-muted-foreground">
          Define and reorder the sequence of steps.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* Wrap list in SortableContext */}
        <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
          {configuration.steps.length > 0 ? (
             configuration.steps
              // No need to sort here, DND kit handles visual order based on array order
              .map((step) => (
                <SortableStepItem
                  key={step.id} // Key MUST be here
                  step={step}
                  isActive={step.id === activeStepId}
                />
              ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
                No steps defined yet. Add the first step below.
            </p>
          )}
        </SortableContext>
      </div>

      <div className="p-4 border-t mt-auto">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddStep}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>
    </div>
  );
};

export default StepsListPanel;