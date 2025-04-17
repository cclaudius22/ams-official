// src/components/onboarding/configurator/field-settings/DefaultFieldSettings.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { FieldConfig } from '../types';

interface DefaultFieldSettingsProps {
  field: Partial<FieldConfig>;
  onChange: (updates: Partial<FieldConfig>) => void;
}

export function DefaultFieldSettings({ field, onChange }: DefaultFieldSettingsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium border-b pb-1 mb-3">Display & Basic Info</h4>
      <div className="grid grid-cols-4 items-center gap-x-4 gap-y-3">
        <Label htmlFor={`field-settings-label-${field.id}`} className="text-right col-span-1">Label*</Label>
        <Input 
          id={`field-settings-label-${field.id}`} 
          value={field.label || ''} 
          onChange={(e) => onChange({ label: e.target.value })} 
          className="col-span-3 h-9" 
          placeholder="User-facing label" 
        />

        {/* Show placeholder for text-like fields */}
        {['text', 'textarea', 'email', 'phone', 'password'].includes(field.type || '') && (
          <>
            <Label htmlFor={`field-settings-placeholder-${field.id}`} className="text-right col-span-1">Placeholder</Label>
            <Input 
              id={`field-settings-placeholder-${field.id}`} 
              value={field.placeholder || ''} 
              onChange={(e) => onChange({ placeholder: e.target.value })} 
              className="col-span-3 h-9" 
              placeholder="Optional placeholder text" 
            />
          </>
        )}

        <Label htmlFor="field-settings-fieldName" className="text-right col-span-1">Field Name</Label>
        <Input 
          id="field-settings-fieldName" 
          value={field.fieldName || ''} 
          readOnly 
          disabled 
          className="col-span-3 h-9 font-mono bg-muted/50 text-muted-foreground text-xs" 
        />

        {/* Required Checkbox */}
        <div /> {/* Empty cell for alignment */}
        <div className="flex items-center space-x-2 col-span-3">
          <Checkbox 
            id="field-settings-isRequired" 
            checked={!!field.isRequired} 
            onCheckedChange={(checked) => onChange({ isRequired: checked === true })} 
          />
          <Label 
            htmlFor="field-settings-isRequired" 
            className="text-sm font-normal leading-none cursor-pointer"
          >
            Required Field
          </Label>
        </div>
      </div>

      {/* Help Text */}
      <div className="grid grid-cols-4 items-start gap-x-4 gap-y-3 mt-2">
        <Label htmlFor={`field-settings-helpText-${field.id}`} className="text-right col-span-1 pt-2">Help Text</Label>
        <Textarea
          id={`field-settings-helpText-${field.id}`}
          value={field.helpText || ''}
          onChange={(e) => onChange({ helpText: e.target.value })}
          placeholder="Optional help text shown below the field"
          className="col-span-3 min-h-[80px]"
        />
      </div>
    </div>
  );
}