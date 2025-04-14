// src/components/onboarding/configurator/StepsListPanel.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import SortableStepItem from './SortableStepItem';
// Import DND components later in Phase 4
// import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const StepsListPanel = () => {
  const { state, dispatch } = useConfigurator();
  const { configuration, activeStepId } = state;

  const handleAddStep = () => {
    dispatch({ type: 'ADD_STEP' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Workflow Steps</h2>
        <p className="text-sm text-muted-foreground">
          Define the sequence of steps for onboarding.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {/* DND Context Wrapper will go here in Phase 4 */}
        {/* <SortableContext items={configuration.steps.map(s => s.id)} strategy={verticalListSortingStrategy}> */}
          {configuration.steps.length > 0 ? (
             configuration.steps
              .sort((a,b) => a.order - b.order) // Ensure rendering respects order
              .map((step) => (
                <SortableStepItem
                  key={step.id}
                  step={step}
                  isActive={step.id === activeStepId}
                />
              ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
                No steps defined yet. Add the first step below.
            </p>
          )}
        {/* </SortableContext> */}
      </div>

      <div className="p-4 border-t mt-auto"> {/* mt-auto pushes button to bottom */}
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