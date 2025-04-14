// src/components/onboarding/configurator/SortableFieldItem.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Settings } from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { FieldConfig } from './types';
import { AVAILABLE_FIELD_COMPONENTS } from './fieldComponents';

interface SortableFieldItemProps {
  field: FieldConfig;
  stepId: string;
}

const SortableFieldItem = ({ field, stepId }: SortableFieldItemProps) => {
  const { dispatch } = useConfigurator();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: { // Pass data for identification
        type: 'field',
        fieldId: field.id,
        stepId: stepId, // Important to know which step it belongs to
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };


  const fieldDefinition = AVAILABLE_FIELD_COMPONENTS.find(c => c.id === field.type);
  const Icon = fieldDefinition?.icon;

  const handleDeleteField = (e: React.MouseEvent) => {
    e.stopPropagation();
     if (confirm(`Are you sure you want to remove field "${field.label}"?`)) {
        dispatch({ type: 'DELETE_FIELD', payload: { stepId, fieldId: field.id } });
     }
  };

  const handleOpenSettings = (e: React.MouseEvent) => {
     e.stopPropagation();
     alert(`Open settings for field: ${field.label} (ID: ${field.id}) - To be implemented`);
     // dispatch({ type: 'SET_SELECTED_FIELD', payload: { stepId, fieldId: field.id } });
  }

  return (
    <div
      ref={setNodeRef} // Set node ref for DND
      style={style}    // Apply DND styles
      className={`p-3 border rounded bg-white group flex items-center justify-between hover:border-primary/50 transition-colors ${isDragging ? 'shadow-lg' : ''}`}
    >
       <div className="flex items-center flex-1 min-w-0">
         {/* Drag Handle */}
         <button
            {...attributes}
            {...listeners}
            className="p-1 mr-2 text-muted-foreground flex-shrink-0 cursor-grab focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label="Drag field to reorder"
            title="Drag to reorder"
         >
             <GripVertical className="h-5 w-5 group-hover:text-foreground" />
         </button>

         {Icon && <Icon className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />}

         <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate" title={field.label}>
                {field.label || 'Untitled Field'}
                {field.isRequired && <span className="text-red-500 ml-1">*</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
                {fieldDefinition?.name || field.type}
            </p>
         </div>
       </div>

      {/* Action Buttons */}
       <div className={`flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Field Settings"
            onClick={handleOpenSettings}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:bg-destructive/10"
            onClick={handleDeleteField}
            title="Remove Field"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
    </div>
  );
};

export default SortableFieldItem;