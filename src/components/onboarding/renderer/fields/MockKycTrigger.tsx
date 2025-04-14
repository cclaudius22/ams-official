// src/components/onboarding/renderer/fields/MockKycTrigger.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ShieldCheck, UserCheck, Loader2, CircleAlert, CheckCircle, XCircle } from "lucide-react"; // Icons
import { FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path

// Add specific config if needed
// interface FieldConfig {
//   // ... other properties
//   config?: {
//      kycProvider?: string; // e.g., 'veriff', 'onfido'
//      checkLevel?: string; // e.g., 'standard', 'enhanced'
//   }
// }

interface MockKycTriggerProps {
  fieldConfig: FieldConfig & { config?: { kycProvider?: string; checkLevel?: string } };
  // control, errorMessage less relevant here, state updated via setValue
}

const MockKycTrigger = ({ fieldConfig }: MockKycTriggerProps) => {
  const { fieldName, label, isRequired, config } = fieldConfig;
  const checkLevel = config?.checkLevel || 'Standard'; // Example using config

  // RHF setValue/watch
  const { setValue, watch } = useFormContext();

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState<'idle' | 'processing' | 'success' | 'failed' | 'requires_review'>('idle');

  // Sync local state with RHF state on load/change
  const currentFieldValue = watch(fieldName);
  useEffect(() => {
      const statusMap = {
          'mock_kyc_success': 'success',
          'mock_kyc_failed': 'failed',
          'mock_kyc_review': 'requires_review',
      };
      // @ts-ignore // Ignore potential type issue if currentFieldValue is not an object initially
      const mappedStatus = statusMap[currentFieldValue?.status] || 'idle';
      setKycStatus(mappedStatus);
  }, [currentFieldValue]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const simulateKycCheck = (result: 'success' | 'failed' | 'requires_review') => {
    setKycStatus('processing');
    closeModal();

    // Simulate processing delay
    setTimeout(() => {
      setKycStatus(result); // Update local state first

      let rhfStatus;
      let rhfData: Record<string, any> = {
          checkedAt: new Date().toISOString(),
          checkLevel: checkLevel,
      };

      switch (result) {
          case 'success':
              rhfStatus = 'mock_kyc_success';
              rhfData.message = 'Identity successfully verified.';
              break;
          case 'failed':
              rhfStatus = 'mock_kyc_failed';
              rhfData.message = 'Identity verification failed. Please contact support.';
              rhfData.reason = 'Simulated failure (e.g., document mismatch).'; // Example reason
              break;
          case 'requires_review':
              rhfStatus = 'mock_kyc_review';
              rhfData.message = 'Verification requires manual review.';
              rhfData.reason = 'Simulated edge case (e.g., low confidence score).'; // Example reason
              break;
          default:
              rhfStatus = 'idle'; // Should not happen here
      }

      setValue(fieldName, { status: rhfStatus, ...rhfData }, { shouldValidate: true, shouldDirty: true });
    }, 3000); // 3 second delay
  };

   const handleReset = () => {
      setKycStatus('idle');
      setValue(fieldName, null, { shouldValidate: true, shouldDirty: true });
   }

  return (
    <div className="space-y-2">
      <Label>
        {label || fieldName}
        {isRequired && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Card className="p-4">
        <CardContent className="p-0 flex items-center justify-between">
          {kycStatus === 'idle' && (
            <>
              <p className="text-sm text-muted-foreground">
                Identity verification required ({checkLevel} level).
              </p>
              <Button type="button" variant="default" onClick={openModal}>
                <UserCheck className="h-4 w-4 mr-2" />
                Start Verification
              </Button>
            </>
          )}

          {kycStatus === 'processing' && (
             <div className="flex items-center text-muted-foreground text-sm w-full">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing identity verification...
             </div>
          )}

          {kycStatus === 'success' && (
            <div className="flex items-center justify-between w-full">
               <div className="flex items-center text-green-600">
                   <CheckCircle className="h-5 w-5 mr-2" />
                   <p className="text-sm font-medium">Identity Verified Successfully</p>
               </div>
                {/* Allow reset even on success? Maybe not needed once passed. */}
               {/* <Button type="button" variant="link" size="sm" onClick={handleReset} className="h-auto p-0 text-xs text-destructive">Clear Status</Button> */}
            </div>
          )}

           {kycStatus === 'failed' && (
             <div className="flex items-center justify-between w-full">
                <div className="flex items-center text-destructive">
                    <XCircle className="h-5 w-5 mr-2" />
                    <p className="text-sm font-medium">Identity Verification Failed</p>
                </div>
                <Button type="button" variant="link" size="sm" onClick={handleReset} className="h-auto p-0 text-xs">
                    Retry Verification
                 </Button>
             </div>
           )}

           {kycStatus === 'requires_review' && (
             <div className="flex items-center justify-between w-full">
                <div className="flex items-center text-yellow-600">
                    <CircleAlert className="h-5 w-5 mr-2" />
                    <p className="text-sm font-medium">Verification Requires Manual Review</p>
                </div>
                 {/* Allow reset/retry? */}
                 <Button type="button" variant="link" size="sm" onClick={handleReset} className="h-auto p-0 text-xs">
                    Retry Verification
                 </Button>
             </div>
           )}

        </CardContent>
      </Card>

       {/* Display Help Text if provided */}
       {fieldConfig.helpText && (
         <p className="text-xs text-muted-foreground pt-1">{fieldConfig.helpText}</p>
       )}

      {/* Mock Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Simulate KYC / Identity Verification</DialogTitle>
            <DialogDescription>
               This simulates launching an identity verification flow (like Veriff, Onfido, etc.). In a real app, this might redirect or show a dedicated SDK interface.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-md flex flex-col items-center justify-center min-h-[200px]">
             {/* Placeholder for KYC flow instructions */}
             <ShieldCheck className="h-16 w-16 text-indigo-400 mb-4" />
             <p className="text-sm text-muted-foreground px-4">Follow the simulated steps to verify your identity.</p>
             <p className="text-xs text-muted-foreground mt-1">(e.g., Liveness check, ID document verification)</p>
          </div>
          <DialogFooter className="gap-2 sm:justify-center">
             <Button type="button" variant="destructive" size="sm" onClick={() => simulateKycCheck('failed')}>
                Simulate Failure
             </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => simulateKycCheck('requires_review')}>
                Simulate Manual Review Needed
             </Button>
             <Button type="button" size="sm" onClick={() => simulateKycCheck('success')}>
                Simulate Success
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MockKycTrigger;