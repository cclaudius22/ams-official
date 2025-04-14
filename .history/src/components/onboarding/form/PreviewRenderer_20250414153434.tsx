// components/onboarding/form/PreviewRenderer.tsx
'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Info
} from 'lucide-react';

// Types
import { 
  OnboardingConfiguration, 
  OnboardingStep, 
  FormField, 
  ValidationRule 
} from '@/types/onboarding';

// Helper to evaluate if a condition is met based on form data
const evaluateCondition = (condition: any, formData: any): boolean => {
  if (!condition) return true;
  
  // Simple condition
  if (condition.field) {
    const fieldValue = formData[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'notEquals':
        return fieldValue !== condition.value;
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(condition.value);
      case 'greaterThan':
        return fieldValue > condition.value;
      case 'lessThan':
        return fieldValue < condition.value;
      case 'empty':
        return !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0);
      case 'notEmpty':
        return !!fieldValue && (!Array.isArray(fieldValue) || fieldValue.length > 0);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      default:
        return true;
    }
  }
  
  // Group condition
  if (condition.type === 'AND' && Array.isArray(condition.conditions)) {
    return condition.conditions.every(c => evaluateCondition(c, formData));
  }
  
  if (condition.type === 'OR' && Array.isArray(condition.conditions)) {
    return condition.conditions.some(c => evaluateCondition(c, formData));
  }
  
  return true;
};

// Create validation rules for react-hook-form
const createValidationRules = (field: FormField) => {
  const rules: any = {};
  
  field.validationRules?.forEach(rule => {
    switch (rule.type) {
      case 'required':
        rules.required = rule.message || 'This field is required';
        break;
      case 'minLength':
        rules.minLength = {
          value: rule.value,
          message: rule.message || `Minimum length is ${rule.value} characters`,
        };
        break;
      case 'maxLength':
        rules.maxLength = {
          value: rule.value,
          message: rule.message || `Maximum length is ${rule.value} characters`,
        };
        break;
      case 'min':
        rules.min = {
          value: rule.value,
          message: rule.message || `Minimum value is ${rule.value}`,
        };
        break;
      case 'max':
        rules.max = {
          value: rule.value,
          message: rule.message || `Maximum value is ${rule.value}`,
        };
        break;
      case 'pattern':
        rules.pattern = {
          value: new RegExp(rule.value),
          message: rule.message || 'Invalid format',
        };
        break;
      case 'email':
        rules.pattern = {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: rule.message || 'Invalid email address',
        };
        break;
    }
  });
  
  return rules;
};

