// src/components/onboarding/configurator/FieldSettingsModal.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { FieldConfig } from './types';
import { toast } from 'sonner';

// Import the field registry function
import { getFieldType } from '@/components/onboarding/registry/fieldTypeRegistry';

// Import specific field settings components
import { DefaultFieldSettings } from './field-settings/DefaultFieldSettings';
import { SelectFieldSettings } from './field-settings/SelectFieldSettings';
// Import other settings components as needed

interface FieldSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  stepId: string | null;
  fieldId: string | null;
}

const FieldSettingsModal = ({ isOpen, onOpenChange, stepId, fieldId }: FieldSettingsModalProps) => {
  const { state, dispatch } = useConfigurator();
  const [localFieldData, setLocalFieldData] = useState<Partial<FieldConfig>>({});
  const [fieldExists, setFieldExists] = useState(false);

  // Get target field from the configuration
  const targetField = React.useMemo(() => {
    if (!stepId || !fieldId) return null;
    const step = state.configuration.steps.find(s => s.id === stepId);
    return step?.fields.find(f => f.id === fieldId) || null;
  }, [state.configuration.steps, stepId, fieldId]);

  // Get field type definition from registry
  const fieldTypeDef = targetField ? getFieldType(targetField.type) : null;

  // Load/Reset local state when modal opens/closes or target changes
  useEffect(() => {
    if (targetField && isOpen) {
      // Deep copy to avoid modifying original state directly
      setLocalFieldData(JSON.parse(JSON.stringify(targetField)));
      setFieldExists(true);
    } else if (!isOpen) {
      setLocalFieldData({});
      setFieldExists(false);
    }
  }, [targetField, isOpen]);

  // Handle field updates
  const handleFieldUpdate = useCallback((updates: Partial<FieldConfig>) => {
    setLocalFieldData(prev => ({ ...prev, ...updates }));
  }, []);

  // Save changes
  const handleSaveChanges = () => {
    if (!stepId || !fieldId || !targetField) return;

    // Validate before saving
    if (targetField.type === 'select') {
      const options = localFieldData.options || [];
      const optionsValid = options.every(opt => opt.value && opt.value.trim() !== '');
      
      if (!optionsValid) {
        toast.error("Invalid Options", { 
          description: "Option 'Stored Value' cannot be empty. Please check your options." 
        });
        return;
      }
    }

    // Find what's changed
    const updates: Partial<FieldConfig> = {};
    const keys = Object.keys(localFieldData) as Array<keyof FieldConfig>;
    
    for (const key of keys) {
      if (JSON.stringify(localFieldData[key]) !== JSON.stringify(targetField[key])) {
        updates[key] = localFieldData[key] as any;
      }
    }

    if (Object.keys(updates).length > 0) {
      dispatch({ 
        type: 'UPDATE_FIELD', 
        payload: { stepId, fieldId, updates } 
      });
      dispatch({ type: 'MARK_MODIFIED' });
    }
    
    onOpenChange(false);
  };

  // Early return if no field
  if (!isOpen || !fieldExists || !targetField) return null;

  // Select the correct settings component based on field type
  const renderFieldSettings = () => {
    switch (targetField.type) {
      case 'select':
        return <SelectFieldSettings field={localFieldData} onChange={handleFieldUpdate} />;
      // Add other field types here
      default:
        return <DefaultFieldSettings field={localFieldData} onChange={handleFieldUpdate} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {fieldTypeDef?.name || targetField.type} Settings
          </DialogTitle>
          <DialogDescription>
            Configure "{localFieldData.label || 'Untitled'}" field ({localFieldData.fieldName || 'No Name'})
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 flex-1 overflow-y-auto pr-3">
          {/* Render the appropriate settings component */}
          {renderFieldSettings()}
          
          <Separator className="my-4" />
          
          {/* Reserved space for future extensions */}
          {/* <div className="space-y-4">
            <h4 className="text-sm font-medium">Validation</h4>
            ...
          </div> */}
          
          {/* <div className="space-y-4">
            <h4 className="text-sm font-medium">Conditional Logic</h4>
            ...
          </div> */}
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FieldSettingsModal;