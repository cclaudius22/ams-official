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

interface VisaConfig {
  id?: string;
  name: string;
  description: string;
  stages: Array<{
    name: string;
    documents: Array<{
      name: string;
      isRequired: boolean;
    }>;
  }>;
  status?: 'draft' | 'published' | 'archived';
}

export function VisaBuilderStep3() {
  const { visaConfig } = useVisaBuilder();
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
      <ConfigurationSummary config={visaConfig} />
      
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button onClick={() => setShowDialog(true)} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit for Review'}
        </Button>
      </div>

      <ConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title="Submit for Review"
        description="Are you sure you want to submit this visa configuration for admin review?"
        onConfirm={handleSubmit}
      />
    </div>
  );
}
