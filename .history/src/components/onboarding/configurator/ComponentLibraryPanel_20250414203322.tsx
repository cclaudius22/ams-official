// src/components/onboarding/configurator/ComponentLibraryPanel.tsx
'use client';

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion'; // For animations, install if needed
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// Import icons for the field types
import { 
  Type, 
  Mail, 
  Hash, 
  Calendar, 
  CheckSquare, 
  List, 
  File, 
  Phone, 
  Info, 
  CreditCard, 
  MapPin, 
  Clock, 
  Image, 
  ListChecks,
  Upload,
  Heading,
  FileText,
  Search
} from 'lucide-react';

// Define field categories
const FIELD_CATEGORIES = [
  {
    id: 'basic',
    name: 'Basic Inputs',
    description: 'Essential form fields',
    fields: ['text', 'email', 'number', 'phone', 'date', 'time'],
  },
  {
    id: 'selection',
    name: 'Selection Controls',
    description: 'Single and multiple choice fields',
    fields: ['select', 'checkbox', 'radio', 'multiselect'],
  },
  {
    id: 'specialized',
    name: 'Specialized Inputs',
    description: 'Advanced input fields',
    fields: ['address', 'creditcard', 'file', 'signature'],
  },
  {
    id: 'content',
    name: 'Content Elements',
    description: 'Non-input display elements',
    fields: ['heading', 'richtext', 'divider', 'image'],
  }
];

// Define all field types with their properties
const FIELD_TYPES = {
  // Basic Inputs
  text: {
    id: 'text',
    name: 'Text Input',
    icon: <Type className="h-full w-full p-1.5" />,
    description: 'Single line text entry',
    category: 'basic',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">Text Field</Label>
        <Input placeholder="Enter text..." className="h-8 text-xs" />
      </div>
    )
  },
  email: {
    id: 'email',
    name: 'Email',
    icon: <Mail className="h-full w-full p-1.5" />,
    description: 'Email address entry with validation',
    category: 'basic',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">Email Field</Label>
        <Input placeholder="user@example.com" className="h-8 text-xs" />
      </div>
    )
  },
  number: {
    id: 'number',
    name: 'Number',
    icon: <Hash className="h-full w-full p-1.5" />,
    description: 'Numeric input with validation',
    category: 'basic',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">Number Field</Label>
        <Input type="number" placeholder="0" className="h-8 text-xs" />
      </div>
    )
  },
  phone: {
    id: 'phone',
    name: 'Phone',
    icon: <Phone className="h-full w-full p-1.5" />,
    description: 'Phone number with formatting',
    category: 'basic',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">Phone Field</Label>
        <Input placeholder="(555) 123-4567" className="h-8 text-xs" />
      </div>
    )
  },
  date: {
    id: 'date',
    name: 'Date',
    icon: <Calendar className="h-full w-full p-1.5" />,
    description: 'Date selection with calendar',
    category: 'basic',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">Date Field</Label>
        <Input type="date" className="h-8 text-xs" />
      </div>
    )
  },
  time: {
    id: 'time',
    name: 'Time',
    icon: <Clock className="h-full w-full p-1.5" />,
    description: 'Time selection control',
    category: 'basic',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">Time Field</Label>
        <Input type="time" className="h-8 text-xs" />
      </div>
    )
  },
  
  // Selection Controls
  select: {
    id: 'select',
    name: 'Dropdown',
    icon: <List className="h-full w-full p-1.5" />,
    description: 'Select from list of options',
    category: 'selection',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">Dropdown Field</Label>
        <div className="h-8 border rounded-md text-xs px-3 flex items-center bg-white">
          Select an option...
        </div>
      </div>
    )
  },
  checkbox: {
    id: 'checkbox',
    name: 'Checkbox',
    icon: <CheckSquare className="h-full w-full p-1.5" />,
    description: 'Multiple selection checkboxes',
    category: 'selection',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">Checkbox Field</Label>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border"></div>
            <span className="text-xs">Option One</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded border"></div>
            <span className="text-xs">Option Two</span>
          </div>
        </div>
      </div>
    )
  },
  radio: {
    id: 'radio',
    name: 'Radio Buttons',
    icon: <ListChecks className="h-full w-full p-1.5" />,
    description: 'Single selection radio buttons',
    category: 'selection',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">Radio Button Field</Label>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border"></div>
            <span className="text-xs">Option One</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border"></div>
            <span className="text-xs">Option Two</span>
          </div>
        </div>
      </div>
    )
  },
  multiselect: {
    id: 'multiselect',
    name: 'Multi-Select',
    icon: <ListChecks className="h-full w-full p-1.5" />,
    description: 'Select multiple items from dropdown',
    category: 'selection',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">Multi-Select Field</Label>
        <div className="h-8 border rounded-md text-xs px-3 flex items-center bg-white">
          Select multiple options...
        </div>
      </div>
    )
  },
  
  // Specialized Inputs
  address: {
    id: 'address',
    name: 'Address',
    icon: <MapPin className="h-full w-full p-1.5" />,
    description: 'Complete address entry form',
    category: 'specialized',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">Address Field</Label>
        <Input placeholder="Street Address" className="h-8 text-xs" />
      </div>
    )
  },
  creditcard: {
    id: 'creditcard',
    name: 'Credit Card',
    icon: <CreditCard className="h-full w-full p-1.5" />,
    description: 'Payment card information entry',
    category: 'specialized',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">Credit Card Field</Label>
        <Input placeholder="•••• •••• •••• ••••" className="h-8 text-xs" />
      </div>
    )
  },
  file: {
    id: 'file',
    name: 'File Upload',
    icon: <Upload className="h-full w-full p-1.5" />,
    description: 'Allow file uploads',
    category: 'specialized',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">File Upload Field</Label>
        <div className="border border-dashed rounded-md p-2 text-xs text-center">
          Click to upload or drag and drop
        </div>
      </div>
    )
  },
  signature: {
    id: 'signature',
    name: 'Signature',
    icon: <Edit className="h-full w-full p-1.5" />,
    description: 'Digital signature capture',
    category: 'specialized',
    preview: (
      <div className="w-full">
        <Label className="text-xs mb-1.5 block">Signature Field</Label>
        <div className="border border-dashed rounded-md p-2 text-xs text-center h-14 flex items-center justify-center">
          Sign here
        </div>
      </div>
    )
  },
  
  // Content Elements
  heading: {
    id: 'heading',
    name: 'Heading',
    icon: <Heading className="h-full w-full p-1.5" />,
    description: 'Section title or header',
    category: 'content',
    preview: (
      <div className="w-full">
        <h3 className="text-sm font-semibold">Section Heading</h3>
      </div>
    )
  },
  richtext: {
    id: 'richtext',
    name: 'Rich Text',
    icon: <FileText className="h-full w-full p-1.5" />,
    description: 'Formatted text content',
    category: 'content',
    preview: (
      <div className="w-full">
        <p className="text-xs">Formatted text content with <strong>bold</strong>, <em>italic</em>, and other formatting options.</p>
      </div>
    )
  },
  divider: {
    id: 'divider',
    name: 'Divider',
    icon: <Minus className="h-full w-full p-1.5" />,
    description: 'Visual section separator',
    category: 'content',
    preview: (
      <div className="w-full py-1">
        <Separator />
      </div>
    )
  },
  image: {
    id: 'image',
    name: 'Image',
    icon: <Image className="h-full w-full p-1.5" />,
    description: 'Display an image',
    category: 'content',
    preview: (
      <div className="w-full">
        <div className="bg-muted h-12 rounded-md flex items-center justify-center text-xs text-muted-foreground">
          Image placeholder
        </div>
      </div>
    )
  }
};

