// src/components/onboarding/renderer/fields/MockIdentityScan.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"; // For the mock modal
import { ScanLine, Camera, CheckCircle, XCircle, Loader2 } from "lucide-react"; // Icons
import { FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path

// Add specific config if needed, e.g., which documents are allowed
// interface FieldConfig {
//   // ... other properties
//   config?: {
//      allowedDocumentTypes?: ('passport' | 'driving_license')[];
//      // ... other scan configs
//   }
// }

interface MockIdentityScanProps {
  fieldConfig: FieldConfig & { config?: { allowedDocumentTypes?: string[] } };
  // control, errorMessage not directly needed for button trigger, state updated via setValue
}

const MockIdentityScan = ({ fieldConfig }: MockIdentityScanProps) => {
  const { fieldName, label, isRequired, config } = fieldConfig;
  const allowedTypes = config?.allowedDocumentTypes || ['Passport', 'Driving License']; // Default allowed

  // RHF setValue to update form state
  const { setValue, getValues, watch } = useFormContext();

  // Local state for modal visibility and mock scan status
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');

  // Watch the RHF value for this field to potentially sync local status on load
  const currentFieldValue = watch(fieldName);

  useEffect(() => {
      // Sync local state if RHF already has a success/failed status
      if (currentFieldValue?.status === 'mock_scan_success') {
          setScanStatus('success');
      } else if (currentFieldValue?.status === 'mock_scan_failed') {
          setScanStatus('failed');
      } else {
          setScanStatus('idle'); // Reset if RHF value is null or different
      }
  }, [currentFieldValue]);


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const simulateScan = (success: boolean) => {
    setScanStatus('scanning');
    closeModal(); // Close modal immediately or after delay? Let's close immediately.

    // Simulate processing delay
    setTimeout(() => {
      if (success) {
        setScanStatus('success');
        setValue(fieldName, {
          status: 'mock_scan_success',
          documentType: allowedTypes[0] || 'id_document', // Just pick the first allowed type for mock
          scannedAt: new Date().toISOString(),
          mockData: { // Example mock data structure
              firstName: "Mocky",
              lastName: "McMockface",
              dob: "1990-01-01",
              docNumber: `MOCK${Date.now()}`
          }
        }, { shouldValidate: true, shouldDirty: true });
      } else {
        setScanStatus('failed');
         setValue(fieldName, {
           status: 'mock_scan_failed',
           error: 'Simulated scan failure.',
           scannedAt: new Date().toISOString(),
         }, { shouldValidate: true, shouldDirty: true });
      }
    }, 2500); // 2.5 second delay
  };

  const handleReset = () => {
      setScanStatus('idle');
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
          {scanStatus === 'idle' && (
            <>
              <p className="text-sm text-muted-foreground">
                Identity document scan required.
              </p>
              <Button type="button" variant="outline" onClick={openModal}>
                <ScanLine className="h-4 w-4 mr-2" />
                Start Scan
              </Button>
            </>
          )}

          {scanStatus === 'scanning' && (
             <div className="flex items-center text-muted-foreground text-sm w-full">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing scan results...
             </div>
          )}

          {scanStatus === 'success' && (
            <div className="flex items-center justify-between w-full">
               <div className="flex items-center text-green-600">
                   <CheckCircle className="h-5 w-5 mr-2" />
                   <p className="text-sm font-medium">Scan Completed Successfully</p>
               </div>
               <Button type="button" variant="link" size="sm" onClick={handleReset} className="h-auto p-0 text-xs text-destructive">
                   Re-scan / Clear
               </Button>
            </div>
          )}

           {scanStatus === 'failed' && (
             <div className="flex items-center justify-between w-full">
                <div className="flex items-center text-destructive">
                    <XCircle className="h-5 w-5 mr-2" />
                    <p className="text-sm font-medium">Scan Failed</p>
                </div>
                <Button type="button" variant="link" size="sm" onClick={handleReset} className="h-auto p-0 text-xs">
                    Try Again
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
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Simulate Document Scan</DialogTitle>
            <DialogDescription>
              In a real application, this modal would activate the camera and guide the user through scanning their {allowedTypes.join(' or ')}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center bg-slate-100 rounded-md flex flex-col items-center justify-center min-h-[200px]">
             {/* Placeholder for camera feed/instructions */}
             <Camera className="h-16 w-16 text-muted-foreground mb-4" />
             <p className="text-sm text-muted-foreground">Position your document within the frame.</p>
          </div>
          <DialogFooter className="gap-2 sm:justify-center">
             <Button type="button" variant="destructive" onClick={() => simulateScan(false)}>
                Simulate Scan Failure
             </Button>
             <Button type="button" onClick={() => simulateScan(true)}>
                Simulate Successful Scan
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MockIdentityScan;