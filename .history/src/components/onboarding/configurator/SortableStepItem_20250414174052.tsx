// src/components/onboarding/configurator/SortableStepItem.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'; // Use Card for better styling
import { GripVertical, Trash2, Edit } from 'lucide-react'; // Import Edit for later
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { StepConfig } from './types';

interface SortableStepItemProps {
  step: StepConfig;
  isActive: boolean;
}

// NOTE: This is the basic version WITHOUT useSortable from dnd-kit yet.
// We'll add DND in Phase 4.

const SortableStepItem = ({ step, isActive }: SortableStepItemProps) => {
  const { dispatch } = useConfigurator();

  const handleSelectStep = () => {
    dispatch({ type: 'SET_ACTIVE_STEP', payload: step.id });
  };

  const handleDeleteStep = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection when clicking delete
    if (confirm(`Are you sure you want to delete step "${step.title}"?`)) {
      dispatch({ type: 'DELETE_STEP', payload: { stepId: step.id } });
    }
  };

  return (
    // Using Card provides padding and borders easily
    <Card
      className={`mb-2 cursor-pointer group ${isActive ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-gray-300 bg-white'}`}
      onClick={handleSelectStep}
    >
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0"> {/* Flex container for icon and text */}
           {/* Drag Handle Placeholder - Will be functional later */}
          <GripVertical className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 cursor-grab group-hover:text-foreground" />
          <div className="flex-1 overflow-hidden"> {/* Allow text to truncate */}
            <p className="text-sm font-medium truncate" title={step.title}>
                {step.title || 'Untitled Step'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step.fields.length} {step.fields.length === 1 ? 'field' : 'fields'}
            </p>
          </div>
        </div>

        {/* Action Buttons - Appear on hover or when active */}
        <div className={`flex items-center space-x-1 ml-2 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
          {/* <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit Step Settings (future)">
            <Edit className="h-3.5 w-3.5" />
          </Button> */}
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