// src/components/onboarding/configurator/SortableFieldItem.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'; // Use Card for consistency maybe? Or just div
import { GripVertical, Trash2, Settings } from 'lucide-react';
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { FieldConfig } from './types';
import { AVAILABLE_FIELD_COMPONENTS } from './fieldComponents'; // Import to get icon/name

interface SortableFieldItemProps {
  field: FieldConfig;
  stepId: string; // Need stepId to dispatch delete/update actions
}

// NOTE: Basic version WITHOUT useSortable from dnd-kit yet.
// Will add DND in Phase 4.

const SortableFieldItem = ({ field, stepId }: SortableFieldItemProps) => {
  const { dispatch } = useConfigurator();

  const fieldDefinition = AVAILABLE_FIELD_COMPONENTS.find(c => c.id === field.type);
  const Icon = fieldDefinition?.icon;

  const handleDeleteField = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent potential parent clicks
     if (confirm(`Are you sure you want to remove field "${field.label}"?`)) {
        dispatch({ type: 'DELETE_FIELD', payload: { stepId, fieldId: field.id } });
     }
  };

  const handleOpenSettings = (e: React.MouseEvent) => {
     e.stopPropagation();
     // TODO: Implement opening the FieldSettingsModal in Phase 5
     alert(`Open settings for field: ${field.label} (ID: ${field.id}) - To be implemented`);
     // Example: dispatch({ type: 'SET_SELECTED_FIELD', payload: { stepId, fieldId: field.id } });
  }

  return (
    // Using a div with border for now, Card might add too much padding
    <div
      className="p-3 border rounded bg-white group flex items-center justify-between hover:border-primary/50 transition-colors"
    >
       <div className="flex items-center flex-1 min-w-0"> {/* Container for handle, icon, text */}
         {/* Drag Handle Placeholder */}
         <GripVertical className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0 cursor-grab group-hover:text-foreground" />

         {Icon && <Icon className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />}

         <div className="flex-1 overflow-hidden"> {/* Allow text truncation */}
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