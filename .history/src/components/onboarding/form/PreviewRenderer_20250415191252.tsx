// components/onboarding/form/PreviewRenderer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
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
  ValidationRule,
  FieldOption
} from '@/types/onboarding';

// Helper to evaluate if a condition is met based on form data
interface Condition {
  field?: string;
  operator?: string;
  value?: any;
  type?: string;
  conditions?: Condition[];
}

const evaluateCondition = (condition: Condition | undefined, formData: Record<string, any>): boolean => {
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
  
  // Handle isRequired property from configuration
  if (field.isRequired) {
    rules.required = 'This field is required';
  }
  
  // Handle validation rules array if present
  field.validationRules?.forEach((rule: ValidationRule) => {
    const ruleType = rule.rule || rule.type; // Handle both formats
    
    switch (ruleType) {
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
  
  console.log(`Validation rules for ${field.fieldName}:`, rules);
  return rules;
};

// Individual field renderers
const renderField = (field: FormField, register: any, control: any, formState: any) => {
  if (!field) {
    console.error("Received undefined field in renderField");
    return null;
  }
  
  console.log("Rendering field:", field);
  
  const validationRules = createValidationRules(field);
  const errors = formState.errors;
  const fieldError = errors[field.fieldName];
  
  // Use fieldType if available, fall back to type
  const fieldType = field.fieldType || field.type;
  
  console.log(`Field ${field.fieldName} has type/fieldType: ${fieldType}`);
  
  if (!fieldType) {
    console.error(`Field ${field.fieldName} is missing both type and fieldType properties`);
    return null;
  }
  
  switch (fieldType) {
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
          <Controller
            name={field.fieldName}
            control={control}
            rules={validationRules}
            defaultValue={field.defaultValue || ""}
            render={({ field: controllerField }) => (
              <Select
                onValueChange={controllerField.onChange}
                value={controllerField.value}
                defaultValue={field.defaultValue}
              >
                <SelectTrigger
                  id={field.fieldName}
                  className={fieldError ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder={field.placeholder || "Select an option"} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option: FieldOption, index: number) => (
                    <SelectItem key={index} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
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
            {field.options?.map((option: FieldOption, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Controller
                  name={`${field.fieldName}.${option.value}`}
                  control={control}
                  defaultValue={false}
                  render={({ field: controllerField }) => (
                    <Checkbox 
                      id={`${field.fieldName}-${index}`}
                      checked={controllerField.value}
                      onCheckedChange={controllerField.onChange}
                    />
                  )}
                />
                <Label htmlFor={`${field.fieldName}-${index}`} className="font-normal">
                  {option.label}
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
          <Controller
            name={field.fieldName}
            control={control}
            rules={validationRules}
            defaultValue=""
            render={({ field: controllerField }) => (
              <RadioGroup
                value={controllerField.value}
                onValueChange={controllerField.onChange}
              >
                {field.options?.map((option: FieldOption, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem id={`${field.fieldName}-${index}`} value={option.value} />
                    <Label htmlFor={`${field.fieldName}-${index}`} className="font-normal">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
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
            {...register(field.fieldName, validationRules)}
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
      console.error(`Unknown field type "${fieldType}" for field "${field.fieldName}"`);
      return (
        <div className="p-4 border border-destructive rounded-md">
          <p className="text-destructive">Unknown field type: {fieldType}</p>
        </div>
      );
  }
};

// Step renderer
const StepRenderer = ({ step, register, control, formState, formData }: any) => {
  console.log("Rendering step:", step);
  
  if (!step || !step.fields) {
    console.error("Invalid step data:", step);
    return (
      <div className="p-4 border border-destructive rounded-md">
        <p className="text-destructive">Error: Invalid step data</p>
      </div>
    );
  }
  
  // Filter fields based on conditional visibility
  const visibleFields = step.fields.filter((field: FormField) => {
    if (!field) {
      console.error("Undefined field found in step:", step.title);
      return false;
    }
    
    if (!field.conditionalVisibility) return true;
    return evaluateCondition(field.conditionalVisibility, formData);
  });
  
  console.log(`Step ${step.title} has ${visibleFields.length} visible fields out of ${step.fields.length} total`);
  
  // Group fields by width to create a responsive layout
  const renderFields = () => {
    const fields = [...visibleFields];
    const rows = [];
    
    while (fields.length > 0) {
      const field = fields.shift();
      if (!field) continue;
      
      const width = field.uiHints?.width || 'full';
      
      if (width === 'full') {
        rows.push(
          <div key={field.id || field.fieldName} className="col-span-2">
            {renderField(field, register, control, formState)}
          </div>
        );
      } else if (width === 'half') {
        // Look for another half-width field to pair
        const nextHalfIndex = fields.findIndex(f => (f?.uiHints?.width || 'full') === 'half');
        
        if (nextHalfIndex >= 0) {
          const nextHalf = fields.splice(nextHalfIndex, 1)[0];
          rows.push(
            <div key={`${field.id || field.fieldName}-row`} className="col-span-2 grid grid-cols-2 gap-4">
              <div>{renderField(field, register, control, formState)}</div>
              <div>{nextHalf ? renderField(nextHalf, register, control, formState) : null}</div>
            </div>
          );
        } else {
          rows.push(
            <div key={field.id || field.fieldName} className="col-span-2 grid grid-cols-2 gap-4">
              <div>{renderField(field, register, control, formState)}</div>
              <div></div>
            </div>
          );
        }
      } else if (width === 'third') {
        // Create a row of thirds
        const thirds = [field];
        
        // Look for up to two more third-width fields
        for (let i = 0; i < 2; i++) {
          const nextThirdIndex = fields.findIndex(f => (f?.uiHints?.width || 'full') === 'third');
          if (nextThirdIndex >= 0) {
            thirds.push(fields.splice(nextThirdIndex, 1)[0]);
          }
        }
        
        rows.push(
          <div key={`${field.id || field.fieldName}-row`} className="col-span-2 grid grid-cols-3 gap-4">
            {thirds.map((f, i) => (
              <div key={`${f?.id || f?.fieldName || i}`}>{f ? renderField(f, register, control, formState) : null}</div>
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
        <React.Fragment key={step.id || step.key || index}>
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
  mode?: 'preview' | 'live';
  className?: string;
}

const PreviewRenderer: React.FC<PreviewRendererProps> = ({ configuration, mode = 'preview', className = '' }) => {
  console.log("PreviewRenderer received configuration:", configuration);
  console.log("PreviewRenderer mode:", mode);
  
  const [currentStep, setCurrentStep] = useState(0);
  
  // Create form instance
  const methods = useForm();
  const { register, handleSubmit, formState, watch, control, reset } = methods;
  const formData = watch();
  
  // Reset the form when configuration changes
  useEffect(() => {
    console.log("Configuration changed, resetting form");
    reset();
  }, [configuration, reset]);
  
  // Safety check for valid configuration
  if (!configuration || !configuration.steps || !Array.isArray(configuration.steps)) {
    console.error("Invalid configuration:", configuration);
    return (
      <div className="p-6 bg-destructive/10 rounded-lg border border-destructive">
        <h3 className="text-lg font-medium text-destructive">Configuration Error</h3>
        <p className="mt-2">The form configuration is invalid or missing steps.</p>
      </div>
    );
  }
  
  // Filter steps based on conditional visibility with null checks
  const visibleSteps = configuration.steps.filter(step => {
    if (!step) {
      console.error("Undefined step found in configuration");
      return false;
    }
    
    if (!step.conditionalVisibility) return true;
    return evaluateCondition(step.conditionalVisibility, formData);
  });
  
  console.log(`Configuration has ${visibleSteps.length} visible steps out of ${configuration.steps.length} total`);
  
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
      <form onSubmit={handleSubmit(onSubmit)} className={`${className} p-6`}>
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
              control={control}
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
            <p className="text-muted-foreground">No visible steps to display. Check your configuration.</p>
            <pre className="mt-4 p-4 bg-muted rounded text-xs overflow-auto max-h-60">
              {JSON.stringify({ steps: configuration.steps?.length }, null, 2)}
            </pre>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default PreviewRenderer;