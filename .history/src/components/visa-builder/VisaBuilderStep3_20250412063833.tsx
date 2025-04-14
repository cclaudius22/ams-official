import { Button } from "@/components/ui/button";
import ConfigurationSummary from "./ConfigurationSummary";
import useVisaBuilder from "./VisaBuilder";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export function VisaBuilderStep3() {
  const visaBuilder = useVisaBuilder();
  const visaConfig = visaBuilder.visaConfig;
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review Visa Configuration</h2>
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
