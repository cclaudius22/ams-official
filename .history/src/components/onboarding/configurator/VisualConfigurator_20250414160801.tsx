// components/onboarding/configurator/VisualConfigurator.tsx
'use client';

import React, { useState, useRef } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Icons
import { 
  Save, 
  Plus, 
  Trash2, 
  Settings, 
  ChevronRight, 
  ChevronLeft, 
  LayoutPanelTop, 
  GripVertical, 
  Eye, 
  Layers, 
  Palette, 
  CheckSquare, 
  Text, 
  Type, 
  CalendarIcon, 
  ListChecks, 
  FileInput, 
  Mail,
  ScanEye
} from 'lucide-react';

// Components for field types
const FIELD_COMPONENTS = [
  { 
    id: 'text', 
    name: 'Text Input', 
    icon: <Type className="h-4 w-4 mr-2" />,
    description: 'Single line text entry',
    preview: (
      <div className="space-y-1 w-full">
        <Label className="text-sm">Text Input</Label>
        <Input placeholder="Enter text..." />
      </div>
    )
  },
  { 
    id: 'textarea', 
    name: 'Text Area', 
    icon: <Text className="h-4 w-4 mr-2" />,
    description: 'Multi-line text entry',
    preview: (
      <div className="space-y-1 w-full">
        <Label className="text-sm">Text Area</Label>
        <div className="w-full h-[80px] border rounded-md bg-background"></div>
      </div>
    )
  },
  { 
    id: 'email', 
    name: 'Email', 
    icon: <Mail className="h-4 w-4 mr-2" />,
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
    icon: <ListChecks className="h-4 w-4 mr-2" />,
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
    icon: <CheckSquare className="h-4 w-4 mr-2" />,
    description: 'Yes/No selection',
    preview: (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 border rounded"></div>
        <Label className="text-sm">Checkbox option</Label>
      </div>
    )
  },
  { 
    id: 'date', 
    name: 'Date Picker', 
    icon: <CalendarIcon className="h-4 w-4 mr-2" />,
    description: 'Date selection',
    preview: (
      <div className="space-y-1 w-full">
        <Label className="text-sm">Date</Label>
        <Input placeholder="Select date..." />
      </div>
    )
  },
  { 
    id: 'file', 
    name: 'File Upload', 
    icon: <FileInput className="h-4 w-4 mr-2" />,
    description: 'Document or image upload',
    preview: (
      <div className="space-y-1 w-full">
        <Label className="text-sm">File Upload</Label>
        <div className="w-full h-[40px] border rounded-md bg-background flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Upload file</span>
        </div>
      </div>
    )
  },
];

