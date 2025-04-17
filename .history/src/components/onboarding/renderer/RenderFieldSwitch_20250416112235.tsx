// src/components/onboarding/renderer/RenderFieldSwitch.tsx

import { getFieldType } from '../registry/fieldTypeRegistry';
import { useFormContext } from 'react-hook-form';

const RenderFieldSwitch = ({ field }) => {
  const formMethods = useFormContext();
  
  // Get the field implementation from registry
  const fieldType = getFieldType(field.type);
  
  if (!fieldType) {
    // Handle unknown field type
    return (
      <div className="p-4 border border-red-200 rounded bg-red-50">
        <p className="text-red-500">Unknown field type: {field.type}</p>
      </div>
    );
  }
  
  // Get the form component
  const FieldComponent = fieldType.formComponent;
  
  // Render the component with field configuration and form context
  return (
    <FieldComponent
      field={field}
      disabled={false}
    />
  );
};

export default RenderFieldSwitch;