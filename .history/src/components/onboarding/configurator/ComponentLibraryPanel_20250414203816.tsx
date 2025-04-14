// src/components/onboarding/configurator/ComponentLibraryPanel.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  CalendarDays,
  FileImage,
  FileText,
  CreditCard,
  Building,
  Search,
  CircleUser,
  Fingerprint,
  FlaskConical,
  BaggageClaim,
  Lock,
  KeyRound
} from 'lucide-react'; 

import { useConfigurator } from '@/contexts/ConfiguratorContext';
import { toast } from 'sonner';
import { FieldComponentDefinition } from './types'; // Assuming types.ts is in the same folder
import FieldTypeCard from './FieldTypeCard'; // Import the card component

// Define categories to organize the fields
const FIELD_CATEGORIES = [
  { id: 'basic', name: 'Basic Fields', description: 'Common input components' },
  { id: 'personal', name: 'Identity & Personal', description: 'User identification fields' },
  { id: 'document', name: 'Documents & Verification', description: 'Identity verification components' },
  { id: 'advanced', name: 'Advanced Controls', description: 'Specialized input types' }
];

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
  
  // Personal Fields
  {
    id: 'firstName',
    name: 'First Name',
    description: 'Personal first/given name.',
    icon: UserRound,
    category: 'personal',
    badge: 'Common',
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
    category: 'personal',
    badge: 'Common',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-lastname" className="text-xs">Last Name</Label>
        <Input id="preview-lastname" placeholder="Enter last name" readOnly className="bg-white h-8" />
      </div>
    )
  },
  {
    id: 'fullName',
    name: 'Full Name',
    description: 'Complete name in one field.',
    icon: CircleUser,
    category: 'personal',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-fullname" className="text-xs">Full Name</Label>
        <Input id="preview-fullname" placeholder="Enter full name" readOnly className="bg-white h-8" />
      </div>
    )
  },
  {
    id: 'dateOfBirth',
    name: 'Date of Birth',
    description: 'Birth date with age calculation.',
    icon: CalendarDays,
    category: 'personal',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-dob" className="text-xs">Date of Birth</Label>
        <Input id="preview-dob" placeholder="YYYY-MM-DD" readOnly className="bg-white h-8" />
      </div>
    )
  },
  {
    id: 'nationality',
    name: 'Nationality',
    description: 'Country of citizenship selection.',
    icon: Globe,
    category: 'personal',
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
    category: 'personal',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-address" className="text-xs">Address</Label>
        <Textarea id="preview-address" placeholder="Enter your address" readOnly className="bg-white h-16 resize-none" />
      </div>
    )
  },
  {
    id: 'organization',
    name: 'Organization',
    description: 'Company or organization name.',
    icon: Building,
    category: 'personal',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-org" className="text-xs">Organization</Label>
        <Input id="preview-org" placeholder="Enter organization name" readOnly className="bg-white h-8" />
      </div>
    )
  },
  
  // Document & Verification
  {
    id: 'passportScan',
    name: 'Passport Scan',
    description: 'Upload and verify passport.',
    icon: FileImage,
    category: 'document',
    badge: 'Verification',
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
    badge: 'Verification',
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
    id: 'biometricVerification',
    name: 'Biometric Verification',
    description: 'Face or fingerprint verification.',
    icon: Fingerprint,
    category: 'document',
    badge: 'Advanced',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-biometric" className="text-xs">Biometric Verification</Label>
        <div className="p-2 border border-dashed rounded bg-muted/30 text-center text-xs text-muted-foreground">
          <Fingerprint className="h-4 w-4 mx-auto mb-1"/>
          Verify with biometrics
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
    badge: 'Verification',
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
  
  // Advanced Controls
  {
    id: 'repeater',
    name: 'Repeatable Section',
    description: 'Group fields that can be added multiple times.',
    icon: Repeat,
    category: 'advanced',
    badge: 'Complex',
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
    id: 'dependentVisa',
    name: 'Dependent Information',
    description: 'Family member or dependent details.',
    icon: BaggageClaim,
    category: 'advanced',
    badge: 'Specialized',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-dependent" className="text-xs">Dependent Information</Label>
        <div className="p-2 border border-dashed rounded bg-muted/30 text-center text-xs text-muted-foreground">
          <BaggageClaim className="h-4 w-4 mx-auto mb-1"/>
          Add dependent details
        </div>
      </div>
    )
  },
  {
    id: 'securityQuestion',
    name: 'Security Questions',
    description: 'Identity verification questions.',
    icon: Lock,
    category: 'advanced',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-security" className="text-xs">Security Question</Label>
        <Select disabled>
          <SelectTrigger id="preview-security" className="bg-white h-8">
            <SelectValue placeholder="Select a security question..." />
          </SelectTrigger>
        </Select>
        <Input placeholder="Your answer" className="mt-1 bg-white h-8" />
      </div>
    )
  },
  {
    id: 'accessCode',
    name: 'Access Code',
    description: 'Special code or reference number.',
    icon: KeyRound,
    category: 'advanced',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-code" className="text-xs">Access/Reference Code</Label>
        <Input id="preview-code" placeholder="Enter access code" readOnly className="bg-white h-8 font-mono" />
      </div>
    )
  },
  {
    id: 'paymentInfo',
    name: 'Payment Information',
    description: 'Credit card or payment details.',
    icon: CreditCard,
    category: 'advanced',
    badge: 'Secure',
    preview: (
      <div className="space-y-1 w-full">
        <Label htmlFor="preview-payment" className="text-xs">Payment Information</Label>
        <Input id="preview-payment" placeholder="•••• •••• •••• ••••" readOnly className="bg-white h-8" />
      </div>
    )
  },
  {
    id: 'consent',
    name: 'Consent Form',
    description: 'Legal agreements and consent.',
    icon: FileText,
    category: 'advanced',
    preview: (
      <div className="space-y-1 w-full">
        <div className="border rounded p-1 bg-muted/30 text-xs">
          I agree to the terms and conditions...
        </div>
        <div className="flex items-center space-x-2 pt-1">
          <Checkbox id="preview-consent" disabled />
          <Label htmlFor="preview-consent" className="text-xs font-normal">I agree</Label>
        </div>
      </div>
    )
  },
];

