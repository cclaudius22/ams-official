// src/app/dashboard/reviewer/[applicationId]/page.tsx
'use client'

import React, { useState, useMemo } from 'react'
import ApplicationHeader from '@/components/application/ApplicationHeader'
import AIScanResultsRedesigned from '@/components/application/AIScanResults' // Corrected import
import SectionCard from '@/components/application/SectionCard'
import DecisionFooter from '@/components/application/DecisionFooter'
import NoteDialog from '@/components/dialogs/NoteDialog'
// import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog' // Can remove if not used
import ContactApplicantDialog from '@/components/dialogs/ContactApplicantDialog';
// --- Import NEW Approve/Reject/Escalate Dialogs ---
import ApproveDialog from '@/components/dialogs/ApproveDialog'; // Import Approve Dialog
import RejectDialog from '@/components/dialogs/RejectDialog';   // Import Reject Dialog
import EscalateDialog from '@/components/dialogs/EscalateDialog'; // Assuming this exists or create placeholder
// --- Remove Old Dialog Import ---
// import MakeDecisionDialog from '@/components/dialogs/MakeDecisionDialog';
// Import placeholder dialogs if you create them later
// import RequestInfoDialog from '@/components/dialogs/RequestInfoDialog';

import { ApplicationData } from '@/types/application'
import { AIScanResult } from '@/types/aiScan'
// import { getApplication } from '@/lib/api/applications' // Keep for later
// import { getAIScanResult, triggerNewScan } from '@/lib/api/scans' // Keep for later
import { Accordion } from "@/components/ui/accordion";
import {
  FileText, Fingerprint, User, MapPin, Globe, Briefcase, CreditCard, Plane, Shield,
  GraduationCap, Library, Languages, BookOpen,
  Eye, Download, HeartPulse, Church, Camera, BookUser, Building2
  // Removed unused icons like ArrowLeft, Bell, MessageSquare
} from 'lucide-react'
// import { Button } from '@/components/ui/button' // Not needed directly
// import { Badge } from '@/components/ui/badge' // Not needed directly

// Mock data imports
import { mockApplicationData } from '@/lib/mockdata'
import { mockScanResult } from '@/lib/mockdata'

// import { useParams } from 'next/navigation'; // Keep for later

