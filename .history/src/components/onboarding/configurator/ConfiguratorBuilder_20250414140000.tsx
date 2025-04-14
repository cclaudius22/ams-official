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
import { toast } from '@/components/ui/use-toast';
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
        <TabsContent value="details">
          {/* Configuration details content here */}
        </TabsContent>
        
        {/* Onboarding Steps Tab */}
        <TabsContent value="steps">
          {/* Steps configuration content here */}
        </TabsContent>
        
        {/* Preview Tab */}
        <TabsContent value="preview">
          {/* Preview content here */}
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