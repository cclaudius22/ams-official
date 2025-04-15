// src/components/onboarding/configurator/FieldSettingsModal.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // To close the dialog
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { FieldConfig } from './types';

interface FieldSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  stepId: string | null;
  fieldId: string | null;
}

const FieldSettingsModal = ({ isOpen, onOpenChange, stepId, fieldId }: FieldSettingsModalProps) => {
  const { state, dispatch } = useConfigurator();
  const [fieldData, setFieldData] = useState<Partial<FieldConfig>>({});
  const [options, setOptions] = useState<{value: string, label: string}[]>([]);
  const [newOption, setNewOption] = useState('');

  // Find the field config when the modal opens or dependencies change
  const targetField = React.useMemo(() => {
      if (!stepId || !fieldId) return null;
      const step = state.configuration.steps.find(s => s.id === stepId);
      return step?.fields.find(f => f.id === fieldId) || null;
  }, [state.configuration.steps, stepId, fieldId]);

  // Load field data into local state when the target field is found
  useEffect(() => {
    if (targetField) {
      setFieldData({
        label: targetField.label,
        fieldName: targetField.fieldName,
        isRequired: targetField.isRequired,
        placeholder: targetField.placeholder,
        options: targetField.options
      });
      setOptions(targetField.options || []);
    } else {
       // Reset local state if no target field (e.g., modal closed or invalid IDs)
       setFieldData({});
    }
  }, [targetField]);

  // Handle changes to local form state
  const handleChange = (key: keyof FieldConfig, value: any) => {
    setFieldData(prev => ({ ...prev, [key]: value }));
  };

  // Save changes by dispatching UPDATE_FIELD
  const handleSaveChanges = () => {
    if (!stepId || !fieldId || !targetField) return;

    // Check if any field has changed
    const hasChanges = 
      fieldData.label !== targetField.label ||
      fieldData.isRequired !== targetField.isRequired ||
      fieldData.placeholder !== targetField.placeholder ||
      JSON.stringify(fieldData.options) !== JSON.stringify(targetField.options);

    if (hasChanges) {
        dispatch({
            type: 'UPDATE_FIELD',
            payload: {
                stepId,
                fieldId,
                updates: {
                    label: fieldData.label,
                    isRequired: fieldData.isRequired,
                    placeholder: fieldData.placeholder,
                    options: fieldData.options
                }
            }
        });
    }
    onOpenChange(false); // Close modal after save
  };

  // Prevent rendering if no field is targeted
  if (!targetField) {
      // Optional: Could return null or a placeholder/error state within the Dialog if needed
      // For now, the parent component controls rendering based on isOpen and valid IDs
      return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]"> {/* Adjust width */}
        <DialogHeader>
          <DialogTitle>Field Settings: {targetField.type}</DialogTitle>
          <DialogDescription>
            Configure the properties for the "{targetField.label || 'Untitled'}" field.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
           {/* Basic Settings */}
           <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="field-label" className="text-right col-span-1">
               Label*
             </Label>
             <Input
               id="field-label"
               value={fieldData.label || ''}
               onChange={(e) => handleChange('label', e.target.value)}
               className="col-span-3"
               placeholder="Enter user-facing label"
             />
           </div>

           {/* Placeholder for text-based fields */}
           {['text', 'textarea', 'email', 'phone', 'password'].includes(targetField.type) && (
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="field-placeholder" className="text-right col-span-1">
                 Placeholder
               </Label>
               <Input
                 id="field-placeholder"
                 value={fieldData.placeholder || ''}
                 onChange={(e) => handleChange('placeholder', e.target.value)}
                 className="col-span-3"
                 placeholder="Enter placeholder text"
               />
             </div>
           )}

           {/* Field Name (read-only) */}
           <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="field-fieldName" className="text-right col-span-1">
               Field Name
             </Label>
             <Input
               id="field-fieldName"
               value={fieldData.fieldName || ''}
               readOnly
               className="col-span-3 bg-gray-100"
             />
           </div>

           <div className="flex items-center space-x-2 col-span-4 pl-[calc(25%+1rem)]"> {/* Align with input fields */}
              <Checkbox
                id="field-isRequired"
                checked={!!fieldData.isRequired}
                onCheckedChange={(checked) => handleChange('isRequired', checked === true)}
              />
              <Label htmlFor="field-isRequired" className="text-sm font-medium leading-none cursor-pointer">
                Required Field
              </Label>
           </div>

           {/* Options for select/multiselect fields */}
           {['select', 'multiselect', 'radio'].includes(targetField.type) && (
             <div className="space-y-2">
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label className="text-right col-span-1">Options</Label>
                 <div className="col-span-3 space-y-2">
                   <div className="flex gap-2">
                     <Input
                       value={newOption}
                       onChange={(e) => setNewOption(e.target.value)}
                       placeholder="Add new option"
                       className="flex-1"
                     />
                     <Button
                       size="sm"
                       onClick={() => {
                         if (newOption.trim()) {
                           const newOptions = [...options, {value: newOption.toLowerCase().replace(/\s+/g, '_'), label: newOption}];
                           setOptions(newOptions);
                           handleChange('options', newOptions);
                           setNewOption('');
                         }
                       }}
                     >
                       Add
                     </Button>
                   </div>
                   <div className="border rounded-md divide-y">
                     {options.map((option, index) => (
                       <div key={index} className="flex items-center justify-between p-2">
                         <span>{option.label}</span>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => {
                             const newOptions = options.filter((_, i) => i !== index);
                             setOptions(newOptions);
                             handleChange('options', newOptions);
                           }}
                         >
                           Remove
                         </Button>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
           )}

        </div>

        <DialogFooter>
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
