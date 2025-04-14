// src/components/visa-builder/ConfigurationSummary.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ListChecks, UserCheck, BadgeInfo, MapPin, DollarSign, Clock, Cog, AlertTriangle } from 'lucide-react'; // More icons
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


interface ConfigurationSummaryProps {
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

  // Step 2 Data (Passed down from VisaBuilder)
  processingTiers: ProcessingTier[];
  visaCostAmount: number | string;
  visaCostCurrency: string;
  additionalCosts: AdditionalCost[];
  processingGeneralTimeframe: string;
  processingAdditionalInfo: string;
  metadataValidityPeriod: number | string;
  metadataMaxExtensions: number | string;

  // Current Step
  currentStep: number; // To know which sections to potentially highlight or show
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
  // Step 2 props
  processingTiers,
  visaCostAmount,
  visaCostCurrency,
  additionalCosts,
  processingAdditionalInfo,
  processingGeneralTimeframe,
  metadataMaxExtensions,
  metadataValidityPeriod,
  currentStep,
}) => {

  const enabledFilteredConditionalStages = conditionalStages.filter(
    stage => stage.enabled && (!stage.categories || stage.categories.includes(selectedCategory))
  );

  const requiredDocuments = documentTypes.filter(
    doc => doc.enabled && (!doc.categories || doc.categories.length === 0 || doc.categories.includes(selectedCategory))
  );

  const fullApplicationFlow = [
    ...fixedStages,
    ...enabledFilteredConditionalStages,
    ...finalStages
  ];

  const isDynamicUploadEnabled = enabledFilteredConditionalStages.some(s => s.id === 'DYNAMIC_DOCUMENTS_UPLOAD');

  // Helper to format currency
  const formatCurrency = (amount: number | string, currency: string) => {
     const numAmount = Number(amount);
     if (isNaN(numAmount)) return `${amount} ${currency}`; // Return as is if not a number
     // Basic formatting, consider using Intl.NumberFormat for more robust formatting
     return `${numAmount.toFixed(2)} ${currency.toUpperCase()}`;
  }

  return (
    <Card className="sticky top-6 bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Configuration Summary</CardTitle>
         <p className="text-xs text-gray-500">Live preview of the visa type.</p>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">

        {/* --- Step 1 Summary --- */}
        <div className={`p-3 rounded-md ${currentStep === 1 ? 'ring-2 ring-indigo-300 bg-indigo-50' : 'opacity-80'}`}> {/* Highlight current step */}
            <h3 className="font-semibold mb-2 flex items-center text-gray-700 text-base">
                <BadgeInfo className="h-4 w-4 mr-2 text-indigo-600"/>
                Visa Details
            </h3>
            <div className="space-y-1.5 pl-6 border-l-2 border-indigo-100 ml-2 text-gray-700">
                <p><span className="font-medium text-gray-500">Name:</span> {visaName || <span className="italic text-gray-400">--</span>}</p>
                <p><span className="font-medium text-gray-500">Code:</span> {visaCode || <span className="italic text-gray-400">--</span>}</p>
                <p><span className="font-medium text-gray-500">Type ID:</span> {visaTypeId || <span className="italic text-gray-400">--</span>}</p>
                <p><span className="font-medium text-gray-500">Category:</span> {selectedCategory}</p>
                <p><span className="font-medium text-gray-500">Description:</span> {visaDescription || <span className="italic text-gray-400">--</span>}</p>
            </div>

             <h3 className="font-semibold mt-4 mb-2 flex items-center text-gray-700 text-base">
                <UserCheck className="h-4 w-4 mr-2 text-teal-600"/>
                Eligibility Criteria
             </h3>
             {eligibilityCriteria.filter(c => c.trim() !== '').length > 0 ? (
                 <ul className="list-disc space-y-1 pl-10 text-sm text-gray-600 border-l-2 border-teal-100 ml-2">
                    {eligibilityCriteria.filter(c => c.trim() !== '').map((criteria, index) => (
                        <li key={index}>{criteria}</li>
                    ))}
                 </ul>
             ) : (
                  <p className="text-xs text-gray-500 italic pl-6 ml-2">No criteria defined.</p>
             )}

             <h3 className="font-semibold mt-4 mb-2 flex items-center text-gray-700 text-base">
                <ListChecks className="h-5 w-5 mr-2 text-blue-600"/>
                Application Flow ({fullApplicationFlow.length} Stages)
             </h3>
             <ol className="list-decimal space-y-1.5 pl-10 text-sm text-gray-600 border-l-2 border-blue-100 ml-2">
                {fullApplicationFlow.map((stage) => (
                    <li key={stage.id} className={conditionalStages.some(s => s.id === stage.id) ? 'font-medium text-blue-700' : ''}>
                        {stage.name}
                        {conditionalStages.some(s => s.id === stage.id) && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Conditional</span>
                        )}
                    </li>
                ))}
             </ol>

             <h3 className="font-semibold mt-4 mb-2 flex items-center text-gray-700 text-sm">
                <FileText className="h-4 w-4 mr-2 text-orange-600"/>
                Document Requirements ({isDynamicUploadEnabled ? requiredDocuments.length : 'N/A'})
             </h3>
             {isDynamicUploadEnabled ? (
                 requiredDocuments.length > 0 ? (
                    <ul className="list-disc space-y-1 pl-10 text-xs text-gray-600 border-l-2 border-orange-100 ml-2">
                        {requiredDocuments.map(doc => ( 
                            <li key={doc.id} className={doc.categories?.includes(selectedCategory) ? 'font-medium text-orange-700' : ''}>
                                {doc.name}
                                {doc.categories?.includes(selectedCategory) && (
                                    <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Conditional</span>
                                )}
                            </li>
                        ))}
                    </ul>
                 ) : ( <p className="text-xs text-gray-500 italic pl-6 ml-2">No additional documents required.</p> )
             ) : ( <p className="text-xs text-gray-500 italic pl-6 ml-2">'Add. Docs' stage disabled.</p> )}
        </div>

        {/* --- Step 2 Summary --- */}
        <div className={`mt-4 p-3 rounded-md ${currentStep === 2 ? 'ring-2 ring-indigo-300 bg-indigo-50' : 'opacity-80'}`}> {/* Highlight current step */}
            <h3 className="font-semibold mb-2 text-gray-700 text-base">
                Costs
            </h3>
            <div className="space-y-1.5 pl-6 border-l-2 border-green-100 ml-2 text-gray-700">
                <p><span className="font-medium text-gray-500">Base Fee:</span> {visaCostAmount ? formatCurrency(visaCostAmount, visaCostCurrency) : <span className="italic text-gray-400">--</span>}</p>
                {additionalCosts.filter(c => c.description.trim() !== '' || String(c.amount).trim() !== '').length > 0 && (
                   <div>
                       <span className="font-medium text-gray-500 text-xs block mb-1">Additional:</span>
                       <ul className="list-disc space-y-1 pl-5 text-xs text-gray-600">
                           {additionalCosts.filter(c => c.description.trim() !== '' || String(c.amount).trim() !== '').map((cost, index) => (
                               <li key={index}>{cost.description || 'Unnamed Cost'}: {formatCurrency(cost.amount, cost.currency)}</li>
                           ))}
                       </ul>
                   </div>
                )}
            </div>

             <h3 className="font-semibold mt-4 mb-2 flex items-center text-gray-700 text-base">
                <Clock className="h-4 w-4 mr-2 text-cyan-600"/>
                Processing
             </h3>
              <div className="space-y-1.5 pl-6 border-l-2 border-cyan-100 ml-2 text-gray-700">
                {processingTiers.filter(t => t.type.trim() !== '' || t.timeframe.trim() !== '').length > 0 && (
                   <div>
                       <span className="font-medium text-gray-500 text-xs block mb-1">Tiers:</span>
                       <ul className="list-disc space-y-1 pl-5 text-xs text-gray-600">
                           {processingTiers.filter(t => t.type.trim() !== '' || t.timeframe.trim() !== '').map((tier, index) => (
                               <li key={index}>{tier.type || 'Unnamed Tier'}: {tier.timeframe || '--'}</li>
                           ))}
                       </ul>
                   </div>
                )}
                 <p className="mt-2"><span className="font-medium text-gray-500">General Note:</span> {processingGeneralTimeframe || <span className="italic text-gray-400">--</span>}</p>
                 <p><span className="font-medium text-gray-500">Additional Info:</span> {processingAdditionalInfo || <span className="italic text-gray-400">--</span>}</p>
              </div>


             <h3 className="font-semibold mt-4 mb-2 flex items-center text-gray-700 text-base">
                <Cog className="h-4 w-4 mr-2 text-gray-600"/>
                Metadata
             </h3>
              <div className="space-y-1.5 pl-6 border-l-2 border-gray-200 ml-2 text-gray-700">
                 <p><span className="font-medium text-gray-500">Validity Period:</span> {metadataValidityPeriod || <span className="italic text-gray-400">--</span>} months</p>
                 <p><span className="font-medium text-gray-500">Max Extensions:</span> {metadataMaxExtensions ?? <span className="italic text-gray-400">--</span>}</p> {/* Handle 0 correctly */}
              </div>
        </div>


      </CardContent>
    </Card>
  );
};

export default ConfigurationSummary;
