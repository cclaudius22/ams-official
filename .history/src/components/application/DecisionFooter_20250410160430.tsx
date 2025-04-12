// src/components/application/DecisionFooter.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
// Added icons: MessageSquare (Contact), ArrowUpCircle (Escalate), CheckSquare (Make Decision)
import { AlertCircle, CheckCircle2, MessageSquare, ArrowUpCircle, CheckSquare } from 'lucide-react';

// --- Define Applicant Contact Details Structure ---
interface ApplicantContact {
    email?: string | null;
    phoneNumber?: string | null;
    name?: string | null;
}

interface DecisionFooterProps {
  totalSections: number;
  decidedSections: number;
  allDecided: boolean; // Still pass it, but won't use for disabling temporarily
  applicantContact: ApplicantContact;
  onContact: () => void;
  onEscalate: () => void;
  onMakeDecision: () => void;
}

export default function DecisionFooter({
  totalSections,
  decidedSections,
  allDecided, // Keep receiving prop
  applicantContact,
  onContact,
  onEscalate,
  onMakeDecision
}: DecisionFooterProps) {

  const progressPercent = totalSections > 0 ? Math.round((decidedSections / totalSections) * 100) : 0;

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-md border sticky bottom-4 z-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left Side: Progress */}
        <div className="flex-shrink-0 text-center sm:text-left">
          {/* ... Progress display ... */}
          <h3 className="font-semibold text-gray-800">Review Progress</h3>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-2 bg-blue-500 rounded-full..." style={{ width: `${progressPercent}%` }}/>
             </div>
             <p className="text-sm text-gray-500"> {decidedSections} of {totalSections} sections reviewed ({progressPercent}%) </p>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
          {/* Contact Applicant Button (was already enabled) */}
          <Button
            variant="outline"
            onClick={onContact}
            // Consider adding a disabled state if contact info is truly missing
            // disabled={!applicantContact.email && !applicantContact.phoneNumber}
            title="Contact the applicant" // Added helpful title
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Applicant
          </Button>

           {/* Escalate Button --- REMOVED 'disabled' PROP --- */}
          <Button
            variant="outline"
            className="border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
            onClick={onEscalate}
            // disabled={!allDecided} // <-- REMOVED FOR TESTING
            // Keep title for context, even if not disabled
            title={!allDecided ? `Review all sections first (currently enabled for testing)` : "Escalate for supervisor review"}
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Escalate
          </Button>

           {/* Make Decision Button --- REMOVED 'disabled' PROP --- */}
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onMakeDecision}
            // disabled={!allDecided} // <-- REMOVED FOR TESTING
            // Keep title for context
             title={!allDecided ? `Review all sections first (currently enabled for testing)` : "Make final decision (Approve/Reject)"}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Make Decision
          </Button>
        </div>
      </div>
    </div>
  );
}