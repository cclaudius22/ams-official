// src/components/onboarding/configurator/SortableFieldItem.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button'; // Make sure Button is imported
import { GripVertical, Trash2, Settings } from 'lucide-react'; // Make sure Settings is imported
import { useConfigurator } from '@/contexts/ConfiguratorContext'; // Adjust path if needed
import { FieldConfig } from './types';
import { AVAILABLE_FIELD_COMPONENTS } from './ComponentLibraryPanel'; // Adjust path if needed

interface SortableFieldItemProps {
  field: FieldConfig;
  stepId: string;
  onOpenSettings: () => void; // Callback to open the settings modal
}

const SortableFieldItem = ({ field, stepId, onOpenSettings }: SortableFieldItemProps) => {
  const { dispatch } = useConfigurator();
  const {
    attributes,
    listeners, // These listeners are for the drag handle
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

  // Find display info for the field type
  const fieldDefinition = AVAILABLE_FIELD_COMPONENTS.find(c => c.id === field.type);
  const Icon = fieldDefinition?.icon; // Get the specific icon for the field type

  // Handler for deleting the field
  const handleDeleteField = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other clicks
     if (confirm(`Are you sure you want to remove field "${field.label}"?`)) {
        dispatch({ type: 'DELETE_FIELD', payload: { stepId, fieldId: field.id } });
     }
  };

  // Handler for opening settings (calls the prop function)
  const handleOpenSettings = (e: React.MouseEvent) => {
     e.stopPropagation();
     onOpenSettings(); // Trigger the function passed from the parent
  }

  return (
    // Main container for the field item, applying DND ref and styles
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 border rounded bg-white group flex items-center justify-between hover:border-primary/50 transition-colors ${isDragging ? 'shadow-lg ring-2 ring-primary ring-offset-2' : ''}`}
    >
       {/* Left side: Drag handle, icon, label, type */}
       <div className="flex items-center flex-1 min-w-0"> {/* Ensure left side can shrink */}
         {/* Drag Handle - Apply DND listeners here */}
         <button
            {...attributes} // DND attributes for accessibility
            {...listeners} // DND listeners to initiate drag
            className="p-1 mr-2 text-muted-foreground flex-shrink-0 cursor-grab focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label="Drag field to reorder"
            title="Drag to reorder"
         >
             <GripVertical className="h-5 w-5 group-hover:text-foreground" />
         </button>

         {/* Field Type Icon */}
         {Icon && <Icon className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />}

         {/* Field Label and Type */}
         <div className="flex-1 overflow-hidden"> {/* Allow text to truncate */}
            <p className="text-sm font-medium truncate" title={field.label}>
                {field.label || 'Untitled Field'}
                {field.isRequired && <span className="text-destructive ml-1">*</span>} {/* Use theme color */}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
                {fieldDefinition?.name || field.type} {/* Show readable name */}
            </p>
         </div>
       </div>

      {/* Right side: Action Buttons - *** THIS IS WHERE THE ICONS ARE *** */}
       <div className={`flex items-center flex-shrink-0 space-x-1 ml-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity`}> {/* Ensure buttons show if focused within */}
          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7" // Smaller icon button
            title="Field Settings"
            onClick={handleOpenSettings} // Use the correct handler
          >
            <Settings className="h-3.5 w-3.5" /> {/* Settings Icon */}
          </Button>
          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:bg-destructive/10" // Destructive hover state
            onClick={handleDeleteField} // Use the correct handler
            title="Remove Field"
          >
            <Trash2 className="h-3.5 w-3.5" /> {/* Delete Icon */}
          </Button>
        </div>
    </div>
  );
};

export default SortableFieldItem;