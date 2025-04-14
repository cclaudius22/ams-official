'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Icons
import { 
  Save, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  LayoutPanelTop, 
  Eye, 
  Layers, 
  GripVertical,
  Check,
  X,
  Settings,
  Trash2
} from 'lucide-react';

// Import services
import { 
  getConfiguration, 
  createConfiguration, 
  updateConfiguration 
} from '@/services/onboardingService';

// Field and component definitions
const FIELD_COMPONENTS = [
  { 
    id: 'text', 
    name: 'Text Input', 
    description: 'Single line text entry',
    preview: (
      <div className="space-y-1 w-full">
        <Label className="text-sm">Text Input</Label>
        <Input placeholder="Enter text..." />
      </div>
    )
  },
  { 
    id: 'email', 
    name: 'Email', 
    description: 'Email address entry with validation',
    preview: (
      <div className="space-y-1 w-full">
        <Label className="text-sm">Email Address</Label>
        <Input placeholder="name@example.com" />
      </div>
    )
  },
  { 
    id: 'select', 
    name: 'Dropdown', 
    description: 'Select from a list of options',
    preview: (
      <div className="space-y-1 w-full">
        <Label className="text-sm">Dropdown</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
        </Select>
      </div>
    )
  },
  { 
    id: 'checkbox', 
    name: 'Checkbox', 
    description: 'Yes/No selection',
    preview: (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 border rounded"></div>
        <Label className="text-sm">Checkbox option</Label>
      </div>
    )
  },
];

// Initial state
const initialConfiguration = {
  name: 'New Onboarding Configuration',
  key: '',
  targetUserType: 'employee',
  targetOrgType: 'all',
  version: 1,
  isActive: false,
  securityLevel: 'standard',
  steps: [
    {
      id: 'step-1',
      title: 'Personal Information',
      description: 'Basic personal details',
      fields: []
    }
  ]
};

