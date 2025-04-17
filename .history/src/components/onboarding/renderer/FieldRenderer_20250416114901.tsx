// src/components/onboarding/renderer/FieldRenderer.tsx
import React from 'react';
import { getFieldType } from '../registry/fieldTypeRegistry';

interface FieldRendererProps {
  field: {
    id: string;
    type: string;
    fieldName: string;
    [key: string]: any;
  };
  mode?: 'form' | 'preview';
  disabled?: boolean;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ 
  field, 
  mode = 'form',
  disabled = false
}) => {
  // Get field type from registry
  const fieldType = getFieldType(field.type);
  
  if (!fieldType) {
    // Handle unknown field type
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50">
        <p className="text-red-500 font-medium">Unknown field type: {field.type}</p>
        <p className="text-sm text-red-400 mt-1">
          This field type is not registered in the field registry.
        </p>
      </div>
    );
  }
  
  // Choose the component based on the mode
  const Component = mode === 'preview' 
    ? fieldType.previewComponent 
    : fieldType.formComponent;
  
  // Render the field component
  return <Component field={field} disabled={disabled} />;
};

export default FieldRenderer;