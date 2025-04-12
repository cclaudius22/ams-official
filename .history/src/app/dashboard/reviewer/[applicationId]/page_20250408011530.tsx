// src/app/dashboard/reviewer/page.tsx
'use client'

import React, { useState, useMemo } from 'react' // Added useMemo
import ApplicationHeader from '@/components/application/ApplicationHeader'
import AIScanResultsRedesigned from '@/components/application/AIScanResults'
import SectionCard from '@/components/application/SectionCard'
import DecisionFooter from '@/components/application/DecisionFooter' // Import the updated footer
import NoteDialog from '@/components/dialogs/NoteDialog'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog'
import ContactApplicantDialog from '@/components/dialogs/ContactApplicantDialog'; // Import new dialog
// Import placeholder dialogs if you create them later
// import RequestInfoDialog from '@/components/dialogs/RequestInfoDialog';
// import EscalateDialog from '@/components/dialogs/EscalateDialog';
// import MakeDecisionDialog from '@/components/dialogs/MakeDecisionDialog';

import { ApplicationData } from '@/types/application'
import { AIScanResult } from '@/types/aiScan'
import { getApplication } from '@/lib/api/applications' // Assuming these work
import { getAIScanResult, triggerNewScan } from '@/lib/api/scans' // Assuming these work
import { Accordion } from "@/components/ui/accordion";
import {
  FileText, Fingerprint, User, MapPin, Globe, Briefcase, CreditCard, Plane, Shield,
  GraduationCap, Library, Languages, BookOpen, 
  ArrowLeft, Bell, MessageSquare, Eye, Download, HeartPulse, Church, Camera, BookUser, Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Mock data imports (keep for now if API isn't ready)
import { mockApplicationData } from '@/lib/mockdata'
import { mockScanResult } from '@/lib/mockdata'

export default function OfficialReviewPage() {
  // --- State management ---
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<Record<string, 'approve' | 'refer' | 'pending'>>({});
  const [activeNoteSection, setActiveNoteSection] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [finalDecision, setFinalDecision] = useState<'approve' | 'refer' | null>(null); // For original confirm dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // For original confirm dialog

  // Application data state
  const [applicationData, setApplicationData] = useState<ApplicationData>(mockApplicationData);
  const [scanResult, setScanResult] = useState<AIScanResult>(mockScanResult);
  const [isLoading, setIsLoading] = useState(false);

  // --- State for NEW Dialogs ---
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showRequestInfoDialog, setShowRequestInfoDialog] = useState(false); // Placeholder
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);       // Placeholder
  const [showMakeDecisionDialog, setShowMakeDecisionDialog] = useState(false); // Placeholder

  // --- Event Handlers & Helper Functions ---
  const getIssuesForSection = (sectionId: string) => {
    return scanResult.issues.filter(issue => issue.sectionId === sectionId);
  };
  const handleApproveSection = (sectionId: string) => {
    setDecisions(prev => ({ ...prev, [sectionId]: 'approve' }));
  };
  const handleReferSection = (sectionId: string) => {
     setDecisions(prev => ({ ...prev, [sectionId]: 'refer' }));
  };
  const handleAddNote = (sectionId: string) => {
    setActiveNoteSection(sectionId);
    setNoteText(notes[sectionId] || '');
  };
  const saveNote = () => {
    if (activeNoteSection) {
      setNotes(prev => ({ ...prev, [activeNoteSection]: noteText }));
      setActiveNoteSection(null);
      setNoteText('');
    }
  };

  // --- Handlers for NEW Footer Actions/Dialogs ---
  const handleOpenContactDialog = () => setShowContactDialog(true);

  const handleOpenRequestInfoDialog = () => {
    setShowContactDialog(false); // Close contact dialog first
    // Logic to prepare for Request Info (e.g., set target applicant?)
    setShowRequestInfoDialog(true); // Open request info dialog (to be built)
    console.log("Opening Request Info Dialog - Placeholder");
    // You'll likely need state here to hold the message being typed
  };

  const handleScheduleCall = () => {
    // Logic to schedule call - TBD
    console.log("Schedule Video Call Clicked - Placeholder");
    alert("Video scheduling not yet implemented."); // Placeholder feedback
  };

  const handleOpenEscalateDialog = () => {
    setShowEscalateDialog(true);
    console.log("Opening Escalate Dialog - Placeholder");
    // You'll likely need state here for escalation reason/notes
  };

  const handleOpenMakeDecisionDialog = () => {
    setShowMakeDecisionDialog(true);
    console.log("Opening Make Decision Dialog - Placeholder");
    // This dialog will likely contain Approve/Reject buttons triggering final submission
  };

  // Submit final decision (example from original ConfirmationDialog)
  // This logic might move into the MakeDecisionDialog submission handler later
  const submitFinalDecision = async (decision: 'approve' | 'reject') => { // Accept decision type
    setIsLoading(true);
    console.log('Submitting final decision:', decision); // Use passed decision
    console.log('Section decisions:', decisions);
    console.log('Notes:', notes);
    try {
      // Replace alert with actual API call
      alert(`Application ${decision === 'approve' ? 'approved' : 'rejected'}`);
      // Close relevant dialogs
      setShowMakeDecisionDialog(false); // Assuming this triggers it
      setShowConfirmDialog(false); // Close old one if still used
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert('Failed to submit decision');
    } finally {
      setIsLoading(false);
    }
  };


  // --- Define Section Icons & Titles ---
  // Using useMemo to prevent recreating this map on every render
  const sectionDefinitions = useMemo(() => ({
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
    // Student Sections
    study: { title: 'Course & Institution', icon: <Library className="h-5 w-5 text-indigo-500" /> },
    cas: { title: 'Confirmation of Acceptance (CAS)', icon: <BookOpen className="h-5 w-5 text-teal-500" /> },
    englishProficiency: { title: 'English Language Proficiency', icon: <Languages className="h-5 w-5 text-rose-500" /> },
    academicQualifications: { title: 'Academic Qualifications', icon: <GraduationCap className="h-5 w-5 text-lime-500" /> },
     // --- ADD NEW SECTION DEFINITIONS ---
     medical: { title: 'Medical Information', icon: <HeartPulse className="h-5 w-5 text-red-600" /> }, // Or Stethoscope
     religiousWorker: { title: 'Religious Worker Details', icon: <Church className="h-5 w-5 text-purple-600" /> }, // Or Scroll

 
  }), []); // Empty dependency array means it only computes once


  // --- Calculate derived data ---
  // Filter the sections to only include those present in the application data
  const availableSectionKeys = useMemo(() =>
      Object.keys(sectionDefinitions)
            .filter(key => applicationData.sections[key]),
      [applicationData.sections, sectionDefinitions]
  );

  const allSectionsDecided = useMemo(() =>
      availableSectionKeys.every(key => decisions[key] === 'approve' || decisions[key] === 'refer'),
      [availableSectionKeys, decisions]
  );

  // Extract contact details safely
  const applicantContact = useMemo(() => ({
        name: `${applicationData.applicantDetails?.givenNames || applicationData.sections?.passport?.data?.givenNames || ''} ${applicationData.applicantDetails?.surname || applicationData.sections?.passport?.data?.surname || ''}`.trim() || null,
        email: applicationData.applicantDetails?.email || null,
        phoneNumber: applicationData.applicantDetails?.phoneNumber || null
    }), [applicationData.applicantDetails, applicationData.sections?.passport?.data]);


  // --- Loading state ---
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading application data...</div>;
  }

  // --- Render JSX ---
  return (
    <div className="flex h-screen bg-gray-50">

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto"> {/* Changed to overflow-y-auto */}
       

        {/* Page Content with Padding */}
        <div className="p-4 md:p-6">
          {/* Application Header */}
          <ApplicationHeader application={applicationData} />

          {/* AI Scan Results */}
          <AIScanResultsRedesigned
            scanResult={scanResult}
            onRefreshScan={() => triggerNewScan(applicationData.applicationId)} // Ensure this function exists and works
          />

          {/* Main Application Sections Accordion */}
          <Accordion type="multiple" className="w-full space-y-3 mt-6">
            {availableSectionKeys.map(sectionKey => {
              const sectionDef = sectionDefinitions[sectionKey as keyof typeof sectionDefinitions];
              const currentSectionData = applicationData.sections[sectionKey];
              // Render SectionCard only if section definition and data exist
              if (!sectionDef || !currentSectionData) return null;

              return (
                <SectionCard
                  key={sectionKey}
                  value={sectionKey} // Use the section key as the unique value
                  title={sectionDef.title}
                  icon={sectionDef.icon}
                  section={currentSectionData} // Pass the specific section data
                  scanIssues={getIssuesForSection(sectionKey)}
                  onApprove={() => handleApproveSection(sectionKey)}
                  onRefer={() => handleReferSection(sectionKey)} // Still needed for internal state? Or remove if Escalate handles referral logic
                  onAddNote={() => handleAddNote(sectionKey)}
                />
              );
            })}
          </Accordion>

          {/* Message if no sections exist */}
          {availableSectionKeys.length === 0 && !isLoading && (
             <div className="p-6 text-center text-gray-500 border rounded-lg mt-6">
                No application sections found for this applicant.
             </div>
          )}

          {/* Decision Footer - STICKY */}
          {/* Wrap footer in a div to manage its position if needed, but sticky on DecisionFooter itself should work */}
           <DecisionFooter
              totalSections={availableSectionKeys.length}
              decidedSections={Object.keys(decisions).length} // Counts sections with 'approve' or 'refer' decision
              allDecided={allSectionsDecided} // Pass the calculated value
              applicantContact={applicantContact} // Pass extracted contact info
              onContact={handleOpenContactDialog}
              onEscalate={handleOpenEscalateDialog}
              onMakeDecision={handleOpenMakeDecisionDialog}
           />
        </div> {/* End Page Content Padding */}
      </div> {/* End Main Content Area */}

      {/* --- Dialogs --- */}
      <NoteDialog
        isOpen={activeNoteSection !== null}
        onClose={() => setActiveNoteSection(null)}
        noteText={noteText}
        onNoteChange={setNoteText}
        onSave={saveNote}
      />

      {/* Confirmation Dialog (Keep or remove depending on final workflow) */}
      {/* <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        decision={finalDecision} // This state might become redundant
        onConfirm={() => submitFinalDecision(finalDecision!)} // Pass decision
      /> */}

      {/* New Contact Dialog */}
       <ContactApplicantDialog
          isOpen={showContactDialog}
          onClose={() => setShowContactDialog(false)}
          contact={applicantContact} // Pass extracted contact info
          onRequestInfo={handleOpenRequestInfoDialog}
          onScheduleCall={handleScheduleCall}
       />

       {/* Placeholder Renders for Future Dialogs */}
       {/* {showRequestInfoDialog && <RequestInfoDialog isOpen={showRequestInfoDialog} onClose={() => setShowRequestInfoDialog(false)} onSubmit={(message) => console.log('Request Info:', message)} />} */}
       {/* {showEscalateDialog && <EscalateDialog isOpen={showEscalateDialog} onClose={() => setShowEscalateDialog(false)} onSubmit={(reason) => console.log('Escalate Reason:', reason)} />} */}
       {/* {showMakeDecisionDialog && <MakeDecisionDialog isOpen={showMakeDecisionDialog} onClose={() => setShowMakeDecisionDialog(false)} onSubmit={submitFinalDecision} />} */}

    </div> // End flex h-screen
  );
}