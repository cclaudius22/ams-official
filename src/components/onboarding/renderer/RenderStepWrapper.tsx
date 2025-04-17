// src/components/onboarding/renderer/RenderStepWrapper.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import FieldRenderer from './FieldRenderer';
import { StepConfig } from '../configurator/types';

interface RenderStepWrapperProps {
  stepConfig: StepConfig;
  mode?: 'form' | 'preview';
  disabled?: boolean;
}

const RenderStepWrapper: React.FC<RenderStepWrapperProps> = ({ 
  stepConfig, 
  mode = 'form',
  disabled = false
}) => {
  const formMethods = useFormContext();
  const formData = formMethods?.watch ? formMethods.watch() : {};
  
  // Function to evaluate conditional visibility
  const evaluateCondition = (condition: any, data: Record<string, any>): boolean => {
    if (!condition) return true;
    
    // Simple condition
    if (condition.field) {
      const fieldValue = data[condition.field];
      
      switch(condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'notEquals':
          return fieldValue !== condition.value;
        case 'contains':
          return typeof fieldValue === 'string' && fieldValue.includes(condition.value);
        case 'empty':
          return !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0);
        case 'notEmpty':
          return !!fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0);
        default:
          return true;
      }
    }
    
    // Group condition
    if (condition.type === 'AND' && Array.isArray(condition.conditions)) {
      return condition.conditions.every(c => evaluateCondition(c, data));
    }
    
    if (condition.type === 'OR' && Array.isArray(condition.conditions)) {
      return condition.conditions.some(c => evaluateCondition(c, data));
    }
    
    return true;
  };
  
  // Filter fields based on conditional visibility if applicable
  const visibleFields = stepConfig.fields.filter(field => {
    // If field has conditional visibility, evaluate it
    if (field.conditionalVisibility) {
      return evaluateCondition(field.conditionalVisibility, formData);
    }
    return true;
  });
  
  return (
    <div className="space-y-6">
      {visibleFields.map(field => (
        <div key={field.id || field.fieldName} className="field-wrapper">
          <FieldRenderer 
            field={field}
            mode={mode}
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
};

export default RenderStepWrapper;