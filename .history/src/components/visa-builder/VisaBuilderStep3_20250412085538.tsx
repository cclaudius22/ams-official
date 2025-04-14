import { Button } from "@/components/ui/button";
import ConfigurationSummary from "./ConfigurationSummary";
import useVisaBuilder from "./VisaBuilder";

interface VisaBuilderContextType {
  visaConfig: {
    name: string;
    description: string;
    typeId: string;
    code: string;
    category: string;
    eligibilityCriteria: any[];
    conditionalStages: any[];
    documentTypes: any[];
    fixedStages: any[];
    finalStages: any[];
    processingTiers: any[];
    visaCost?: { amount: string; currency: string };
    additionalCosts: any[];
    processingInfo?: { generalTimeframe: string; additionalInfo: string };
    metadata?: { validityPeriod: string; maxExtensions: string };
  };
  setVisaConfig: (config: any) => void;
}
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export function VisaBuilderStep3() {
  const visaBuilder = useVisaBuilder() as VisaBuilderContextType;
  const visaConfig = visaBuilder?.visaConfig || {
    name: '',
    description: '',
    typeId: '',
    code: '',
    category: '',
    eligibilityCriteria: [],
    conditionalStages: [],
    documentTypes: [],
    fixedStages: [],
    finalStages: [],
    processingTiers: [],
    visaCost: { amount: '', currency: 'GBP' },
    additionalCosts: [],
    processingInfo: { generalTimeframe: '', additionalInfo: '' },
    metadata: { validityPeriod: '', maxExtensions: '' }
  };
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/visa-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...visaConfig,
          status: 'draft'
        }),
      });

      if (response.ok) {
        router.push('/dashboard/visa-types');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review Visa Configuration</h2>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2 flex items-center">
          <ShieldCheck className="h-4 w-4 mr-2 text-purple-500" />
          AI Scan Requirements
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          These AI validations are automatically performed on submitted documents.
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
      </div>
      <ConfigurationSummary 
        visaName={visaConfig.name}
        visaDescription={visaConfig.description}
        visaTypeId={visaConfig.typeId}
        visaCode={visaConfig.code}
        eligibilityCriteria={visaConfig.eligibilityCriteria || []}
        selectedCategory={visaConfig.category}
        conditionalStages={visaConfig.conditionalStages || []}
        documentTypes={visaConfig.documentTypes || []}
        fixedStages={visaConfig.fixedStages || []}
        finalStages={visaConfig.finalStages || []}
        processingTiers={visaConfig.processingTiers || []}
        visaCostAmount={visaConfig.visaCost?.amount || ''}
        visaCostCurrency={visaConfig.visaCost?.currency || 'GBP'}
        additionalCosts={visaConfig.additionalCosts || []}
        processingGeneralTimeframe={visaConfig.processingInfo?.generalTimeframe || ''}
        processingAdditionalInfo={visaConfig.processingInfo?.additionalInfo || ''}
        metadataValidityPeriod={visaConfig.metadata?.validityPeriod || ''}
        metadataMaxExtensions={visaConfig.metadata?.maxExtensions || ''}
        currentStep={3}
      />
      
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button onClick={() => setShowDialog(true)} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit for Review'}
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit for Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this visa configuration for admin review?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
