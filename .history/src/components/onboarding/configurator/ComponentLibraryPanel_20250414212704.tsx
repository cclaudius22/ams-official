// src/components/onboarding/configurator/ComponentLibraryPanel.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge'; // Added Badge component for better visual cues
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Calendar, 
  FileUp, 
  Repeat, 
  ScanLine, 
  ShieldCheck, 
  Type, 
  Mail, 
  List, 
  Phone, 
  TextCursorInput, 
  CheckSquare,
  UserRound,
  MapPin,
  Globe,
  FileImage,
  CreditCard,
  Search
} from 'lucide-react'; 

import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { toast } from 'sonner';
import { FieldComponentDefinition } from './types';
import FieldTypeCard from './FieldTypeCard';

// Define field categories with their colors for gradients
const FIELD_CATEGORIES = [
  { id: 'basic', name: 'Basic', color: 'from-blue-50 to-blue-100', textColor: 'text-blue-600', iconColor: 'text-blue-500' },
  { id: 'identity', name: 'Identity', color: 'from-purple-50 to-purple-100', textColor: 'text-purple-600', iconColor: 'text-purple-500' },
  { id: 'document', name: 'Document', color: 'from-amber-50 to-amber-100', textColor: 'text-amber-600', iconColor: 'text-amber-500' },
  { id: 'advanced', name: 'Advanced', color: 'from-emerald-50 to-emerald-100', textColor: 'text-emerald-600', iconColor: 'text-emerald-500' }
];

// Get category details by ID
const getCategoryDetails = (categoryId) => {
  return FIELD_CATEGORIES.find(cat => cat.id === categoryId) || FIELD_CATEGORIES[0];
};

