// src/components/visa-builder/VisaBuilderStep1.tsx
import React from 'react';
import StageConfigurator from './StageConfigurator';
import DocumentConfigurator from './DocumentConfigurator';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Stage, DocumentType } from './interfaces';
import { DragEndEvent } from '@dnd-kit/core';
import { useSensors } from '@dnd-kit/core';

interface VisaBuilderStep1Props {
  fixedStages: Stage[];
  conditionalStages: Stage[];
  finalStages: Stage[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  visaCategories: string[];
  toggleStage: (id: string) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  sensors: ReturnType<typeof useSensors>;

  documentTypes: DocumentType[];
  toggleDocumentEnabled: (docId: string) => void;
  addDocumentType: () => void;
  removeDocumentType: (docId: string) => void;
  openDocumentModal: (docId: string) => void;

  onNextStep: () => void;
}

const VisaBuilderStep1: React.FC<VisaBuilderStep1Props> = ({
  fixedStages,
  conditionalStages,
  finalStages,
  selectedCategory,
  setSelectedCategory,
  visaCategories,
  toggleStage,
  handleDragEnd,
  sensors,
  documentTypes,
  toggleDocumentEnabled,
  addDocumentType,
  removeDocumentType,
  openDocumentModal,
  onNextStep,
}) => {
  return (
    <div className="space-y-6">
      <StageConfigurator
        fixedStages={fixedStages}
        conditionalStages={conditionalStages}
        finalStages={finalStages}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        visaCategories={visaCategories}
        toggleStage={toggleStage}
        handleDragEnd={handleDragEnd}
        sensors={sensors}
      />
      <DocumentConfigurator
        documentTypes={documentTypes}
        selectedCategory={selectedCategory}
        conditionalStages={conditionalStages}
        toggleDocumentEnabled={toggleDocumentEnabled}
        addDocumentType={addDocumentType}
        removeDocumentType={removeDocumentType}
        openDocumentModal={openDocumentModal}
      />
      <div className="flex justify-end pt-4">
        <Button onClick={onNextStep} size="sm">
          Next: Costs & Processing
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default VisaBuilderStep1;
