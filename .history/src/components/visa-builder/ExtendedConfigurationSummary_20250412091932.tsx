// src/components/visa-builder/ExtendedConfigurationSummary.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import ConfigurationSummary from './ConfigurationSummary';
import { Stage, DocumentType } from './interfaces';

// Define interfaces used in Step 2 data for props
interface ProcessingTier {
  type: string;
  timeframe: string;
}

interface AdditionalCost {
  description: string;
  amount: number | string;
  currency: string;
}

interface AIScan {
  id: string;
  name: string;
  enabled: boolean;
}

interface ExtendedConfigurationSummaryProps {
  // Step 1 Data
  visaName: string;
  visaDescription: string;
  visaTypeId: string;
  visaCode: string;
  eligibilityCriteria: string[];
  selectedCategory: string;
  conditionalStages: Stage[];
  documentTypes: DocumentType[];
  fixedStages: Stage[];
  finalStages: Stage[];

  // Step 2 Data
  processingTiers: ProcessingTier[];
  visaCostAmount: number | string;
  visaCostCurrency: string;
  additionalCosts: AdditionalCost[];
  processingGeneralTimeframe: string;
  processingAdditionalInfo: string;
  metadataValidityPeriod: number | string;
  metadataMaxExtensions: number | string;

  // Step 3 Data - AI Scans
  aiScans: AIScan[];

  // Current Step
  currentStep: number;
}

const ExtendedConfigurationSummary: React.FC<ExtendedConfigurationSummaryProps> = ({
  // Step 1 Data
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

  // Step 2 Data
  processingTiers,
  visaCostAmount,
  visaCostCurrency,
  additionalCosts,
  processingGeneralTimeframe,
  processingAdditionalInfo,
  metadataValidityPeriod,
  metadataMaxExtensions,

  // Step 3 Data
  aiScans,

  // Current Step
  currentStep,
}) => {
  return (
    <div className="space-y-4">
      {/* Original Configuration Summary */}
      <ConfigurationSummary
        visaName={visaName}
        visaDescription={visaDescription}
        visaTypeId={visaTypeId}
        visaCode={visaCode}
        eligibilityCriteria={eligibilityCriteria}
        selectedCategory={selectedCategory}
        conditionalStages={conditionalStages}
        documentTypes={documentTypes}
        fixedStages={fixedStages}
        finalStages={finalStages}
        processingTiers={processingTiers}
        visaCostAmount={visaCostAmount}
        visaCostCurrency={visaCostCurrency}
        additionalCosts={additionalCosts}
        processingGeneralTimeframe={processingGeneralTimeframe}
        processingAdditionalInfo={processingAdditionalInfo}
        metadataValidityPeriod={metadataValidityPeriod}
        metadataMaxExtensions={metadataMaxExtensions}
        currentStep={currentStep}
      />

      {/* AI Scan Requirements Summary */}
      <Card className="sticky top-6 bg-white">
        <CardContent className="pt-6 space-y-5 text-sm">
          <div className={`p-3 rounded-md ${currentStep === 3 ? 'ring-2 ring-indigo-300 bg-indigo-50' : 'opacity-80'}`}>
            <h3 className="font-semibold mb-2 flex items-center text-gray-700 text-base">
              <ShieldCheck className="h-4 w-4 mr-2 text-purple-600" />
              AI Scan Requirements
            </h3>
            <div className="space-y-1.5 pl-6 border-l-2 border-purple-100 ml-2 text-gray-700">
              {aiScans.length > 0 ? (
                <ul className="list-disc space-y-1 pl-5 text-xs text-gray-600">
                  {aiScans.map((scan) => (
                    <li key={scan.id} className={scan.enabled ? 'font-medium text-purple-700' : 'text-gray-500'}>
                      {scan.name}
                      <span className={`ml-2 text-xs ${scan.enabled ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'} px-2 py-0.5 rounded-full`}>
                        {scan.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 italic">No AI scans configured.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtendedConfigurationSummary;