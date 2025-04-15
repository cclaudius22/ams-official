// src/components/onboarding/configurator/SortableStepItem.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useConfigurator } from '@/contexts/ConfiguratorContext';

interface SortableStepItemProps {
  step: any; // Replace with proper step type
  isActive: boolean;
}

const SortableStepItem: React.FC<SortableStepItemProps> = ({ step, isActive }) => {
  const { dispatch } = useConfigurator();
  
  // Get counts for fields in this step
  const fieldCount = step.fields?.length || 0;
  const requiredFieldCount = step.fields?.filter(f => f.isRequired)?.length || 0;
  
  // Setup sortable functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: step.id,
    data: {
      type: 'step',
      step
    }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };
  
  const handleSelectStep = () => {
    dispatch({ type: 'SET_ACTIVE_STEP', payload: step.id });
  };
  
  // Determine if step has content
  const isEmpty = fieldCount === 0;
  
  // Get status indicator based on fields
  const getStatusIndicator = () => {
    if (isEmpty) {
      return (
        <div className="h-5 w-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
          <AlertCircle className="h-3 w-3 text-amber-500" />
        </div>
      );
    }
    
    return (
      <div className="h-5 w-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
      </div>
    );
  };
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`group relative pl-3 pr-2 py-2.5 rounded-md border mb-2 transition-all cursor-pointer ${
        isDragging ? 'shadow-md' : ''
      } ${
        isActive
          ? 'bg-primary/5 border-primary/30'
          : 'hover:bg-accent/20 border-border'
      }`}
      onClick={handleSelectStep}
      {...attributes}
      {...listeners}
    >
      
      <div className="flex items-center">
        {/* Status indicator */}
        <div className="flex-shrink-0 mr-2">
          {getStatusIndicator()}
        </div>
        
        {/* Step info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <div className="font-medium truncate">{step.title || 'Untitled Step'}</div>
            
            {/* Field count badge */}
            {fieldCount > 0 && (
              <Badge 
                variant="outline" 
                className={`ml-2 px-1 py-0 h-4 text-[10px] ${
                  isActive 
                    ? 'bg-primary/10 border-primary/20 text-primary' 
                    : 'bg-muted border-muted-foreground/20 text-muted-foreground'
                }`}
              >
                {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
              </Badge>
            )}
          </div>
          
          {/* Very subtle description if exists */}
          {step.description && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">
              {step.description}
            </div>
          )}
        </div>
        
        {/* Active indicator */}
        {isActive && (
          <ChevronRight className="h-4 w-4 ml-2 text-primary" />
        )}
      </div>
    </div>
  );
};

export default SortableStepItem;
