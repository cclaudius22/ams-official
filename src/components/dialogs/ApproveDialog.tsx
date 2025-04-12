// src/components/dialogs/ApproveDialog.tsx
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
import { CheckCircle } from 'lucide-react';

interface ApproveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  applicationData: ApplicationData | null;
  // Passes 'approve' and optional notes
  onSubmitDecision: (decision: 'approve', rationale?: string) => void;
  isSubmitting?: boolean;
}

export default function ApproveDialog({
  isOpen,
  onClose,
  applicationData,
  onSubmitDecision,
  isSubmitting = false,
}: ApproveDialogProps) {
  const [rationale, setRationale] = useState('');

  // Reset notes when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setRationale(''), 150); // Delay reset
      return () => clearTimeout(timer);
    } else {
        setRationale(''); // Reset immediately on open
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmitDecision('approve', rationale);
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
      <DialogContent className="sm:max-w-lg"> {/* Standard width is fine */}
        <DialogHeader>
          <DialogTitle className="text-xl text-green-700 flex items-center gap-2">
            <CheckCircle className="h-5 w-5"/> Confirm Approval
          </DialogTitle>
          <DialogDescription>
            Please review the application summary and confirm the approval.
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

          {/* Optional Approval Notes */}
          <div className="space-y-2">
            <Label htmlFor="approval-notes" className="font-medium">Approval Notes (Optional)</Label>
            <Textarea
              id="approval-notes"
              placeholder="Add any optional notes regarding the approval..."
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              className="text-sm"
            />
          </div>

           {/* Confirmation Message */}
           <div className="mt-2 p-3 rounded-md border bg-green-50 border-green-300 text-center">
               <p className="text-sm font-medium text-green-800">
                  Proceed with approving this application?
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
            className="bg-green-600 hover:bg-green-700" // Keep explicit green
            onClick={handleSubmit}
            disabled={isSubmitting} // Disable while submitting
          >
            {isSubmitting ? 'Approving...' : 'Confirm Approval'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}