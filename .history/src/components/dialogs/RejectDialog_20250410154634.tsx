// src/components/dialogs/RejectDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApplicationData } from '@/types/application'; // Assuming type exists
import { XCircle } from 'lucide-react'; // Icon for rejection
import { cn } from '@/lib/utils'; // For conditional classes

interface RejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  applicationData: ApplicationData | null;
  // Passes 'reject' and mandatory notes
  onSubmitDecision: (decision: 'reject', rationale: string) => void;
  isSubmitting?: boolean;
}

export default function RejectDialog({
  isOpen,
  onClose,
  applicationData,
  onSubmitDecision,
  isSubmitting = false,
}: RejectDialogProps) {
  const [rationale, setRationale] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
         setRationale('');
         setShowValidationError(false);
      }, 150);
      return () => clearTimeout(timer);
    } else {
        setRationale('');
        setShowValidationError(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    // Validate that rationale is provided
    if (!rationale.trim()) {
      setShowValidationError(true);
      // Optionally focus the textarea
      document.getElementById('rejection-rationale')?.focus();
      return; // Prevent submission
    }
    setShowValidationError(false); // Clear validation error if present
    onSubmitDecision('reject', rationale);
    // Parent component should handle closing via state change after successful submission
  };

  // --- Safely extract data for summary ---
  const appId = applicationData?.applicationId ?? 'N/A';
  const visaType = applicationData?.visaTypeId?.replace(/-/g, ' ') ?? 'N/A';
  const passportData = applicationData?.sections?.passport?.data;
  const applicantName = passportData?.givenNames && passportData?.surname
    ? `${passportData.givenNames} ${passportData.surname}`.trim()
    : applicationData?.applicantDetails?.givenNames && applicationData?.applicantDetails?.surname
    ? `${applicationData.applicantDetails.givenNames} ${applicationData.applicantDetails.surname}`.trim()
    : 'N/A';
  // --- End data extraction ---

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
       {/* Can make rejection dialog wider if rationale tends to be long */}
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-red-700 flex items-center gap-2">
            <XCircle className="h-5 w-5" /> Confirm Rejection
          </DialogTitle>
          <DialogDescription>
            Review the summary and provide a clear rationale for rejecting this application. This rationale is required.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
           {/* Application Summary */}
           <div className="space-y-2 rounded-lg border bg-slate-50 p-4">
             <h4 className="text-base font-semibold mb-3 text-slate-800">Application Summary</h4>
             <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                 <span className="font-medium text-slate-500 col-span-1">Application ID:</span>
                 <span className="col-span-2 font-mono">{appId}</span>
                 <span className="font-medium text-slate-500 col-span-1">Applicant:</span>
                 <span className="col-span-2 font-semibold">{applicantName}</span>
                 <span className="font-medium text-slate-500 col-span-1">Visa Type:</span>
                 <span className="col-span-2 capitalize">{visaType}</span>
             </div>
          </div>

          {/* Rejection Rationale Notes (Required) */}
          <div className="space-y-1"> {/* Reduced space */}
            <Label htmlFor="rejection-rationale" className="font-semibold flex justify-between items-center">
                <span>Rejection Rationale <span className="text-red-600">*</span></span>
                 {showValidationError && <span className="text-xs text-red-600 font-normal">Rationale is required</span>}
            </Label>
            <Textarea
              id="rejection-rationale"
              placeholder="Clearly state the reasons for rejection, referencing specific requirements or issues found..."
              value={rationale}
              onChange={(e) => {
                  setRationale(e.target.value);
                  // Clear validation error when user starts typing
                  if (showValidationError && e.target.value.trim()) {
                      setShowValidationError(false);
                  }
              }}
              rows={5} // More rows for rejection rationale
              required // HTML5 required attribute
              className={cn("text-sm", showValidationError ? 'border-red-500 focus-visible:ring-red-500' : '')} // Highlight if error
              aria-describedby={showValidationError ? "rationale-error" : undefined}
              aria-invalid={showValidationError}
            />
             {showValidationError && <p id="rationale-error" className="text-xs text-red-600 sr-only">Rationale is required</p>}
          </div>

           {/* Confirmation Message */}
            <div className="mt-2 p-3 rounded-md border bg-red-50 border-red-300 text-center">
               <p className="text-sm font-medium text-red-800">
                  Proceed with rejecting this application? Ensure rationale is complete.
               </p>
            </div>

        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive" // Keep destructive style
            onClick={handleSubmit}
            // Disable if submitting OR if rationale is empty (redundant due to check in handleSubmit, but good UX)
            disabled={isSubmitting || !rationale.trim()}
          >
            {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}