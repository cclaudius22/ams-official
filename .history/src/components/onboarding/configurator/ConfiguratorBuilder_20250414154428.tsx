// components/onboarding/configurator/ConfiguratorBuilder.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/sonner';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Lucide icons
import { 
  Save, 
  Plus, 
  ChevronRight, 
  X, 
  Edit, 
  Trash2, 
  MoveVertical, 
  Settings, 
  Eye, 
  List, 
  Code
} from 'lucide-react';

// Custom components
import StepConfigurator from './StepConfigurator';
import FieldConfigurator from './FieldConfigurator';
import AddStepModal from './AddStepModal';
import AddFieldModal from './AddFieldModal';
import ValidationRuleEditor from './ValidationRuleEditor';
import ConditionalLogicEditor from './ConditionalLogicEditor';
import PreviewRenderer from '../form/PreviewRenderer';

// Types
import { 
  OnboardingConfiguration, 
  OnboardingStep, 
  FormField,
  ValidationRule,
  ConditionalVisibility
} from '@/types/onboarding';

// Services
import { 
  getConfiguration, 
  createConfiguration, 
  updateConfiguration 
} from '@/services/onboardingService';

interface ConfiguratorBuilderProps {
  configId?: string;
}

const ConfiguratorBuilder: React.FC<ConfiguratorBuilderProps> = ({ configId }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [activeStepKey, setActiveStepKey] = useState<string | null>(null);
  const [activeFieldIndex, setActiveFieldIndex] = useState<number | null>(null);
  
  // Configuration state
  const [configuration, setConfiguration] = useState<OnboardingConfiguration>({
    name: 'New Onboarding Configuration',
    key: '',
    targetUserType: 'employee',
    targetOrgType: 'all',
    version: 1,
    isActive: false,
    securityLevel: 'standard',
    steps: [],
    createdBy: '',
  });
  
  // Load existing configuration if editing
  useEffect(() => {
    const loadExistingConfig = async () => {
      if (configId) {
        setLoading(true);
        try {
          const config = await getConfiguration(configId);
          setConfiguration(config);
          if (config.steps.length > 0) {
            setActiveStepKey(config.steps[0].key);
          }
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load configuration',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadExistingConfig();
  }, [configId]);
  
  // Handle input changes for configuration details
  const handleInputChange = (field: keyof OnboardingConfiguration, value: any) => {
    setConfiguration(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle step reordering via drag and drop
  const handleStepDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Find indices of steps
      const oldIndex = configuration.steps.findIndex(step => step.key === active.id);
      const newIndex = configuration.steps.findIndex(step => step.key === over.id);
      
      // Reorder steps
      const newSteps = [...configuration.steps];
      const [movedStep] = newSteps.splice(oldIndex, 1);
      newSteps.splice(newIndex, 0, movedStep);
      
      // Update order properties
      const updatedSteps = newSteps.map((step, index) => ({
        ...step,
        order: index
      }));
      
      // Update configuration
      setConfiguration(prev => ({
        ...prev,
        steps: updatedSteps
      }));
    }
  };
  
  // Handle field reordering via drag and drop
  const handleFieldDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && activeStepKey) {
      // Find active step
      const stepIndex = configuration.steps.findIndex(step => step.key === activeStepKey);
      if (stepIndex === -1) return;
      
      // Find field indices
      const oldIndex = parseInt(active.id.toString().split('-')[1]);
      const newIndex = parseInt(over.id.toString().split('-')[1]);
      
      // Reorder fields
      const step = configuration.steps[stepIndex];
      const newFields = [...step.fields];
      const [movedField] = newFields.splice(oldIndex, 1);
      newFields.splice(newIndex, 0, movedField);
      
      // Update order properties
      const updatedFields = newFields.map((field, index) => ({
        ...field,
        order: index
      }));
      
      // Update step in configuration
      const newSteps = [...configuration.steps];
      newSteps[stepIndex] = {
        ...step,
        fields: updatedFields
      };
      
      // Update configuration
      setConfiguration(prev => ({
        ...prev,
        steps: newSteps
      }));
    }
  };
  
  // Save configuration
  const handleSaveConfiguration = async () => {
    // Validate required fields
    if (!configuration.name || !configuration.key || !configuration.targetUserType) {
      toast({
        title: 'Validation Error',
        description: 'Name, key, and target user type are required',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      if (configId) {
        // Update existing configuration
        await updateConfiguration(configId, configuration);
        toast({
          title: 'Success',
          description: 'Configuration updated successfully',
          variant: 'default',
        });
      } else {
        // Create new configuration
        const newConfig = await createConfiguration(configuration);
        setConfiguration(newConfig);
        router.push(`/nexus-onboard/configurator?id=${newConfig.id}`);
        toast({
          title: 'Success',
          description: 'Configuration created successfully',
          variant: 'default',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Add a new step
  const handleAddStep = (stepData: { title: string; description?: string }) => {
    const newStep: OnboardingStep = {
      key: `step-${Date.now()}`,
      title: stepData.title,
      description: stepData.description || '',
      order: configuration.steps.length,
      fields: []
    };
    
    setConfiguration(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
    
    setActiveStepKey(newStep.key);
    setShowAddStepModal(false);
  };
  
  // Update an existing step
  const handleUpdateStep = (updatedStep: OnboardingStep) => {
    setConfiguration(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.key === updatedStep.key ? updatedStep : step
      )
    }));
  };
  
  // Delete a step
  const handleDeleteStep = (stepKey: string) => {
    setConfiguration(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.key !== stepKey)
    }));
    
    // If deleting the active step, select another one
    if (activeStepKey === stepKey) {
      const remainingSteps = configuration.steps.filter(step => step.key !== stepKey);
      setActiveStepKey(remainingSteps.length > 0 ? remainingSteps[0].key : null);
    }
  };
  
  // Add a new field to the active step
  const handleAddField = (fieldData: Partial<FormField>) => {
    if (!activeStepKey) return;
    
    const stepIndex = configuration.steps.findIndex(step => step.key === activeStepKey);
    if (stepIndex === -1) return;
    
    const step = configuration.steps[stepIndex];
    const newField: FormField = {
      fieldName: fieldData.fieldName || `field-${Date.now()}`,
      label: fieldData.label || 'New Field',
      fieldType: fieldData.fieldType || 'text',
      dataType: fieldData.dataType || 'string',
      order: step.fields.length,
      placeholder: fieldData.placeholder || '',
      helpText: fieldData.helpText || '',
      validationRules: fieldData.validationRules || [],
      options: fieldData.options || [],
      conditionalVisibility: fieldData.conditionalVisibility,
      uiHints: fieldData.uiHints || { width: 'full' },
    };
    
    const newSteps = [...configuration.steps];
    newSteps[stepIndex] = {
      ...step,
      fields: [...step.fields, newField]
    };
    
    setConfiguration(prev => ({
      ...prev,
      steps: newSteps
    }));
    
    setShowAddFieldModal(false);
    setActiveFieldIndex(step.fields.length);
  };
  
  // Update an existing field
  const handleUpdateField = (stepKey: string, fieldIndex: number, updatedField: FormField) => {
    const stepIndex = configuration.steps.findIndex(step => step.key === stepKey);
    if (stepIndex === -1) return;
    
    const step = configuration.steps[stepIndex];
    const newFields = [...step.fields];
    newFields[fieldIndex] = updatedField;
    
    const newSteps = [...configuration.steps];
    newSteps[stepIndex] = {
      ...step,
      fields: newFields
    };
    
    setConfiguration(prev => ({
      ...prev,
      steps: newSteps
    }));
  };
  
  // Delete a field
  const handleDeleteField = (stepKey: string, fieldIndex: number) => {
    const stepIndex = configuration.steps.findIndex(step => step.key === stepKey);
    if (stepIndex === -1) return;
    
    const step = configuration.steps[stepIndex];
    const newFields = step.fields.filter((_, index) => index !== fieldIndex);
    
    const newSteps = [...configuration.steps];
    newSteps[stepIndex] = {
      ...step,
      fields: newFields
    };
    
    setConfiguration(prev => ({
      ...prev,
      steps: newSteps
    }));
    
    setActiveFieldIndex(null);
  };
  
  // Get active step
  const activeStep = activeStepKey 
    ? configuration.steps.find(step => step.key === activeStepKey) 
    : null;
  
  // Get active field
  const activeField = activeStep && activeFieldIndex !== null 
    ? activeStep.fields[activeFieldIndex] 
    : null;
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {configId ? 'Edit Onboarding Configuration' : 'Create Onboarding Configuration'}
          </h1>
          <p className="text-muted-foreground">
            Define a custom onboarding workflow for your organization
          </p>
        </div>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/nexus-onboard/configurator')}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSaveConfiguration}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
      
      {/* Main tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="details">Configuration Details</TabsTrigger>
          <TabsTrigger value="steps">Onboarding Steps</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
       {/* Configuration Details Tab */}
<TabsContent value="details" className="space-y-6">
  <Card>
    <CardHeader>
      <CardTitle>Basic Information</CardTitle>
      <CardDescription>
        Define the core properties of this onboarding configuration
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Configuration Name</Label>
          <Input
            id="name"
            value={configuration.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Employee Onboarding"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="key">Configuration Key</Label>
          <Input
            id="key"
            value={configuration.key}
            onChange={(e) => handleInputChange('key', e.target.value)}
            placeholder="e.g., employee-onboarding"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Unique identifier used in the system. Use lowercase with hyphens.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetUserType">Target User Type</Label>
          <Select
            value={configuration.targetUserType}
            onValueChange={(value) => handleInputChange('targetUserType', value)}
          >
            <SelectTrigger id="targetUserType">
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
              <SelectItem value="super-admin">Super Administrator</SelectItem>
              <SelectItem value="all">All Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetOrgType">Target Organization Type</Label>
          <Select
            value={configuration.targetOrgType}
            onValueChange={(value) => handleInputChange('targetOrgType', value)}
          >
            <SelectTrigger id="targetOrgType">
              <SelectValue placeholder="Select organization type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="bank">Bank</SelectItem>
              <SelectItem value="all">All Organizations</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="version">Version</Label>
          <Input
            id="version"
            type="number"
            min="1"
            value={configuration.version.toString()}
            onChange={(e) => handleInputChange('version', parseInt(e.target.value) || 1)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="securityLevel">Security Level</Label>
          <Select
            value={configuration.securityLevel || 'standard'}
            onValueChange={(value) => handleInputChange('securityLevel', value)}
          >
            <SelectTrigger id="securityLevel">
              <SelectValue placeholder="Select security level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="enhanced">Enhanced</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={configuration.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Provide a detailed description of this onboarding configuration"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={configuration.isActive}
          onCheckedChange={(checked) => handleInputChange('isActive', checked === true)}
        />
        <Label htmlFor="isActive" className="font-normal cursor-pointer">
          Set as active configuration for the selected user and organization type
        </Label>
      </div>
    </CardContent>
  </Card>
</TabsContent>
        
        {/* Onboarding Steps Tab */}
<TabsContent value="steps">
  <div className="grid grid-cols-3 gap-6">
    <div className="col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Onboarding Steps</h3>
        <Button 
          onClick={() => setShowAddStepModal(true)}
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>

      {configuration.steps.length === 0 ? (
        <div className="border border-dashed rounded-lg p-8 text-center">
          <h4 className="font-medium mb-2">No steps defined yet</h4>
          <p className="text-muted-foreground mb-4">
            Start building your onboarding flow by adding the first step.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setShowAddStepModal(true)}
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Step
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={[]}
          collisionDetection={closestCenter}
          onDragEnd={handleStepDragEnd}
        >
          <SortableContext
            items={configuration.steps.map(step => step.key)}
            strategy={verticalListSortingStrategy}
          >
            {configuration.steps.map((step) => (
              <StepConfigurator
                key={step.key}
                step={step}
                onUpdate={handleUpdateStep}
                onDelete={() => handleDeleteStep(step.key)}
                onAddField={() => {
                  setActiveStepKey(step.key);
                  setShowAddFieldModal(true);
                }}
                onFieldUpdate={(fieldIndex, updatedField) => 
                  handleUpdateField(step.key, fieldIndex, updatedField)
                }
                onFieldDelete={(fieldIndex) => 
                  handleDeleteField(step.key, fieldIndex)
                }
                activeFieldIndex={step.key === activeStepKey ? activeFieldIndex : null}
                setActiveFieldIndex={(index) => {
                  setActiveStepKey(step.key);
                  setActiveFieldIndex(index);
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>

    <div className="space-y-6">
      {/* Field configurator sidebar */}
      {activeField && activeStep ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-md">Field Properties</CardTitle>
            <CardDescription>
              Configure the selected field
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldConfigurator
              field={activeField}
              onUpdate={(updatedField) => {
                if (activeStepKey && activeFieldIndex !== null) {
                  handleUpdateField(activeStepKey, activeFieldIndex, updatedField);
                }
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-md">Field Properties</CardTitle>
            <CardDescription>
              Select a field to configure its properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                No field selected. Click on a field in a step to edit its properties.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Steps Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-md flex items-center justify-between">
            <span>Onboarding Summary</span>
            <span className="text-xs font-normal bg-muted rounded-full px-2 py-1">
              {configuration.steps.length} step{configuration.steps.length !== 1 ? 's' : ''}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[300px] overflow-y-auto">
            {configuration.steps.map((step, index) => (
              <div 
                key={step.key}
                className={`border-b last:border-b-0 p-3 cursor-pointer transition-colors ${
                  activeStepKey === step.key ? 'bg-muted' : 'hover:bg-accent/50'
                }`}
                onClick={() => setActiveStepKey(step.key)}
              >
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {step.fields.length} field{step.fields.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</TabsContent>
        
        {/* Preview Tab */}
<TabsContent value="preview">
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Preview Onboarding Flow</span>
          <div className="flex space-x-2">
            <Select defaultValue="desktop">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="View mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desktop">Desktop View</SelectItem>
                <SelectItem value="tablet">Tablet View</SelectItem>
                <SelectItem value="mobile">Mobile View</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
        <CardDescription>
          Preview how the onboarding flow will appear to users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {configuration.steps.length === 0 ? (
          <div className="py-10 text-center border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-2">
              No steps have been defined yet
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setActiveTab('steps');
                setShowAddStepModal(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Step
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <PreviewRenderer configuration={configuration} />
          </div>
        )}
      </CardContent>
    </Card>
  </div>
</TabsContent>
      </Tabs>
      
      {/* Modals for adding steps and fields */}
      {showAddStepModal && (
        <AddStepModal
          onClose={() => setShowAddStepModal(false)}
          onAdd={handleAddStep}
        />
      )}
      
      {showAddFieldModal && activeStepKey && (
        <AddFieldModal
          onClose={() => setShowAddFieldModal(false)}
          onAdd={handleAddField}
          existingFields={activeStep?.fields || []}
        />
      )}
    </div>
  );
};

export default ConfiguratorBuilder;