export default function OfficialReviewPage() {
  // const params = useParams();
  // const applicationId = params?.applicationId as string;

  // --- State management ---
  const [notes, setNotes] = useState<Record<string, string>>({}); // For section notes
  const [decisions, setDecisions] = useState<Record<string, 'approve' | 'refer' | 'pending'>>({}); // For section review status UI
  const [activeNoteSection, setActiveNoteSection] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  // const [finalDecision, setFinalDecision] = useState<'approve' | 'refer' | null>(null); // Can remove if old ConfirmationDialog is gone
  // const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Can remove if old ConfirmationDialog is gone

  // TODO: Replace with useQuery later
  const [applicationData, setApplicationData] = useState<ApplicationData>(mockApplicationData);
  const [scanResult, setScanResult] = useState<AIScanResult>(mockScanResult);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false); // Use this for dialog loading state

  // --- State for Dialogs ---
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showRequestInfoDialog, setShowRequestInfoDialog] = useState(false); // Placeholder state
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  // --- NEW State for Approve/Reject Dialogs ---
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  // --- Remove old state ---
  // const [showMakeDecisionDialog, setShowMakeDecisionDialog] = useState(false);


  // --- Event Handlers & Helper Functions ---
  const getIssuesForSection = (sectionId: string): AIScanResult['issues'] => { /* ... as before ... */ };
  const handleApproveSection = (sectionId: string) => { /* ... as before ... */ };
  const handleReferSection = (sectionId: string) => { /* ... as before ... */ }; // Keep for section-level UI state if needed
  const handleAddNote = (sectionId: string) => { /* ... as before ... */ };
  const saveNote = () => { /* ... as before ... */ };
  const handleOpenContactDialog = () => setShowContactDialog(true);
  const handleOpenRequestInfoDialog = () => { /* ... as before ... */ };
  const handleScheduleCall = () => { /* ... as before ... */ };
  const handleOpenEscalateDialog = () => setShowEscalateDialog(true);
  // --- NEW Handlers for Approve/Reject Dialogs ---
  const handleOpenApproveDialog = () => setShowApproveDialog(true);
  const handleOpenRejectDialog = () => setShowRejectDialog(true);
  // --- Remove old handler ---
  // const handleOpenMakeDecisionDialog = () => { /* ... */ };

  // --- Handler for Escalate Dialog Submission ---
  const handleEscalateSubmit = (reasons: string[], notes: string) => {
    console.log("Escalation Submitted - Placeholder");
    console.log("Reasons:", reasons);
    console.log("Notes:", notes);
    // TODO: Add API call (useMutation)
    setShowEscalateDialog(false); // Close dialog
  };

  // --- Handler for FINAL Decision Submission (called by Approve/Reject Dialogs) ---
  const handleSubmitFinalDecision = async (decision: 'approve' | 'reject', rationale?: string) => {
    setIsSubmittingDecision(true); // Set loading state
    console.log('Submitting final decision:', decision);
    console.log('Rationale Notes:', rationale);
    // Add section decisions if needed for audit log on backend
    // console.log('Section decisions (at time of decision):', decisions);
    try {
      // Replace alert with actual API call using TanStack useMutation
      // Example: decisionMutation.mutate({ applicationId, decision, rationale });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      alert(`Mock API: Application ${decision === 'approve' ? 'approved' : 'rejected'}. Rationale: ${rationale || 'None'}`);

      // On successful API call (inside mutation's onSuccess):
      setShowApproveDialog(false); // Close relevant dialog
      setShowRejectDialog(false);
      // Maybe refetch application data or navigate away?
      // queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      // router.push('/dashboard/reviewer/queue');

    } catch (error) {
      console.error('Error submitting final decision:', error);
      alert('Failed to submit final decision.');
      // Keep dialog open on error?
    } finally {
      setIsSubmittingDecision(false); // Reset loading state
    }
  };


  // --- Define Section Icons & Titles ---
  const sectionDefinitions = useMemo(() => ({ /* ... as before ... */ }), []);


  // --- Calculate derived data ---
  const availableSectionKeys = useMemo(() => Object.keys(sectionDefinitions).filter(key => applicationData?.sections?.[key]), [applicationData?.sections, sectionDefinitions]);
  const allSectionsDecided = useMemo(() => availableSectionKeys.every(key => decisions[key] === 'approve' || decisions[key] === 'refer'), [availableSectionKeys, decisions]);
  const applicantContact = useMemo(() => ({ /* ... as before ... */ }), [applicationData?.applicantDetails, applicationData?.sections?.passport?.data]);


  // --- Loading state (will use useQuery later) ---
  const isLoading = false; // Placeholder - Replace with useQuery isLoading
  if (isLoading) { /* ... */ }
  if (!applicationData) { /* ... */ }


  // --- Render JSX ---
  return (
    <>
      <div className="space-y-6">
        {/* Application Header */}
        <ApplicationHeader application={applicationData} />

        {/* AI Scan Results */}
        {scanResult ? ( <AIScanResultsRedesigned scanResult={scanResult} onRefreshScan={() => console.log("Refresh Scan Placeholder")} />) : ( /* Loading... */ )}

        {/* Main Application Sections Accordion */}
        <Accordion type="multiple" className="w-full space-y-3 mt-6">
          {availableSectionKeys.map(sectionKey => {
            const sectionDef = sectionDefinitions[sectionKey as keyof typeof sectionDefinitions];
            const currentSectionData = applicationData.sections[sectionKey];
            if (!sectionDef || !currentSectionData) return null;

            return (
              <SectionCard
                key={sectionKey} value={sectionKey} title={sectionDef.title}
                icon={sectionDef.icon} section={currentSectionData}
                scanIssues={getIssuesForSection(sectionKey)}
                onApprove={() => handleApproveSection(sectionKey)}
                onRefer={() => handleReferSection(sectionKey)}
                onAddNote={() => handleAddNote(sectionKey)}
              />
            );
          })}
        </Accordion>

        {/* Message if no sections exist */}
        {availableSectionKeys.length === 0 && !isLoading && ( /* ... */ )}

        {/* Decision Footer */}
        {applicationData && (
           <DecisionFooter
              totalSections={availableSectionKeys.length}
              decidedSections={Object.keys(decisions).length}
              allDecided={allSectionsDecided} // Pass flag
              applicantContact={applicantContact}
              onContact={handleOpenContactDialog}
              onEscalate={handleOpenEscalateDialog}
              // --- Pass NEW handlers ---
              onApprove={handleOpenApproveDialog}
              onReject={handleOpenRejectDialog}
           />
        )}
      </div>

      {/* --- Dialogs --- */}
      <NoteDialog /* ... props ... */ />
      <ContactApplicantDialog /* ... props ... */ />

      {/* Placeholder Escalate Dialog */}
      {/* Ensure EscalateDialog component exists or is created */}
      {/* <EscalateDialog
          isOpen={showEscalateDialog}
          onClose={() => setShowEscalateDialog(false)}
          applicationData={applicationData}
          onSubmit={handleEscalateSubmit} // Pass submission handler
       /> */}

       {/* --- Render NEW Approve/Reject Dialogs --- */}
       <ApproveDialog
          isOpen={showApproveDialog}
          onClose={() => setShowApproveDialog(false)}
          applicationData={applicationData}
          onSubmitDecision={handleSubmitFinalDecision} // Use the shared submit handler
          isSubmitting={isSubmittingDecision} // Pass loading state
       />
       <RejectDialog
          isOpen={showRejectDialog}
          onClose={() => setShowRejectDialog(false)}
          applicationData={applicationData}
          onSubmitDecision={handleSubmitFinalDecision} // Use the shared submit handler
          isSubmitting={isSubmittingDecision} // Pass loading state
       />
       {/* --- Remove Old Dialog --- */}
       {/* <MakeDecisionDialog ... /> */}

       {/* Placeholder RequestInfo Dialog */}
       {/* {showRequestInfoDialog && <RequestInfoDialog ... />} */}
    </>
  );
}