// --- Definition of Available Field Components ---
export const AVAILABLE_FIELD_COMPONENTS: FieldComponentDefinition[] = [
  // Basic Fields
  {
    id: 'text',
    name: 'Text Input',
    description: 'Single line text entry.',
    icon: TextCursorInput,
    category: 'basic',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-text" className="text-xs">Text Label</Label>
        <Input id="preview-text" placeholder="Enter text..." readOnly className="bg-white h-8" />
      </div>
    )
  },
  {
    id: 'textarea',
    name: 'Text Area',
    description: 'Multi-line text entry.',
    icon: Type,
    category: 'basic',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-textarea" className="text-xs">Text Area Label</Label>
        <Textarea id="preview-textarea" placeholder="Enter longer text..." readOnly className="bg-white h-16 resize-none" />
      </div>
    )
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Email input with validation hint.',
    icon: Mail,
    category: 'basic',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-email" className="text-xs">Email Label</Label>
        <Input id="preview-email" type="email" placeholder="name@example.com" readOnly className="bg-white h-8" />
      </div>
    )
  },
  {
    id: 'phone',
    name: 'Phone Number',
    description: 'Phone number input.',
    icon: Phone,
    category: 'basic',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-phone" className="text-xs">Phone Label</Label>
        <Input id="preview-phone" type="tel" placeholder="+1 (555) 123-4567" readOnly className="bg-white h-8" />
      </div>
    )
  },
  {
    id: 'select',
    name: 'Dropdown Select',
    description: 'Select from predefined options.',
    icon: List,
    category: 'basic',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-select" className="text-xs">Dropdown Label</Label>
        <Select disabled>
          <SelectTrigger id="preview-select" className="bg-white h-8">
            <SelectValue placeholder="Select option..." />
          </SelectTrigger>
        </Select>
      </div>
    )
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    description: 'Single confirmation check.',
    icon: CheckSquare,
    category: 'basic',
    preview: (
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox id="preview-checkbox" disabled />
        <Label htmlFor="preview-checkbox" className="text-xs font-normal">Checkbox Label</Label>
      </div>
    )
  },
  {
    id: 'date',
    name: 'Date Picker',
    description: 'Select a single date.',
    icon: Calendar,
    category: 'basic',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-date" className="text-xs">Date Label</Label>
        <Input id="preview-date" placeholder="YYYY-MM-DD" readOnly className="bg-white h-8" />
      </div>
    )
  },
  
  // Identity Fields
  {
    id: 'firstName',
    name: 'First Name',
    description: 'Personal first/given name.',
    icon: UserRound,
    category: 'identity',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-firstname" className="text-xs">First Name</Label>
        <Input id="preview-firstname" placeholder="Enter first name" readOnly className="bg-white h-8" />
      </div>
    )
  },
  {
    id: 'lastName',
    name: 'Last Name',
    description: 'Personal surname/family name.',
    icon: UserRound,
    category: 'identity',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-lastname" className="text-xs">Last Name</Label>
        <Input id="preview-lastname" placeholder="Enter last name" readOnly className="bg-white h-8" />
      </div>
    )
  },
  {
    id: 'nationality',
    name: 'Nationality',
    description: 'Country of citizenship selection.',
    icon: Globe,
    category: 'identity',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-nationality" className="text-xs">Nationality</Label>
        <Select disabled>
          <SelectTrigger id="preview-nationality" className="bg-white h-8">
            <SelectValue placeholder="Select country..." />
          </SelectTrigger>
        </Select>
      </div>
    )
  },
  {
    id: 'address',
    name: 'Address',
    description: 'Full postal address entry.',
    icon: MapPin,
    category: 'identity',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-address" className="text-xs">Address</Label>
        <Textarea id="preview-address" placeholder="Enter your address" readOnly className="bg-white h-16 resize-none" />
      </div>
    )
  },
  
  // Document Fields
  {
    id: 'passportScan',
    name: 'Passport Scan',
    description: 'Upload and verify passport.',
    icon: FileImage,
    category: 'document',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-passport" className="text-xs">Passport Upload</Label>
        <div className="p-2 border border-dashed rounded bg-muted/30 text-center text-xs text-muted-foreground">
          <FileImage className="h-4 w-4 mx-auto mb-1"/>
          Upload passport image
        </div>
      </div>
    )
  },
  {
    id: 'documentSelectUpload',
    name: 'Document Upload',
    description: 'Select type and upload file.',
    icon: FileUp,
    category: 'document',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-docupload" className="text-xs">Document Upload</Label>
        <div className="p-2 border border-dashed rounded bg-muted/30 text-center text-xs text-muted-foreground">
          <FileUp className="h-4 w-4 mx-auto mb-1"/>
          Select and upload document
        </div>
      </div>
    )
  },
  {
    id: 'identityDocumentScan',
    name: 'ID Verification',
    description: 'Scan Passport/Driving License.',
    icon: ScanLine,
    category: 'document',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-idscan" className="text-xs">ID Verification</Label>
        <div className="p-2 border border-dashed rounded bg-muted/30 text-center text-xs text-muted-foreground">
          <ScanLine className="h-4 w-4 mx-auto mb-1"/>
          Verify identity document
        </div>
      </div>
    )
  },
  {
    id: 'kycTrigger',
    name: 'KYC/Identity Check',
    description: 'Initiate identity verification.',
    icon: ShieldCheck,
    category: 'document',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-kyc" className="text-xs">KYC Check</Label>
        <div className="p-2 border border-dashed rounded bg-muted/30 text-center text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 mx-auto mb-1"/>
          Verify identity (KYC)
        </div>
      </div>
    )
  },
  
  // Advanced Fields
  {
    id: 'repeater',
    name: 'Repeatable Section',
    description: 'Group fields that can be added multiple times.',
    icon: Repeat,
    category: 'advanced',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-repeater" className="text-xs">Repeatable Section</Label>
        <div className="p-2 border border-dashed rounded bg-muted/30 text-center text-xs text-muted-foreground">
          <Repeat className="h-4 w-4 mx-auto mb-1"/>
          Add multiple entries
        </div>
      </div>
    )
  },
  {
    id: 'paymentInfo',
    name: 'Payment Information',
    description: 'Credit card or payment details.',
    icon: CreditCard,
    category: 'advanced',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-payment" className="text-xs">Payment Information</Label>
        <Input id="preview-payment" placeholder="•••• •••• •••• ••••" readOnly className="bg-white h-8" />
      </div>
    )
  },
];

