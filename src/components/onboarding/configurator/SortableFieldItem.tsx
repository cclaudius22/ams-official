// src/components/onboarding/configurator/SortableFieldItem.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Settings } from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { FieldConfig } from './types';

// Replace the import for AVAILABLE_FIELD_COMPONENTS with our registry
import { getFieldType } from '@/components/onboarding/registry/fieldTypeRegistry';

interface SortableFieldItemProps {
  field: FieldConfig;
  stepId: string;
  onOpenSettings: () => void;
}

const SortableFieldItem = ({ field, stepId, onOpenSettings }: SortableFieldItemProps) => {
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
    data: {
        type: 'field',
        fieldId: field.id,
        stepId: stepId,
    }
  });

  // DND styles
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };

  // Get field type information from our registry instead
  const fieldDefinition = getFieldType(field.type);
  
  // If we can't find it in registry, use a fallback icon
  const Icon = fieldDefinition?.icon || (() => <span className="w-4 h-4 bg-muted rounded" />);

  // Handler for deleting the field
  const handleDeleteField = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to remove field "${field.label}"?`)) {
        dispatch({ type: 'DELETE_FIELD', payload: { stepId, fieldId: field.id } });
    }
  };

  // Handler for opening settings
  const handleOpenSettings = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenSettings();
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 border rounded bg-white group flex items-center justify-between hover:border-primary/50 transition-colors ${isDragging ? 'shadow-lg ring-2 ring-primary ring-offset-2' : ''}`}
    >
       {/* Left side: Drag handle, icon, label, type */}
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

         {/* Field Type Icon */}
         <Icon className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />

         {/* Field Label and Type */}
         <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate" title={field.label}>
                {field.label || 'Untitled Field'}
                {field.isRequired && <span className="text-destructive ml-1">*</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
                {fieldDefinition?.name || field.type}
            </p>
         </div>
       </div>

      {/* Right side: Action Buttons */}
       <div className={`flex items-center flex-shrink-0 space-x-1 ml-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity`}>
          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Field Settings"
            onClick={handleOpenSettings}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          {/* Delete Button */}
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