// Draggable Component for each field type
const DraggableComponent = ({ type }) => {
  const fieldType = FIELD_TYPES[type];
  const { state } = useConfigurator();
  const { activeStepId } = state;
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `component-${type}`,
    data: {
      type: 'component',
      fieldType: type,
    },
  });
  
  // When no active step, we'll use click to add with a warning
  const handleClick = () => {
    if (!activeStepId) {
      toast.error("No active step", { 
        description: "Please select a step first to add fields."
      });
      return;
    }
    
    // Normally would dispatch an add field action
    toast.success("Field Added", { 
      description: `Added ${fieldType.name} to the current step.`
    });
  };
  
  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 999 : 'auto',
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="cursor-grab active:cursor-grabbing rounded-md border bg-card hover:border-primary/50 hover:bg-accent/5"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex-shrink-0">
            {fieldType.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{fieldType.name}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{fieldType.description}</div>
          </div>
        </div>
        <div className="mt-3 p-2 rounded-md bg-muted/40 border border-border/50">
          {fieldType.preview}
        </div>
      </div>
    </motion.div>
  );
};

// Main Component
const ComponentLibraryPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(
    FIELD_CATEGORIES.map(cat => cat.id)
  );
  
  // Filter fields based on search term
  const getFilteredFieldTypes = () => {
    if (!searchTerm.trim()) return FIELD_TYPES;
    
    return Object.fromEntries(
      Object.entries(FIELD_TYPES).filter(([_, field]) => 
        field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };
  
  const filteredFieldTypes = getFilteredFieldTypes();
  
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-1">Component Library</h2>
        <p className="text-sm text-muted-foreground">Drag fields to build your form</p>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <ScrollArea className="flex-1 -mx-4 px-4">
        {searchTerm ? (
          // Search results view
          <div className="space-y-3">
            {Object.keys(filteredFieldTypes).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No components found matching "{searchTerm}"</p>
              </div>
            ) : (
              Object.keys(filteredFieldTypes).map(type => (
                <DraggableComponent key={type} type={type} />
              ))
            )}
          </div>
        ) : (
          // Categorized view
          <Accordion
            type="multiple"
            value={expandedCategories}
            onValueChange={setExpandedCategories}
            className="space-y-2"
          >
            {FIELD_CATEGORIES.map(category => {
              // Get fields that belong to this category
              const categoryFields = Object.keys(FIELD_TYPES).filter(
                key => FIELD_TYPES[key].category === category.id
              );
              
              if (categoryFields.length === 0) return null;
              
              return (
                <AccordionItem 
                  key={category.id} 
                  value={category.id}
                  className="border rounded-md overflow-hidden"
                >
                  <AccordionTrigger className="px-3 py-2 hover:bg-muted/50 hover:no-underline">
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium">{category.name}</span>
                      <span className="text-xs text-muted-foreground">{category.description}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3 pt-1 px-3">
                    <div className="space-y-3">
                      {categoryFields.map(type => (
                        <DraggableComponent key={type} type={type} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </ScrollArea>

      <Separator className="my-4" />
      
      <div className="py-3 px-4 rounded-md bg-muted/50 border text-sm">
        <p className="font-medium mb-1 text-xs">Pro Tip</p>
        <p className="text-xs text-muted-foreground">
          Drag components directly into your form or click to add to the current step.
        </p>
      </div>
    </div>
  );
};

export default ComponentLibraryPanel;