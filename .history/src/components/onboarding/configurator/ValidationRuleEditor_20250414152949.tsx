// components/onboarding/configurator/ValidationRuleEditor.tsx
'use client';

import React, { useState } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, 
  Trash2,
  AlertCircle,
  Info,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Types for validation rules
export interface ValidationRule {
  type: string;
  message?: string;
  value?: any;
}

// Validation rule types and their settings based on field and data types
const VALIDATION_RULES = {
  required: {
    name: 'Required',
    description: 'Field must have a value',
    applicableTypes: ['all'],
    hasValue: false,
    defaultMessage: 'This field is required',
  },
  minLength: {
    name: 'Minimum Length',
    description: 'Minimum number of characters',
    applicableTypes: ['text', 'textarea', 'password', 'email'],
    hasValue: true,
    valueType: 'number',
    defaultMessage: 'Must be at least {value} characters',
  },
  maxLength: {
    name: 'Maximum Length',
    description: 'Maximum number of characters',
    applicableTypes: ['text', 'textarea', 'password', 'email'],
    hasValue: true,
    valueType: 'number',
    defaultMessage: 'Must be at most {value} characters',
  },
  min: {
    name: 'Minimum Value',
    description: 'Minimum allowed value',
    applicableTypes: ['number', 'date'],
    hasValue: true,
    valueType: 'number',
    defaultMessage: 'Must be at least {value}',
  },
  max: {
    name: 'Maximum Value',
    description: 'Maximum allowed value',
    applicableTypes: ['number', 'date'],
    hasValue: true,
    valueType: 'number',
    defaultMessage: 'Must be at most {value}',
  },
  pattern: {
    name: 'Pattern Match',
    description: 'Regular expression pattern',
    applicableTypes: ['text', 'textarea', 'email', 'password'],
    hasValue: true,
    valueType: 'string',
    defaultMessage: 'Invalid format',
  },
  email: {
    name: 'Email Format',
    description: 'Must be a valid email address',
    applicableTypes: ['email', 'text'],
    hasValue: false,
    defaultMessage: 'Please enter a valid email address',
  },
  url: {
    name: 'URL Format',
    description: 'Must be a valid URL',
    applicableTypes: ['text'],
    hasValue: false,
    defaultMessage: 'Please enter a valid URL',
  },
  minItems: {
    name: 'Minimum Items',
    description: 'Minimum number of selected items',
    applicableTypes: ['multiselect', 'checkbox'],
    hasValue: true,
    valueType: 'number',
    defaultMessage: 'Please select at least {value} items',
  },
  maxItems: {
    name: 'Maximum Items',
    description: 'Maximum number of selected items',
    applicableTypes: ['multiselect', 'checkbox'],
    hasValue: true,
    valueType: 'number',
    defaultMessage: 'Please select at most {value} items',
  },
  fileType: {
    name: 'File Type',
    description: 'Allowed file types (comma-separated)',
    applicableTypes: ['file'],
    hasValue: true,
    valueType: 'string',
    defaultMessage: 'Only {value} files are allowed',
  },
  maxFileSize: {
    name: 'Maximum File Size',
    description: 'Maximum file size in KB',
    applicableTypes: ['file'],
    hasValue: true,
    valueType: 'number',
    defaultMessage: 'File size must be less than {value} KB',
  },
};

interface ValidationRuleEditorProps {
  rules: ValidationRule[];
  fieldType: string;
  dataType: string;
  onChange: (rules: ValidationRule[]) => void;
}

const ValidationRuleEditor: React.FC<ValidationRuleEditorProps> = ({
  rules,
  fieldType,
  dataType,
  onChange,
}) => {
  const [newRuleType, setNewRuleType] = useState<string>('');

  // Filter applicable rule types based on field type
  const getApplicableRules = () => {
    return Object.entries(VALIDATION_RULES).filter(([ruleType, rule]) => {
      return rule.applicableTypes.includes('all') || rule.applicableTypes.includes(fieldType);
    });
  };

  // Check if a rule type is already added
  const isRuleAdded = (ruleType: string) => {
    return rules.some(rule => rule.type === ruleType);
  };

  // Format default message with value
  const formatValidationMessage = (template: string, replacement: any) => {
    return template.replace('{value}', replacement);
  };

  // Add a new validation rule
  const addRule = () => {
    if (!newRuleType || isRuleAdded(newRuleType)) return;

    const ruleSettings = VALIDATION_RULES[newRuleType as keyof typeof VALIDATION_RULES];
    const newRule: ValidationRule = {
      type: newRuleType,
      message: ruleSettings.defaultMessage,
      value: ruleSettings.hasValue ? (ruleSettings.valueType === 'number' ? 0 : '') : undefined,
    };

    onChange([...rules, newRule]);
    setNewRuleType('');
  };

  // Update an existing rule
  const updateRule = (index: number, field: keyof ValidationRule, value: any) => {
    const updatedRules = [...rules];
    updatedRules[index] = {
      ...updatedRules[index],
      [field]: value,
    };
    onChange(updatedRules);
  };

  // Remove a rule
  /**
   * Removes a validation rule at the given index
   * @param {number} index Index of the rule to remove
   */
  const removeRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    onChange(updatedRules);
  };

  // Get available rule types (not already added)
  const availableRuleTypes = getApplicableRules().filter(([ruleType, _]) => !isRuleAdded(ruleType));

  return (
    <div className="space-y-4">
      {rules.length === 0 ? (
        <div className="flex items-center justify-center py-6 border border-dashed rounded-md">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No validation rules added</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add rules to validate user input for this field
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, index) => {
            const ruleSettings = VALIDATION_RULES[rule.type as keyof typeof VALIDATION_RULES];
            
            return (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-3 bg-muted">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{ruleSettings?.name || rule.type}</Badge>
                      {ruleSettings && (
                        <span className="text-xs text-muted-foreground">{ruleSettings.description}</span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeRule(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="p-3 space-y-3">
                    {ruleSettings?.hasValue && (
                      <div>
                        <Label htmlFor={`rule-value-${index}`}>Value</Label>
                        <Input
                          id={`rule-value-${index}`}
                          type={ruleSettings.valueType === 'number' ? 'number' : 'text'}
                          value={rule.value}
                          onChange={(e) => updateRule(index, 'value', ruleSettings.valueType === 'number' ? Number(e.target.value) : e.target.value)}
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor={`rule-message-${index}`}>Error Message</Label>
                      <Input
                        id={`rule-message-${index}`}
                        value={rule.message}
                        onChange={(e) => updateRule(index, 'message', e.target.value)}
                        placeholder={ruleSettings?.defaultMessage}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {availableRuleTypes.length > 0 && (
        <div className="flex space-x-2">
          <Select value={newRuleType} onValueChange={setNewRuleType}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Add validation rule" />
            </SelectTrigger>
            <SelectContent>
              {availableRuleTypes.map(([ruleType, rule]) => (
                <SelectItem key={ruleType} value={ruleType}>
                  <div className="flex items-center">
                    <span>{rule.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({rule.description})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={addRule}
            disabled={!newRuleType || isRuleAdded(newRuleType)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      )}

      {availableRuleTypes.length === 0 && rules.length > 0 && (
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground">
            All applicable validation rules have been added.
          </p>
        </div>
      )}
      
      <div className="mt-4 text-sm flex items-start space-x-2 text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5" />
        <p>Validation rules are applied in the order shown above. Add appropriate error messages to help users correct their input.</p>
      </div>
    </div>
  );
};

export default ValidationRuleEditor;