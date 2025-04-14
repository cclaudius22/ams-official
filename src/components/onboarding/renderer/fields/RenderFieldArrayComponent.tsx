// src/components/onboarding/renderer/fields/RenderFieldArrayComponent.tsx
'use client';

import React from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Use Card for grouping items
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path
import RenderFieldSwitch from '../RenderFieldSwitch'; // Import the switch to render sub-fields

// Add 'config' with 'subFields' and 'addButtonLabel' to FieldConfig type if not already there
// interface FieldConfig {
//   // ... other properties
//   config?: {
//      subFields?: FieldConfig[];
//      addButtonLabel?: string;
//      minItems?: number;
//      maxItems?: number;
//      // ... other repeater specific configs
//   }
// }


interface RenderFieldArrayComponentProps {
  fieldConfig: FieldConfig;
  control: any; // Control object from react-hook-form (passed down, but useFieldArray uses it too)
  // register, errors might be needed if passed directly, but context is often easier
}

const RenderFieldArrayComponent = ({ fieldConfig, control }: RenderFieldArrayComponentProps) => {
  const { fieldName, label, isRequired, config } = fieldConfig;
  const subFieldsConfig = config?.subFields || []; // Get sub-field definitions from config
  const addButtonLabel = config?.addButtonLabel || `Add ${label || 'Item'}`;

  // --- useFieldArray Hook ---
  const { fields, append, remove } = useFieldArray({
    control, // Control object from useFormContext or passed props
    name: fieldName, // The name of the array field in the form data (e.g., "training.modules")
    // keyName: 'customId', // Optional: Use a different key than 'id' if needed, default is 'id'
    // rules: { // Optional: Add validation rules for the array itself
    //    minLength: config?.minItems,
    //    maxLength: config?.maxItems,
    //    required: isRequired
    // }
  });
  // --- End useFieldArray Hook ---

  // Default values for a new item added to the array
  const defaultItemValues = React.useMemo(() => {
      const defaults: Record<string, any> = {};
      subFieldsConfig.forEach(subField => {
          // Add logic here to set default values based on subField.type if needed
          defaults[subField.fieldName] = ''; // Default to empty string or based on type
          if (subField.type === 'checkbox') defaults[subField.fieldName] = false;
      });
      return defaults;
  }, [subFieldsConfig]);

  return (
    <div className="space-y-4">
       {/* Overall Label for the Repeater Section */}
       <Label className="font-medium text-base"> {/* Make label slightly larger */}
          {label || fieldName}
          {isRequired && <span className="text-destructive ml-1">*</span>}
       </Label>

       {/* Render existing items in the array */}
       <div className="space-y-4">
          {fields.map((item, index) => (
             // Using Card to visually group each item's sub-fields
             <Card key={item.id} className="bg-muted/30 p-4 relative group"> {/* Use item.id provided by useFieldArray as key */}
                <CardContent className="p-0 space-y-4"> {/* Remove default Card padding */}
                   {/* Optional: Display item number */}
                   {/* <h4 className="text-sm font-medium mb-2">{label || 'Item'} #{index + 1}</h4> */}

                   {/* Render Sub-fields using RenderFieldSwitch */}
                   {/* Use grid layout within each item */}
                   <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2"> {/* Adjust grid as needed */}
                      {subFieldsConfig
                         .sort((a, b) => a.order - b.order) // Sort sub-fields
                         .map((subFieldConfig) => {
                            // IMPORTANT: Construct the nested field name for RHF
                            const nestedFieldName = `${fieldName}.${index}.${subFieldConfig.fieldName}`;

                            // Determine layout hint for sub-field (if sub-fields have hints)
                            const subColSpan = subFieldConfig.layoutHint === 'fullWidth'
                               ? 'sm:col-span-2'
                               : 'sm:col-span-1';

                            return (
                               <div key={subFieldConfig.id} className={subColSpan}>
                                  {/* Render sub-field using the switch */}
                                  {/* We pass the modified subFieldConfig with the correct nested name */}
                                  <RenderFieldSwitch
                                     fieldConfig={{
                                        ...subFieldConfig,
                                        fieldName: nestedFieldName, // Use the nested name
                                     }}
                                     // RHF context is automatically available via FormProvider
                                  />
                               </div>
                            );
                         })}
                   </div>
                </CardContent>

                 {/* Remove Button - Positioned absolutely or within flow */}
                 <Button
                   type="button"
                   variant="ghost"
                   size="icon"
                   className="absolute top-2 right-2 h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                   title={`Remove ${label || 'Item'} #${index + 1}`}
                   onClick={() => remove(index)} // Call remove function from useFieldArray
                 >
                   <Trash2 className="h-4 w-4" />
                 </Button>
             </Card>
          ))}
       </div>

       {/* Add Item Button */}
       <Button
          type="button" // Important: prevent form submission
          variant="outline"
          size="sm"
          onClick={() => append(defaultItemValues)} // Call append function from useFieldArray
          // Optional: Disable if maxItems reached
          // disabled={config?.maxItems && fields.length >= config.maxItems}
       >
          <Plus className="h-4 w-4 mr-2" />
          {addButtonLabel}
       </Button>

       {/* Display Help Text if provided */}
       {fieldConfig.helpText && (
         <p className="text-xs text-muted-foreground pt-1">{fieldConfig.helpText}</p>
       )}

       {/* Error message for the array field itself (e.g., minLength) - Needs careful RHF setup */}
       {/* {errorMessage && (
          <p id={`${fieldName}-error`} className="text-xs text-destructive font-medium pt-1">
              {errorMessage}
          </p>
        )} */}

    </div>
  );
};

export default RenderFieldArrayComponent;