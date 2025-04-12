// src/components/visa-builder/VisaBuilder.tsx
'use client'

import React from 'react';
import { useState, useEffect } from 'react';
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
import VisaInfoForm from './VisaInfoForm';
import StageConfigurator from './StageConfigurator';
import DocumentConfigurator from './DocumentConfigurator';
import ConfigurationSummary from './ConfigurationSummary';
import DocumentModal from './DocumentModal';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react'; // Using RotateCcw for Reset

// --- Interfaces (Consider moving to ./interfaces.ts) ---
export interface Stage {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  enabled?: boolean; // Optional for fixed/final stages
  locked?: boolean;
  group: 'fixed' | 'conditional' | 'final';
  categories?: string[];
}

export interface DocumentType {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  purpose: string;
  format: string;
  examples: string[];
  categories?: string[];
}

// Define icons explicitly for stages (replace with actual icons from lucide-react or other library)
import {
  FileCheck, User, CreditCard, Briefcase, Map, ShieldCheck,
  Image, FileText, Building, CheckSquare, Activity // Used Activity as placeholder
} from 'lucide-react';

// --- Initial Data (Keep outside component if static) ---
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
    // IMPORTANT: Ensure this ID matches the check in DocumentConfigurator
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


// --- Main Component ---
const VisaBuilder: React.FC = () => {
  // --- State Declarations ---
  const [visaName, setVisaName] = useState('');
  const [visaTypeId, setVisaTypeId] = useState('');
  const [visaDescription, setVisaDescription] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState<string[]>(['']); // Start with one empty
  const [selectedCategory, setSelectedCategory] = useState<string>(visaCategoriesData[0]);
  const [conditionalStages, setConditionalStages] = useState<Stage[]>(() =>
      // Deep copy to avoid modifying the original data
      JSON.parse(JSON.stringify(conditionalStagesData))
  );
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(() =>
      JSON.parse(JSON.stringify(documentTypesData))
  );
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  // **Corrected visaCode State with localStorage**
  const [visaCode, setVisaCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('visaBuilder_visaCode') || '';
    }
    return '';
  });

  // **Corrected useEffect for localStorage**
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('visaBuilder_visaCode', visaCode);
    }
  }, [visaCode]);

  // --- State Update Functions ---
  const resetForm = () => {
    setVisaName('');
    setVisaTypeId('');
    setVisaDescription('');
    setVisaCode(''); // Reset visaCode state
    setEligibilityCriteria(['']); // Reset to one empty criterion
    setSelectedCategory(visaCategoriesData[0]); // Reset category
    // Reset conditional stages based on the initial data, applying default logic if needed
    setConditionalStages(JSON.parse(JSON.stringify(conditionalStagesData)));
    // Reset document types to their initial state
    setDocumentTypes(JSON.parse(JSON.stringify(documentTypesData)));
    if (typeof window !== 'undefined') {
      localStorage.removeItem('visaBuilder_visaCode'); // Clear localStorage too
    }
    setActiveDocumentId(null);
    setIsDocumentModalOpen(false);
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
    // Find current category's docs to avoid adding duplicates if user switches category then adds
     const currentCategoryDocs = documentTypes.filter(doc => !doc.categories || doc.categories.length === 0 || doc.categories.includes(selectedCategory));

     const newDoc: DocumentType = {
       id: `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`, // More unique ID
       name: 'New Document Type',
       enabled: false, // Start disabled
       description: '',
       purpose: '',
       format: '',
       examples: [],
       categories: [selectedCategory] // Assign to current category by default
     };
    setDocumentTypes(prevDocs => [...prevDocs, newDoc]);
    // Optionally open modal immediately
    // setActiveDocumentId(newDoc.id);
    // setIsDocumentModalOpen(true);
  };

  const removeDocumentType = (docId: string) => {
      // Optional: Add a window.confirm here
      if (window.confirm(`Are you sure you want to permanently remove the document type associated with ID: ${docId}? This cannot be undone.`)) {
        setDocumentTypes(prevDocs => prevDocs.filter(doc => doc.id !== docId));
        if (activeDocumentId === docId) { // Close modal if the removed doc was active
            closeDocumentModal();
        }
      }
  };

  const openDocumentModal = (docId: string) => {
    setActiveDocumentId(docId);
    setIsDocumentModalOpen(true);
  };

  const closeDocumentModal = () => {
    setIsDocumentModalOpen(false);
    setActiveDocumentId(null);
  };

  // **Corrected updateDocumentField with implementation**
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
             const newExamples = [...doc.examples];
             if (index >= 0 && index < newExamples.length) {
                 newExamples[index] = value;
             }
             return { ...doc, examples: newExamples };
         }
         return doc;
     }));
  };

  const addDocumentExample = (docId: string) => {
      setDocumentTypes(prevDocs => prevDocs.map(doc => {
          if (doc.id === docId) {
              // Add an empty string for the new example
              return { ...doc, examples: [...doc.examples, ''] };
          }
          return doc;
      }));
  };

 const removeDocumentExample = (docId: string, index: number) => {
     setDocumentTypes(prevDocs => prevDocs.map(doc => {
         if (doc.id === docId) {
             const newExamples = [...doc.examples];
             if (index >= 0 && index < newExamples.length) {
                 newExamples.splice(index, 1);
             }
             return { ...doc, examples: newExamples };
         }
         return doc;
     }));
 };


  // --- Drag and Drop Handler ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Operate on the full conditionalStages list
      setConditionalStages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        // Check if both indices are valid before moving
        if (oldIndex !== -1 && newIndex !== -1) {
           return arrayMove(items, oldIndex, newIndex);
        }
        return items; // Return original if indices are invalid
      });
    }
  };

  // --- Save Handler ---
  const handleSave = () => {
    console.log("Attempting to save Visa Type...");

    // Basic Validation (Example)
    if (!visaName || !visaTypeId || !visaCode) {
        alert("Please fill in Visa Name, Visa Type ID, and Visa Code.");
        return;
    }

    // Filter stages relevant to the *selected category* and are *enabled*
    const enabledFilteredConditionalStages = conditionalStages
      .filter(s => s.enabled && (!s.categories || s.categories.includes(selectedCategory)))


     // Maintain the order from the state
     const orderedEnabledFilteredConditionalStageIds = enabledFilteredConditionalStages.map(s => s.id)


    const applicationFlow = [
      ...fixedStagesData.map(s => s.id), // Use original fixed data IDs
      ...orderedEnabledFilteredConditionalStageIds, // Use ordered enabled conditional IDs
      ...finalStagesData.map(s => s.id)   // Use original final data IDs
    ];

    // Filter required documents relevant to the *selected category* and are *enabled*
    const requiredDocumentsList = documentTypes
      .filter(d => d.enabled && (!d.categories || d.categories.length === 0 || d.categories.includes(selectedCategory)))
      .map(d => d.id); // Get IDs

    // Construct final JSON
    const visaTypeConfig = {
      visaName: visaName.trim(),
      visaTypeId: visaTypeId.trim().toLowerCase().replace(/\s+/g, '-'), // Sanitize ID
      visaDescription: visaDescription.trim(),
      visaCode: visaCode.trim().toUpperCase(), // Standardize code
      category: selectedCategory,
      eligibilityCriteria: eligibilityCriteria.map(c => c.trim()).filter(c => c !== ''), // Clean criteria
      applicationFlow,
      requiredDocuments: requiredDocumentsList,
      // It might be useful to store the full definitions for lookup later,
      // or just rely on having master lists elsewhere. For now, just IDs.
      // stageDefinitions: [...fixedStagesData, ...enabledFilteredConditionalStages, ...finalStagesData],
      // documentDefinitions: documentTypes.filter(d => requiredDocumentsList.includes(d.id)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1 // Example versioning
    };

    console.log("Generated Config:", JSON.stringify(visaTypeConfig, null, 2));
    alert(`Visa Type "${visaName}" configuration generated (check console). Implement API call to save.`);

    // --- TODO: Implement actual API call ---
    // try {
    //   const response = await fetch('/api/visa-types', {
    //     method: 'POST', // or PUT if updating
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(visaTypeConfig),
    //   });
    //   if (!response.ok) throw new Error('Failed to save visa type');
    //   const result = await response.json();
    //   console.log("Save successful:", result);
    //   alert('Visa Type saved successfully!');
    //   // Optionally reset form or navigate away
    // } catch (error) {
    //   console.error("Save failed:", error);
    //   alert('Error saving visa type. Please try again.');
    // }
    // --- End TODO ---
  };

  // --- Sensors for DND ---
  const sensors = useSensors(
     useSensor(PointerSensor),
     useSensor(KeyboardSensor, {
       coordinateGetter: sortableKeyboardCoordinates,
     })
  );

  // --- Render Logic ---
  return (
    <div className="flex flex-col space-y-6">
      {/* Header is now handled by layout.tsx */}
      {/* We might want a specific header for the builder itself here */}
       <div className="flex justify-between items-center border-b pb-4 mb-4">
         <div>
           <h2 className="text-xl font-semibold">Visa Type Builder</h2>
           <p className="text-sm text-gray-500">Configure the details and flow for a new visa application type.</p>
         </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetForm} size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
          </Button>
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (Span 1) */}
        <div className="lg:col-span-1 space-y-6">
          <VisaInfoForm
            visaName={visaName} setVisaName={setVisaName}
            visaDescription={visaDescription} setVisaDescription={setVisaDescription}
            visaTypeId={visaTypeId} setVisaTypeId={setVisaTypeId}
            visaCode={visaCode} setVisaCode={setVisaCode}
            eligibilityCriteria={eligibilityCriteria} setEligibilityCriteria={setEligibilityCriteria}
          />
          <ConfigurationSummary
             visaName={visaName}
             visaDescription={visaDescription}
             visaTypeId={visaTypeId}
             visaCode={visaCode}
             eligibilityCriteria={eligibilityCriteria}
             selectedCategory={selectedCategory}
             conditionalStages={conditionalStages}
             documentTypes={documentTypes}
             fixedStages={fixedStagesData}   // Pass fixed stages data
             finalStages={finalStagesData}   // Pass final stages data
          />
        </div>

        {/* Right Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
           <StageConfigurator
              fixedStages={fixedStagesData}     // Pass fixed stages data
              conditionalStages={conditionalStages} // Pass state list
              finalStages={finalStagesData}     // Pass final stages data
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              visaCategories={visaCategoriesData} // Pass categories data
              toggleStage={toggleStage}
              handleDragEnd={handleDragEnd}
              sensors={sensors}
           />
           <DocumentConfigurator
              documentTypes={documentTypes}       // Pass state list
              selectedCategory={selectedCategory}
              conditionalStages={conditionalStages} // Pass state list
              toggleDocumentEnabled={toggleDocumentEnabled}
              addDocumentType={addDocumentType}
              removeDocumentType={removeDocumentType}
              openDocumentModal={openDocumentModal}
           />
        </div>
      </div>

      {/* Document Modal (Rendered conditionally) */}
      {isDocumentModalOpen && activeDocumentId && (
        <DocumentModal
          docId={activeDocumentId}
          documentTypes={documentTypes} // Pass state list
          updateDocumentField={updateDocumentField}
          updateDocumentExample={updateDocumentExample}
          addDocumentExample={addDocumentExample}
          removeDocumentExample={removeDocumentExample}
          closeModal={closeDocumentModal}
          toggleDocumentEnabled={toggleDocumentEnabled}
        />
      )}
    </div>
  );
};

export default VisaBuilder;