// Field component in canvas
const SortableField = ({ field, index, activeId, onRemove, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: activeId === field.id ? 0.4 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group rounded-md border border-border p-3 mb-2 bg-background hover:border-primary/20 hover:bg-accent/20 transition-colors"
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 flex opacity-60 group-hover:opacity-100">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 cursor-grab" 
          {...attributes} 
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>
      </div>
    
      <div className="pl-10 flex justify-between items-center">
        <div>
          <div className="font-medium flex items-center">
            {FIELD_COMPONENTS.find(c => c.id === field.type)?.icon} 
            {field.label || field.name}
          </div>
          {field.placeholder && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {field.placeholder}
            </div>
          )}
        </div>
        
        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => onEdit(field)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive" 
            onClick={() => onRemove(field.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step component in sidebar
const StepItem = ({ step, isActive, onClick, onRemove }) => {
  return (
    <div 
      className={`p-3 mb-2 rounded-md border cursor-pointer transition-colors ${
        isActive 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/30 hover:bg-accent/10'
      }`}
      onClick={() => onClick(step.id)}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">{step.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {step.fields.length} field{step.fields.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {isActive && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive opacity-0 hover:opacity-100 transition-opacity" 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(step.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Component palette item
const ComponentPaletteItem = ({ component, onDragStart }) => {
  return (
    <div 
      className="p-3 mb-3 border border-border rounded-md bg-background hover:border-primary/20 hover:bg-accent/20 transition-colors cursor-grab"
      onMouseDown={() => onDragStart(component)}
      draggable
    >
      <div className="flex items-center mb-2">
        <div className="bg-primary/10 rounded-md p-1 mr-2">
          {component.icon}
        </div>
        <div>
          <div className="font-medium text-sm">{component.name}</div>
          <div className="text-xs text-muted-foreground">{component.description}</div>
        </div>
      </div>
      <div className="mt-2">
        {component.preview}
      </div>
    </div>
  );
};

// Initial state
const initialConfiguration = {
  name: 'New Onboarding Configuration',
  key: 'new-onboarding',
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

const VisualConfigurator = () => {
  const [configuration, setConfiguration] = useState(initialConfiguration);
  const [activeStep, setActiveStep] = useState(configuration.steps[0].id);
  const [activeField, setActiveField] = useState(null);
  const [draggingComponent, setDraggingComponent] = useState(null);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'preview'
  
  // Find current step
  const currentStep = configuration.steps.find(step => step.id === activeStep);
  
  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handle field drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setConfiguration(config => {
        const stepIndex = config.steps.findIndex(step => step.id === activeStep);
        
        if (stepIndex === -1) return config;
        
        const fields = [...config.steps[stepIndex].fields];
        const oldIndex = fields.findIndex(field => field.id === active.id);
        const newIndex = fields.findIndex(field => field.id === over.id);
        
        const newFields = arrayMove(fields, oldIndex, newIndex);
        
        const newSteps = [...config.steps];
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          fields: newFields
        };
        
        return {
          ...config,
          steps: newSteps
        };
      });
    }
    
    setDraggingComponent(null);
  };
  
  // Handle component drag start from palette
  const handleComponentDragStart = (component) => {
    setDraggingComponent(component);
  };
  
  // Add a new field to the current step
  const addField = (fieldType) => {
    const fieldComponent = FIELD_COMPONENTS.find(c => c.id === fieldType);
    
    if (!fieldComponent) return;
    
    const newField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      name: fieldComponent.name,
      label: fieldComponent.name,
      placeholder: '',
      required: false
    };
    
    setConfiguration(config => {
      const stepIndex = config.steps.findIndex(step => step.id === activeStep);
      
      if (stepIndex === -1) return config;
      
      const newSteps = [...config.steps];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        fields: [...newSteps[stepIndex].fields, newField]
      };
      
      return {
        ...config,
        steps: newSteps
      };
    });
  };
  
  // Remove a field from the current step
  const removeField = (fieldId) => {
    setConfiguration(config => {
      const stepIndex = config.steps.findIndex(step => step.id === activeStep);
      
      if (stepIndex === -1) return config;
      
      const newSteps = [...config.steps];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        fields: newSteps[stepIndex].fields.filter(field => field.id !== fieldId)
      };
      
      return {
        ...config,
        steps: newSteps
      };
    });
    
    if (activeField?.id === fieldId) {
      setActiveField(null);
    }
  };
  
  // Add a new step
  const addStep = () => {
    const newStep = {
      id: `step-${Date.now()}`,
      title: `Step ${configuration.steps.length + 1}`,
      description: '',
      fields: []
    };
    
    setConfiguration(config => ({
      ...config,
      steps: [...config.steps, newStep]
    }));
    
    setActiveStep(newStep.id);
  };
  
  // Remove a step
  const removeStep = (stepId) => {
    if (configuration.steps.length <= 1) return;
    
    setConfiguration(config => {
      const newSteps = config.steps.filter(step => step.id !== stepId);
      
      return {
        ...config,
        steps: newSteps
      };
    });
    
    if (activeStep === stepId) {
      setActiveStep(configuration.steps[0].id);
    }
  };
  
  // Edit a field
  const editField = (field) => {
    setActiveField(field);
  };
  
  // Get field order for drag and drop
  const getFieldsIds = () => {
    return currentStep?.fields.map(field => field.id) || [];
  };
  
  return (
    <div className="bg-background min-h-screen">
      <header className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur">
        <div className="container mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold">Create Onboarding Configuration</h1>
              <p className="text-sm text-muted-foreground">Drag and drop to build your onboarding flow</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex border rounded-md p-0.5">
                <Button
                  variant={viewMode === 'edit' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-sm"
                  onClick={() => setViewMode('edit')}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant={viewMode === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-sm"
                  onClick={() => setViewMode('preview')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
              
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-6">
        {viewMode === 'edit' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-12 gap-6">
              {/* Left Sidebar - Steps */}
              <div className="col-span-2 space-y-4">
                <Card>
                  <CardHeader className="px-4 py-3">
                    <CardTitle className="text-base">Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-2">
                    <ScrollArea className="h-[calc(100vh-220px)]">
                      <div className="space-y-1 pr-3">
                        {configuration.steps.map(step => (
                          <StepItem
                            key={step.id}
                            step={step}
                            isActive={step.id === activeStep}
                            onClick={() => setActiveStep(step.id)}
                            onRemove={removeStep}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="px-4 py-3 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={addStep}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {/* Middle - Canvas */}
              <div className="col-span-7">
                <Card className="min-h-[calc(100vh-120px)]">
                  <CardHeader className="px-4 py-3 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <Input
                          value={currentStep?.title || ''}
                          onChange={(e) => {
                            setConfiguration(config => {
                              const stepIndex = config.steps.findIndex(step => step.id === activeStep);
                              
                              if (stepIndex === -1) return config;
                              
                              const newSteps = [...config.steps];
                              newSteps[stepIndex] = {
                                ...newSteps[stepIndex],
                                title: e.target.value
                              };
                              
                              return {
                                ...config,
                                steps: newSteps
                              };
                            });
                          }}
                          className="text-lg font-semibold border-0 p-0 h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
                          placeholder="Step Title"
                        />
                        <Input
                          value={currentStep?.description || ''}
                          onChange={(e) => {
                            setConfiguration(config => {
                              const stepIndex = config.steps.findIndex(step => step.id === activeStep);
                              
                              if (stepIndex === -1) return config;
                              
                              const newSteps = [...config.steps];
                              newSteps[stepIndex] = {
                                ...newSteps[stepIndex],
                                description: e.target.value
                              };
                              
                              return {
                                ...config,
                                steps: newSteps
                              };
                            });
                          }}
                          className="text-sm text-muted-foreground border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
                          placeholder="Step Description (optional)"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={configuration.steps.findIndex(step => step.id === activeStep) === 0}
                          onClick={() => {
                            const currentIndex = configuration.steps.findIndex(step => step.id === activeStep);
                            if (currentIndex > 0) {
                              setActiveStep(configuration.steps[currentIndex - 1].id);
                            }
                          }}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={configuration.steps.findIndex(step => step.id === activeStep) === configuration.steps.length - 1}
                          onClick={() => {
                            const currentIndex = configuration.steps.findIndex(step => step.id === activeStep);
                            if (currentIndex < configuration.steps.length - 1) {
                              setActiveStep(configuration.steps[currentIndex + 1].id);
                            }
                          }}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {currentStep?.fields.length === 0 ? (
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <LayoutPanelTop className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Add Form Components</h3>
                        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                          Drag components from the right panel or use the button below to add fields to this step.
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Field
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center">
                            {FIELD_COMPONENTS.map(component => (
                              <DropdownMenuItem 
                                key={component.id}
                                onClick={() => addField(component.id)}
                              >
                                {component.icon} {component.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <SortableContext
                          items={getFieldsIds()}
                          strategy={verticalListSortingStrategy}
                        >
                          {currentStep.fields.map((field, index) => (
                            <SortableField
                              key={field.id}
                              field={field}
                              index={index}
                              activeId={draggingComponent?.id}
                              onRemove={removeField}
                              onEdit={editField}
                            />
                          ))}
                        </SortableContext>
                        
                        <div className="mt-6 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Field
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center">
                              {FIELD_COMPONENTS.map(component => (
                                <DropdownMenuItem 
                                  key={component.id}
                                  onClick={() => addField(component.id)}
                                >
                                  {component.icon} {component.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Sidebar - Components & Properties */}
              <div className="col-span-3 space-y-4">
                <Tabs defaultValue="components">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="components" className="mt-3">
                    <Card>
                      <CardHeader className="px-4 py-3">
                        <CardTitle className="text-base">Form Components</CardTitle>
                        <CardDescription>Drag to add or click to insert</CardDescription>
                      </CardHeader>
                      <CardContent className="px-4 py-2">
                        <ScrollArea className="h-[calc(100vh-250px)] pr-3">
                          <div className="space-y-3">
                            {FIELD_COMPONENTS.map(component => (
                              <ComponentPaletteItem
                                key={component.id}
                                component={component}
                                onDragStart={() => addField(component.id)}
                              />
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="properties" className="mt-3">
                    <Card>
                      <CardHeader className="px-4 py-3">
                        <CardTitle className="text-base">
                          {activeField ? `Edit ${activeField.name}` : 'Properties'}
                        </CardTitle>
                        <CardDescription>
                          {activeField 
                            ? 'Configure the selected field'
                            : 'Select a field to edit its properties'
                          }
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="px-4 py-2">
                        {activeField ? (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="field-label">Label</Label>
                              <Input
                                id="field-label"
                                value={activeField.label || ''}
                                onChange={(e) => {
                                  setActiveField({
                                    ...activeField,
                                    label: e.target.value
                                  });
                                  
                                  setConfiguration(config => {
                                    const stepIndex = config.steps.findIndex(step => step.id === activeStep);
                                    
                                    if (stepIndex === -1) return config;
                                    
                                    const fieldIndex = config.steps[stepIndex].fields.findIndex(field => field.id === activeField.id);
                                    
                                    if (fieldIndex === -1) return config;
                                    
                                    const newSteps = [...config.steps];
                                    newSteps[stepIndex].fields[fieldIndex] = {
                                      ...newSteps[stepIndex].fields[fieldIndex],
                                      label: e.target.value
                                    };
                                    
                                    return {
                                      ...config,
                                      steps: newSteps
                                    };
                                  });
                                }}
                                placeholder="Field Label"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="field-placeholder">Placeholder</Label>
                              <Input
                                id="field-placeholder"
                                value={activeField.placeholder || ''}
                                onChange={(e) => {
                                  setActiveField({
                                    ...activeField,
                                    placeholder: e.target.value
                                  });
                                  
                                  setConfiguration(config => {
                                    const stepIndex = config.steps.findIndex(step => step.id === activeStep);
                                    
                                    if (stepIndex === -1) return config;
                                    
                                    const fieldIndex = config.steps[stepIndex].fields.findIndex(field => field.id === activeField.id);
                                    
                                    if (fieldIndex === -1) return config;
                                    
                                    const newSteps = [...config.steps];
                                    newSteps[stepIndex].fields[fieldIndex] = {
                                      ...newSteps[stepIndex].fields[fieldIndex],
                                      placeholder: e.target.value
                                    };
                                    
                                    return {
                                      ...config,
                                      steps: newSteps
                                    };
                                  });
                                }}
                                placeholder="Placeholder text"
                              />
                            </div>
                            
                            {/* Additional properties like required, validation, etc. */}
                            {/* These would be expanded in the full implementation */}
                          </div>
                        ) : (
                          <div className="h-[500px] flex items-center justify-center text-center p-4">
                            <div>
                              <ScanEye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                              <h3 className="text-lg font-medium mb-2">No Field Selected</h3>
                              <p className="text-muted-foreground">
                                Select a field from the form builder to configure its properties and options.
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Drag overlay */}
            <DragOverlay>
              {draggingComponent && (
                <div className="border rounded-md p-3 bg-background shadow-md w-[250px]">
                  <div className="flex items-center mb-1">
                    {draggingComponent.icon}
                    <span className="ml-2 font-medium">{draggingComponent.name}</span>
                  </div>
                  <div className="opacity-50 scale-90">
                    {draggingComponent.preview}
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          // Preview mode
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{configuration.name}</CardTitle>
                    <CardDescription>Preview of the onboarding flow</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setViewMode('edit')}
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Back to Editor
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Step indicator */}
                <div className="flex items-center mb-8">
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
                
                {/* Current step content */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold">{configuration.steps[0].title}</h2>
                    {configuration.steps[0].description && (
                      <p className="text-muted-foreground mt-1">{configuration.steps[0].description}</p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {configuration.steps[0].fields.map((field) => {
                      const FieldComponent = FIELD_COMPONENTS.find(c => c.id === field.type);
                      
                      if (!FieldComponent) return null;
                      
                      return (
                        <div key={field.id} className="space-y-2">
                          <Label>{field.label}</Label>
                          <div className="opacity-80">
                            {FieldComponent.preview}
                          </div>
                          {field.placeholder && (
                            <p className="text-xs text-muted-foreground">Placeholder: {field.placeholder}</p>
                          )}
                        </div>
                      );
                    })}
                    
                    {configuration.steps[0].fields.length === 0 && (
                      <div className="py-6 text-center text-muted-foreground">
                        No fields added to this step yet.
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Navigation */}
                <div className="mt-8 pt-4 border-t flex justify-end">
                  <Button>
                    Next Step
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default VisualConfigurator;