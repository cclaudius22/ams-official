// src/components/onboarding/form/PreviewRenderer.tsx

import { getFieldType } from '../registry/fieldTypeRegistry';

// Inside your StepRenderer component:
const renderField = (field) => {
  // Get the field type from registry
  const fieldType = getFieldType(field.type);
  
  if (!fieldType) {
    // Handle unknown field type
    return (
      <div className="error-state">
        Unknown field type: {field.type}
      </div>
    );
  }
  
  // Use the preview component from the registry
  const PreviewComponent = fieldType.previewComponent;
  
  // Render the component with the field config
  return <PreviewComponent field={field} />;
};