// Individual field renderers
const renderField = (field: FormField, register: any, formState: any) => {
  const validationRules = createValidationRules(field);
  const errors = formState.errors;
  const fieldError = errors[field.fieldName];
  
  switch (field.fieldType) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label 
            htmlFor={field.fieldName}
            className={validationRules.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
          >
            {field.label}
          </Label>
          <Input
            id={field.fieldName}
            {...register(field.fieldName, validationRules)}
            placeholder={field.placeholder}
            className={fieldError ? 'border-destructive' : ''}
          />
          {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
          {fieldError && <p className="text-xs text-destructive">{fieldError.message?.toString()}</p>}
        </div>
      );
      
    case 'textarea':
      return (
        <div className="space-y-2">
          <Label 
            htmlFor={field.fieldName}
            className={validationRules.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
          >
            {field.label}
          </Label>
          <Textarea
            id={field.fieldName}
            {...register(field.fieldName, validationRules)}
            placeholder={field.placeholder}
            className={fieldError ? 'border-destructive' : ''}
          />
          {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
          {fieldError && <p className="text-xs text-destructive">{fieldError.message?.toString()}</p>}
        </div>
      );
      
    case 'email':
      return (
        <div className="space-y-2">
          <Label 
            htmlFor={field.fieldName}
            className={validationRules.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
          >
            {field.label}
          </Label>
          <Input
            id={field.fieldName}
            type="email"
            {...register(field.fieldName, validationRules)}
            placeholder={field.placeholder}
            className={fieldError ? 'border-destructive' : ''}
          />
          {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
          {fieldError && <p className="text-xs text-destructive">{fieldError.message?.toString()}</p>}
        </div>
      );
      
    case 'password':
      return (
        <div className="space-y-2">
          <Label 
            htmlFor={field.fieldName}
            className={validationRules.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
          >
            {field.label}
          </Label>
          <Input
            id={field.fieldName}
            type="password"
            {...register(field.fieldName, validationRules)}
            placeholder={field.placeholder}
            className={fieldError ? 'border-destructive' : ''}
          />
          {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
          {fieldError && <p className="text-xs text-destructive">{fieldError.message?.toString()}</p>}
        </div>
      );
      
    case 'number':
      return (
        <div className="space-y-2">
          <Label 
            htmlFor={field.fieldName}
            className={validationRules.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
          >
            {field.label}
          </Label>
          <Input
            id={field.fieldName}
            type="number"
            {...register(field.fieldName, {
              ...validationRules,
              valueAsNumber: true,
            })}
            placeholder={field.placeholder}
            className={fieldError ? 'border-destructive' : ''}
          />
          {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
          {fieldError && <p className="text-xs text-destructive">{fieldError.message?.toString()}</p>}
        </div>
      );
      
    case 'date':
      return (
        <div className="space-y-2">
          <Label 
            htmlFor={field.fieldName}
            className={validationRules.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
          >
            {field.label}
          </Label>
          <Input
            id={field.fieldName}
            type="date"
            {...register(field.fieldName, validationRules)}
            className={fieldError ? 'border-destructive' : ''}
          />
          {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
          {fieldError && <p className="text-xs text-destructive">{fieldError.message?.toString()}</p>}
        </div>
      );
      
    case 'select':
      return (
        <div className="space-y-2">
          <Label 
            htmlFor={field.fieldName}
            className={validationRules.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
          >
            {field.label}
          </Label>
          <Select>
            <SelectTrigger
              id={field.fieldName}
              className={fieldError ? 'border-destructive' : ''}
            >
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
          {fieldError && <p className="text-xs text-destructive">{fieldError.message?.toString()}</p>}
        </div>
      );
      
    case 'checkbox':
      return (
        <div className="space-y-2">
          <div>
            <Label 
              className={validationRules.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
            >
              {field.label}
            </Label>
            {field.helpText && <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>}
          </div>
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`${field.fieldName}-${index}`} />
                <Label htmlFor={`${field.fieldName}-${index}`} className="font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </div>
          {fieldError && <p className="text-xs text-destructive">{fieldError.message?.toString()}</p>}
        </div>
      );
      
    case 'radio':
      return (
        <div className="space-y-2">
          <div>
            <Label 
              className={validationRules.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
            >
              {field.label}
            </Label>
            {field.helpText && <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>}
          </div>
          <RadioGroup>
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem id={`${field.fieldName}-${index}`} value={option} />
                <Label htmlFor={`${field.fieldName}-${index}`} className="font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {fieldError && <p className="text-xs text-destructive">{fieldError.message?.toString()}</p>}
        </div>
      );
      
    case 'file':
      return (
        <div className="space-y-2">
          <Label 
            htmlFor={field.fieldName}
            className={validationRules.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}
          >
            {field.label}
          </Label>
          <Input
            id={field.fieldName}
            type="file"
            className={fieldError ? 'border-destructive' : ''}
          />
          {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
          {fieldError && <p className="text-xs text-destructive">{fieldError.message?.toString()}</p>}
        </div>
      );
      
    case 'heading':
      return (
        <div className="pt-2 pb-1">
          <h3 className="text-lg font-semibold">{field.label}</h3>
          {field.helpText && <p className="text-sm text-muted-foreground mt-1">{field.helpText}</p>}
        </div>
      );
      
    case 'info':
      return (
        <div className="rounded-lg bg-muted p-4 flex items-start space-x-3">
          <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            {field.label && <h4 className="font-medium">{field.label}</h4>}
            <p className="text-sm text-muted-foreground mt-1">{field.helpText}</p>
          </div>
        </div>
      );
      
    default:
      return null;
  }
};

// Step renderer
const StepRenderer = ({ step, register, formState, formData }: any) => {
  // Filter fields based on conditional visibility
  const visibleFields = step.fields.filter((field: FormField) => {
    if (!field.conditionalVisibility) return true;
    return evaluateCondition(field.conditionalVisibility, formData);
  });
  
  // Group fields by width to create a responsive layout
  const renderFields = () => {
    const fields = [...visibleFields];
    const rows = [];
    
    while (fields.length > 0) {
      const field = fields.shift();
      const width = field.uiHints?.width || 'full';
      
      if (width === 'full') {
        rows.push(
          <div key={field.fieldName} className="col-span-2">
            {renderField(field, register, formState)}
          </div>
        );
      } else if (width === 'half') {
        // Look for another half-width field to pair
        const nextHalfIndex = fields.findIndex(f => (f.uiHints?.width || 'full') === 'half');
        
        if (nextHalfIndex >= 0) {
          const nextHalf = fields.splice(nextHalfIndex, 1)[0];
          rows.push(
            <div key={`${field.fieldName}-row`} className="col-span-2 grid grid-cols-2 gap-4">
              <div>{renderField(field, register, formState)}</div>
              <div>{renderField(nextHalf, register, formState)}</div>
            </div>
          );
        } else {
          rows.push(
            <div key={field.fieldName} className="col-span-2 grid grid-cols-2 gap-4">
              <div>{renderField(field, register, formState)}</div>
              <div></div>
            </div>
          );
        }
      } else if (width === 'third') {
        // Create a row of thirds
        const thirds = [field];
        
        // Look for up to two more third-width fields
        for (let i = 0; i < 2; i++) {
          const nextThirdIndex = fields.findIndex(f => (f.uiHints?.width || 'full') === 'third');
          if (nextThirdIndex >= 0) {
            thirds.push(fields.splice(nextThirdIndex, 1)[0]);
          }
        }
        
        rows.push(
          <div key={`${field.fieldName}-row`} className="col-span-2 grid grid-cols-3 gap-4">
            {thirds.map((f, i) => (
              <div key={`${f.fieldName}-${i}`}>{renderField(f, register, formState)}</div>
            ))}
            {thirds.length === 1 && (<><div></div><div></div></>)}
            {thirds.length === 2 && (<div></div>)}
          </div>
        );
      }
    }
    
    return rows;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{step.title}</h2>
        {step.description && <p className="text-muted-foreground mt-1">{step.description}</p>}
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {renderFields()}
      </div>
    </div>
  );
};

// Progress indicator
const ProgressIndicator = ({ steps, currentStep, onStepChange }: any) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step: OnboardingStep, index: number) => (
        <React.Fragment key={step.key}>
          <button
            type="button"
            onClick={() => onStepChange(index)}
            className={`flex flex-col items-center ${
              index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
            }`}
            disabled={index > currentStep}
          >
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center mb-2 ${
                index < currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : index === currentStep 
                    ? 'bg-primary/90 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {index < currentStep ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className={`text-xs ${
              index === currentStep ? 'font-medium' : 'text-muted-foreground'
            }`}>
              {step.title}
            </span>
          </button>
          
          {index < steps.length - 1 && (
            <div className={`h-[1px] flex-1 mx-2 ${
              index < currentStep ? 'bg-primary' : 'bg-muted'
            }`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

interface PreviewRendererProps {
  configuration: OnboardingConfiguration;
}

const PreviewRenderer: React.FC<PreviewRendererProps> = ({ configuration }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Create form instance
  const methods = useForm();
  const { register, handleSubmit, formState, watch } = methods;
  const formData = watch();
  
  // Filter steps based on conditional visibility
  const visibleSteps = configuration.steps.filter(step => {
    if (!step.conditionalVisibility) return true;
    return evaluateCondition(step.conditionalVisibility, formData);
  });
  
  // Handle step navigation
  const goToNextStep = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
    // In the real app, this would submit the onboarding data
  };
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {visibleSteps.length > 0 ? (
          <>
            <ProgressIndicator 
              steps={visibleSteps} 
              currentStep={currentStep} 
              onStepChange={setCurrentStep} 
            />
            
            <StepRenderer 
              step={visibleSteps[currentStep]} 
              register={register} 
              formState={formState} 
              formData={formData}
            />
            
            <div className="mt-8 pt-4 border-t flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Step
              </Button>
              
              {currentStep < visibleSteps.length - 1 ? (
                <Button
                  type="button"
                  onClick={goToNextStep}
                >
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit">
                  Complete Onboarding
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">No visible steps to display.</p>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default PreviewRenderer;