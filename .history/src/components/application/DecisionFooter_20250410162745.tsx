// src/components/application/DecisionFooter.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
// Icons needed: Contact, Escalate, Approve, Reject
import { MessageSquare, ArrowUpCircle, CheckCircle, XCircle } from 'lucide-react';

// --- Define Applicant Contact Details Structure ---
interface ApplicantContact {
    email?: string | null;
    phoneNumber?: string | null;
    name?: string | null; // Keep if used by contact modal
}

// --- Define Props ---
interface DecisionFooterProps {
  totalSections: number;
  decidedSections: number; // Number of sections marked 'approve' or 'refer'
  allDecided: boolean; // True if all sections have a decision
  applicantContact: ApplicantContact;
  onContact: () => void; // Opens contact dialog
  onEscalate: () => void; // Opens escalate dialog
  // --- UPDATED PROPS ---
  onApprove: () => void; // Opens approve dialog
  onReject: () => void;  // Opens reject dialog
}

export default function DecisionFooter({
  totalSections,
  decidedSections,
  allDecided,
  applicantContact,
  onContact,
  onEscalate,
  onApprove, // Destructure new prop
  onReject   // Destructure new prop
}: DecisionFooterProps) {

  // Calculate progress percentage
  const progressPercent = totalSections > 0 ? Math.round((decidedSections / totalSections) * 100) : 0;

  // Determine if final actions should be enabled (based on all sections decided)
  // Set to true temporarily for testing if needed
  const enableFinalActions = allDecided;
  // const enableFinalActions = true; // <-- UNCOMMENT FOR TESTING

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-md border sticky bottom-4 z-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left Side: Progress Indicator */}
        <div className="flex-shrink-0 text-center sm:text-left">
          <h3 className="font-semibold text-gray-800 text-sm">Review Progress</h3> {/* Adjusted size */}
          <div className="flex items-center gap-2 mt-1">
             <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden"> {/* Adjusted height */}
                <div
                   className="h-1.5 bg-blue-500 rounded-full transition-all duration-300 ease-in-out"
                   style={{ width: `${progressPercent}%` }}
                />
             </div>
             <p className="text-xs text-gray-500"> {/* Adjusted size */}
                {decidedSections} of {totalSections} sections reviewed ({progressPercent}%)
             </p>
          </div>
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-wrap justify-center sm:justify-end gap-2">
          {/* Contact Applicant Button */}
          <Button
            variant="outline"
            size="sm" // Consistent size
            onClick={onContact}
            disabled={!applicantContact.email && !applicantContact.phoneNumber} // Disable if no contact info
            title={!applicantContact.email && !applicantContact.phoneNumber ? "No contact info available" : "Contact the applicant"}
          >
            <MessageSquare className="h-4 w-4 mr-1.5" /> {/* Adjusted margin */}
            Contact Applicant
          </Button>

           {/* Escalate Button */}
          <Button
            variant="outline"
            size="sm" // Consistent size
            className="border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
            onClick={onEscalate}
            disabled={!enableFinalActions} // Use the derived boolean
            title={!enableFinalActions ? `Review all ${totalSections} sections first` : "Escalate for supervisor review"}
          >
            <ArrowUpCircle className="h-4 w-4 mr-1.5" /> {/* Adjusted margin */}
            Escalate
          </Button>

           {/* --- Reject Button --- */}
           <Button
             variant="destructive" // Destructive style
             size="sm" // Consistent size
             onClick={onReject} // Use onReject handler
             disabled={!enableFinalActions} // Use the derived boolean
             title={!enableFinalActions ? `Review all ${totalSections} sections first` : "Reject this application"}
           >
             <XCircle className="h-4 w-4 mr-1.5" /> {/* Adjusted margin */}
             Reject
           </Button>

           {/* --- Approve Button --- */}
          <Button
            // variant="default" // Default often maps to primary color
            className="bg-green-600 hover:bg-green-700 text-white" // Explicit green
            size="sm" // Consistent size
            onClick={onApprove} // Use onApprove handler
            disabled={!enableFinalActions} // Use the derived boolean
             title={!enableFinalActions ? `Review all ${totalSections} sections first` : "Approve this application"}
          >
            <CheckCircle className="h-4 w-4 mr-1.5" /> {/* Adjusted margin */}
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}