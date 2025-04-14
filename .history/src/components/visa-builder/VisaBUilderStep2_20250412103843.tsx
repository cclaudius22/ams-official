// src/components/visa-builder/VisaBuilderStep2.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ArrowLeft, Save, DollarSign, Clock, Info, Cog } from 'lucide-react'; // More Icons

// Define specific interfaces for this step's data
interface ProcessingTier {
    type: 'STANDARD' | 'PREMIUM' | 'PRIORITY';
    timeframe: string;
    timeUnit: 'HOURS' | 'DAYS' | 'WEEKS';
    minTime: number;
    maxTime: number;
}

interface AdditionalCost {
    description: string;
    amount: number | string; // Allow string initially for input flexibility
    currency: string;
}

interface VisaBuilderStep2Props {
  // Processing Tiers
  processingTiers: ProcessingTier[];
  setProcessingTiers: (tiers: ProcessingTier[]) => void;

  // Visa Cost
  visaCostAmount: number | string;
  setVisaCostAmount: (amount: number | string) => void;
  visaCostCurrency: string;
  setVisaCostCurrency: (currency: string) => void;

  // Additional Costs
  additionalCosts: AdditionalCost[];
  setAdditionalCosts: (costs: AdditionalCost[]) => void;

  // Processing Info
  processingGeneralTimeframe: string;
  setProcessingGeneralTimeframe: (timeframe: string) => void;
  processingAdditionalInfo: string;
  setProcessingAdditionalInfo: (info: string) => void;

  // Metadata
  metadataValidityPeriod: number | string;
  setMetadataValidityPeriod: (period: number | string) => void;
  metadataMaxExtensions: number | string;
  setMetadataMaxExtensions: (extensions: number | string) => void;

  // Navigation & Save
  onPreviousStep: () => void;
  onSave: () => void; // Renamed from handleSave for clarity
}

