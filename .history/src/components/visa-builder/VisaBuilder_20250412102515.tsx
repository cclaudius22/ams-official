// src/components/visa-builder/VisaBuilder.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import {
  FileCheck, User, CreditCard, Briefcase, Map, ShieldCheck,
  Image, FileText, Building, CheckSquare, RotateCcw, Save
} from 'lucide-react';

import VisaInfoForm from './VisaInfoForm';
// Import Step Components
import VisaBuilderStep1 from './VisaBuilderStep1';
import VisaBuilderStep2 from './VisaBuilderStep2';
import VisaBuilderStep3 from './VisaBuilderStep3';
import ConfigurationSummary from './ConfigurationSummary';
import DocumentModal from './DocumentModal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Stage, DocumentType, ProcessingTier, AdditionalCost } from './interfaces';

// --- Initial Data Definitions ---
const fixedStagesData: Stage[] = [
    { id: 'ELIGIBILITY_CHECK', name: 'Eligibility Check', icon: CheckSquare, locked: true, group: 'fixed' },
    { id: 'SMS_VERIFICATION', name: 'SMS Verification', icon: ShieldCheck, locked: true, group: 'fixed' },
    { id: 'PASSPORT_UPLOAD', name: 'Passport Upload', icon: FileText, locked: true, group: 'fixed' },
    { id: 'RESIDENCY_INFO', name: 'Residency Information', icon: Building, locked: true, group: 'fixed' },
    { id: 'KYC_LIVENESS', name: 'KYC & Liveness Check', icon: User, locked: true, group: 'fixed' },
    { id: 'PHOTO_UPLOAD', name: 'Photo Upload', icon: Image, locked: true, group: 'fixed' },
];
const conditionalStagesData: Stage[] = [
    { id: 'EXISTING_VISAS', name: 'Existing Visas', icon: FileText, enabled: false, group: 'conditional', categories: ['Business', 'Tourist', 'Work'] },
    { id: 'TRAVEL_DETAILS', name: 'Travel Details', icon: Map, enabled: true, group: 'conditional', categories: ['Business', 'Tourist'] },
    { id: 'TRAVEL_INSURANCE', name: 'Travel Insurance', icon: ShieldCheck, enabled: true, group: 'conditional', categories: ['Business', 'Tourist'] },
    { id: 'STUDENT_INFO', name: 'Student Information', icon: User, enabled: false, group: 'conditional', categories: ['Student'] },
    { id: 'RELIGION_WORKER_INFO', name: 'Religious Worker Info', icon: Building, enabled: false, group: 'conditional', categories: ['Religious'] },
    { id: 'MEDICAL_WORKER_INFO', name: 'Medical Worker Info', icon: User, enabled: false, group: 'conditional', categories: ['Medical'] },
    { id: 'PROFESSIONAL_INFO', name: 'Professional Information', icon: Briefcase, enabled: true, group: 'conditional', categories: ['Business', 'Work'] },
    { id: 'FINANCIAL_INFO', name: 'Financial Information', icon: CreditCard, enabled: true, group: 'conditional', categories: ['Business', 'Work'] },
    { id: 'DYNAMIC_DOCUMENTS_UPLOAD', name: 'Additional Documents', icon: FileText, enabled: true, group: 'conditional', categories: ['Business', 'Tourist', 'Student', 'Work', 'Medical', 'Religious'] },
  ];
