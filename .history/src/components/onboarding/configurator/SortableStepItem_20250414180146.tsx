// src/components/onboarding/configurator/SortableStepItem.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, Trash2, Edit } from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { StepConfig } from './types';

interface SortableStepItemProps {
  step: StepConfig;
  isActive: boolean;
}

const SortableStepItem = ({ step, isActive }: SortableStepItemProps) => {
  const { dispatch } = useConfigurator();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // Use this for styling while dragging
  } = useSortable({
    id: step.id,
    data: { // Pass data for identification in handleDragEnd
        type: 'step',
        stepId: step.id,
    }
  });

  // Style for DND transform/transition
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined, // Use undefined if null/""
    zIndex: isDragging ? 10 : undefined, // Ensure dragging item is on top
    opacity: isDragging ? 0.7 : 1, // Dim item while dragging
  };

  const handleSelectStep = () => {
    dispatch({ type: 'SET_ACTIVE_STEP', payload: step.id });
  };

  const handleDeleteStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete step "${step.title}"?`)) {
      dispatch({ type: 'DELETE_STEP', payload: { stepId: step.id } });
    }
  };

  return (
    <Card
      ref={setNodeRef} // Set the node reference for dnd-kit
      style={style}    // Apply DND styles
      className={`mb-2 group ${isActive ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-gray-300 bg-white'} ${isDragging ? 'shadow-lg' : ''}`}
      // Do NOT add onClick directly here, use listeners on the handle or specific areas if needed,
      // but for selecting the step, clicking the background is fine.
      onClick={handleSelectStep}
    >
      <CardContent className="p-3 flex items-center justify-between cursor-default"> {/* Make content non-draggable by default */}
        <div className="flex items-center flex-1 min-w-0">
           {/* Drag Handle - Apply listeners here */}
          <button
             {...attributes} // DND attributes
             {...listeners} // DND listeners for drag start
             className="p-1 mr-2 text-muted-foreground flex-shrink-0 cursor-grab focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
             aria-label="Drag step to reorder"
             title="Drag to reorder"
           >
            <GripVertical className="h-5 w-5 group-hover:text-foreground" />
           </button>

          <div className="flex-1 overflow-hidden" onClick={handleSelectStep} style={{ cursor: 'pointer' }}> {/* Make text area clickable for selection */}
            <p className="text-sm font-medium truncate" title={step.title}>
                {step.title || 'Untitled Step'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step.fields.length} {step.fields.length === 1 ? 'field' : 'fields'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex items-center space-x-1 ml-2 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:bg-destructive/10"
            onClick={handleDeleteStep}
            title="Delete Step"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SortableStepItem;