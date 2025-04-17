// src/components/onboarding/configurator/field-settings/SelectFieldSettings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X, GripVertical } from 'lucide-react';
import { FieldConfig, FieldOption } from '../types';
import { DefaultFieldSettings } from './DefaultFieldSettings';

interface SelectFieldSettingsProps {
  field: Partial<FieldConfig>;
  onChange: (updates: Partial<FieldConfig>) => void;
}

export function SelectFieldSettings({ field, onChange }: SelectFieldSettingsProps) {
  const [options, setOptions] = useState<FieldOption[]>(field.options || []);

  // Update options when field changes
  useEffect(() => {
    setOptions(field.options || []);
  }, [field.options]);

  // Handle option changes
  const handleOptionChange = (index: number, key: keyof FieldOption, value: string) => {
    const updatedOptions = [...options];
    
    if (key === 'label' && (!updatedOptions[index].value || updatedOptions[index].value === '_placeholder_')) {
      // Auto-generate value from label if value is empty and label changes
      const newValue = value.toLowerCase().replace(/[^a-z0-9_]+/g, '_').substring(0, 50);
      
      // Ensure generated value isn't empty
      updatedOptions[index] = { 
        ...updatedOptions[index], 
        label: value, 
        value: newValue || `option_${index + 1}` 
      };
    } else {
      updatedOptions[index] = { ...updatedOptions[index], [key]: value };
    }
    
    setOptions(updatedOptions);
    onChange({ options: updatedOptions });
  };

  // Add a new option
  const addOption = () => {
    const newOption: FieldOption = { label: '', value: '' };
    const updatedOptions = [...options, newOption];
    setOptions(updatedOptions);
    onChange({ options: updatedOptions });
  };

  // Remove an option
  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
    onChange({ options: updatedOptions });
  };

  return (
    <div className="space-y-4">
      {/* Inherit standard field settings */}
      <DefaultFieldSettings field={field} onChange={onChange} />
      
      {/* Select-specific options */}
      <div className="space-y-3 mt-4">
        <h4 className="text-sm font-medium border-b pb-1 mb-3">Dropdown Options</h4>
        <div className="pl-2 space-y-2 max-h-48 overflow-y-auto pr-1 border rounded-md p-3 bg-muted/20">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 group">
              {/* Drag Handle Placeholder */}
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
              
              <div className='flex-1 grid grid-cols-2 gap-2'>
                <div className='space-y-0.5'>
                  <Label htmlFor={`option-label-${field.id}-${index}`} className='text-xs font-normal'>
                    Display Label
                  </Label>
                  <Input
                    id={`option-label-${field.id}-${index}`}
                    value={option.label}
                    onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                    placeholder="Label shown to user"
                    className="h-8 text-sm"
                  />
                </div>
                <div className='space-y-0.5'>
                  <Label htmlFor={`option-value-${field.id}-${index}`} className='text-xs font-normal'>
                    Stored Value*
                  </Label>
                  <Input
                    id={`option-value-${field.id}-${index}`}
                    value={option.value}
                    onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                    placeholder="Unique value"
                    className={`h-8 text-sm font-mono ${!option.value ? 'border-destructive' : ''}`}
                  />
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => removeOption(index)} 
                className="h-8 w-8 text-destructive opacity-50 group-hover:opacity-100 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {options.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No options defined yet.
            </p>
          )}
        </div>
        
        <Button variant="outline" size="sm" onClick={addOption} className="mt-2">
          <Plus className="h-4 w-4 mr-2"/> Add Option
        </Button>
        
        <p className="text-xs text-muted-foreground">
          Define choices. Stored Value must be unique and not empty. 
          It can be auto-generated from the Label if left blank initially.
        </p>
      </div>
    </div>
  );
}