const finalStagesData: Stage[] = [
    { id: 'APPLICATION_REVIEW', name: 'Application Review', icon: FileCheck, locked: true, group: 'final' },
    { id: 'PAYMENT', name: 'Payment', icon: CreditCard, locked: true, group: 'final' },
    { id: 'SUBMISSION', name: 'Submission', icon: CheckSquare, locked: true, group: 'final' },
];
const documentTypesData: DocumentType[] = [
    { id: 'invitation_letter', name: 'Invitation Letter', enabled: false, description: 'Official letter from host.', purpose: 'Verify business visit.', format: 'PDF/JPEG', examples: ['Company letterhead'], categories: ['Business', 'Work'] },
    { id: 'business_itinerary', name: 'Business Itinerary', enabled: false, description: 'Detailed schedule.', purpose: 'Confirm business trip nature.', format: 'PDF/DOC', examples: ['Meeting schedules'], categories: ['Business', 'Work'] },
    { id: 'job_offer', name: 'Job Offer Letter', enabled: false, description: 'Official job offer.', purpose: 'Verify employment.', format: 'PDF', examples: ['Salary, title, start date'], categories: ['Work'] },
    { id: 'degree_certificate', name: 'Degree Certificate', enabled: false, description: 'University degree.', purpose: 'Verify education.', format: 'PDF/JPEG', examples: ['Certificate image'], categories: ['Student', 'Work'] },
    { id: 'enrollment_proof', name: 'Enrollment Proof', enabled: false, description: 'Proof from institution.', purpose: 'Verify student status.', format: 'PDF', examples: ['Letter of acceptance'], categories: ['Student'] },
    { id: 'professional_letter', name: 'Professional Reference', enabled: false, description: 'Letter from accountant/lawyer.', purpose: 'Verify professional status.', format: 'PDF', examples: ['CPA proof'], categories: ['Work'] },
    { id: 'financial_statements', name: 'Financial Statements', enabled: false, description: 'Bank statements/proof.', purpose: 'Establish financial capability.', format: 'PDF/JPEG', examples: ['3 months statements'], categories: ['Business', 'Work', 'Student'] }
];
const visaCategoriesData = ['Business', 'Tourist', 'Student', 'Work', 'Medical', 'Religious'];

// Default empty objects for dynamic lists in Step 2
const defaultProcessingTier = { 
  type: 'STANDARD', 
  timeframe: '',
  timeUnit: 'WEEKS',
  minTime: 0,
  maxTime: 0
};
const defaultAdditionalCost = { description: '', amount: 0, currency: 'GBP' };


// --- Main Component ---
interface VisaBuilderContextValue {
  visaConfig: {
    name: string;
    description: string;
    typeId: string;
    code: string;
    category: string;
    eligibilityCriteria: string[];
    conditionalStages: Stage[];
    documentTypes: DocumentType[];
    fixedStages: Stage[];
    finalStages: Stage[];
    processingTiers: ProcessingTier[];
    visaCost: { amount: string | number; currency: string };
    additionalCosts: AdditionalCost[];
    processingInfo: { generalTimeframe: string; additionalInfo: string };
    metadata: { validityPeriod: string | number; maxExtensions: string | number };
  };
  setVisaConfig: (config: Partial<VisaBuilderContextValue['visaConfig']>) => void;
}

const VisaBuilderContext = React.createContext<VisaBuilderContextValue | null>(null);

export const useVisaBuilder = () => {
  const context = React.useContext(VisaBuilderContext);
  if (!context) {
    throw new Error('useVisaBuilder must be used within a VisaBuilderProvider');
  }
  return context;
};

