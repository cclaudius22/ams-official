// components/onboarding/configurator/ConditionalLogicEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  Plus, 
  Trash2, 
  AlertCircle,
  AndIcon,
  OrIcon
} from 'lucide-react';

// Types for conditional logic
interface Condition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'empty' | 'notEmpty' | 'in';
  value?: string | string[];
}

interface ConditionGroup {
  type: 'AND' | 'OR';
  conditions: Array<Condition | ConditionGroup>;
}

export type ConditionalVisibility = Condition | ConditionGroup | null;

interface ConditionalLogicEditorProps {
  condition: ConditionalVisibility;
  onChange: (condition: ConditionalVisibility) => void;
  availableFields?: { fieldName: string; label: string }[];
}

const ConditionalLogicEditor: React.FC<ConditionalLogicEditorProps> = ({
  condition,
  onChange,
  availableFields = [],
}) => {
  // Initialize with an empty AND group if no condition exists
  useEffect(() => {
    if (!condition) {
      onChange({
        type: 'AND',
        conditions: [{
          field: '',
          operator: 'equals',
          value: ''
        }]
      });
    }
  }, []);

  const isGroup = (item: any): item is ConditionGroup => {
    return item && (item.type === 'AND' || item.type === 'OR');
  };

  const addCondition = (group: ConditionGroup) => {
    const newGroup = { ...group };
    newGroup.conditions = [...newGroup.conditions, {
      field: '',
      operator: 'equals',
      value: ''
    }];
    onChange(newGroup);
  };

  const updateCondition = (
    group: ConditionGroup, 
    index: number, 
    field: keyof Condition, 
    value: any
  ) => {
    const newGroup = { ...group };
    const condition = { ...newGroup.conditions[index] } as Condition;
    
    // If this is a nested group, return
    if (isGroup(condition)) return;
    
    // Update the condition
    condition[field] = value;
    
    // If operator changed, reset value for certain operators
    if (field === 'operator') {
      if (value === 'empty' || value === 'notEmpty') {
        condition.value = undefined;
      } else if (value === 'in' && !Array.isArray(condition.value)) {
        condition.value = condition.value ? [condition.value.toString()] : [];
      } else if (value !== 'in' && Array.isArray(condition.value)) {
        condition.value = condition.value.length > 0 ? condition.value[0] : '';
      } else if (!condition.value && value !== 'empty' && value !== 'notEmpty') {
        condition.value = '';
      }
    }
    
    newGroup.conditions[index] = condition;
    onChange(newGroup);
  };

  const removeCondition = (group: ConditionGroup, index: number) => {
    const newGroup = { ...group };
    newGroup.conditions = newGroup.conditions.filter((_, i) => i !== index);
    
    // If all conditions were removed, add one empty condition
    if (newGroup.conditions.length === 0) {
      newGroup.conditions = [{
        field: '',
        operator: 'equals',
        value: ''
      }];
    }
    
    onChange(newGroup);
  };

  const toggleGroupType = (group: ConditionGroup) => {
    const newGroup = { ...group };
    newGroup.type = newGroup.type === 'AND' ? 'OR' : 'AND';
    onChange(newGroup);
  };

  // If condition is null or not a group, show a message
  if (!condition) {
    return (
      <div className="text-center py-4">
        <AlertCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading condition...</p>
      </div>
    );
  }

  if (!isGroup(condition)) {
    // Convert single condition to group for consistency
    const conditionGroup: ConditionGroup = {
      type: 'AND',
      conditions: [condition]
    };
    return <ConditionalLogicEditor condition={conditionGroup} onChange={onChange} availableFields={availableFields} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => toggleGroupType(condition)}
          className="text-xs"
        >
          {condition.type === 'AND' ? (
            <>
              <AndIcon className="h-3 w-3 mr-1" /> All conditions (AND)
            </>
          ) : (
            <>
              <OrIcon className="h-3 w-3 mr-1" /> Any condition (OR)
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addCondition(condition)}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Condition
        </Button>
      </div>

      {condition.conditions.map((cond, index) => {
        // Skip nested groups for simplicity (could expand later)
        if (isGroup(cond)) return null;

        return (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-4">
              <Select
                value={cond.field}
                onValueChange={(value) => updateCondition(condition, index, 'field', value)}
              >
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.length > 0 ? (
                    availableFields.map((field) => (
                      <SelectItem key={field.fieldName} value={field.fieldName} className="text-xs">
                        {field.label}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="firstName" className="text-xs">First Name</SelectItem>
                      <SelectItem value="lastName" className="text-xs">Last Name</SelectItem>
                      <SelectItem value="email" className="text-xs">Email</SelectItem>
                      <SelectItem value="role" className="text-xs">Role</SelectItem>
                      <SelectItem value="department" className="text-xs">Department</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-3">
              <Select
                value={cond.operator}
                onValueChange={(value) => updateCondition(
                  condition, 
                  index, 
                  'operator', 
                  value as Condition['operator']
                )}
              >
                <SelectTrigger className="text-xs h-8">
                  <SelectValue placeholder="Operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals" className="text-xs">equals</SelectItem>
                  <SelectItem value="notEquals" className="text-xs">not equals</SelectItem>
                  <SelectItem value="contains" className="text-xs">contains</SelectItem>
                  <SelectItem value="greaterThan" className="text-xs">greater than</SelectItem>
                  <SelectItem value="lessThan" className="text-xs">less than</SelectItem>
                  <SelectItem value="empty" className="text-xs">is empty</SelectItem>
                  <SelectItem value="notEmpty" className="text-xs">is not empty</SelectItem>
                  <SelectItem value="in" className="text-xs">in list</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-4">
              {cond.operator !== 'empty' && cond.operator !== 'notEmpty' && (
                <Input
                  value={Array.isArray(cond.value) ? cond.value.join(', ') : cond.value || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (cond.operator === 'in') {
                      // Split by comma and trim
                      const values = val.split(',').map(v => v.trim()).filter(v => v);
                      updateCondition(condition, index, 'value', values);
                    } else {
                      updateCondition(condition, index, 'value', val);
                    }
                  }}
                  placeholder={cond.operator === 'in' ? "Values (comma separated)" : "Value"}
                  className="text-xs h-8"
                />
              )}
            </div>
            
            <div className="col-span-1 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeCondition(condition, index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}

      <div className="mt-2 text-xs text-muted-foreground">
        <p>This step will only be shown if the condition{condition.conditions.length > 1 ? 's are' : ' is'} met.</p>
      </div>
    </div>
  );
};

export default ConditionalLogicEditor;