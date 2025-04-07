// src/components/application/DecisionFooter.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
// Added icons: MessageSquare (Contact), ArrowUpCircle (Escalate), CheckSquare (Make Decision)
import { AlertCircle, CheckCircle2, MessageSquare, ArrowUpCircle, CheckSquare } from 'lucide-react';

// --- Define Applicant Contact Details Structure ---
interface ApplicantContact {
    email?: string | null;
    phoneNumber?: string | null;
    // Add name if helpful for the modal title
    name?: string | null;
}

interface DecisionFooterProps {
  totalSections: number;
  decidedSections: number;
  allDecided: boolean;
  // --- NEW PROPS ---
  applicantContact: ApplicantContact; // Pass contact info
  onContact: () => void; // Callback to open Contact modal
  onEscalate: () => void; // Callback to open Escalate modal
  onMakeDecision: () => void; // Callback to open Make Decision modal
}

export default function DecisionFooter({
  totalSections,
  decidedSections,
  allDecided,
  applicantContact, // Destructure new props
  onContact,
  onEscalate,
  onMakeDecision
}: DecisionFooterProps) {

  // Determine progress percentage for visual indicator (optional)
  const progressPercent = totalSections > 0 ? Math.round((decidedSections / totalSections) * 100) : 0;

  return (
    // Add z-index to ensure it stays above content when sticky
    <div className="mt-8 p-4 bg-white rounded-lg shadow-md border sticky bottom-4 z-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left Side: Progress */}
        <div className="flex-shrink-0 text-center sm:text-left">
          <h3 className="font-semibold text-gray-800">Review Progress</h3>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                   className="h-2 bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
                   style={{ width: `${progressPercent}%` }}
                />
             </div>
             <p className="text-sm text-gray-500">
                {decidedSections} of {totalSections} sections reviewed ({progressPercent}%)
             </p>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
          {/* Contact Applicant Button */}
          <Button
            variant="outline"
            onClick={onContact}
            // Optionally disable if no contact info available
            // disabled={!applicantContact.email && !applicantContact.phoneNumber}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Applicant
          </Button>

           {/* Escalate Button */}
          <Button
            variant="outline"
            className="border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
            onClick={onEscalate}
            disabled={!allDecided} // Can escalate only after reviewing all sections? Or allow anytime? Adjust logic.
            title={!allDecided ? `Review all ${totalSections} sections first` : "Escalate for supervisor review"}
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Escalate
          </Button>

           {/* Make Decision Button */}
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white" // Changed color to blue as it opens a modal now
            onClick={onMakeDecision}
            disabled={!allDecided} // Must review all sections before final decision
             title={!allDecided ? `Review all ${totalSections} sections first` : "Make final decision (Approve/Reject)"}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Make Decision
          </Button>
        </div>
      </div>
    </div>
  );
}