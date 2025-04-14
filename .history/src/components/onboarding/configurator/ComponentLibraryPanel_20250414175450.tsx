// src/components/onboarding/configurator/ComponentLibraryPanel.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, FileUp, Repeat, ScanLine, ShieldCheck, Type, Mail, List, Phone, TextCursorInput, CheckSquare } from 'lucide-react'; // Added CheckSquare
import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { toast } from '@/components/ui/use-toast';
import { FieldComponentDefinition } from './types'; // Assuming types.ts is in the same folder
import FieldTypeCard from './FieldTypeCard'; // Import the card component

// --- Definition of Available Field Components ---
// Keeping this directly in the file for simplicity now.
// Could be moved to a separate constants file later if desired.
export const AVAILABLE_FIELD_COMPONENTS: FieldComponentDefinition[] = [
  {
    id: 'text',
    name: 'Text Input',
    description: 'Single line text entry.',
    icon: TextCursorInput,
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
    preview: (
       <div className="space-y-1 w-full">
        <Label htmlFor="preview-date" className="text-xs">Date Label</Label>
        <Input id="preview-date" placeholder="YYYY-MM-DD" readOnly className="bg-white h-8" />
       </div>
    )
  },
   // --- Complex / Future Fields ---
   {
     id: 'repeater',
     name: 'Repeatable Section',
     description: 'Group fields that can be added multiple times.',
     icon: Repeat,
     preview: (
       <div className="p-2 border border-dashed rounded text-center text-xs text-muted-foreground">
         <Repeat className="h-4 w-4 mx-auto mb-1"/>
         Repeatable Section
       </div>
     )
   },
   {
     id: 'documentSelectUpload',
     name: 'Document Upload',
     description: 'Select type and upload file.',
     icon: FileUp,
     preview: (
       <div className="p-2 border border-dashed rounded text-center text-xs text-muted-foreground">
         <FileUp className="h-4 w-4 mx-auto mb-1"/>
         Document Upload
       </div>
     )
   },
   {
     id: 'identityDocumentScan',
     name: 'ID Scan',
     description: 'Scan Passport/Driving License.',
     icon: ScanLine,
     preview: (
       <div className="p-2 border border-dashed rounded text-center text-xs text-muted-foreground">
          <ScanLine className="h-4 w-4 mx-auto mb-1"/>
          ID Document Scan
       </div>
     )
   },
    {
     id: 'kycTrigger',
     name: 'KYC/Identity Check',
     description: 'Initiate identity verification.',
     icon: ShieldCheck,
     preview: (
       <div className="p-2 border border-dashed rounded text-center text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 mx-auto mb-1"/>
          KYC Check Trigger
       </div>
     )
   },
   // Add Info Block, etc. later
];
// --- End of Definition ---


// --- Component Definition ---
const ComponentLibraryPanel = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Component Library</h2>
        <p className="text-sm text-muted-foreground">
          Add fields to the selected step.
        </p>
      </div>
      {/* Scrollable List of Components */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {AVAILABLE_FIELD_COMPONENTS.map(componentDef => (
          <FieldTypeCard key={componentDef.id} componentDef={componentDef} />
        ))}
      </div>
    </div>
  );
};

export default ComponentLibraryPanel;