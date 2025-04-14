// components/onboarding/configurator/FieldConfigurator.tsx
'use client';

import React, { useState } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
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
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { 
  Settings, 
  Eye, 
  List, 
  Code
} from 'lucide-react';

// Types
import { FormField, ValidationRule } from '@/types/onboarding';
import ValidationRuleEditor from './ValidationRuleEditor';
import ConditionalLogicEditor from './ConditionalLogicEditor';

interface FieldConfiguratorProps {
  field: FormField;
  onUpdate: (updatedField: FormField) => void;
}

const FieldConfigurator: React.FC<FieldConfiguratorProps> = ({ field, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('general');
  
  const handleInputChange = (
    property: keyof FormField, 
    value: any
  ) => {
    onUpdate({
      ...field,
      [property]: value,
    });
  };
  
  const handleValidationChange = (rules: ValidationRule[]) => {
    onUpdate({
      ...field,
      validationRules: rules,
    });
  };
  
  const handleOptionsChange = (options: string[]) => {
    onUpdate({
      ...field,
      options,
    });
  };
  
  const handleConditionalVisibilityChange = (condition: any) => {
    onUpdate({
      ...field,
      conditionalVisibility: condition,
    });
  };
  
  const handleWidthChange = (width: string) => {
    onUpdate({
      ...field,
      uiHints: {
        ...field.uiHints,
        width,
      },
    });
  };
  
  // Determine if options are needed based on field type
  const needsOptions = [
    'select', 
    'multiselect', 
    'radio', 
    'checkbox'
  ].includes(field.fieldType);
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
        </TabsList>
        
        {/* General Tab */}
        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="fieldName">Field Name</Label>
            <Input
              id="fieldName"
              value={field.fieldName}
              onChange={(e) => handleInputChange('fieldName', e.target.value)}
              placeholder="e.g., firstName"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for this field. Use camelCase.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={field.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              placeholder="e.g., First Name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type</Label>
              <Select
                value={field.fieldType}
                onValueChange={(value) => handleInputChange('fieldType', value)}
              >
                <SelectTrigger id="fieldType">
                  <SelectValue placeholder="Select field type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="textarea">Text Area</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Select (Dropdown)</SelectItem>
                  <SelectItem value="multiselect">Multi-Select</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="radio">Radio Buttons</SelectItem>
                  <SelectItem value="file">File Upload</SelectItem>
                  <SelectItem value="info">Info Text</SelectItem>
                  <SelectItem value="heading">Heading</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataType">Data Type</Label>
              <Select
                value={field.dataType}
                onValueChange={(value) => handleInputChange('dataType', value)}
              >
                <SelectTrigger id="dataType">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                  <SelectItem value="object">Object</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={field.placeholder || ''}
              onChange={(e) => handleInputChange('placeholder', e.target.value)}
              placeholder="e.g., Enter your first name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="helpText">Help Text</Label>
            <Input
              id="helpText"
              value={field.helpText || ''}
              onChange={(e) => handleInputChange('helpText', e.target.value)}
              placeholder="e.g., Your legal first name as it appears on your ID"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Width</Label>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant={field.uiHints?.width === 'full' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleWidthChange('full')}
              >
                Full
              </Button>
              <Button
                type="button"
                variant={field.uiHints?.width === 'half' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleWidthChange('half')}
              >
                Half
              </Button>
              <Button
                type="button"
                variant={field.uiHints?.width === 'third' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => handleWidthChange('third')}
              >
                Third
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-4 pt-4">
          <ValidationRuleEditor
            rules={field.validationRules || []}
            fieldType={field.fieldType}
            dataType={field.dataType}
            onChange={handleValidationChange}
          />
        </TabsContent>
        
        {/* Options Tab */}
        <TabsContent value="options" className="space-y-4 pt-4">
          {needsOptions ? (
            <div className="space-y-4">
              <Label>Options</Label>
              <div className="space-y-2">
                {(field.options || []).map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[index] = e.target.value;
                        handleOptionsChange(newOptions);
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newOptions = (field.options || []).filter((_, i) => i !== index);
                        handleOptionsChange(newOptions);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M18 6L6 18"></path>
                        <path d="M6 6l12 12"></path>
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  handleOptionsChange([...(field.options || []), '']);
                }}
              >
                Add Option
              </Button>
              
              <div className="text-xs text-muted-foreground">
                {field.fieldType === 'select' && (
                  <p>These options will appear in the dropdown menu.</p>
                )}
                {field.fieldType === 'multiselect' && (
                  <p>Users will be able to select multiple options from this list.</p>
                )}
                {field.fieldType === 'radio' && (
                  <p>Users will be able to select a single option from these radio buttons.</p>
                )}
                {field.fieldType === 'checkbox' && (
                  <p>Users will be able to check multiple options from this list.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                Options are only applicable for select, multiselect, radio, and checkbox field types.
              </p>
            </div>
          )}
        </TabsContent>
        
        {/* Visibility Tab */}
        <TabsContent value="visibility" className="space-y-4 pt-4">
          <ConditionalLogicEditor
            condition={field.conditionalVisibility || null}
            onChange={handleConditionalVisibilityChange}
          />
          <div className="text-xs text-muted-foreground mt-2">
            <p>This field will only be shown if the condition is met.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FieldConfigurator;