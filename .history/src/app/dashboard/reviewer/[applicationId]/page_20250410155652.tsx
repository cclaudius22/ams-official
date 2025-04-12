// src/app/dashboard/reviewer/[applicationId]/page.tsx // Renamed file for dynamic routing
'use client'

import React, { useState, useMemo } from 'react'
import ApplicationHeader from '@/components/application/ApplicationHeader'
// Corrected Import Name: Assuming AIScanResults is the component you intend to use
import AIScanResults from '@/components/application/AIScanResults'
import SectionCard from '@/components/application/SectionCard'
import DecisionFooter from '@/components/application/DecisionFooter'
import NoteDialog from '@/components/dialogs/NoteDialog'
import ContactApplicantDialog from '@/components/dialogs/ContactApplicantDialog';
// --- Import NEW Dialogs ---
import ApproveDialog from '@/components/dialogs/ApproveDialog'; // Import Approve Dialog
import RejectDialog from '@/components/dialogs/RejectDialog';   // Import Reject Dialog
import EscalateDialog from '@/components/dialogs/EscalateDialog'; // Keep placeholder or import if exists

import { ApplicationData } from '@/types/application'
import { AIScanResult } from '@/types/aiScan'
// import { getApplication } from '@/lib/api/applications' // Keep for later
// import { getAIScanResult, triggerNewScan } from '@/lib/api/scans' // Keep for later
import { Accordion } from "@/components/ui/accordion";
import {
  FileText, Fingerprint, User, MapPin, Globe, Briefcase, CreditCard, Plane, Shield,
  GraduationCap, Library, Languages, BookOpen,
  Eye, Download, HeartPulse, Church, Camera, BookUser, Building2
} from 'lucide-react'
// Mock data imports
import { mockApplicationData } from '@/lib/mockdata'
import { mockScanResult } from '@/lib/mockdata'

// import { useParams } from 'next/navigation'; // Keep for later