export default function ConfiguratorBuilder({ configId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idFromParams = searchParams.get('id') || configId;
  
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [activeStepKey, setActiveStepKey] = useState(null);
  const [activeFieldIndex, setActiveFieldIndex] = useState(null);
  const [viewMode, setViewMode] = useState('edit');
  
  // Configuration state
  const [configuration, setConfiguration] = useState(initialConfiguration);
  
  // Load existing configuration if editing
  useEffect(() => {
    const loadExistingConfig = async () => {
      if (idFromParams) {
        setLoading(true);
        try {
          // In a real app, this would fetch from the API:
          // const config = await getConfiguration(idFromParams);
          // setConfiguration(config);
          
          // For now, just use a mock configuration
          setConfiguration({
            ...initialConfiguration,
            id: idFromParams,
            name: 'Employee Onboarding',
            key: 'employee-onboarding',
          });
          
          if (initialConfiguration.steps.length > 0) {
            setActiveStepKey(initialConfiguration.steps[0].id);
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
      } else if (configuration.steps.length > 0) {
        setActiveStepKey(configuration.steps[0].id);
      }
    };
    
    loadExistingConfig();
  }, [idFromParams]);
  
  // Handle input changes for configuration details
  const handleInputChange = (field, value) => {
    setConfiguration(prev => ({ ...prev, [field]: value }));
  };
  
  // Get active step
  const activeStep = activeStepKey 
    ? configuration.steps.find(step => step.id === activeStepKey) 
    : configuration.steps.length > 0 ? configuration.steps[0] : null;
  
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
      if (idFromParams) {
        // Update existing configuration
        // await updateConfiguration(idFromParams, configuration);
        toast({
          title: 'Success',
          description: 'Configuration updated successfully',
          variant: 'default',
        });
      } else {
        // Create new configuration
        // const newConfig = await createConfiguration(configuration);
        // setConfiguration(newConfig);
        // router.push(`/nexus-onboard/configurator?id=${newConfig.id}`);
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
  const handleAddStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      title: `Step ${configuration.steps.length + 1}`,
      description: '',
      fields: []
    };
    
    setConfiguration(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
    
    setActiveStepKey(newStep.id);
  };
  
  // Update an existing step
  const handleUpdateStep = (stepId, updates) => {
    setConfiguration(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };
  
  // Delete a step
  const handleDeleteStep = (stepId) => {
    if (configuration.steps.length <= 1) {
      toast({
        title: 'Cannot Delete',
        description: 'You must have at least one step in the configuration',
        variant: 'destructive',
      });
      return;
    }
    
    setConfiguration(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
    
    // If deleting the active step, select another one
    if (activeStepKey === stepId) {
      const remainingSteps = configuration.steps.filter(step => step.id !== stepId);
      setActiveStepKey(remainingSteps.length > 0 ? remainingSteps[0].id : null);
    }
  };
  
  // Add a new field
  const handleAddField = (fieldType) => {
    if (!activeStepKey) return;
    
    const stepIndex = configuration.steps.findIndex(step => step.id === activeStepKey);
    if (stepIndex === -1) return;
    
    const fieldComponent = FIELD_COMPONENTS.find(c => c.id === fieldType);
    if (!fieldComponent) return;
    
    const newField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      name: fieldComponent.name,
      label: fieldComponent.name,
      placeholder: '',
      required: false,
      order: configuration.steps[stepIndex].fields.length
    };
    
    setConfiguration(prev => {
      const newSteps = [...prev.steps];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        fields: [...newSteps[stepIndex].fields, newField]
      };
      
      return {
        ...prev,
        steps: newSteps
      };
    });
  };
  
  // Remove a field
  const handleRemoveField = (fieldId) => {
    if (!activeStepKey) return;
    
    const stepIndex = configuration.steps.findIndex(step => step.id === activeStepKey);
    if (stepIndex === -1) return;
    
    setConfiguration(prev => {
      const newSteps = [...prev.steps];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        fields: newSteps[stepIndex].fields.filter(field => field.id !== fieldId)
      };
      
      return {
        ...prev,
        steps: newSteps
      };
    });
  };
  
  // Field component in the step builder
  const FieldItem = ({ field }) => {
    return (
      <div className="flex items-center justify-between p-3 border rounded-md mb-2 group hover:border-primary/50 hover:bg-accent/10">
        <div className="flex items-center">
          <GripVertical className="h-4 w-4 mr-2 text-muted-foreground cursor-grab" />
          <div>
            <div className="font-medium">{field.label}</div>
            <div className="text-xs text-muted-foreground">{field.type}</div>
          </div>
        </div>
        
        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive" 
            onClick={() => handleRemoveField(field.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {idFromParams ? 'Edit Onboarding Configuration' : 'Create Onboarding Configuration'}
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
          <div className="grid grid-cols-12 gap-6">
            {/* Left sidebar - Steps */}
            <div className="col-span-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-md">Steps</CardTitle>
                  <CardDescription>Manage onboarding flow steps</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {configuration.steps.map(step => (
                    <div 
                      key={step.id}
                      className={`p-3 border rounded-md cursor-pointer ${
                        step.id === activeStepKey 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-accent/10'
                      }`}
                      onClick={() => setActiveStepKey(step.id)}
                    >
                      <div className="font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {step.fields.length} {step.fields.length === 1 ? 'field' : 'fields'}
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleAddStep}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Middle - Step Builder */}
            <div className="col-span-6">
              {activeStep ? (
                <Card>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <Input
                          value={activeStep.title}
                          onChange={(e) => handleUpdateStep(activeStep.id, { title: e.target.value })}
                          className="text-lg font-semibold border-0 p-0 h-8 focus-visible:ring-0"
                          placeholder="Step Title"
                        />
                        <Input
                          value={activeStep.description || ''}
                          onChange={(e) => handleUpdateStep(activeStep.id, { description: e.target.value })}
                          className="text-sm text-muted-foreground border-0 p-0 h-6 focus-visible:ring-0"
                          placeholder="Step Description (optional)"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteStep(activeStep.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Fields</h3>
                      
                      {activeStep.fields.length === 0 ? (
                        <div className="border border-dashed rounded-md p-8 text-center">
                          <LayoutPanelTop className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-muted-foreground mb-4">
                            No fields added to this step yet.
                          </p>
                          <Select onValueChange={handleAddField}>
                            <SelectTrigger className="w-[200px] mx-auto">
                              <SelectValue placeholder="Add a field" />
                            </SelectTrigger>
                            <SelectContent>
                              {FIELD_COMPONENTS.map(component => (
                                <SelectItem key={component.id} value={component.id}>
                                  {component.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {activeStep.fields.map(field => (
                            <FieldItem key={field.id} field={field} />
                          ))}
                          
                          <div className="mt-4">
                            <Select onValueChange={handleAddField}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Add another field" />
                              </SelectTrigger>
                              <SelectContent>
                                {FIELD_COMPONENTS.map(component => (
                                  <SelectItem key={component.id} value={component.id}>
                                    {component.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      No step selected. Select a step from the sidebar or add a new one.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleAddStep}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Right sidebar - Component library */}
            <div className="col-span-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-md">Component Library</CardTitle>
                  <CardDescription>Drag & drop field components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {FIELD_COMPONENTS.map(component => (
                    <div 
                      key={component.id}
                      className="p-3 border rounded-md hover:border-primary/50 hover:bg-accent/10 cursor-pointer"
                      onClick={() => {
                        if (activeStepKey) {
                          handleAddField(component.id);
                        } else {
                          toast({
                            title: 'No Step Selected',
                            description: 'Please select or create a step first',
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      <div className="font-medium mb-2">{component.name}</div>
                      <div className="text-xs text-muted-foreground mb-2">{component.description}</div>
                      <div className="p-2 bg-accent/20 rounded-sm">
                        {component.preview}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Preview Onboarding Flow</span>
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
                      handleAddStep();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Step
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md">
                  {/* Step indicator */}
                  <div className="border-b px-6 py-4">
                    <div className="flex items-center">
                      {configuration.steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                          <div className="flex flex-col items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {index + 1}
                            </div>
                            <span className="text-xs mt-1">{step.title}</span>
                          </div>
                          {index < configuration.steps.length - 1 && (
                            <div className="h-[1px] bg-border flex-1 mx-2" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  
                  {/* Current step content */}
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold">{configuration.steps[0].title}</h2>
                      {configuration.steps[0].description && (
                        <p className="text-muted-foreground mt-1">{configuration.steps[0].description}</p>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {configuration.steps[0].fields.map((field) => {
                        const component = FIELD_COMPONENTS.find(c => c.id === field.type);
                        
                        return (
                          <div key={field.id} className="mb-4">
                            {component?.preview}
                          </div>
                        );
                      })}
                      
                      {configuration.steps[0].fields.length === 0 && (
                        <div className="py-6 text-center text-muted-foreground">
                          No fields added to this step yet.
                        </div>
                      )}
                    </div>
                    
                    {/* Navigation */}
                    <div className="mt-8 pt-4 border-t flex justify-end">
                      <Button>
                        Next Step
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}