// --- Component Definition ---
const ComponentLibraryPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const { state } = useConfigurator();
  
  // Filter field components by search term and category
  const filteredComponents = AVAILABLE_FIELD_COMPONENTS.filter(component => {
    const matchesSearch = searchTerm === '' || 
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = activeCategory === 'all' || component.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Count components by category
  const componentCounts = FIELD_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = AVAILABLE_FIELD_COMPONENTS.filter(c => c.category === category.id).length;
    return acc;
  }, {});
  
  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b bg-card">
        <h2 className="text-lg font-semibold tracking-tight">Component Library</h2>
        <p className="text-sm text-muted-foreground">
          Drag or click to add fields to your form
        </p>
      </div>
      
      {/* Search Bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
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
      <div className="px-4 pb-2">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="all" className="text-xs">
              All
              <Badge variant="outline" className="ml-1.5 h-5 px-1" aria-label="count">
                {AVAILABLE_FIELD_COMPONENTS.length}
              </Badge>
            </TabsTrigger>
            {FIELD_CATEGORIES.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                {category.name.split(' ')[0]}
                <Badge variant="outline" className="ml-1.5 h-5 px-1" aria-label="count">
                  {componentCounts[category.id]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Scrollable List of Components */}
      <ScrollArea className="flex-1 px-4">
        {filteredComponents.length > 0 ? (
          <div className="py-2 space-y-3">
            {filteredComponents.map(componentDef => (
              <FieldTypeCard key={componentDef.id} componentDef={componentDef} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-muted-foreground text-sm">No components found matching "{searchTerm}"</p>
            <Button 
              variant="link" 
              className="mt-2 h-auto p-0 text-xs"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </Button>
          </div>
        )}
      </ScrollArea>
      
      {/* Pro Tip Footer */}
      {!searchTerm && activeCategory === 'all' && (
        <div className="p-4 bg-muted/40 m-4 rounded-lg border border-border/60">
          <h3 className="text-xs font-medium mb-1">Pro Tip</h3>
          <p className="text-xs text-muted-foreground">
            Drag components directly to your form or select a field type to add with customized defaults.
          </p>
        </div>
      )}
    </div>
  );
};

export default ComponentLibraryPanel;