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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ApplicationData } from '@/types/application'; // Assuming this type covers needed fields
import { formatDate } from '@/utils/formatters'; // Assuming a date formatter exists

interface EscalateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  applicationData: ApplicationData | null; // Allow null initially
  onSubmit: (reasons: string[], notes: string) => void;
}

const ESCALATION_REASONS = [
  "Requires Senior Review",
  "Policy Clarification Needed",
  "Incomplete Information",
  "Sanctions list",
  "Failed additional checks",
  "Suspected Fraud", // Added from initial suggestion
  "Complex Case", // Added from initial suggestion
  "Technical Issue" // Added from initial suggestion
];

export default function EscalateDialog({
  isOpen,
  onClose,
  applicationData,
  onSubmit,
}: EscalateDialogProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Reset state when dialog opens or applicationData changes
  useEffect(() => {
    if (isOpen) {
      setSelectedReasons([]);
      setNotes('');
    }
  }, [isOpen]);

  const handleReasonChange = (reason: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedReasons((prev) => [...prev, reason]);
    } else {
      setSelectedReasons((prev) => prev.filter((r) => r !== reason));
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedReasons, notes);
    onClose(); // Close the dialog after submission
  };

  // Extract details safely based on ApplicationData type
  const passportData = applicationData?.sections?.passport?.data;
  const applicantName = passportData?.givenNames && passportData?.surname
    ? `${passportData.givenNames} ${passportData.surname}`.trim()
    : 'N/A';

  // Use progress.lastUpdated as submission date proxy
  const submissionDate = applicationData?.progress?.lastUpdated
    ? formatDate(applicationData.progress.lastUpdated) // Use formatter
    : 'N/A';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Escalate Application</DialogTitle>
          <DialogDescription>
            Select reasons for escalation and add relevant notes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Application Details */}
          <div className="space-y-2 rounded-md border bg-muted/40 p-3">
             <h4 className="text-sm font-semibold mb-2">Application Details</h4>
             <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">Application ID:</span>
                <span>{applicationData?.applicationId || 'N/A'}</span>
                <span className="text-muted-foreground">Applicant:</span>
                <span>{applicantName}</span>
                <span className="text-muted-foreground">Visa Type ID:</span>
                <span>{applicationData?.visaTypeId || 'N/A'}</span>
                 <span className="text-muted-foreground">Last Updated:</span>
                <span>{submissionDate}</span>
                {/* Priority removed as it's not in ApplicationData type */}
             </div>
          </div>

          {/* Escalation Reasons */}
          <div className="space-y-2">
            <Label htmlFor="escalation-reasons">Reasons for Escalation (select all that apply)</Label>
            <div id="escalation-reasons" className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-md border p-3">
              {ESCALATION_REASONS.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <Checkbox
                    id={`reason-${reason.replace(/\s+/g, '-')}`} // Create unique ID
                    checked={selectedReasons.includes(reason)}
                    onCheckedChange={(checked) => handleReasonChange(reason, checked)}
                  />
                  <Label
                    htmlFor={`reason-${reason.replace(/\s+/g, '-')}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {reason}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="escalation-notes">Notes</Label>
            <Textarea
              id="escalation-notes"
              placeholder="Add any relevant details or context for the escalation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
             <Button type="button" variant="outline">
                Cancel
             </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={selectedReasons.length === 0} // Disable if no reason selected
          >
            Submit Escalation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