// Simple component for "Add to Step" button
const AddToStepButton = ({ componentDef }) => {
  const { state, dispatch } = useConfigurator();
  const { activeStepId } = state;
  
  const handleClick = () => {
    if (!activeStepId) {
      toast.error("No step selected", { 
        description: "Please select a step before adding fields."
      });
      return;
    }
    
    dispatch({
      type: 'ADD_FIELD',
      payload: {
        stepId: activeStepId,
        fieldType: componentDef.id
      }
    });
    
    toast.success(`Added ${componentDef.name}`, { 
      description: "Field added to the current step."
    });
  };
  
  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="h-7 px-2" 
      onClick={handleClick}
    >
      <Plus className="h-3.5 w-3.5 mr-1" />
      Add
    </Button>
  );
};

// Modernized compact component card
const CompactFieldCard = ({ componentDef }) => {
  const categoryDetails = getCategoryDetails(componentDef.category);
  
  return (
    <Card className={`overflow-hidden border mb-2 shadow-sm bg-gradient-to-br ${categoryDetails.color} hover:shadow-md transition-shadow`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {React.createElement(componentDef.icon, { className: `h-4 w-4 ${categoryDetails.iconColor}` })}
            <div className="font-medium text-sm">{componentDef.name}</div>
          </div>
          <AddToStepButton componentDef={componentDef} />
        </div>
        
        <div className="text-xs text-muted-foreground mb-2">
          {componentDef.description}
        </div>
        
        <div className="border rounded-md bg-white/80 p-2">
          <div className="transform scale-90 origin-top-left">
            {componentDef.preview}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// --- Component Definition ---
const ComponentLibraryPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Filter field components by search term and category
  const filteredComponents = AVAILABLE_FIELD_COMPONENTS.filter(component => {
    const matchesSearch = searchTerm === '' || 
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = 
      activeCategory === 'All' || 
      (activeCategory === 'Basic' && component.category === 'basic') ||
      (activeCategory === 'Identity' && component.category === 'identity') ||
      (activeCategory === 'Document' && component.category === 'document') ||
      (activeCategory === 'Advanced' && component.category === 'advanced');
    
    return matchesSearch && matchesCategory;
  });
  
  // Count components by category
  const basicCount = AVAILABLE_FIELD_COMPONENTS.filter(c => c.category === 'basic').length;
  const identityCount = AVAILABLE_FIELD_COMPONENTS.filter(c => c.category === 'identity').length;
  const documentCount = AVAILABLE_FIELD_COMPONENTS.filter(c => c.category === 'document').length;
  const advancedCount = AVAILABLE_FIELD_COMPONENTS.filter(c => c.category === 'advanced').length;
  
  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-1">Component Library</h2>
        <p className="text-sm text-muted-foreground">
          Choose fields to add to your form
        </p>
        
        {/* Search Bar */}
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      {/* Category Tabs */}
      <Tabs defaultValue="All" value={activeCategory} onValueChange={setActiveCategory} className="px-4">
        <TabsList className="w-full grid grid-cols-5 mb-2">
          <TabsTrigger value="All" className="text-xs">
            All <Badge variant="outline" className="ml-1 px-1.5 py-0 text-xs">{AVAILABLE_FIELD_COMPONENTS.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="Basic" className="text-xs">
            Basic <Badge variant="outline" className="ml-1 px-1.5 py-0 text-xs">{basicCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="Identity" className="text-xs">
            Identity <Badge variant="outline" className="ml-1 px-1.5 py-0 text-xs">{identityCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="Document" className="text-xs">
            Document <Badge variant="outline" className="ml-1 px-1.5 py-0 text-xs">{documentCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="Advanced" className="text-xs">
            Advanced <Badge variant="outline" className="ml-1 px-1.5 py-0 text-xs">{advancedCount}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Component Grid */}
      <ScrollArea className="flex-1 p-4 pt-0">
        {filteredComponents.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {filteredComponents.map(componentDef => (
              <CompactFieldCard 
                key={componentDef.id} 
                componentDef={componentDef} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              No components match your search
            </p>
            <Button 
              variant="link" 
              onClick={() => setSearchTerm('')}
              className="mt-2"
            >
              Clear search
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ComponentLibraryPanel;