export default function OfficialReviewPage() {
  // const params = useParams();
  // const applicationId = params?.applicationId as string; // Get ID from URL when using dynamic routes

  // --- State management ---
  const [notes, setNotes] = useState<Record<string, string>>({}); // For section notes
  const [decisions, setDecisions] = useState<Record<string, 'approve' | 'refer' | 'pending'>>({}); // For section review status UI
  const [activeNoteSection, setActiveNoteSection] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // --- Mock Data State (Replace with useQuery later) ---
  const [applicationData, setApplicationData] = useState<ApplicationData>(mockApplicationData);
  const [scanResult, setScanResult] = useState<AIScanResult>(mockScanResult);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false); // Loading state for final decision

  // --- State for Dialogs ---
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false); // State for Approve Dialog
  const [showRejectDialog, setShowRejectDialog] = useState(false);   // State for Reject Dialog
  // Remove unused/placeholder states if not needed yet
  // const [showRequestInfoDialog, setShowRequestInfoDialog] = useState(false);

  // --- Event Handlers & Helper Functions ---
  const getIssuesForSection = (sectionId: string): AIScanResult['issues'] => {
    return scanResult?.issues?.filter(issue => issue.sectionId === sectionId) || [];
  };
  // Section level approve/refer still useful for UI indicators maybe
  const handleApproveSection = (sectionId: string) => { setDecisions(prev => ({ ...prev, [sectionId]: 'approve' })); };
  const handleReferSection = (sectionId: string) => { setDecisions(prev => ({ ...prev, [sectionId]: 'refer' })); };
  const handleAddNote = (sectionId: string) => { setActiveNoteSection(sectionId); setNoteText(notes[sectionId] || ''); };
  const saveNote = () => { /* ... */ }; // Keep saveNote logic
  const handleOpenContactDialog = () => setShowContactDialog(true);
  const handleOpenEscalateDialog = () => setShowEscalateDialog(true);
  // --- NEW Handlers for Approve/Reject Dialogs ---
  const handleOpenApproveDialog = () => setShowApproveDialog(true);
  const handleOpenRejectDialog = () => setShowRejectDialog(true);

  // --- Handlers for Dialog Submissions ---
  const handleEscalateSubmit = (reasons: string[], notes: string) => {
    console.log("Escalation Submitted - Placeholder");
    // TODO: Add API call (useMutation)
    setShowEscalateDialog(false);
  };

  // Final decision handler (called by ApproveDialog and RejectDialog)
  const handleSubmitFinalDecision = async (decision: 'approve' | 'reject', rationale?: string) => {
    setIsSubmittingDecision(true);
    console.log('Submitting final decision:', decision);
    console.log('Rationale Notes:', rationale);
    try {
      // --- Replace alert with actual API call using TanStack useMutation ---
      // Example: decisionMutation.mutate({ applicationId: applicationData?.applicationId, decision, rationale });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      alert(`Mock API: Application ${decision === 'approve' ? 'approved' : 'rejected'}. Rationale: ${rationale || 'None'}`);

      // --- On successful API call (inside mutation's onSuccess): ---
      setShowApproveDialog(false); // Close relevant dialog
      setShowRejectDialog(false);
      // Maybe refetch application data or navigate away?
      // queryClient.invalidateQueries({ queryKey: ['application', applicationId] });
      // router.push('/dashboard/reviewer/queue');

    } catch (error) {
      console.error('Error submitting final decision:', error);
      alert('Failed to submit final decision.');
      // Keep dialog open on error? Maybe show error message in dialog?
    } finally {
      setIsSubmittingDecision(false); // Reset loading state
    }
  };


  // --- Define Section Icons & Titles ---
  const sectionDefinitions = useMemo(() => ({
    // --- Your full list of section definitions as provided before ---
    passport: { title: 'Passport Information', icon: <FileText className="h-5 w-5 text-blue-500" /> },
    kyc: { title: 'Identity Verification', icon: <Fingerprint className="h-5 w-5 text-purple-500" /> },
    residency: { title: 'Residence Information', icon: <MapPin className="h-5 w-5 text-red-500" /> },
    photo: { title: 'Visa Photo Analysis', icon: <Camera className="h-5 w-5 text-gray-500" /> },
    visas: { title: 'Existing Visas & Status', icon: <BookUser className="h-5 w-5 text-orange-500" /> },
    professional: { title: 'Professional Information', icon: <Briefcase className="h-5 w-5 text-orange-500" /> },
    financial: { title: 'Financial Information', icon: <CreditCard className="h-5 w-5 text-emerald-500" /> },
    travel: { title: 'Travel Details', icon: <Plane className="h-5 w-5 text-cyan-500" /> },
    travelInsurance: { title: 'Travel Insurance', icon: <Shield className="h-5 w-5 text-pink-500" /> },
    documents: { title: 'Required Documents', icon: <FileText className="h-5 w-5 text-amber-500" /> },
    sponsorshipAndRole: { title: 'Sponsorship & Role Details', icon: <Building2 className="h-5 w-5 text-cyan-600" /> },
    study: { title: 'Course & Institution', icon: <Library className="h-5 w-5 text-indigo-500" /> },
    cas: { title: 'Confirmation of Acceptance (CAS)', icon: <BookOpen className="h-5 w-5 text-teal-500" /> },
    englishProficiency: { title: 'English Language Proficiency', icon: <Languages className="h-5 w-5 text-rose-500" /> },
    academicQualifications: { title: 'Academic Qualifications', icon: <GraduationCap className="h-5 w-5 text-lime-500" /> },
    medical: { title: 'Medical Information', icon: <HeartPulse className="h-5 w-5 text-red-600" /> },
    religiousWorker: { title: 'Religious Worker Details', icon: <Church className="h-5 w-5 text-purple-600" /> },
  }), []);


  // --- Calculate derived data ---
  const availableSectionKeys = useMemo(() =>
    // Ensure applicationData and sections exist before accessing keys
    Object.keys(sectionDefinitions).filter(key => applicationData?.sections?.[key]),
    [applicationData?.sections, sectionDefinitions]
  );
  const allSectionsDecided = useMemo(() =>
    // This logic might need refinement based on what 'decided' means now (approve/refer flags?)
    availableSectionKeys.every(key => decisions[key] === 'approve' || decisions[key] === 'refer'),
    [availableSectionKeys, decisions]
  );
  const applicantContact = useMemo(() => {
      // Extract contact info safely
      const passportData = applicationData?.sections?.passport?.data;
      const name = (passportData?.givenNames && passportData?.surname)
        ? `${passportData.givenNames} ${passportData.surname}`.trim()
        : (applicationData?.applicantDetails?.givenNames && applicationData?.applicantDetails?.surname)
        ? `${applicationData.applicantDetails.givenNames} ${applicationData.applicantDetails.surname}`.trim()
        : null;
      const email = applicationData?.applicantDetails?.email || null;
      const phoneNumber = applicationData?.applicantDetails?.phoneNumber || null;
      return { name, email, phoneNumber };
    }, [applicationData?.applicantDetails, applicationData?.sections?.passport?.data]);


  // --- Loading state ---
  const isLoading = false; // Placeholder for TanStack Query state
  if (isLoading) {
    return <div className="flex h-full items-center justify-center">Loading application data...</div>;
  }
  if (!applicationData) {
    return <div className="flex h-full items-center justify-center">Could not load application data.</div>;
  }


  // --- Render JSX ---
  return (
    // No outer div needed, layout provides structure
    <>
      <div className="space-y-6">
        {/* Application Header */}
        <ApplicationHeader application={applicationData} />

        {/* AI Scan Results */}
        {scanResult ? (
            <AIScanResultsRedesigned // Using the component name from your working version
                scanResult={scanResult}
                onRefreshScan={() => console.log("Refresh Scan Placeholder")}
            />
        ) : (
           <div className="p-4 text-center border rounded bg-gray-50 text-gray-500">Loading AI Scan Results...</div>
        )}

        {/* Main Application Sections Accordion */}
        <Accordion type="multiple" className="w-full space-y-3 mt-6">
          {availableSectionKeys.map(sectionKey => {
            const sectionDef = sectionDefinitions[sectionKey as keyof typeof sectionDefinitions];
            const currentSectionData = applicationData.sections[sectionKey];
            if (!sectionDef || !currentSectionData) return null;

            return (
              <SectionCard
                key={sectionKey}
                value={sectionKey}
                title={sectionDef.title}
                icon={sectionDef.icon}
                section={currentSectionData}
                scanIssues={getIssuesForSection(sectionKey)}
                onApprove={() => handleApproveSection(sectionKey)} // Section-level (UI only for now)
                onRefer={() => handleReferSection(sectionKey)}     // Section-level (UI only for now)
                onAddNote={() => handleAddNote(sectionKey)}
              />
            );
          })}
        </Accordion>

        {/* Message if no sections exist */}
        {availableSectionKeys.length === 0 && ( /* ... */ )}

        {/* Decision Footer */}
         <DecisionFooter
            totalSections={availableSectionKeys.length}
            decidedSections={Object.keys(decisions).length}
            allDecided={allSectionsDecided} // Pass flag, disable logic is inside footer
            applicantContact={applicantContact}
            onContact={handleOpenContactDialog}
            onEscalate={handleOpenEscalateDialog}
            // --- Pass NEW handlers ---
            onApprove={handleOpenApproveDialog}
            onReject={handleOpenRejectDialog}
         />
      </div> {/* End spacing wrapper div */}

      {/* --- Dialogs --- */}
      <NoteDialog
        isOpen={activeNoteSection !== null}
        onClose={() => setActiveNoteSection(null)}
        noteText={noteText}
        onNoteChange={setNoteText}
        onSave={saveNote}
      />
      <ContactApplicantDialog
         isOpen={showContactDialog}
         onClose={() => setShowContactDialog(false)}
         contact={applicantContact}
         onRequestInfo={() => console.log("Request Info Placeholder")} // Placeholder action
         onScheduleCall={handleScheduleCall}
      />
       {/* Render Escalate Dialog Placeholder/Component */}
       {/* <EscalateDialog
          isOpen={showEscalateDialog}
          onClose={() => setShowEscalateDialog(false)}
          applicationData={applicationData}
          onSubmit={handleEscalateSubmit}
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
       {/* Remove old MakeDecisionDialog render if it was present */}

    </>
  );
}