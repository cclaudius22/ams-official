// src/components/onboarding/renderer/RenderFieldSwitch.tsx

import React from 'react';
import { getFieldType } from '../registry/fieldTypeRegistry';

// This component renders a field based on its type
const RenderFieldSwitch = ({ field, mode = 'form' }) => {
  // Get field type from registry
  const fieldType = getFieldType(field.type);
  
  if (!fieldType) {
    // Handle unknown field type
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50">
        <p className="text-red-500">Unknown field type: {field.type}</p>
      </div>
    );
  }
  
  // Choose the appropriate component based on mode
  const Component = mode === 'preview' 
    ? fieldType.previewComponent 
    : fieldType.formComponent;
  
  // Render the component
  return <Component field={field} />;
};

export default RenderFieldSwitch;