const VisaBuilder: React.FC = () => {
  // --- State Declarations ---
  // Step Tracking
  const [currentStep, setCurrentStep] = useState<number>(1); // Start at step 1

  // Step 1 State
  const [visaName, setVisaName] = useState('');
  const [visaTypeId, setVisaTypeId] = useState('');
  const [visaDescription, setVisaDescription] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState<string[]>(['']);
  const [selectedCategory, setSelectedCategory] = useState<string>(visaCategoriesData[0]);
  const [conditionalStages, setConditionalStages] = useState<Stage[]>(() =>
      JSON.parse(JSON.stringify(conditionalStagesData))
  );
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(() =>
      JSON.parse(JSON.stringify(documentTypesData))
  );
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [visaCode, setVisaCode] = useState<string>('');

  // Step 2 State
  const [processingTiers, setProcessingTiers] = useState<ProcessingTier[]>([defaultProcessingTier]);
  const [visaCostAmount, setVisaCostAmount] = useState<number | string>('');
  const [visaCostCurrency, setVisaCostCurrency] = useState<string>('GBP'); // Default currency
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([defaultAdditionalCost]);
  const handleSetAdditionalCosts = (costs: AdditionalCost[]) => {
    setAdditionalCosts(costs.map(c => ({
      ...c,
      amount: typeof c.amount === 'string' ? Number(c.amount) || 0 : c.amount
    })));
  };
  const [processingGeneralTimeframe, setProcessingGeneralTimeframe] = useState<string>('');
  const [processingAdditionalInfo, setProcessingAdditionalInfo] = useState<string>('');
  const [metadataValidityPeriod, setMetadataValidityPeriod] = useState<number | string>('');
  const [metadataMaxExtensions, setMetadataMaxExtensions] = useState<number | string>('');


  // --- Effects for localStorage ---
   useEffect(() => {
     const storedVisaCode = localStorage.getItem('visaBuilder_visaCode');
     if (storedVisaCode) setVisaCode(storedVisaCode);
     // Load other potentially saved state here...
   }, []);

   useEffect(() => {
     if (typeof window !== 'undefined') {
       localStorage.setItem('visaBuilder_visaCode', visaCode);
     }
   }, [visaCode]);

  // --- Step Navigation ---
  const handleNextStep = () => {
      console.log('Validation values:', {
        visaName: visaName?.trim(),
        visaTypeId: visaTypeId?.trim(), 
        visaCode: visaCode?.trim()
      });

      // Enhanced validation with trim and length checks
      const trimmedName = visaName?.trim();
      const trimmedTypeId = visaTypeId?.trim();
      const trimmedCode = visaCode?.trim();

      if (!trimmedName || !trimmedTypeId || !trimmedCode) {
          alert("Please fill in all required fields (Visa Name, Type ID, and Code) before proceeding.");
          return;
      }

      if (trimmedName.length < 2 || trimmedTypeId.length < 2 || trimmedCode.length < 2) {
          alert("Each field must contain at least 2 characters");
          return;
      }

      setCurrentStep(2);
      window.scrollTo(0, 0);
  };

  const handlePreviousStep = () => {
      setCurrentStep(1);
      window.scrollTo(0, 0); // Scroll to top on step change
  };

  // --- State Update Functions ---
  const [resetKey, setResetKey] = useState(0);

  const resetForm = () => {
    setCurrentStep(1); // Reset to step 1
    setVisaName('');
    setVisaTypeId('');
    setVisaDescription('');
    setVisaCode('');
    setEligibilityCriteria(['']);
    setSelectedCategory(visaCategoriesData[0]);
    // Reset stages to their initial state including enabled status
    setConditionalStages(conditionalStagesData.map(stage => ({
      ...stage,
      enabled: stage.group === 'conditional' ? false : stage.enabled
    })));
    setDocumentTypes(JSON.parse(JSON.stringify(documentTypesData)));
    // Reset Step 2 state
    setProcessingTiers([defaultProcessingTier]);
    setVisaCostAmount('');
    setVisaCostCurrency('GBP');
    setAdditionalCosts([defaultAdditionalCost]);
    setProcessingGeneralTimeframe('');
    setProcessingAdditionalInfo('');
    setMetadataValidityPeriod('');
    setMetadataMaxExtensions('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('visaBuilder_visaCode');
    }
    setActiveDocumentId(null);
    setIsDocumentModalOpen(false);
    // Force ConfigurationSummary to reset by changing its key
    setResetKey(prev => prev + 1);
    console.log("Form Reset");
  };

  const toggleStage = (stageId: string) => {
    setConditionalStages(prevStages =>
      prevStages.map(stage =>
        stage.id === stageId ? { ...stage, enabled: !stage.enabled } : stage
      )
    );
  };

  const toggleDocumentEnabled = (docId: string) => {
    setDocumentTypes(prevDocs =>
      prevDocs.map(doc =>
        doc.id === docId ? { ...doc, enabled: !doc.enabled } : doc
      )
    );
  };


  const addDocumentType = () => {
     const newDocId = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
     const newDoc: DocumentType = {
       id: newDocId, name: '', enabled: false, description: '',
       purpose: '', format: '', examples: [], categories: [selectedCategory]
     };
    setDocumentTypes(prevDocs => [...prevDocs, newDoc]);
    setActiveDocumentId(newDocId); // Set active ID
    setIsDocumentModalOpen(true); // Open modal
  };

  const removeDocumentType = (docId: string) => {
      if (window.confirm(`Remove document type config? (ID: ${docId})`)) {
        setDocumentTypes(prevDocs => prevDocs.filter(doc => doc.id !== docId));
        if (activeDocumentId === docId) { closeModal(); }
      }
  };

  const openDocumentModal = (docId: string) => {
    setActiveDocumentId(docId);
    setIsDocumentModalOpen(true);
  };

  const closeModal = () => {
    setIsDocumentModalOpen(false);
    setActiveDocumentId(null);
  };

  const updateDocumentField = (docId: string, field: keyof DocumentType, value: string | boolean | string[]) => {
    setDocumentTypes(prevDocs =>
      prevDocs.map(doc =>
        doc.id === docId ? { ...doc, [field]: value } : doc
      )
    );
  };

   const updateDocumentExample = (docId: string, index: number, value: string) => {
     setDocumentTypes(prevDocs => prevDocs.map(doc => {
         if (doc.id === docId) {
             const newExamples = [...(doc.examples || [])]; // Ensure examples is an array
             if (index >= 0 && index < newExamples.length) newExamples[index] = value;
             return { ...doc, examples: newExamples };
         } return doc;
     }));
  };

  const addDocumentExample = (docId: string) => {
      setDocumentTypes(prevDocs => prevDocs.map(doc => {
          if (doc.id === docId) {
              return { ...doc, examples: [...(doc.examples || []), ''] }; // Ensure examples exists
          } return doc;
      }));
  };

 const removeDocumentExample = (docId: string, index: number) => {
     setDocumentTypes(prevDocs => prevDocs.map(doc => {
         if (doc.id === docId) {
             const currentExamples = doc.examples || [];
             const newExamples = [...currentExamples];
             if (index >= 0 && index < newExamples.length) newExamples.splice(index, 1);
             return { ...doc, examples: newExamples };
         } return doc;
     }));
 };


  // --- Drag and Drop Handler ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setConditionalStages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
           return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  };

  // --- FINAL Save Handler (moved logic here) ---
  const [reviewNotes, setReviewNotes] = useState('');

  const handleReviewConfiguration = () => {
    setCurrentStep(3);
    window.scrollTo(0, 0);
  };

  const handleSaveConfiguration = () => {
    console.log("Attempting to save FINAL Visa Type Configuration...");
    
    const auditData = {
      createdBy: 'System', // Will be replaced with actual user when auth is added
      createdAt: new Date().toISOString(),
      lastModifiedBy: 'System',
      lastModifiedAt: new Date().toISOString(),
      reviewNotes: reviewNotes.trim()
    };

    // Gather Step 1 Data
    const enabledFilteredConditionalStages = conditionalStages
      .filter(s => s.enabled && (!s.categories || s.categories.includes(selectedCategory)))
    const orderedEnabledFilteredConditionalStageIds = enabledFilteredConditionalStages.map(s => s.id)
    const applicationFlow = [
      ...fixedStagesData.map(s => s.id),
      ...orderedEnabledFilteredConditionalStageIds,
      ...finalStagesData.map(s => s.id)
    ];
    const requiredDocumentsList = documentTypes
      .filter(d => d.enabled && (!d.categories || d.categories.length === 0 || d.categories.includes(selectedCategory)))
      .map(d => d.id);

    // Clean Step 2 data (remove empty entries, parse numbers)
    const cleanProcessingTiers = processingTiers
        .map(t => ({ type: t.type.trim(), timeframe: t.timeframe.trim() }))
        .filter(t => t.type !== '' || t.timeframe !== '');

    const cleanAdditionalCosts = additionalCosts
        .map(c => ({
            description: c.description.trim(),
            amount: isNaN(Number(c.amount)) ? 0 : Number(c.amount), // Convert to number, default to 0 if invalid
            currency: c.currency.trim().toUpperCase()
        }))
        .filter(c => c.description !== '' || c.amount > 0); // Filter out truly empty costs


    // Construct final JSON
    const visaTypeConfig = {
      // Step 1
      visaName: visaName.trim(),
      visaTypeId: visaTypeId.trim().toLowerCase().replace(/\s+/g, '-'),
      visaDescription: visaDescription.trim(),
      visaCode: visaCode.trim().toUpperCase(),
      category: selectedCategory,
      eligibilityCriteria: eligibilityCriteria.map(c => c.trim()).filter(c => c !== ''),
      applicationFlow,
      requiredDocuments: requiredDocumentsList,

      // Step 2
      processingTier: cleanProcessingTiers,
      visaCost: {
          amount: isNaN(Number(visaCostAmount)) ? 0 : Number(visaCostAmount), // Convert to number
          currency: visaCostCurrency.trim().toUpperCase() || 'GBP' // Default currency if empty
      },
      additionalCosts: cleanAdditionalCosts,
      processingInfo: {
          generalTimeframe: processingGeneralTimeframe.trim(),
          additionalInfo: processingAdditionalInfo.trim()
      },
      metadata: {
          validityPeriod: isNaN(Number(metadataValidityPeriod)) ? null : Number(metadataValidityPeriod), // Convert to number or null
          maxExtensions: isNaN(Number(metadataMaxExtensions)) ? null : Number(metadataMaxExtensions) // Convert to number or null
      },

      // Timestamps & Version
      createdAt: new Date().toISOString(), // Consider adding only if creating new
      updatedAt: new Date().toISOString(),
      version: 1 // Increment this if updating an existing record
    };

    console.log("Final Config to Save:", JSON.stringify(visaTypeConfig, null, 2));
    alert(`Visa Type "${visaName}" configuration generated (check console). Ready for API call.`);

    // --- TODO: Implement actual API call to save/update visaTypeConfig ---
  };

  // --- Sensors for DND ---
  const sensors = useSensors(
     useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Add tolerance
     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Render Logic ---
  const contextValue = {
    visaConfig: {
      name: visaName,
      description: visaDescription,
      typeId: visaTypeId,
      code: visaCode,
      category: selectedCategory,
      eligibilityCriteria,
      conditionalStages,
      documentTypes,
      fixedStages: fixedStagesData,
      finalStages: finalStagesData,
      processingTiers,
      visaCost: { amount: visaCostAmount, currency: visaCostCurrency },
      additionalCosts,
      processingInfo: { generalTimeframe: processingGeneralTimeframe, additionalInfo: processingAdditionalInfo },
      metadata: { validityPeriod: metadataValidityPeriod, maxExtensions: metadataMaxExtensions }
    },
    setVisaConfig: (newConfig: Partial<VisaBuilderContextValue['visaConfig']>) => {
      if (newConfig.name !== undefined) setVisaName(newConfig.name);
      if (newConfig.description !== undefined) setVisaDescription(newConfig.description);
      if (newConfig.typeId !== undefined) setVisaTypeId(newConfig.typeId);
      if (newConfig.code !== undefined) setVisaCode(newConfig.code);
      if (newConfig.category !== undefined) setSelectedCategory(newConfig.category);
      if (newConfig.eligibilityCriteria !== undefined) setEligibilityCriteria(newConfig.eligibilityCriteria);
      if (newConfig.conditionalStages !== undefined) setConditionalStages(newConfig.conditionalStages);
      if (newConfig.documentTypes !== undefined) setDocumentTypes(newConfig.documentTypes);
      if (newConfig.processingTiers !== undefined) setProcessingTiers(newConfig.processingTiers);
      if (newConfig.visaCost !== undefined) {
        setVisaCostAmount(newConfig.visaCost.amount);
        setVisaCostCurrency(newConfig.visaCost.currency);
      }
      if (newConfig.additionalCosts !== undefined) setAdditionalCosts(newConfig.additionalCosts);
      if (newConfig.processingInfo !== undefined) {
        setProcessingGeneralTimeframe(newConfig.processingInfo.generalTimeframe);
        setProcessingAdditionalInfo(newConfig.processingInfo.additionalInfo);
      }
      if (newConfig.metadata !== undefined) {
        setMetadataValidityPeriod(newConfig.metadata.validityPeriod);
        setMetadataMaxExtensions(newConfig.metadata.maxExtensions);
      }
    }
  };

  return (
    <VisaBuilderContext.Provider value={contextValue}>
      <div className="flex flex-col space-y-6">
      {/* Builder specific Header */}
      <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-4 gap-2">
         <div>
           <h2 className="text-xl font-semibold">Visa Type Builder</h2>
           <p className="text-sm text-gray-500">
               {currentStep === 1 ? "Step 1: Define Flow & Documents" : 
                currentStep === 2 ? "Step 2: Costs & Processing Details" : 
                "Step 3: Review & Confirm"}
            </p>
         </div>
        <div className="flex gap-2">
          {currentStep === 2 && (
            <Button variant="outline" onClick={handlePreviousStep} size="sm">
              Back
            </Button>
          )}
          {currentStep === 1 ? (
            <Button onClick={handleNextStep} size="sm">
              Next
            </Button>
          ) : currentStep === 2 ? (
            <Button onClick={handleReviewConfiguration} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Review Configuration
            </Button>
          ) : (
            <Button onClick={handleSaveConfiguration} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Confirm & Save
            </Button>
          )}
          <Button variant="outline" onClick={resetForm} size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        </div>
      </div>

     {/* Main Content Grid - Consistent layout for all steps */}
     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Basic Info + Summary (visible in all steps) */}
        <div className="lg:col-span-1 space-y-6">
           {/* Basic Visa Information - Only show when not on Step 3 */}
           {currentStep !== 3 && (
             <VisaInfoForm
               visaName={visaName} setVisaName={setVisaName}
               visaDescription={visaDescription} setVisaDescription={setVisaDescription}
               visaTypeId={visaTypeId} setVisaTypeId={setVisaTypeId}
               visaCode={visaCode} setVisaCode={setVisaCode}
               eligibilityCriteria={eligibilityCriteria} setEligibilityCriteria={setEligibilityCriteria}
             />
           )}
           {/* Configuration Summary - Show in all steps */}
           <ConfigurationSummary
             key={resetKey}
             // Step 1 Data
             visaName={visaName}
             visaDescription={visaDescription}
             visaTypeId={visaTypeId}
             visaCode={visaCode}
             eligibilityCriteria={eligibilityCriteria}
             selectedCategory={selectedCategory}
             conditionalStages={conditionalStages}
             documentTypes={documentTypes}
             fixedStages={fixedStagesData}
             finalStages={finalStagesData}
             // Step 2 Data
             processingTiers={processingTiers}
             visaCostAmount={visaCostAmount}
             visaCostCurrency={visaCostCurrency}
             additionalCosts={additionalCosts}
             processingGeneralTimeframe={processingGeneralTimeframe}
             processingAdditionalInfo={processingAdditionalInfo}
             metadataValidityPeriod={metadataValidityPeriod}
             metadataMaxExtensions={metadataMaxExtensions}
             // Current Step
             currentStep={currentStep}
           />
           
           {/* AI Scan Info Card - Show in all steps below ConfigurationSummary */}
           <Card className="bg-white border-purple-100 shadow-sm">
             <CardHeader className="bg-purple-50 border-b border-purple-100">
               <CardTitle className="text-base flex items-center text-purple-800">
                 <ShieldCheck className="h-5 w-5 mr-2 text-purple-600" />
                 AI Scan Information
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4 pt-5">
               <div className="flex items-start">
                 <div className="bg-purple-100 p-2 rounded-full mr-3 mt-1">
                   <ShieldCheck className="h-5 w-5 text-purple-600" />
                 </div>
                 <div>
                   <h3 className="font-medium text-sm text-gray-700">What are AI Scans?</h3>
                   <p className="text-sm text-gray-600 mt-1">
                     AI scans are automated validations performed on submitted documents to verify authenticity and compliance.
                   </p>
                 </div>
               </div>
               
               <div className="flex items-start">
                 <div className="bg-purple-100 p-2 rounded-full mr-3 mt-1">
                   <ShieldCheck className="h-5 w-5 text-purple-600" />
                 </div>
                 <div>
                   <h3 className="font-medium text-sm text-gray-700">Configuration</h3>
                   <p className="text-sm text-gray-600 mt-1">
                     Configure which AI scans should be enabled for this visa type in the main configuration panel.
                   </p>
                 </div>
               </div>
               
               <div className="flex items-start">
                 <div className="bg-purple-100 p-2 rounded-full mr-3 mt-1">
                   <ShieldCheck className="h-5 w-5 text-purple-600" />
                 </div>
                 <div>
                   <h3 className="font-medium text-sm text-gray-700">Benefits</h3>
                   <p className="text-sm text-gray-600 mt-1">
                     AI scans help reduce fraud, improve processing times, and ensure compliance with visa requirements.
                   </p>
                 </div>
               </div>
               
               <div className="mt-6 pt-4 border-t border-gray-100">
                 <a
                   href="/dashboard/knowledgebase/ai-scans"
                   target="_blank"
                   className="text-purple-600 hover:text-purple-800 hover:underline flex items-center font-medium"
                 >
                   <ShieldCheck className="h-4 w-4 mr-2" />
                   View Complete AI Scanner Documentation
                 </a>
               </div>
             </CardContent>
           </Card>
         </div>

        {/* Right Column: Step Content */}
        <div className="lg:col-span-2 space-y-6">
          {currentStep === 1 && (
            <VisaBuilderStep1
              fixedStages={fixedStagesData}
              conditionalStages={conditionalStages}
              finalStages={finalStagesData}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              visaCategories={visaCategoriesData}
              toggleStage={toggleStage}
              handleDragEnd={handleDragEnd}
              sensors={sensors}
              documentTypes={documentTypes}
              toggleDocumentEnabled={toggleDocumentEnabled}
              addDocumentType={addDocumentType}
              removeDocumentType={removeDocumentType}
              openDocumentModal={openDocumentModal}
              onNextStep={handleNextStep}
            />
          )}
           {currentStep === 2 && (
             <VisaBuilderStep2
               processingTiers={processingTiers}
               setProcessingTiers={setProcessingTiers}
               visaCostAmount={visaCostAmount}
               setVisaCostAmount={setVisaCostAmount}
               visaCostCurrency={visaCostCurrency}
               setVisaCostCurrency={setVisaCostCurrency}
               additionalCosts={additionalCosts.map(c => ({
                 ...c,
                 amount: typeof c.amount === 'string' ? c.amount : String(c.amount)
               }))}
               setAdditionalCosts={(costs) => setAdditionalCosts(
                 costs.map(c => ({
                   ...c,
                   amount: typeof c.amount === 'string' ? Number(c.amount) || 0 : c.amount
                 }))
               )}
               processingGeneralTimeframe={processingGeneralTimeframe}
               setProcessingGeneralTimeframe={setProcessingGeneralTimeframe}
               processingAdditionalInfo={processingAdditionalInfo}
               setProcessingAdditionalInfo={setProcessingAdditionalInfo}
               metadataValidityPeriod={metadataValidityPeriod}
               setMetadataValidityPeriod={setMetadataValidityPeriod}
               metadataMaxExtensions={metadataMaxExtensions}
               setMetadataMaxExtensions={setMetadataMaxExtensions}
               onPreviousStep={handlePreviousStep}
               onSave={handleSaveConfiguration}
             />
          )}
          {currentStep === 3 && (
            <VisaBuilderStep3
              reviewNotes={reviewNotes}
              setReviewNotes={setReviewNotes}
              onPreviousStep={() => setCurrentStep(2)}
              onSave={handleSaveConfiguration}
            />
          )}
        </div>
      </div>

      {/* Document Modal (Rendered conditionally at top level) */}
      {isDocumentModalOpen && activeDocumentId && (
        <DocumentModal
          docId={activeDocumentId}
          documentTypes={documentTypes}
          updateDocumentField={updateDocumentField}
          updateDocumentExample={updateDocumentExample}
          addDocumentExample={addDocumentExample}
          removeDocumentExample={removeDocumentExample}
          closeModal={closeModal}
          toggleDocumentEnabled={toggleDocumentEnabled}
        />
      )}
      </div>
    </VisaBuilderContext.Provider>
  );
};

export default VisaBuilder;
