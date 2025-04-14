// src/components/visa-builder/VisaBuilderStep3.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Save, ArrowLeft } from 'lucide-react';
import ExtendedConfigurationSummary from './ExtendedConfigurationSummary';
import AIScanConfigurator from './AIScanConfigurator';
import { useVisaBuilder } from './VisaBuilder'; // Fixed import to use named export
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

interface VisaBuilderStep3Props {
  reviewNotes: string;
  setReviewNotes: (notes: string) => void;
  onPreviousStep: () => void;
  onSave: () => void;
}

const VisaBuilderStep3: React.FC<VisaBuilderStep3Props> = ({
  reviewNotes,
  setReviewNotes,
  onPreviousStep,
  onSave
}) => {
  const { visaConfig } = useVisaBuilder();
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Scan configuration
  const [aiScans, setAiScans] = useState([
    { id: 'PASSPORT_VALIDITY', name: 'Passport Validity', enabled: true },
    { id: 'FACE_MATCHING', name: 'Face Matching', enabled: true },
    { id: 'DATES_VALIDATION', name: 'Dates Validation', enabled: true },
    { id: 'LIVENESS_CHECK', name: 'Liveness Check', enabled: true },
    { id: 'DYNAMIC_DOCUMENTS_SCAN', name: 'Dynamic Documents Scan', enabled: true },
    { id: 'ROOTEDNESS_ANALYSIS', name: 'Rootedness Analysis', enabled: true },
    { id: 'INTENT_ANALYSIS', name: 'Intent Analysis', enabled: true }
  ]);

  const toggleAIScan = (scanId: string) => {
    setAiScans(prevScans =>
      prevScans.map(scan =>
        scan.id === scanId ? { ...scan, enabled: !scan.enabled } : scan
      )
    );
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    try {
      // Call the parent's save function
      onSave();
    } finally {
      setIsSubmitting(false);
      setShowDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Extended Configuration Summary with AI Scan Requirements */}
      <ExtendedConfigurationSummary
        visaName={visaConfig.name}
        visaDescription={visaConfig.description}
        visaTypeId={visaConfig.typeId}
        visaCode={visaConfig.code}
        eligibilityCriteria={visaConfig.eligibilityCriteria}
        selectedCategory={visaConfig.category}
        conditionalStages={visaConfig.conditionalStages}
        documentTypes={visaConfig.documentTypes}
        fixedStages={visaConfig.fixedStages}
        finalStages={visaConfig.finalStages}
        processingTiers={visaConfig.processingTiers}
        visaCostAmount={visaConfig.visaCost.amount}
        visaCostCurrency={visaConfig.visaCost.currency}
        additionalCosts={visaConfig.additionalCosts}
        processingGeneralTimeframe={visaConfig.processingInfo.generalTimeframe}
        processingAdditionalInfo={visaConfig.processingInfo.additionalInfo}
        metadataValidityPeriod={visaConfig.metadata?.validityPeriod}
        metadataMaxExtensions={visaConfig.metadata?.maxExtensions}
        aiScans={aiScans}
        currentStep={3}
      />

      {/* AI Scan Configuration Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base">
            <ShieldCheck className="h-4 w-4 mr-2 text-purple-500" />
            Configure AI Scan Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Enable or disable AI validations that will be performed on submitted documents.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {aiScans.map((scan) => (
              <div
                key={scan.id}
                className={`border rounded-md p-3 flex items-center ${
                  scan.enabled ? 'bg-purple-50' : 'bg-gray-50'
                }`}
              >
                <ShieldCheck className={`h-5 w-5 mr-2 ${
                  scan.enabled ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <div>
                  <p className="text-sm font-medium">{scan.name}</p>
                  <p className="text-xs">
                    <span className={scan.enabled ? 'text-purple-500' : 'text-gray-500'}>
                      {scan.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => toggleAIScan(scan.id)}
                >
                  {scan.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review & Confirm - Moved below Configuration Summary and removed "3." */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review & Confirm</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label>Created By</Label>
              <p className="text-sm">System</p>
            </div>
            <div>
              <Label>Creation Date</Label>
              <p className="text-sm">{new Date().toLocaleString()}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reviewNotes">Review Notes</Label>
            <Textarea
              id="reviewNotes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add any review comments or notes..."
              className="h-24"
            />
            <p className="text-xs text-gray-500">
              These notes will be saved with the configuration.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Navigation & Save Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Button onClick={onPreviousStep} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous: Costs & Processing
        </Button>
        <Button onClick={() => setShowDialog(true)} size="sm">
          <Save className="mr-2 h-4 w-4" />
          Confirm & Save
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Configuration</DialogTitle>
            <DialogDescription>
              Are you sure you want to save this visa configuration?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisaBuilderStep3;
