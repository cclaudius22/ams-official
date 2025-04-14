// src/components/onboarding/configurator/SortableFieldItem.tsx
'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Settings } from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext'; // Adjust path
import { FieldConfig } from './types';
import { AVAILABLE_FIELD_COMPONENTS } from './ComponentLibraryPanel'; // Adjust path

// *** DEFINE PROPS ***
interface SortableFieldItemProps {
  field: FieldConfig;
  stepId: string;
  onOpenSettings: () => void; // Expect the callback prop
}

const SortableFieldItem = ({ field, stepId, onOpenSettings }: SortableFieldItemProps) => { // Destructure prop
  const { dispatch } = useConfigurator();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ /* ... */ id: field.id, data: { type: 'field', fieldId: field.id, stepId: stepId } });
  const style = { transform: CSS.Transform.toString(transform), transition: transition || undefined, zIndex: isDragging ? 10: undefined, opacity: isDragging ? 0.7: 1 };
  const fieldDefinition = AVAILABLE_FIELD_COMPONENTS.find(c => c.id === field.type);
  const Icon = fieldDefinition?.icon;

  const handleDeleteField = (e: React.MouseEvent) => { /* ... (same as before) ... */ e.stopPropagation(); if (confirm(...)) dispatch({ type: 'DELETE_FIELD', payload: { stepId, fieldId: field.id } }); };

  // *** USE THE PROP IN THE HANDLER ***
  const handleOpenSettings = (e: React.MouseEvent) => {
     e.stopPropagation();
     onOpenSettings(); // Call the passed function
  }

  return (
    <div ref={setNodeRef} style={style} className={`p-3 border rounded bg-white group flex items-center justify-between hover:border-primary/50 transition-colors ${isDragging ? 'shadow-lg ring-2 ring-primary ring-offset-2' : ''}`}>
       <div className="flex items-center flex-1 min-w-0">
         {/* Drag Handle using button */}
         <button {...attributes} {...listeners} className="p-1 mr-2 ... cursor-grab ..."><GripVertical className="h-5 w-5 ..." /></button>
         {/* Icon */}
         {Icon && <Icon className="h-4 w-4 mr-2 ..." />}
         {/* Text */}
         <div className="flex-1 overflow-hidden"> <p className="text-sm ... truncate" title={field.label}>{field.label || '...'} {field.isRequired && <span className="text-destructive ml-1">*</span>}</p> <p className="text-xs ...">{fieldDefinition?.name || field.type}</p> </div>
       </div>
       {/* Action Buttons */}
       <div className={`flex items-center flex-shrink-0 space-x-1 ml-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity`}>
          {/* Settings Button triggers handleOpenSettings */}
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Field Settings" onClick={handleOpenSettings}> <Settings className="h-3.5 w-3.5" /> </Button>
          {/* Delete Button triggers handleDeleteField */}
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" title="Remove Field" onClick={handleDeleteField}> <Trash2 className="h-3.5 w-3.5" /> </Button>
        </div>
    </div>
  );
};

export default SortableFieldItem;