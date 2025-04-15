// components/onboarding/configurator/AddFieldModal.tsx
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField, FieldOption } from '@/types/onboarding';
import { FieldType } from './types';

// Field type definitions with icons and descriptions
const FIELD_TYPES = [
  {
    value: 'text',
    label: 'Text',
    icon: '✏️',
    description: 'Single line text input',
  },
  {
    value: 'textarea',
    label: 'Text Area',
    icon: '📝',
    description: 'Multi-line text input',
  },
  {
    value: 'email',
    label: 'Email',
    icon: '📧',
    description: 'Email address input with validation',
  },
  {
    value: 'password',
    label: 'Password',
    icon: '🔒',
    description: 'Masked password input',
  },
  {
    value: 'number',
    label: 'Number',
    icon: '🔢',
    description: 'Numeric input field',
  },
  {
    value: 'date',
    label: 'Date',
    icon: '📅',
    description: 'Date picker',
  },
  {
    value: 'select',
    label: 'Select',
    icon: '▼',
    description: 'Dropdown selection',
  },
  {
    value: 'multiselect',
    label: 'Multi-Select',
    icon: '☑️',
    description: 'Multiple selection dropdown',
  },
  {
    value: 'checkbox',
    label: 'Checkbox',
    icon: '✅',
    description: 'Multiple checkbox options',
  },
  {
    value: 'radio',
    label: 'Radio',
    icon: '⚪',
    description: 'Single selection radio buttons',
  },
  {
    value: 'file',
    label: 'File Upload',
    icon: '📎',
    description: 'File upload field',
  },
  {
    value: 'info',
    label: 'Info Text',
    icon: 'ℹ️',
    description: 'Informational text (not an input)',
  },
  {
    value: 'heading',
    label: 'Heading',
    icon: '🔠',
    description: 'Section heading',
  },
];

// Get default data type based on field type
const getDefaultDataType = (fieldType: string): string => {
  switch (fieldType) {
    case 'number':
      return 'number';
    case 'checkbox':
    case 'radio':
      return 'boolean';
    case 'date':
      return 'date';
    case 'multiselect':
      return 'array';
    case 'file':
      return 'object';
    default:
      return 'string';
  }
};

interface AddFieldModalProps {
  onClose: () => void;
  onAdd: (field: Partial<FormField>) => void;
  existingFields: FormField[];
}

const AddFieldModal: React.FC<AddFieldModalProps> = ({
  onClose,
  onAdd,
  existingFields,
}) => {
  const [fieldType, setFieldType] = useState<FieldType>('text');
  const [label, setLabel] = useState<string>('');
  const [fieldName, setFieldName] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Generate field name from label
  const generateFieldName = (label: string): string => {
    // Convert to camelCase: "First Name" -> "firstName"
    return label
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[A-Z]/, (c) => c.toLowerCase());
  };

  // Handle label change
  const handleLabelChange = (value: string) => {
    setLabel(value);
    if (!fieldName || fieldName === generateFieldName(label)) {
      setFieldName(generateFieldName(value));
    }
    validateField(value, fieldName === generateFieldName(label) ? generateFieldName(value) : fieldName);
  };

  // Handle field name change
  const handleFieldNameChange = (value: string) => {
    setFieldName(value);
    validateField(label, value);
  };

  // Validate the field
  const validateField = (labelValue: string, fieldNameValue: string) => {
    // Check if field name is already used
    const isDuplicate = existingFields.some(field => field.fieldName === fieldNameValue);
    
    if (!labelValue.trim()) {
      setIsValid(false);
      setErrorMessage('Label is required');
    } else if (!fieldNameValue.trim()) {
      setIsValid(false);
      setErrorMessage('Field name is required');
    } else if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(fieldNameValue)) {
      setIsValid(false);
      setErrorMessage('Field name must start with a letter and contain only letters and numbers');
    } else if (isDuplicate) {
      setIsValid(false);
      setErrorMessage('Field name must be unique within this step');
    } else {
      setIsValid(true);
      setErrorMessage('');
    }
  };

  // Handle add button click
  const handleAdd = () => {
    if (!isValid || !label.trim() || !fieldName.trim()) {
      return;
    }

    const dataType = getDefaultDataType(fieldType);
    
    // For select/multiselect/radio/checkbox, add default options
    let options: FieldOption[] | undefined = undefined;
    if (['select', 'multiselect', 'radio', 'checkbox'].includes(fieldType)) {
      options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ];
    }
    
    onAdd({
      fieldName,
      label,
      fieldType,
      dataType,
      options,
      placeholder: '',
      helpText: '',
      validationRules: [],
      uiHints: { width: 'full' },
    });
    
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Field</DialogTitle>
          <DialogDescription>
            Add a new field to the onboarding step.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="fieldType">Field Type</Label>
            <Select
              value={fieldType}
              onValueChange={setFieldType}
            >
              <SelectTrigger id="fieldType">
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center">
                      <span className="mr-2">{type.icon}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {FIELD_TYPES.find(t => t.value === fieldType)?.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="e.g., First Name"
            />
            <p className="text-xs text-muted-foreground">
              The label displayed to the user above the field
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fieldName">Field Name</Label>
            <Input
              id="fieldName"
              value={fieldName}
              onChange={(e) => handleFieldNameChange(e.target.value)}
              placeholder="e.g., firstName"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for this field in the data model. Use camelCase.
            </p>
            {!isValid && (
              <p className="text-xs text-destructive">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!isValid}>
            Add Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFieldModal;
