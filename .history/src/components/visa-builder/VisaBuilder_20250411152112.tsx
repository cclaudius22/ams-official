// src/components/visa-builder/VisaBuilder.tsx
'use client'

import React, { useState, useEffect } from 'react';
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
import StageConfigurator from './StageConfigurator';
import DocumentConfigurator from './DocumentConfigurator';
import ConfigurationSummary from './ConfigurationSummary';
import DocumentModal from './DocumentModal';
import { Button } from '@/components/ui/button';
import { Stage, DocumentType } from './interfaces';

// --- Initial Data (Keep outside component) ---
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


// --- Main Component ---
const VisaBuilder: React.FC = () => {
  // --- State Declarations ---
  const [visaName, setVisaName] = useState('');
  const [visaTypeId, setVisaTypeId] = useState('');
  const [visaDescription, setVisaDescription] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState<string[]>(['']);
  const [selectedCategory, setSelectedCategory] = useState<string>(visaCategoriesData[0]);
  const [conditionalStages, setConditionalStages] = useState<Stage[]>(() =>
      JSON.parse(JSON.stringify(conditionalStagesData)) // Deep copy initial state
  );
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(() =>
      JSON.parse(JSON.stringify(documentTypesData)) // Deep copy initial state
  );
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [visaCode, setVisaCode] = useState<string>(''); // Initialize empty first

  // --- Effect for localStorage hydration (Addresses potential hydration error) ---
  useEffect(() => {
    // This runs only on the client, after the initial render
    const storedVisaCode = localStorage.getItem('visaBuilder_visaCode');
    if (storedVisaCode) {
      setVisaCode(storedVisaCode);
    }
    // Initialize other states from localStorage here if needed
  }, []); // Empty dependency array means run once on mount

  // --- Effect to update localStorage on change ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('visaBuilder_visaCode', visaCode);
    }
  }, [visaCode]);

  // --- State Update Functions (Now with Implementation) ---
  const resetForm = () => {
    setVisaName('');
    setVisaTypeId('');
    setVisaDescription('');
    setVisaCode(''); // Reset state
    setEligibilityCriteria(['']);
    setSelectedCategory(visaCategoriesData[0]);
    setConditionalStages(JSON.parse(JSON.stringify(conditionalStagesData))); // Use deep copy
    setDocumentTypes(JSON.parse(JSON.stringify(documentTypesData))); // Use deep copy
    if (typeof window !== 'undefined') {
      localStorage.removeItem('visaBuilder_visaCode');
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
    const newDocId = `doc_${Date.now()}_${Math.random().toString(36).substring(7)}`; // Generate ID first
    const newDoc: DocumentType = {
      id: newDocId, // Use the generated ID
      name: '', // Start with empty name in modal
      enabled: false, // Start disabled
      description: '',
      purpose: '',
      format: '',
      examples: [],
      categories: [selectedCategory] // Default to current category
    };

   // 1. Add the new document structure to the state
   setDocumentTypes(prevDocs => [...prevDocs, newDoc]);

   // 2. Set the active ID to the newly created document's ID
   setActiveDocumentId(newDocId);

   // 3. Open the modal
   setIsDocumentModalOpen(true);
   console.log("Added new document type template and opened modal for ID:", newDocId);
 };

  const removeDocumentType = (docId: string) => {
      if (window.confirm(`Remove document type configuration? This action might affect existing visa types if this document was shared. (ID: ${docId})`)) {
        setDocumentTypes(prevDocs => prevDocs.filter(doc => doc.id !== docId));
        if (activeDocumentId === docId) {
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
             const newExamples = [...doc.examples]; // Create a copy
             if (index >= 0 && index < newExamples.length) {
                 newExamples[index] = value; // Update the specific index
             }
             return { ...doc, examples: newExamples }; // Return updated doc
         }
         return doc; // Return unchanged doc
     }));
  };

  const addDocumentExample = (docId: string) => {
      setDocumentTypes(prevDocs => prevDocs.map(doc => {
          if (doc.id === docId) {
              return { ...doc, examples: [...doc.examples, ''] }; // Add empty string
          }
          return doc;
      }));
  };

 const removeDocumentExample = (docId: string, index: number) => {
     setDocumentTypes(prevDocs => prevDocs.map(doc => {
         if (doc.id === docId) {
             const currentExamples = doc.examples || []; // Handle potentially undefined examples
             const newExamples = [...currentExamples];
             if (index >= 0 && index < newExamples.length) {
                 newExamples.splice(index, 1); // Remove item at index
             }
             return { ...doc, examples: newExamples };
         }
         return doc;
     }));
 };

  // --- Drag and Drop Handler (Implementation) ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setConditionalStages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
           // Create a new moved array - this triggers re-render
           return arrayMove(items, oldIndex, newIndex);
        }
        return items; // Return original array if indices are invalid
      });
    }
  };

  // --- Save Handler (Implementation - still logs, needs API call) ---
  const handleSave = () => {
    console.log("Attempting to save Visa Type...");
    if (!visaName || !visaTypeId || !visaCode) {
        alert("Please fill in Visa Name, Visa Type ID, and Visa Code before saving.");
        return;
    }

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

    const visaTypeConfig = {
      visaName: visaName.trim(),
      visaTypeId: visaTypeId.trim().toLowerCase().replace(/\s+/g, '-'),
      visaDescription: visaDescription.trim(),
      visaCode: visaCode.trim().toUpperCase(),
      category: selectedCategory,
      eligibilityCriteria: eligibilityCriteria.map(c => c.trim()).filter(c => c !== ''),
      applicationFlow,
      requiredDocuments: requiredDocumentsList,
      // Include full definitions if your backend/consumer needs them readily available
      // stageDefinitions: JSON.parse(JSON.stringify([...fixedStagesData, ...enabledFilteredConditionalStages, ...finalStagesData])),
      // documentDefinitions: JSON.parse(JSON.stringify(documentTypes.filter(d => requiredDocumentsList.includes(d.id)))),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    console.log("Generated Config:", JSON.stringify(visaTypeConfig, null, 2));
    alert(`Visa Type "${visaName}" configuration generated (check console). Implement API call to save.`);

    // --- TODO: Implement API call ---
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
    // Container div provided by page.tsx's <main> tag
    <div className="flex flex-col space-y-6">
       {/* Builder specific Header */}
       <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-4 gap-2">
         <div>
           <h2 className="text-xl font-semibold">Visa Type Builder</h2>
           <p className="text-sm text-gray-500">Configure the details and flow for a new visa application type.</p>
         </div>
        <div className="flex space-x-2 flex-shrink-0">
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
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <VisaInfoForm
            visaName={visaName} setVisaName={setVisaName}
            visaDescription={visaDescription} setVisaDescription={setVisaDescription}
            visaTypeId={visaTypeId} setVisaTypeId={setVisaTypeId}
            visaCode={visaCode} setVisaCode={setVisaCode}
            eligibilityCriteria={eligibilityCriteria} setEligibilityCriteria={setEligibilityCriteria}
          />
          {/* Pass original data for reference, state for current values */}
          <ConfigurationSummary
             visaName={visaName}
             visaDescription={visaDescription}
             visaTypeId={visaTypeId}
             visaCode={visaCode}
             eligibilityCriteria={eligibilityCriteria}
             selectedCategory={selectedCategory}
             conditionalStages={conditionalStages} // Pass current state
             documentTypes={documentTypes} // Pass current state
             fixedStages={fixedStagesData}
             finalStages={finalStagesData}
          />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
           <StageConfigurator
              fixedStages={fixedStagesData}
              conditionalStages={conditionalStages} // Pass current state
              finalStages={finalStagesData}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory} // Pass setter
              visaCategories={visaCategoriesData}
              toggleStage={toggleStage} // Pass function
              handleDragEnd={handleDragEnd} // Pass function
              sensors={sensors} // Pass sensors
           />
           <DocumentConfigurator
              documentTypes={documentTypes} // Pass current state
              selectedCategory={selectedCategory}
              conditionalStages={conditionalStages} // Pass current state
              toggleDocumentEnabled={toggleDocumentEnabled} // Pass function
              addDocumentType={addDocumentType} // Pass function
              removeDocumentType={removeDocumentType} // Pass function
              openDocumentModal={openDocumentModal} // Pass function
           />
        </div>
      </div>

      {/* Document Modal */}
      {isDocumentModalOpen && activeDocumentId && (
        <DocumentModal
          docId={activeDocumentId}
          documentTypes={documentTypes} // Pass current state
          updateDocumentField={updateDocumentField} // Pass function
          updateDocumentExample={updateDocumentExample} // Pass function
          addDocumentExample={addDocumentExample} // Pass function
          removeDocumentExample={removeDocumentExample} // Pass function
          closeModal={closeModal} // Pass function
          toggleDocumentEnabled={toggleDocumentEnabled} // Pass function
        />
      )}
    </div>
  );
};

export default VisaBuilder;