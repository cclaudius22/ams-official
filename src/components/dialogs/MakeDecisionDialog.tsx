// src/components/dialogs/MakeDecisionDialog.tsx (Updated)
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
import { ApplicationData } from '@/types/application'; // Assuming this type exists
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'; // Icons for buttons
import { cn } from '@/lib/utils'; // For conditional classes

interface MakeDecisionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // Pass the full application data or relevant parts for summary
  applicationData: ApplicationData | null;
  // Callback receives the decision and optional notes
  onSubmitDecision: (decision: 'approve' | 'reject', rationale?: string) => void;
  // Optional: Loading state for submission
  isSubmitting?: boolean;
}

export default function MakeDecisionDialog({
  isOpen,
  onClose,
  applicationData,
  onSubmitDecision,
  isSubmitting = false, // Default to not submitting
}: MakeDecisionDialogProps) {
  const [rationale, setRationale] = useState('');
  // State to manage the confirmation step
  const [confirmingDecision, setConfirmingDecision] = useState<'approve' | 'reject' | null>(null);

  // Reset internal state when the dialog is opened or closed
  useEffect(() => {
    if (!isOpen) {
      // Delay reset slightly to avoid visual glitch during closing animation
      const timer = setTimeout(() => {
        setRationale('');
        setConfirmingDecision(null);
      }, 150);
      return () => clearTimeout(timer);
    } else {
        // Reset immediately when opening
        setRationale('');
        setConfirmingDecision(null);
    }
  }, [isOpen]);

  // Handler when initial Approve/Reject button is clicked
  const handleInitialDecision = (decision: 'approve' | 'reject') => {
    // Require rationale for rejection
    if (decision === 'reject' && !rationale.trim()) {
        alert('Please provide a rationale for rejecting the application.');
        // Optionally focus the textarea here
        document.getElementById('decision-rationale')?.focus();
        return;
    }
    setConfirmingDecision(decision);
  };

  // Handler for the final confirmation button
  const handleConfirm = () => {
    if (confirmingDecision) {
      onSubmitDecision(confirmingDecision, rationale);
      // Parent component should handle closing on successful submission via its logic,
      // but we can optimistically close or rely on parent state change.
      // onClose(); // Optionally close immediately
    }
  };

  // --- Safely extract data for summary ---
  const appId = applicationData?.applicationId ?? 'N/A';
  const visaType = applicationData?.visaTypeId?.replace(/-/g, ' ') ?? 'N/A'; // Format type ID
  const passportData = applicationData?.sections?.passport?.data;
  const applicantName = passportData?.givenNames && passportData?.surname
    ? `${passportData.givenNames} ${passportData.surname}`.trim()
    : applicationData?.applicantDetails?.givenNames && applicationData?.applicantDetails?.surname // Fallback
    ? `${applicationData.applicantDetails.givenNames} ${applicationData.applicantDetails.surname}`.trim()
    : 'N/A';
  // --- End data extraction ---

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Increased max-width for a wider dialog */}
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Make Final Decision</DialogTitle>
          <DialogDescription>
            Review the application summary and confirm your final decision. Add rationale notes where necessary, especially for rejections.
          </DialogDescription>
        </DialogHeader>

        {/* Main Content Area */}
        <div className="grid gap-6 py-4">
          {/* Application Summary Section */}
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

          {/* Decision Rationale Notes */}
          <div className="space-y-2">
            <Label htmlFor="decision-rationale" className="font-semibold">
                Decision Rationale <span className="text-gray-500 font-normal">(Optional for approval, recommended for rejection)</span>
            </Label>
            <Textarea
              id="decision-rationale"
              placeholder="Add justification, reference specific issues, or note reasons for the decision..."
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={4} // Increased rows
              className="text-sm"
            />
          </div>

          {/* Confirmation Step Display */}
          {confirmingDecision && (
            <div className={cn(
                "mt-2 p-4 rounded-md border text-center",
                confirmingDecision === 'reject' ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
            )}>
              <p className={cn(
                  "text-base font-semibold",
                  confirmingDecision === 'reject' ? 'text-red-800' : 'text-green-800'
              )}>
                 Confirm {confirmingDecision === 'reject' ? 'Rejection' : 'Approval'}?
              </p>
              {rationale && (
                 <p className="text-xs text-slate-600 mt-2 border-t pt-2">
                     <span className="font-medium">Rationale Provided:</span> {rationale.length > 100 ? rationale.substring(0, 100) + '...' : rationale}
                 </p>
              )}
              <p className="text-xs text-slate-500 mt-2">This action will finalize the application status.</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="gap-2 flex-col sm:flex-row sm:justify-between">
          {/* Cancel Button (Always Visible) */}
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>

          {/* Conditional Buttons: Initial Actions OR Confirmation */}
          {!confirmingDecision ? (
            // Step 1: Show Approve & Reject Buttons
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="destructive" // Red color for rejection
                onClick={() => handleInitialDecision('reject')}
                disabled={isSubmitting}
              >
                <XCircle className="mr-2 h-4 w-4" /> Reject Application
              </Button>
              <Button
                type="button"
                variant="default" // Primary color (often green/blue) for approval
                className="bg-green-600 hover:bg-green-700" // Explicit green for approval
                onClick={() => handleInitialDecision('approve')}
                disabled={isSubmitting}
              >
                 <CheckCircle className="mr-2 h-4 w-4" /> Approve Application
              </Button>
            </div>
          ) : (
            // Step 2: Show Confirmation Button
            <Button
              type="button"
              // Style matches the decision being confirmed
              variant={confirmingDecision === 'reject' ? 'destructive' : 'default'}
              className={confirmingDecision === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              onClick={handleConfirm}
              disabled={isSubmitting} // Disable while submitting
            >
              {isSubmitting ? 'Submitting...' : `Confirm ${confirmingDecision === 'reject' ? 'Rejection' : 'Approval'}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}