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
import { ApplicationData } from '@/types/application';
import { AlertCircle, CheckCircle } from 'lucide-react'; // Icons for buttons

interface MakeDecisionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  applicationData: ApplicationData | null;
  onSubmitDecision: (decision: 'approve' | 'reject', notes?: string) => void;
}

export default function MakeDecisionDialog({
  isOpen,
  onClose,
  applicationData,
  onSubmitDecision,
}: MakeDecisionDialogProps) {
  const [notes, setNotes] = useState('');
  const [decisionType, setDecisionType] = useState<'approve' | 'reject' | null>(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNotes('');
      setDecisionType(null); // Reset decision type as well
    }
  }, [isOpen]);

  const handleDecision = (decision: 'approve' | 'reject') => {
    setDecisionType(decision); // Set the decision type to confirm
    // Optionally, you could immediately submit if no notes are required for approval
    // if (decision === 'approve') {
    //   handleSubmit(decision);
    // }
  };

  const handleSubmit = () => {
    if (decisionType) {
      onSubmitDecision(decisionType, notes);
      onClose(); // Close the dialog after submission
    }
  };

  // Extract applicant name safely
  const passportData = applicationData?.sections?.passport?.data;
  const applicantName = passportData?.givenNames && passportData?.surname
    ? `${passportData.givenNames} ${passportData.surname}`.trim()
    : 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Make Final Decision</DialogTitle>
          <DialogDescription>
            Review the details and confirm the final decision for this application.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Application Details */}
          <div className="space-y-2 rounded-md border bg-muted/40 p-3 text-sm">
             <h4 className="text-sm font-semibold mb-2">Application Summary</h4>
             <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                 <span className="text-muted-foreground">Application ID:</span>
                 <span>{applicationData?.applicationId || 'N/A'}</span>
                 <span className="text-muted-foreground">Applicant:</span>
                 <span>{applicantName}</span>
                 <span className="text-muted-foreground">Visa Type ID:</span>
                 <span>{applicationData?.visaTypeId || 'N/A'}</span>
             </div>
          </div>

          {/* Decision Rationale Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="decision-notes">Decision Rationale (Optional)</Label>
            <Textarea
              id="decision-notes"
              placeholder="Add any final notes or justification for the decision (especially for rejections)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Confirmation Area - Shows after initial button click */}
          {decisionType && (
            <div className={`mt-4 p-3 rounded-md border ${decisionType === 'reject' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <p className={`text-sm font-medium ${decisionType === 'reject' ? 'text-red-700' : 'text-green-700'}`}>
                Are you sure you want to **{decisionType === 'reject' ? 'Reject' : 'Approve'}** this application?
              </p>
              {notes && (
                 <p className="text-xs text-muted-foreground mt-1">Rationale: {notes}</p>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          {/* Show initial decision buttons OR confirmation button */}
          {!decisionType ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDecision('reject')}
              >
                <AlertCircle className="mr-2 h-4 w-4" /> Reject Application
              </Button>
              <Button
                type="button"
                variant="success" // Assuming you have a success variant
                onClick={() => handleDecision('approve')}
              >
                 <CheckCircle className="mr-2 h-4 w-4" /> Approve Application
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant={decisionType === 'reject' ? 'destructive' : 'success'}
              onClick={handleSubmit}
            >
              Confirm {decisionType === 'reject' ? 'Rejection' : 'Approval'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