const VisaBuilderStep2: React.FC<VisaBuilderStep2Props> = ({
  processingTiers,
  setProcessingTiers,
  visaCostAmount,
  setVisaCostAmount,
  visaCostCurrency,
  setVisaCostCurrency,
  additionalCosts,
  setAdditionalCosts,
  processingGeneralTimeframe,
  setProcessingGeneralTimeframe,
  processingAdditionalInfo,
  setProcessingAdditionalInfo,
  metadataValidityPeriod,
  setMetadataValidityPeriod,
  metadataMaxExtensions,
  setMetadataMaxExtensions,
  onPreviousStep,
  onSave,
}) => {

  // Handlers for dynamic lists
  const handleProcessingTierChange = (index: number, field: keyof ProcessingTier, value: string) => {
    const newTiers = [...processingTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setProcessingTiers(newTiers);
  };

  const addProcessingTier = () => {
    setProcessingTiers([...processingTiers, { 
      type: 'STANDARD', 
      timeframe: '',
      timeUnit: 'WEEKS',
      minTime: 0,
      maxTime: 0
    }]);
  };

  const removeProcessingTier = (index: number) => {
    const newTiers = [...processingTiers];
    newTiers.splice(index, 1);
    setProcessingTiers(newTiers);
  };

  const handleAdditionalCostChange = (index: number, field: keyof AdditionalCost, value: string | number) => {
    const newCosts = [...additionalCosts];
    // Ensure amount is treated as number if possible, but allow string input
    const finalValue = (field === 'amount') ? value : String(value);
    newCosts[index] = { ...newCosts[index], [field]: finalValue };
    setAdditionalCosts(newCosts);
  };

  const addAdditionalCost = () => {
    setAdditionalCosts([...additionalCosts, { description: '', amount: '', currency: 'GBP' }]); // Default currency
  };

  const removeAdditionalCost = (index: number) => {
    const newCosts = [...additionalCosts];
    newCosts.splice(index, 1);
    setAdditionalCosts(newCosts);
  };


  return (
    <div className="space-y-6">
      {/* Costs Card */}
      <Card className="bg-white">
        <CardHeader>
        <CardTitle>Visa Costs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           {/* Main Visa Cost */}
           <div className="grid grid-cols-3 gap-4 items-end">
             <div className="col-span-2">
                <Label htmlFor="visaCostAmount" className="block text-sm font-medium text-gray-700 mb-1">Base Visa Fee</Label>
                <Input
                    id="visaCostAmount"
                    type="number" // Use number type for better input
                    min="0" // Prevent negative values
                    step="0.01" // Allow decimals if needed
                    value={visaCostAmount}
                    onChange={(e) => setVisaCostAmount(e.target.value)} // Keep as string from input initially
                    placeholder="e.g., 719"
                />
             </div>
              <div>
                <Label htmlFor="visaCostCurrency" className="block text-sm font-medium text-gray-700 mb-1">Currency</Label>
                 <Input
                    id="visaCostCurrency"
                    type="text"
                    value={visaCostCurrency}
                    onChange={(e) => setVisaCostCurrency(e.target.value.toUpperCase())}
                    maxLength={3} // Standard currency code length
                    placeholder="e.g., GBP"
                    className="uppercase"
                 />
              </div>
           </div>

           {/* Additional Costs */}
            <div>
              <div className="flex justify-between items-center mb-2 mt-4">
                <h3 className="font-medium text-sm text-gray-700">Additional Costs (e.g., Surcharges)</h3>
                <Button variant="ghost" size="sm" onClick={addAdditionalCost} type="button">
                  <Plus className="h-4 w-4" />
                  <span className="ml-1">Add Cost</span>
                </Button>
              </div>
              <div className="space-y-2">
                {additionalCosts.length > 0 ? (
                  additionalCosts.map((cost, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center border p-2 rounded-md bg-gray-50">
                      <div className="sm:col-span-3">
                         <Label htmlFor={`addCostDesc-${index}`} className="sr-only">Description</Label>
                         <Input
                            id={`addCostDesc-${index}`}
                            type="text"
                            placeholder="Description (e.g., Healthcare Surcharge)"
                            value={cost.description}
                            onChange={(e) => handleAdditionalCostChange(index, 'description', e.target.value)}
                            className="text-sm"
                         />
                      </div>
                       <div className="sm:col-span-2">
                         <Label htmlFor={`addCostAmount-${index}`} className="sr-only">Amount</Label>
                          <Input
                            id={`addCostAmount-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Amount"
                            value={cost.amount}
                            onChange={(e) => handleAdditionalCostChange(index, 'amount', e.target.value)}
                            className="text-sm"
                          />
                       </div>
                       <div>
                          <Label htmlFor={`addCostCurrency-${index}`} className="sr-only">Currency</Label>
                          <Input
                              id={`addCostCurrency-${index}`}
                              type="text"
                              placeholder="GBP"
                              value={cost.currency}
                              onChange={(e) => handleAdditionalCostChange(index, 'currency', e.target.value.toUpperCase())}
                              maxLength={3}
                              className="text-sm uppercase"
                          />
                       </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAdditionalCost(index)}
                        className="flex-shrink-0 justify-self-end h-8 w-8"
                        type="button"
                        aria-label="Remove additional cost"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic text-center">No additional costs added.</p>
                )}
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Processing Info Card */}
      <Card className="bg-white">
          <CardHeader>
             <CardTitle className="flex items-center"><Clock className="h-5 w-5 mr-2 text-blue-600"/>Processing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Processing Tiers */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-sm text-gray-700">Processing Tiers</h3>
                <Button variant="ghost" size="sm" onClick={addProcessingTier} type="button">
                  <Plus className="h-4 w-4" />
                  <span className="ml-1">Add Tier</span>
                </Button>
              </div>
              <div className="space-y-2">
                {processingTiers.map((tier, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center border p-2 rounded-md bg-gray-50">
                    <div className="sm:col-span-1">
                       <Label htmlFor={`tierType-${index}`} className="sr-only">Type</Label>
                       <select
                          id={`tierType-${index}`}
                          value={tier.type}
                          onChange={(e) => handleProcessingTierChange(index, 'type', e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                       >
                          <option value="STANDARD">Standard</option>
                          <option value="PREMIUM">Premium</option>
                          <option value="PRIORITY">Priority</option>
                       </select>
                    </div>
                    <div className="sm:col-span-1">
                       <Label htmlFor={`tierTimeframe-${index}`} className="sr-only">Timeframe</Label>
                       <Input
                          id={`tierTimeframe-${index}`}
                          type="text"
                          placeholder="Timeframe (e.g., 3-4 weeks)"
                          value={tier.timeframe}
                          onChange={(e) => handleProcessingTierChange(index, 'timeframe', e.target.value)}
                           className="text-sm"
                       />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProcessingTier(index)}
                      className="flex-shrink-0 justify-self-end h-8 w-8"
                      type="button"
                       aria-label="Remove processing tier"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {processingTiers.length === 0 && (
                   <p className="text-xs text-gray-500 italic text-center">No processing tiers added.</p>
                 )}
              </div>
            </div>

             {/* General/Additional Info */}
             <div>
               <Label htmlFor="generalTimeframe" className="block text-sm font-medium text-gray-700 mb-1 mt-4">General Timeframe Note</Label>
               <Input
                   id="generalTimeframe"
                   type="text"
                   value={processingGeneralTimeframe}
                   onChange={(e) => setProcessingGeneralTimeframe(e.target.value)}
                   placeholder="e.g., Standard processing is 3-4 weeks"
               />
             </div>
             <div>
               <Label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">Additional Processing Info</Label>
               <Textarea
                   id="additionalInfo"
                   value={processingAdditionalInfo}
                   onChange={(e) => setProcessingAdditionalInfo(e.target.value)}
                   className="h-16"
                   placeholder="e.g., Times may vary based on application complexity..."
               />
             </div>
          </CardContent>
      </Card>

      {/* Metadata Card */}
      <Card className="bg-white">
        <CardHeader>
             <CardTitle className="flex items-center"><Cog className="h-5 w-5 mr-2 text-gray-600"/>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div>
             <Label htmlFor="validityPeriod" className="block text-sm font-medium text-gray-700 mb-1">Visa Validity Period (Months)</Label>
             <Input
                 id="validityPeriod"
                 type="number"
                 min="0"
                 value={metadataValidityPeriod}
                 onChange={(e) => setMetadataValidityPeriod(e.target.value)}
                 placeholder="e.g., 24"
             />
           </div>
            <div>
             <Label htmlFor="maxExtensions" className="block text-sm font-medium text-gray-700 mb-1">Max Extensions Allowed</Label>
             <Input
                 id="maxExtensions"
                 type="number"
                 min="0"
                 value={metadataMaxExtensions}
                 onChange={(e) => setMetadataMaxExtensions(e.target.value)}
                 placeholder="e.g., 0 or 1"
             />
           </div>
        </CardContent>
      </Card>


      {/* Navigation & Save Buttons for Step 2 */}
      <div className="flex justify-between items-center pt-4">
        <Button onClick={onPreviousStep} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous: Flow & Docs
        </Button>
        <Button onClick={onSave} size="sm"> {/* Call the main save handler */}
          <Save className="mr-2 h-4 w-4" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default VisaBuilderStep2;
