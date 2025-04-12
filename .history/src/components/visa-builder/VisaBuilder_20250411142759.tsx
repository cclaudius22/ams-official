// src/components/visa-builder/VisaBuilder.tsx
'use client'
import React, { useState, useEffect } from 'react';
import VisaInfoForm from './VisaInfoForm';
import StageConfigurator from './StageConfigurator';
import DocumentConfigurator from './DocumentConfigurator';
import ConfigurationSummary from './ConfigurationSummary';
import DocumentModal from './DocumentModal';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent // Import the specific event type
  } from '@dnd-kit/core';
  import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    sortableKeyboardCoordinates
    // Note: useSortable is typically imported in the SortableStageItem component itself
  } from '@dnd-kit/sortable';
// ... other imports and interfaces (Stage, DocumentType, VisaConfig)

const initialConditionalStages: Stage[] = [ /* ... your initial stages */ ];
const initialDocumentTypes: DocumentType[] = [ /* ... your initial docs */ ];
const visaCategories = [ /* ... */ ];
const fixedStages = [ /* ... */ ];
const finalStages = [ /* ... */ ];

const VisaBuilder: React.FC = () => {
  const [visaName, setVisaName] = useState('');
  const [visaTypeId, setVisaTypeId] = useState('');
  // ... other basic visa states
  const [eligibilityCriteria, setEligibilityCriteria] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(visaCategories[0]);
  const [conditionalStages, setConditionalStages] = useState<Stage[]>(initialConditionalStages);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(initialDocumentTypes);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  // --- State Update Functions ---
  const resetForm = () => { /* ... implementation ... */ };
  const toggleStage = (stageId: string) => { /* ... implementation ... */ };
  const toggleDocumentEnabled = (docId: string) => { /* ... implementation ... */ };
  const addDocumentType = () => { /* ... implementation ... */ };
  const removeDocumentType = (docId: string) => { /* ... implementation ... */ };
  const openDocumentModal = (docId: string) => { /* ... implementation ... */ };
  const closeDocumentModal = () => { /* ... implementation ... */ };
  const updateDocumentField = (docId: string, field: keyof DocumentType, value: string | boolean | string[]) => { /* ... implementation ... */ };

  // --- Drag and Drop Handler ---
  const handleDragEnd = (event: any) => { /* ... implementation using arrayMove ... */ };

  // --- Save Handler ---
  const handleSave = () => {
    console.log("Saving Visa Type...");

    // 1. Filter and order stages
    const enabledConditional = conditionalStages
      .filter(s => s.enabled && (!s.categories || s.categories.includes(selectedCategory)))
      .map(s => s.id); // Get IDs

    const applicationFlow = [
      ...fixedStages.map(s => s.id),
      ...enabledConditional,
      ...finalStages.map(s => s.id)
    ];

    // 2. Filter required documents
    const requiredDocuments = documentTypes
       .filter(d => d.enabled && (!d.categories || d.categories.includes(selectedCategory)))
       .map(d => d.id); // Get IDs

    // 3. Construct final JSON
    const visaTypeConfig = {
      visaName,
      visaTypeId,
      visaDescription,
      visaCode,
      category: selectedCategory,
      eligibilityCriteria,
      applicationFlow, // Ordered list of enabled stage IDs
      requiredDocuments // List of enabled document IDs
      // Maybe also include the full definitions of enabled docs/stages if needed later?
    };

    console.log("Generated Config:", JSON.stringify(visaTypeConfig, null, 2));

    // TODO: Replace console.log with API call to save visaTypeConfig
    // alert('Configuration saved (see console)!');
  };

  // --- Sensors for DND ---
  const sensors = useSensors(/* ... */);

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
         {/* ... header JSX ... */}
         <Button onClick={handleSave}> <Save className="h-4 w-4 mr-2" /> Save Visa Type </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="w-full lg:w-1/3 space-y-6">
          <VisaInfoForm
            visaName={visaName} setVisaName={setVisaName}
            // ... pass other basic info props
            eligibilityCriteria={eligibilityCriteria} setEligibilityCriteria={setEligibilityCriteria}
          />
          <ConfigurationSummary
             visaName={visaName}
             visaCode={visaCode}
             // ... pass other summary props
             selectedCategory={selectedCategory}
             conditionalStages={conditionalStages} // Component can filter internally
             documentTypes={documentTypes} // Component can filter internally
          />
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-2/3">
           <StageConfigurator
              fixedStages={fixedStages}
              conditionalStages={conditionalStages} // Pass full list for DnD
              finalStages={finalStages}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              visaCategories={visaCategories}
              toggleStage={toggleStage}
              handleDragEnd={handleDragEnd} // Pass handler down
              sensors={sensors} // Pass sensors down
           />
           <DocumentConfigurator
              documentTypes={documentTypes}
              selectedCategory={selectedCategory}
              conditionalStages={conditionalStages} // Needed to check if dynamic stage is enabled
              toggleDocumentEnabled={toggleDocumentEnabled}
              addDocumentType={addDocumentType}
              removeDocumentType={removeDocumentType}
              openDocumentModal={openDocumentModal}
           />
        </div>
      </div>

      {/* Document Modal */}
      {isDocumentModalOpen && activeDocumentId && (
        <DocumentModal
          docId={activeDocumentId}
          documentTypes={documentTypes} // Pass full list
          updateDocumentField={updateDocumentField}
          // ... pass other modal update functions
          closeModal={closeDocumentModal}
          toggleDocumentEnabled={toggleDocumentEnabled} // Pass toggle fn
        />
      )}
    </div>
  );
};

export default VisaBuilder;