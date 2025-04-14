// components/onboarding/configurator/StepConfigurator.tsx
'use client';

import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription, 
  CardFooter 
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

// Icons
import { 
  MoveVertical, 
  Settings, 
  Trash2, 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff 
} from 'lucide-react';

// Types
import { OnboardingStep, FormField } from '@/types/onboarding';

// Child components
import FieldConfigurator from './FieldConfigurator';
import ConditionalLogicEditor from './ConditionalLogicEditor';

interface StepConfiguratorProps {
  step: OnboardingStep;
  onUpdate: (updatedStep: OnboardingStep) => void;
  onDelete: () => void;
  onAddField: () => void;
  onFieldUpdate: (fieldIndex: number, updatedField: FormField) => void;
  onFieldDelete: (fieldIndex: number) => void;
  activeFieldIndex: number | null;
  setActiveFieldIndex: (index: number | null) => void;
  isDragging?: boolean;
}

const StepConfigurator: React.FC<StepConfiguratorProps> = ({
  step,
  onUpdate,
  onDelete,
  onAddField,
  onFieldUpdate,
  onFieldDelete,
  activeFieldIndex,
  setActiveFieldIndex,
  isDragging = false,
}) => {
  const [showConditionalLogic, setShowConditionalLogic] = useState(false);
  
  const handleInputChange = (field: keyof OnboardingStep, value: any) => {
    onUpdate({
      ...step,
      [field]: value,
    });
  };
  
  const handleConditionalLogicUpdate = (condition: any) => {
    onUpdate({
      ...step,
      conditionalVisibility: condition,
    });
  };

  return (
    <Card className={`mb-4 ${isDragging ? 'opacity-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle>
              <Input
                value={step.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Step Title"
                className="text-xl font-bold border-0 p-0 h-8 focus-visible:ring-0"
              />
            </CardTitle>
            <CardDescription className="pt-1">
              <Input
                value={step.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Step Description (optional)"
                className="text-muted-foreground border-0 p-0 h-6 focus-visible:ring-0"
              />
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" title="Reorder">
              <MoveVertical className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              title="Edit Conditional Logic"
              onClick={() => setShowConditionalLogic(!showConditionalLogic)}
            >
              {step.conditionalVisibility ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              title="Delete Step"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {showConditionalLogic && (
        <CardContent className="border-t border-b pt-4 pb-4">
          <h4 className="text-sm font-medium mb-2">Conditional Visibility</h4>
          <ConditionalLogicEditor
            condition={step.conditionalVisibility}
            onChange={handleConditionalLogicUpdate}
          />
        </CardContent>
      )}

      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium">Fields</h4>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onAddField}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </div>

        {step.fields.length === 0 ? (
          <div className="py-8 text-center border border-dashed rounded-md">
            <p className="text-muted-foreground">No fields added to this step yet.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={onAddField}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {step.fields.map((field, index) => (
              <div 
                key={`${field.fieldName}-${index}`}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  activeFieldIndex === index 
                    ? 'border-primary bg-muted/50' 
                    : 'hover:bg-accent'
                }`}
                onClick={() => setActiveFieldIndex(index)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{field.label}</div>
                    <div className="text-sm text-muted-foreground">{field.fieldName} • {field.fieldType}</div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon">
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFieldDelete(index);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end border-t pt-4">
        <div className="text-xs text-muted-foreground">
          Step Key: <code className="bg-muted px-1 py-0.5 rounded">{step.key}</code>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StepConfigurator;