'use client'

import React, { useState, useEffect } from 'react';

interface Stage {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  enabled?: boolean;
  locked?: boolean;
  group: 'fixed' | 'conditional' | 'final';
  categories?: string[]; // Categories this stage applies to
}

interface DocumentType {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  purpose: string;
  format: string;
  examples: string[];
  categories?: string[]; // Categories this document applies to
}

interface VisaConfig {
  visaName: string;
  visaTypeId: string;
  visaDescription: string;
  visaCode: string;
  eligibilityCriteria: string[];
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus,
  Save,
  Trash2,
  Lock,
  Unlock,
  FileCheck,
  User,
  CreditCard,
  Briefcase,
  Map,
  ShieldCheck,
  Image,
  FileText,
  Building,
  CheckSquare,
  Grip,
  Layers,
  X
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Stage Item Component
interface SortableStageItemProps {
  stage: Stage;
  toggleStage: (id: string) => void;
}

const SortableStageItem = ({ stage, toggleStage }: SortableStageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: stage.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  
  // Ensure the icon is a valid component before rendering
  const IconComponent = stage.icon || FileText;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-md p-3 flex justify-between items-center ${
        stage.enabled ? 'bg-white' : 'bg-gray-100 text-gray-500'
      }`}
    >
      <div className="flex items-center">
        <div {...attributes} {...listeners} className="mr-2 cursor-grab">
          <Grip className="h-4 w-4 text-gray-400" />
        </div>
        <IconComponent className={`h-5 w-5 mr-2 ${
          stage.enabled ? 'text-blue-600' : 'text-gray-400'
        }`} />
        <span className="font-medium">{stage.name}</span>
      </div>
      <div>
        <Button 
          variant={stage.enabled ? "default" : "outline"}
          size="sm"
          onClick={() => toggleStage(stage.id)}
        >
          {stage.enabled ? 'Enabled' : 'Disabled'}
        </Button>
      </div>
    </div>
  );
};

const VisaBuilder: React.FC = () => {
  // State for tracking visa type configuration
  const resetForm = () => {
    setVisaName('');
    setVisaTypeId('');
    setVisaDescription('');
    setVisaCode('');
    setEligibilityCriteria([]);
    setSelectedCategory('Business');
    setConditionalStages(conditionalStages.map(stage => ({
      ...stage,
      enabled: stage.group === 'fixed' && stage.id !== 'DYNAMIC_DOCUMENTS_UPLOAD'
    })));
    setDocumentTypes(documentTypes.map(doc => ({
      ...doc,
      enabled: false
    })));
    if (typeof window !== 'undefined') {
      localStorage.removeItem('visaBuilder_visaCode');
    }
  };

  const [visaName, setVisaName] = useState('Business Visitor Visa');
  const [visaTypeId, setVisaTypeId] = useState('business-visitor');
  const [visaDescription, setVisaDescription] = useState('For business professionals visiting for meetings, conferences, and business activities.');
  const [visaCode, setVisaCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('visaBuilder_visaCode') || '';
    }
    return '';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('visaBuilder_visaCode', visaCode);
    }
  }, [visaCode]);
  const [eligibilityCriteria, setEligibilityCriteria] = useState([
    'Must be 18 years or older',
    'Valid passport with at least 6 months validity',
    'Proof of business purpose',
    'Sufficient funds for stay'
  ]);
  
  // Document Modal State
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  
  // Fixed stages that are required for all visa types
  const fixedStages = [
    { id: 'ELIGIBILITY_CHECK', name: 'Eligibility Check', icon: CheckSquare, locked: true, group: 'fixed' },
    { id: 'SMS_VERIFICATION', name: 'SMS Verification', icon: ShieldCheck, locked: true, group: 'fixed' },
    { id: 'PASSPORT_UPLOAD', name: 'Passport Upload', icon: FileText, locked: true, group: 'fixed' },
    { id: 'RESIDENCY_INFO', name: 'Residency Information', icon: Building, locked: true, group: 'fixed' },
    { id: 'KYC_LIVENESS', name: 'KYC & Liveness Check', icon: User, locked: true, group: 'fixed' },
    { id: 'PHOTO_UPLOAD', name: 'Photo Upload', icon: Image, locked: true, group: 'fixed' },
  ];
  
  // Visa categories
  const visaCategories = [
    'Business',
    'Tourist', 
    'Student',
    'Work',
    'Medical',
    'Religious'
  ];
  
  const [selectedCategory, setSelectedCategory] = useState<string>('Business');

  // Conditional stages that can be enabled/disabled
  const [conditionalStages, setConditionalStages] = useState<Stage[]>([
    { id: 'EXISTING_VISAS', name: 'Existing Visas', icon: FileText, enabled: false, group: 'conditional', categories: ['Business', 'Tourist', 'Work'] },
    { id: 'TRAVEL_DETAILS', name: 'Travel Details', icon: Map, enabled: true, group: 'conditional', categories: ['Business', 'Tourist'] },
    { id: 'TRAVEL_INSURANCE', name: 'Travel Insurance', icon: ShieldCheck, enabled: true, group: 'conditional', categories: ['Business', 'Tourist'] },
    { id: 'STUDENT_INFO', name: 'Student Information', icon: User, enabled: false, group: 'conditional', categories: ['Student'] },
    { id: 'RELIGION_WORKER_INFO', name: 'Religious Worker Info', icon: Building, enabled: false, group: 'conditional', categories: ['Religious'] },
    { id: 'MEDICAL_WORKER_INFO', name: 'Medical Worker Info', icon: User, enabled: false, group: 'conditional', categories: ['Medical'] },
    { id: 'PROFESSIONAL_INFO', name: 'Professional Information', icon: Briefcase, enabled: true, group: 'conditional', categories: ['Business', 'Work'] },
    { id: 'FINANCIAL_INFO', name: 'Financial Information', icon: CreditCard, enabled: true, group: 'conditional', categories: ['Business', 'Work'] },
    { id: 'DYNAMIC_DOCUMENTS_UPLOAD', name: 'Additional Documents', icon: FileText, enabled: true, group: 'conditional', categories: ['Business', 'Tourist', 'Student', 'Work', 'Medical', 'Religious'] },
  ]);

  // Filter stages based on selected category
  const filteredStages = conditionalStages.filter(stage => 
    !stage.categories || stage.categories.includes(selectedCategory)
  );
  
  // Final stages for review, payment and submission
  const finalStages = [
    { id: 'APPLICATION_REVIEW', name: 'Application Review', icon: FileCheck, locked: true, group: 'final' },
    { id: 'PAYMENT', name: 'Payment', icon: CreditCard, locked: true, group: 'final' },
    { id: 'SUBMISSION', name: 'Submission', icon: CheckSquare, locked: true, group: 'final' },
  ];
  
  // Available document types for dynamic document upload
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([
    { 
      id: 'invitation_letter', 
      name: 'Invitation Letter', 
      enabled: true,
      description: 'Official letter from the host company/organization inviting the applicant.',
      purpose: 'Verify purpose and legitimacy of business visit.',
      format: 'PDF or JPEG',
      examples: ['Company letterhead', 'Contact details of inviting person'],
      categories: ['Business', 'Work']
    },
    { 
      id: 'business_itinerary', 
      name: 'Business Itinerary', 
      enabled: true,
      description: 'Detailed schedule of business activities.',
      purpose: 'Confirm business nature of trip.',
      format: 'PDF or DOC',
      examples: ['Meeting schedules', 'Conference details'],
      categories: ['Business', 'Work']
    },
    { 
      id: 'job_offer', 
      name: 'Job Offer Letter', 
      enabled: true,
      description: 'Official job offer from employer.',
      purpose: 'Verify employment offer details.',
      format: 'PDF',
      examples: ['Salary details', 'Job title', 'Start date'],
      categories: ['Work']
    },
    { 
      id: 'degree_certificate', 
      name: 'Degree Certificate', 
      enabled: true,
      description: 'Official university degree certificate.',
      purpose: 'Verify educational qualifications.',
      format: 'PDF or JPEG',
      examples: ['Bachelor/Master certificate', 'Transcripts'],
      categories: ['Student', 'Work']
    },
    { 
      id: 'enrollment_proof', 
      name: 'Enrollment Proof', 
      enabled: true,
      description: 'Proof of enrollment from educational institution.',
      purpose: 'Verify student status.',
      format: 'PDF',
      examples: ['Letter of acceptance', 'Current enrollment certificate'],
      categories: ['Student']
    },
    { 
      id: 'professional_letter', 
      name: 'Professional Reference', 
      enabled: true,
      description: 'Letter from accountant/lawyer verifying status.',
      purpose: 'Verify professional qualifications.',
      format: 'PDF',
      examples: ['CPA certification proof', 'Bar association membership'],
      categories: ['Work']
    },
    { 
      id: 'financial_statements', 
      name: 'Financial Statements', 
      enabled: false,
      description: 'Bank statements or financial proof.',
      purpose: 'Establish financial capability.',
      format: 'PDF or JPEG',
      examples: ['3 months bank statements', 'Sponsorship letter'],
      categories: ['Business', 'Work', 'Student']
    }
  ]);
  
  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Document Modal Functions
  const openDocumentModal = (docId: string) => {
    setActiveDocumentId(docId);
    setIsDocumentModalOpen(true);
  };
  
  const closeDocumentModal = () => {
    setIsDocumentModalOpen(false);
    setActiveDocumentId(null);
  };
  
  const updateDocumentField = (docId: string, field: keyof DocumentType, value: string | boolean | string[]) => {
    setDocumentTypes(documentTypes.map(doc => 
      doc.id === docId ? { ...doc, [field]: value } : doc
    ));
  };
  
  const updateDocumentExample = (docId: string, index: number, value: string) => {
    setDocumentTypes(documentTypes.map(doc => {
      if (doc.id === docId) {
        const newExamples = [...doc.examples];
        newExamples[index] = value;
        return { ...doc, examples: newExamples };
      }
      return doc;
    }));
  };
  
  const addDocumentExample = (docId: string) => {
    setDocumentTypes(documentTypes.map(doc => {
      if (doc.id === docId) {
        return { ...doc, examples: [...doc.examples, 'New example'] };
      }
      return doc;
    }));
  };
  
  const removeDocumentExample = (docId: string, index: number) => {
    setDocumentTypes(documentTypes.map(doc => {
      if (doc.id === docId) {
        const newExamples = [...doc.examples];
        newExamples.splice(index, 1);
        return { ...doc, examples: newExamples };
      }
      return doc;
    }));
  };
  
  // Toggle conditional stage enabled status
  const toggleStage = (stageId: string) => {
    setConditionalStages(conditionalStages.map(stage => 
      stage.id === stageId ? { ...stage, enabled: !stage.enabled } : stage
    ));
  };
  
  // Toggle document required status
  const toggleDocumentEnabled = (docId: string) => {
    setDocumentTypes(documentTypes.map(doc => 
      doc.id === docId ? { ...doc, enabled: !doc.enabled } : doc
    ));
  };
  
  // Add new document type
  const addDocumentType = () => {
    setDocumentTypes([
      ...documentTypes, 
      { 
        id: `doc_${Date.now()}`, 
        name: 'New Document', 
        enabled: false,
        description: 'Enter document description here.',
        purpose: 'Enter the purpose of this document.',
        format: 'PDF, JPEG, etc.',
        examples: ['Example 1', 'Example 2'],
        categories: []
      }
    ]);
  };
  
  // Remove document type
  const removeDocumentType = (docId: string) => {
    setDocumentTypes(documentTypes.filter(doc => doc.id !== docId));
  };
  
  // Handle drag end for reordering stages
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setConditionalStages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Visa Builder</h1>
          <p className="text-gray-500">Configure visa requirements and application flow</p>
        </div>
        <div className="flex space-x-4">
          <Button variant="outline" onClick={resetForm}>Cancel</Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Visa Type
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Basic Info */}
        <div className="w-full lg:w-1/3">
          <Card>
            <CardHeader>
            <CardTitle className="text-lg">Visa Type Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visa Name</label>
                <input
                  type="text"
                  value={visaName}
                  onChange={(e) => setVisaName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={visaDescription}
                  onChange={(e) => setVisaDescription(e.target.value)}
                  className="w-full p-2 border rounded-md h-24"
                />
              </div>
              
                              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Eligibility Criteria</h3>
                  <Button variant="ghost" size="sm" onClick={() => setEligibilityCriteria([...eligibilityCriteria, 'New requirement'])}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 mb-4">
                  {eligibilityCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={criteria}
                        onChange={(e) => {
                          const newCriteria = [...eligibilityCriteria];
                          newCriteria[index] = e.target.value;
                          setEligibilityCriteria(newCriteria);
                        }}
                        className="w-full p-2 border rounded-md text-sm"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => {
                          const newCriteria = [...eligibilityCriteria];
                          newCriteria.splice(index, 1);
                          setEligibilityCriteria(newCriteria);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type ID (for system)</label>
                  <input
                    type="text"
                    value={visaTypeId}
                    onChange={(e) => setVisaTypeId(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm font-mono"
                    placeholder="e.g., high-potential-individual"
                  />
                  <p className="text-xs text-gray-500 mt-1">Unique identifier used in the system</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visa Code</label>
                  <input
                    type="text"
                    value={visaCode || ''}
                    onChange={(e) => setVisaCode(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                    placeholder="e.g., B1, F1, H1B"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Configuration Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Active Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Visa Details</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {visaName}</p>
                  <p><span className="font-medium">Code:</span> {visaCode}</p>
                  <p><span className="font-medium">Type ID:</span> {visaTypeId}</p>
                  <p><span className="font-medium">Category:</span> {selectedCategory}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Enabled Stages</h3>
                {conditionalStages
                  .filter(stage => stage.enabled && (!stage.categories || stage.categories.includes(selectedCategory)))
                  .length > 0 ? (
                  <div className="space-y-2">
                    {conditionalStages
                      .filter(stage => stage.enabled && (!stage.categories || stage.categories.includes(selectedCategory)))
                      .map(stage => (
                        <div key={stage.id} className="flex items-center text-sm">
                          <CheckSquare className="h-4 w-4 mr-2 text-blue-500" />
                          <span>{stage.name}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No conditional stages enabled</p>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">Required Documents</h3>
                {documentTypes
                  .filter(doc => doc.enabled && (!doc.categories || doc.categories.includes(selectedCategory)))
                  .length > 0 ? (
                  <div className="space-y-2">
                    {documentTypes
                      .filter(doc => doc.enabled && (!doc.categories || doc.categories.includes(selectedCategory)))
                      .map(doc => (
                        <div key={doc.id} className="flex items-center text-sm">
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          <span>{doc.name}</span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No documents required</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Application Flow */}
        <div className="w-full lg:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Application Flow Builder</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Fixed Stages Section */}
              <div className="mb-6">
                <h3 className="font-medium mb-2 flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-gray-500" />
                  1. Fixed Stages (Always Required)
                </h3>
                <p className="text-sm text-gray-500 mb-2">These stages are mandatory for all visa types and cannot be disabled.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {fixedStages.map((stage) => {
                    // Ensure the icon is a valid component before rendering
                    const IconComponent = stage.icon || FileText;
                    return (
                      <div 
                        key={stage.id} 
                        className="border rounded-md p-3 bg-blue-50 flex items-center"
                      >
                        <IconComponent className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium">{stage.name}</p>
                          <p className="text-xs text-blue-500">Fixed Stage</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Conditional Stages Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium flex items-center">
                    <Unlock className="h-4 w-4 mr-2 text-gray-500" />
                    2. Conditional Stages (Configurable)
                  </h3>
                  <div className="w-48">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      {visaCategories.map(category => (
                        <option key={category} value={category}>
                          {category} Visa
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-2">These stages can be enabled or disabled depending on the visa type requirements. Drag to reorder their appearance in the application flow.</p>
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={filteredStages.map(stage => stage.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {filteredStages.map((stage) => (
                        <SortableStageItem 
                          key={stage.id} 
                          stage={stage} 
                          toggleStage={toggleStage} 
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
              
              {/* Document Requirements Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    3. Document Requirements
                  </h3>
                  <Button variant="outline" size="sm" onClick={addDocumentType}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Document
                  </Button>
                </div>
                
                <p className="text-sm text-gray-500 mb-3">
                  Configure the required documents for this visa type. These documents will be requested in the "Additional Documents" stage.
                </p>
                
                {/* Only show if DYNAMIC_DOCUMENTS_UPLOAD is enabled */}
                {conditionalStages.find(s => s.id === 'DYNAMIC_DOCUMENTS_UPLOAD')?.enabled ? (
                  <>
                    <div className="space-y-2">
                      {documentTypes
                        .filter(doc => !doc.categories || doc.categories.includes(selectedCategory))
                        .map((doc) => (
                        <div 
                          key={doc.id} 
                          className="border rounded-md p-3"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                              <div>
                                <input
                                  type="text"
                                  value={doc.name}
                                  onChange={(e) => {
                                    updateDocumentField(doc.id, 'name', e.target.value);
                                  }}
                                  className="font-medium border-none p-0 focus:outline-none focus:ring-0"
                                />
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant={doc.enabled ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleDocumentEnabled(doc.id)}
                              >
                                {doc.enabled ? 'Enabled' : 'Disabled'}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openDocumentModal(doc.id)}
                              >
                                Edit Details
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeDocumentType(doc.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Preview of document description */}
                          <div className="mt-2 text-sm text-gray-500 ml-7">
                            <p className="line-clamp-1">{doc.description}</p>
                            <div className="flex mt-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">{doc.format}</span>
                              {doc.examples.length > 0 && (
                                <span className="text-xs text-gray-500">{doc.examples.length} validation rules</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-100 border-dashed border-2 rounded-md p-4 text-center text-gray-500">
                    <p>Enable "Additional Documents" in Conditional Stages to configure document requirements</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2 flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-gray-500" />
                  4. AI Scan Requirements
                </h3>
                <p className="text-sm text-gray-500 mb-2">These AI validations are automatically performed on submitted documents.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'PASSPORT_VALIDITY', name: 'Passport Validity', enabled: true },
                    { id: 'FACE_MATCHING', name: 'Face Matching', enabled: true },
                    { id: 'DATES_VALIDATION', name: 'Dates Validation', enabled: true },
                    { id: 'LIVENESS_CHECK', name: 'Liveness Check', enabled: true },
                    { id: 'DYNAMIC_DOCUMENTS_SCAN', name: 'Dynamic Documents Scan', enabled: true },
                    { id: 'ROOTEDNESS_ANALYSIS', name: 'Rootedness Analysis', enabled: true },
                    { id: 'INTENT_ANALYSIS', name: 'Intent Analysis', enabled: true }
                  ].map((scan) => (
                    <div 
                      key={scan.id} 
                      className="border rounded-md p-3 bg-purple-50 flex items-center"
                    >
                      <ShieldCheck className="h-5 w-5 text-purple-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium">{scan.name}</p>
                        <p className="text-xs text-purple-500">AI Validation</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium mb-2 flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-gray-500" />
                  5. Final Stages (Always Required)
                </h3>
                <p className="text-sm text-gray-500 mb-2">These stages are always included at the end of the application process.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {finalStages.map((stage) => {
                    // Ensure the icon is a valid component before rendering
                    const IconComponent = stage.icon || FileText;
                    return (
                      <div 
                        key={stage.id} 
                        className="border rounded-md p-3 bg-green-50 flex items-center"
                      >
                        <IconComponent className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium">{stage.name}</p>
                          <p className="text-xs text-green-500">Final Stage</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Document Details Modal */}
      {isDocumentModalOpen && activeDocumentId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Document Configuration</h3>
                <Button variant="ghost" size="sm" onClick={closeDocumentModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {(() => {
                const doc = documentTypes.find(d => d.id === activeDocumentId);
                if (!doc) return null;
                
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                      <input
                        type="text"
                        value={doc.name}
                        onChange={(e) => updateDocumentField(doc.id, 'name', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={doc.description}
                        onChange={(e) => updateDocumentField(doc.id, 'description', e.target.value)}
                        className="w-full p-2 border rounded-md h-20"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                      <textarea
                        value={doc.purpose}
                        onChange={(e) => updateDocumentField(doc.id, 'purpose', e.target.value)}
                        className="w-full p-2 border rounded-md h-20"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Accepted Format</label>
                      <input
                        type="text"
                        value={doc.format}
                        onChange={(e) => updateDocumentField(doc.id, 'format', e.target.value)}
                        className="w-full p-2 border rounded-md"
                        placeholder="PDF, JPEG, PNG, etc."
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-gray-700">Validation Rules</label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => addDocumentExample(doc.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {doc.examples.map((example, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="text"
                              value={example}
                              onChange={(e) => updateDocumentExample(doc.id, index, e.target.value)}
                              className="w-full p-2 border rounded-md"
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-2"
                              onClick={() => removeDocumentExample(doc.id, index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <Button 
                        variant="outline" 
                        onClick={closeDocumentModal}
                      >
                        Cancel
                      </Button>
                      <div className="space-x-2">
                        <Button 
                          variant={doc.enabled ? "default" : "outline"}
                          onClick={() => toggleDocumentEnabled(doc.id)}
                        >
                          {doc.enabled ? 'Set as Disabled' : 'Set as Enabled'}
                        </Button>
                        <Button onClick={closeDocumentModal}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
                
    </div>
  );
};

export default VisaBuilder;
