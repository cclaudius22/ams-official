// src/components/visa-builder/ConfigurationSummary.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, FileText, ListChecks, UserCheck, BadgeInfo } from 'lucide-react'; // Added more icons
import { Stage, DocumentType } from './interfaces'; // Import interfaces

interface ConfigurationSummaryProps {
  visaName: string;
  visaDescription: string; // Added description
  visaTypeId: string;
  visaCode: string;
  eligibilityCriteria: string[]; // Added eligibility
  selectedCategory: string;
  conditionalStages: Stage[];
  documentTypes: DocumentType[];
  fixedStages: Stage[]; // Pass fixed stages for full flow view
  finalStages: Stage[]; // Pass final stages for full flow view
}

const ConfigurationSummary: React.FC<ConfigurationSummaryProps> = ({
  visaName,
  visaDescription,
  visaTypeId,
  visaCode,
  eligibilityCriteria,
  selectedCategory,
  conditionalStages,
  documentTypes,
  fixedStages,
  finalStages,
}) => {

  const enabledConditionalStages = conditionalStages.filter(
    stage => stage.enabled && (!stage.categories || stage.categories.includes(selectedCategory))
  );

  const requiredDocuments = documentTypes.filter(
    doc => doc.enabled && (!doc.categories || doc.categories.length === 0 || doc.categories.includes(selectedCategory))
  );

  // Combine all stages in order for a full flow preview
  const fullApplicationFlow = [
    ...fixedStages,
    ...enabledConditionalStages, // Use the already filtered AND ordered list
    ...finalStages
  ];

  return (
    <Card className="mt-6 sticky top-6"> {/* Added sticky positioning */}
      <CardHeader>
        <CardTitle className="text-lg">Configuration Summary</CardTitle>
        <p className="text-xs text-gray-500">Review the visa type being configured.</p>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        {/* Visa Details Section */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center text-gray-700">
             <BadgeInfo className="h-4 w-4 mr-2 text-gray-500"/>
             Visa Details
          </h3>
          <div className="space-y-1 pl-6 border-l border-gray-200 ml-2">
            <p><span className="font-medium text-gray-600">Name:</span> {visaName || <span className="italic text-gray-400">Not set</span>}</p>
            <p><span className="font-medium text-gray-600">Code:</span> {visaCode || <span className="italic text-gray-400">Not set</span>}</p>
            <p><span className="font-medium text-gray-600">Type ID:</span> {visaTypeId || <span className="italic text-gray-400">Not set</span>}</p>
            <p><span className="font-medium text-gray-600">Category:</span> {selectedCategory}</p>
            <p><span className="font-medium text-gray-600">Description:</span> {visaDescription || <span className="italic text-gray-400">Not set</span>}</p>
          </div>
        </div>

        {/* Eligibility Criteria Section */}
         {eligibilityCriteria.length > 0 && (
             <div>
                 <h3 className="font-semibold mb-2 flex items-center text-gray-700">
                 <UserCheck className="h-4 w-4 mr-2 text-gray-500"/>
                 Eligibility Criteria
                 </h3>
                 <ul className="list-disc space-y-1 pl-10 text-xs text-gray-600">
                 {eligibilityCriteria.map((criteria, index) => (
                     <li key={index}>{criteria || <span className="italic text-gray-400">Empty requirement</span>}</li>
                 ))}
                 </ul>
             </div>
         )}

        {/* Application Flow Section */}
        <div>
          <h3 className="font-semibold mb-2 flex items-center text-gray-700">
             <ListChecks className="h-4 w-4 mr-2 text-gray-500"/>
             Application Flow ({fullApplicationFlow.length} Stages)
          </h3>
          <ol className="list-decimal space-y-2 pl-10 text-xs text-gray-600">
            {fullApplicationFlow.map((stage) => (
              <li key={stage.id} className="flex items-center">
                 {/* Maybe add icons back here if desired */}
                 <span>{stage.name}</span>
                 {stage.group === 'fixed' && <span className="ml-2 text-blue-500 text-[10px]">(Fixed)</span>}
                 {stage.group === 'conditional' && <span className="ml-2 text-purple-500 text-[10px]">(Conditional)</span>}
                 {stage.group === 'final' && <span className="ml-2 text-green-500 text-[10px]">(Final)</span>}
              </li>
            ))}
          </ol>
        </div>

        {/* Required Documents Section */}
        {enabledConditionalStages.some(s => s.id === 'DYNAMIC_DOCUMENTS_UPLOAD') && ( // Only show if dynamic stage enabled
          <div>
            <h3 className="font-semibold mb-2 flex items-center text-gray-700">
                <FileText className="h-4 w-4 mr-2 text-gray-500"/>
                Required Documents ({requiredDocuments.length})
            </h3>
            {requiredDocuments.length > 0 ? (
              <ul className="list-disc space-y-1 pl-10 text-xs text-gray-600">
                {requiredDocuments.map(doc => (
                  <li key={doc.id}>{doc.name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500 italic pl-6">No additional documents marked as required for this category.</p>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default ConfigurationSummary;