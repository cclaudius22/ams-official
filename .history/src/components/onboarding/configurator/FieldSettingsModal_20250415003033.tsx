// src/components/onboarding/configurator/FieldSettingsModal.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { X, Plus, GripVertical } from "lucide-react"; // Added Grip for potential future DND
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { FieldConfig, FieldOption } from './types';
import { toast } from 'sonner';

interface FieldSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  stepId: string | null;
  fieldId: string | null;
}

const FieldSettingsModal = ({ isOpen, onOpenChange, stepId, fieldId }: FieldSettingsModalProps) => {
  const { state, dispatch } = useConfigurator();
  const [localFieldData, setLocalFieldData] = useState<Partial<Pick<FieldConfig, 'label' | 'isRequired' | 'placeholder' | 'fieldName' | 'options'>>>({});
  const [fieldExists, setFieldExists] = useState(false);

  const targetField = React.useMemo(() => {
      if (!stepId || !fieldId) return null;
      const step = state.configuration.steps.find(s => s.id === stepId);
      return step?.fields.find(f => f.id === fieldId) || null;
  }, [state.configuration.steps, stepId, fieldId]);

  // Load/Reset local state when modal opens/closes or target changes
  useEffect(() => {
    if (targetField && isOpen) {
      // Deep copy options to avoid modifying original state directly
      const currentOptions = targetField.options ? JSON.parse(JSON.stringify(targetField.options)) : [];
      setLocalFieldData({
        label: targetField.label || '',
        isRequired: targetField.isRequired || false,
        placeholder: targetField.placeholder || '',
        fieldName: targetField.fieldName || '',
        options: currentOptions,
      });
      setFieldExists(true);
    } else if (!isOpen) {
      setLocalFieldData({});
      setFieldExists(false);
    }
  }, [targetField, isOpen]);

  const handleChange = (key: keyof typeof localFieldData, value: any) => {
    setLocalFieldData(prev => ({ ...prev, [key]: value }));
  };

  // --- Options Management ---
  const handleOptionChange = useCallback((index: number, key: keyof FieldOption, value: string) => {
    setLocalFieldData(prev => {
        const currentOptions = prev.options || [];
        const updatedOptions = [...currentOptions];
        if (updatedOptions[index]) {
             // Auto-generate value from label if value is empty and label changes
            let newValue = value;
            if (key === 'label' && (!updatedOptions[index].value || updatedOptions[index].value === '_placeholder_')) {
                newValue = value.toLowerCase().replace(/[^a-z0-9_]+/g, '_').substring(0, 50); // Auto-generate value
                 // Ensure generated value isn't empty
                 if (!newValue) newValue = `option_${index + 1}`;
                 updatedOptions[index] = { ...updatedOptions[index], label: value, value: newValue };
            } else {
                updatedOptions[index] = { ...updatedOptions[index], [key]: value };
            }

        }
        return { ...prev, options: updatedOptions };
    });
  }, []); // No dependencies needed as it uses the state setter function

  const addOption = useCallback(() => {
    const newOption: FieldOption = { label: '', value: '' }; // Start empty
    setLocalFieldData(prev => ({
        ...prev,
        options: [...(prev.options || []), newOption]
    }));
  }, []);

  const removeOption = useCallback((index: number) => {
    setLocalFieldData(prev => ({
        ...prev,
        options: (prev.options || []).filter((_, i) => i !== index)
    }));
  }, []);
  // --- End Options Management ---

  const handleSaveChanges = () => {
    if (!stepId || !fieldId || !targetField) return;

    // Validate options before saving (ensure no empty values)
    const optionsValid = (localFieldData.options || []).every(opt => opt.value && opt.value.trim() !== '');
    if (targetField.type === 'select' && !optionsValid) {
        toast.error("Invalid Options", { description: "Option 'Stored Value' cannot be empty. Please check your options." });
        return;
    }

    // Construct updates object with only potentially changed fields
    const updates: Partial<FieldConfig> = {};
    if (localFieldData.label !== targetField.label) updates.label = localFieldData.label;
    if (localFieldData.isRequired !== targetField.isRequired) updates.isRequired = localFieldData.isRequired;
    if (localFieldData.placeholder !== targetField.placeholder) updates.placeholder = localFieldData.placeholder;
    if (targetField.type === 'select' && JSON.stringify(localFieldData.options) !== JSON.stringify(targetField.options)) {
         updates.options = localFieldData.options;
     }
    // Note: fieldName is generally not user-editable after creation

    if (Object.keys(updates).length > 0) { // Only dispatch if there are actual changes
         dispatch({ type: 'UPDATE_FIELD', payload: { stepId, fieldId, updates } });
         dispatch({ type: 'MARK_MODIFIED' }); // Ensure main state knows about modification
    }
    onOpenChange(false);
  };

  if (!isOpen || !fieldExists || !targetField) return null;

  const isSelectType = targetField.type === 'select';
  const isTextualType = ['text', 'textarea', 'email', 'phone', 'password'].includes(targetField.type);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Increased max-width */}
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Field Settings: {targetField.type}</DialogTitle>
          <DialogDescription>
            Configure "{localFieldData.label || 'Untitled'}" field ({localFieldData.fieldName || 'No Name'}).
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="grid gap-6 py-4 flex-1 overflow-y-auto pr-3"> {/* Added scroll */}

           {/* --- Basic Settings Section --- */}
           <div className="space-y-4">
              <h4 className="text-sm font-medium border-b pb-1 mb-3">Display & Basic Info</h4>
              <div className="grid grid-cols-4 items-center gap-x-4 gap-y-3">
                <Label htmlFor="field-settings-label" className="text-right col-span-1">Label*</Label>
                <Input id="field-settings-label" value={localFieldData.label || ''} onChange={(e) => handleChange('label', e.target.value)} className="col-span-3 h-9" placeholder="User-facing label" />

                {isTextualType && (<>
                     <Label htmlFor="field-settings-placeholder" className="text-right col-span-1">Placeholder</Label>
                     <Input id="field-settings-placeholder" value={localFieldData.placeholder || ''} onChange={(e) => handleChange('placeholder', e.target.value)} className="col-span-3 h-9" placeholder="Optional placeholder text" />
                </>)}

                <Label htmlFor="field-settings-fieldName" className="text-right col-span-1">Field Name</Label>
                <Input id="field-settings-fieldName" value={localFieldData.fieldName || ''} readOnly disabled className="col-span-3 h-9 font-mono bg-muted/50 text-muted-foreground text-xs" />

                {/* Required Checkbox - Aligned Right */}
                <div /> {/* Empty cell for alignment */}
                <div className="flex items-center space-x-2 col-span-3">
                   <Checkbox id="field-settings-isRequired" checked={!!localFieldData.isRequired} onCheckedChange={(checked) => handleChange('isRequired', checked === true)} />
                   <Label htmlFor="field-settings-isRequired" className="text-sm font-normal leading-none cursor-pointer"> Required Field </Label>
                </div>
              </div>
           </div>
           <Separator />

           {/* --- Select Options Section (Conditional) --- */}
           {isSelectType && (
             <div className="space-y-3">
                <h4 className="text-sm font-medium">Dropdown Options</h4>
                 <div className="pl-2 space-y-2 max-h-48 overflow-y-auto pr-1 border rounded-md p-3 bg-muted/20"> {/* Scrollable options */}
                    {(localFieldData.options || []).map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 group">
                         {/* Optional Drag Handle Placeholder */}
                         {/* <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0"/> */}
                         <div className='flex-1 grid grid-cols-2 gap-2'>
                            <div className='space-y-0.5'>
                                <Label htmlFor={`option-label-${index}`} className='text-xs font-normal'>Display Label</Label>
                                <Input
                                    id={`option-label-${index}`}
                                    value={option.label}
                                    onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                                    placeholder="Label shown to user"
                                    className="h-8 text-sm"
                                />
                             </div>
                             <div className='space-y-0.5'>
                                <Label htmlFor={`option-value-${index}`} className='text-xs font-normal'>Stored Value*</Label>
                                <Input
                                    id={`option-value-${index}`}
                                    value={option.value}
                                    onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                                    placeholder="Unique value"
                                    className={`h-8 text-sm font-mono ${!option.value ? 'border-destructive' : ''}`} // Highlight if empty
                                />
                              </div>
                         </div>
                        <Button variant="ghost" size="icon" onClick={() => removeOption(index)} className="h-8 w-8 text-destructive opacity-50 group-hover:opacity-100 flex-shrink-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                     {(localFieldData.options || []).length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">No options defined yet.</p>
                    )}
                </div>
                <Button variant="outline" size="sm" onClick={addOption} className="mt-2">
                  <Plus className="h-4 w-4 mr-2"/> Add Option
                </Button>
                <p className="text-xs text-muted-foreground">Define choices. Stored Value must be unique and not empty. It can be auto-generated from the Label if left blank initially.</p>
             </div>
           )}
           <Separator/>

           {/* --- Validation Section (Placeholder) --- */}
           {/* <div className="space-y-4"> <h4 className="text-sm font-medium">Validation</h4> ... </div> */}
           {/* --- Conditional Logic Section (Placeholder) --- */}
           {/* <div className="space-y-4"> <h4 className="text-sm font-medium">Conditional Logic</h4> ... </div> */}

        </div>

        {/* Footer */}
        <DialogFooter className="mt-auto pt-4 border-t"> {/* Ensure footer is at bottom */}
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