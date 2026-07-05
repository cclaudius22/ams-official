'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ApplicationHeader from '@/components/application/ApplicationHeader'
import RecommendationSummaryPanel from '@/components/application/RecommendationSummaryPanel'
import GlassBoxTracePanel from '@/components/application/GlassBoxTracePanel'
import EvidencePanel from '@/components/application/EvidencePanel'
import OVIntelligencePanel from '@/components/application/OVIntelligencePanel'
import RFIPanel from '@/components/application/RFIPanel'
import SectionCard from '@/components/application/SectionCard'
import DecisionFooter from '@/components/application/DecisionFooter'
import NoteDialog from '@/components/dialogs/NoteDialog'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog'
import ContactApplicantDialog from '@/components/dialogs/ContactApplicantDialog';
// Import NEW dialogs
import EscalateDialog from '@/components/dialogs/EscalateDialog';
import ApproveDialog from '@/components/dialogs/ApproveDialog';
import RejectDialog from '@/components/dialogs/RejectDialog';
// Import placeholder dialogs if you create them later
// import RequestInfoDialog from '@/components/dialogs/RequestInfoDialog';

import { ApplicationData } from '@/types/application'
import { AIScanResult } from '@/types/aiScan'
import type { DISApplicationView } from '@/api-contracts/dis'
import type { OVAssessment } from '@/api-contracts/ov'
import type { RfiSummary } from '@/data/providers/deepSetRfiAdapter'
import { syntheticOvAssessment } from '@/lib/syntheticOvAssessment'
import { disViewToLegacyScan } from '@/lib/disViewAdapter'
import { Accordion } from "@/components/ui/accordion";
import {
  FileText, Fingerprint, User, MapPin, Globe, Briefcase, CreditCard, Plane, Shield,
  GraduationCap, Library, Languages, BookOpen,
  ArrowLeft, Bell, MessageSquare, Eye, Download, HeartPulse, Church, Camera, BookUser, Building2,
  Loader2, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Mock data imports (fallback if API fails)
import { mockApplicationData } from '@/lib/mockdata'
import { mockScanResult } from '@/lib/mockdata'
import { mockDISApplicationView } from '@/lib/mockDISData'

// Default empty scan result - use mock as default to ensure page always renders
const emptyScanResult: AIScanResult = mockScanResult;

const asText = (value: unknown): string => (typeof value === 'string' ? value : '')

function disViewToApplicationData(disView: DISApplicationView, fallbackId: string): ApplicationData {
  const passportExtraction = disView.document_extractions?.find((e) => e.document_type === 'PASSPORT')
  const passport = (passportExtraction?.normalised_fields ?? {}) as Record<string, unknown>
  const givenNames = asText(passport.given_names)
  const surname = asText(passport.surname)
  const fullName = `${givenNames} ${surname}`.trim()

  return {
    applicationId: disView.source_application_id || fallbackId,
    userId: '',
    visaTypeId: 'skilled-worker',
    currentStage: disView.queue_state || 'READY_FOR_REVIEW',
    verificationPath: 'standard',
    processingType: 'standard',
    status: 'review_required',
    sections: {
      passport: {
        status: 'verified',
        validationStatus: 'valid',
        updatedAt: disView.submitted_at,
        data: {
          sectionId: 'passport',
          documentNumber: asText(passport.document_number),
          surname,
          givenNames,
          dateOfBirth: asText(passport.date_of_birth),
          dateOfExpiry: asText(passport.expiry_date),
          nationality: asText(passport.nationality_code),
          gender: asText(passport.sex),
          documentType: 'Passport',
          issuingCountry: asText(passport.issuing_country_code),
          issueDate: asText(passport.issue_date),
          mrzData: {
            line1: asText(passport.mrz_line_1),
            line2: asText(passport.mrz_line_2),
          },
          scanQuality: 'high',
        },
      },
    },
    progress: {
      stageProgress: [],
      overallProgress: 100,
      lastUpdated: disView.submitted_at,
    },
    metadata: {},
    timeline: [],
    applicantDetails: {
      name: fullName || undefined,
      givenNames: givenNames || undefined,
      surname: surname || undefined,
    },
    createdAt: disView.submitted_at,
    updatedAt: disView.submitted_at,
    sourceChannel: disView.source_channel,
    disApplicationId: disView.dis_application_id,
    disView,
    disQueueState: disView.queue_state,
  }
}

export default function OfficialReviewPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.applicationId as string;
  // --- State management ---
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<Record<string, 'approve' | 'refer' | 'pending'>>({});
  const [activeNoteSection, setActiveNoteSection] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [finalDecision, setFinalDecision] = useState<'approve' | 'refer' | null>(null); // For original confirm dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // For original confirm dialog

  // Application data state - default to mock data to ensure page always renders
  const [applicationData, setApplicationData] = useState<ApplicationData>(mockApplicationData);
  const [scanResult, setScanResult] = useState<AIScanResult>(mockScanResult);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Task 5 — per-case ownership guard. The deep review fetch below returns
  // 403 when the signed-in officer isn't assigned this case (admin bypasses
  // this entirely, server-side). That's a hard stop: render a dedicated
  // "not yours" state instead of falling through to the mock-data fallbacks
  // below (which exist for OTHER failure modes — a 403 must never look like
  // a loaded case). A 401 means the session is no longer valid — redirect to
  // sign-in rather than showing any case content.
  const [accessDenied, setAccessDenied] = useState(false);

  // DIS integration state (Phase 2 — task 2.0)
  // disView is the canonical DIS processing result. scanResult above is derived
  // from it via disViewToLegacyScan() for backwards compat with existing components.
  // Task 2.1 replaces AIScanResultsRedesigned with ComponentScoresDashboard, at
  // which point scanResult state and the adapter are removed.
  const [disView, setDisView] = useState<DISApplicationView>(mockDISApplicationView);

  // OV-IP assessment (Panel 4). Per-case from the enriched deep_set when present
  // (Slice 3a); null → the page uses syntheticOvAssessment() (legacy/demo ids).
  const [ovAssessment, setOvAssessment] = useState<OVAssessment | null>(null);

  // RFI scaffold (Slice 3b). Present only on cases with an enabled rfi_lifecycle
  // (the 3 heroes). Drives the RFIPanel walkthrough; null → no panel.
  const [rfi, setRfi] = useState<RfiSummary | null>(null);

  // Mock application IDs used by Rachel Johnson (Demo)
  const demoApplicationIds = ['VK-2024-1835', 'VK-2024-1836', 'UK-2024-1837', 'UK-2024-1838'];

  // Fetch application data from API
  useEffect(() => {
    let active = true; // guards against a stale/out-of-order response landing after the id changed

    async function fetchApplicationData() {
      if (!applicationId) return;

      setIsLoading(true);
      setError(null);
      setAccessDenied(false);

      // Special case: Demo applications show mock data with full details
      if (demoApplicationIds.includes(applicationId)) {
        console.log('Using mock data for demo application:', applicationId);
        setApplicationData(mockApplicationData);
        setDisView(mockDISApplicationView);
        setScanResult(disViewToLegacyScan(mockDISApplicationView));
        setIsLoading(false);
        return;
      }

      // Slice 3a — ams-demo deep_set per-case review. Try the enriched corpus
      // FIRST: a real DISApplicationView (Panels 1–3) + a real OVAssessment
      // (Panel 4), applicant-specific, with NO mock/synthetic fallback. The
      // route 404s for non-deep_set ids → we fall through to the DIS read layer.
      setOvAssessment(null);
      setRfi(null);
      let deepLoaded = false;
      try {
        const reviewRes = await fetch(`/api/ams-demo/applications/${applicationId}/review`);
        if (!active) return;

        // Task 5 — 401: the session is no longer valid. Redirect to sign-in
        // rather than rendering any case content (mock or otherwise).
        if (reviewRes.status === 401) {
          setIsLoading(false);
          router.push('/signin');
          return;
        }

        // Task 5 — 403: this case is assigned to a different officer (admin
        // bypasses the guard server-side, so this can only mean "not yours").
        // Stop here — do NOT fall through to the DIS/application-detail
        // fetches below, which would otherwise paint over this with mock data.
        if (reviewRes.status === 403) {
          setAccessDenied(true);
          setIsLoading(false);
          return;
        }

        if (reviewRes.ok) {
          const reviewJson = await reviewRes.json();
          if (!active) return;
          if (reviewJson.success && reviewJson.data?.disView) {
            const deepDisView = reviewJson.data.disView as DISApplicationView;
            setDisView(deepDisView);
            setScanResult(disViewToLegacyScan(deepDisView));
            setApplicationData(disViewToApplicationData(deepDisView, applicationId));
            setOvAssessment(reviewJson.data.ovAssessment ?? null);
            setRfi(reviewJson.data.rfi ?? null);
            deepLoaded = true;
          }
        }
      } catch (reviewErr) {
        if (active) console.error('Error fetching deep review (falling through):', reviewErr);
      }

      // Phase 2F.4 — wire Panels 1 & 2 to the DIS read layer (replica/mock).
      // Skipped when the deep_set review already populated the panels. Reset to
      // the mock fixture FIRST so a failed/slow fetch for THIS id can never leave
      // the previous applicant's DIS view on screen, then fetch the assembled
      // DISApplicationView from the replica-backed composite route
      // (DIS_DATA_PROVIDER selects mock | replica). `active` guards against a
      // stale response landing after the id changed.
      if (!deepLoaded) {
        setDisView(mockDISApplicationView);
        try {
          const disResponse = await fetch(`/api/dis/applications/${applicationId}/view`);
          if (!active) return;
          if (disResponse.ok) {
            const disResult = await disResponse.json();
            if (!active) return;
            if (disResult.success && disResult.data) {
              setDisView(disResult.data);
            }
          }
        } catch (disErr) {
          if (active) console.error('Error fetching DIS view (keeping mock fallback):', disErr);
        }
      }

      try {
        console.log('Fetching application:', applicationId);
        const response = await fetch(`/api/applications/${applicationId}`);
        const result = await response.json();
        console.log('API result:', result);

        if (result.success && result.data) {
          const apiData = result.data;

          // Transform API response to ApplicationData format
          const transformedData: ApplicationData = {
            applicationId: apiData.id || apiData.applicationId || applicationId,
            userId: apiData.userId || '',
            visaTypeId: apiData.visaTypeId || apiData.visaType || 'unknown',
            currentStage: apiData.currentStage || 'INITIAL_REVIEW',
            verificationPath: apiData.verificationPath || 'standard',
            processingType: apiData.processingType || 'standard',
            status: apiData.status || 'submitted',
            sections: apiData.sections || {},
            progress: apiData.progress || {
              stageProgress: [],
              overallProgress: 0,
              lastUpdated: new Date().toISOString(),
            },
            metadata: apiData.metadata || {},
            timeline: apiData.timeline || [],
            applicantDetails: apiData.applicantDetails,
            createdAt: apiData.createdAt,
            updatedAt: apiData.updatedAt,
          };

          console.log('Transformed data:', transformedData);
          setApplicationData(transformedData);

          // Transform scan result - convert string dates to Date objects
          if (apiData.scanResult) {
            const scanData = apiData.scanResult;
            const transformedScan: AIScanResult = {
              status: scanData.status || 'completed',
              scanStartedAt: scanData.scanStartedAt ? new Date(scanData.scanStartedAt) : undefined,
              scanCompletedAt: scanData.scanCompletedAt ? new Date(scanData.scanCompletedAt) : undefined,
              isValid: scanData.isValid ?? true,
              score: scanData.score || 50,
              rootednessScore: scanData.rootednessScore,
              intentScore: scanData.intentScore,
              issues: scanData.issues || [],
              recommendations: scanData.recommendations || [],
            };
            console.log('Transformed scan:', transformedScan);
            setScanResult(transformedScan);
          } else {
            setScanResult(mockScanResult);
          }
        } else {
          console.log(deepLoaded ? 'Application detail API failed, keeping deep_set header' : 'API failed, using mock data');
          if (!deepLoaded) {
            setApplicationData(mockApplicationData);
            setScanResult(mockScanResult);
          }
        }
      } catch (err) {
        console.error('Error fetching application:', err);
        if (!deepLoaded) {
          // Legacy/demo fallback only. For deep_set ids, keep the header derived
          // from the enriched DIS view so the page never regresses to John Doe.
          setApplicationData(mockApplicationData);
          setScanResult(mockScanResult);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchApplicationData();
    return () => {
      active = false;
    };
  }, [applicationId, router]);

  // --- State for NEW Dialogs ---
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showRequestInfoDialog, setShowRequestInfoDialog] = useState(false); // Placeholder
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);       // Placeholder
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false); // Rename isLoading for clarity

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

  const handleOpenApproveDialog = () => setShowApproveDialog(true);
  const handleOpenRejectDialog = () => setShowRejectDialog(true);

  // --- Handlers for NEW Dialog Submissions ---
  const handleEscalateSubmit = (reasons: string[], notes: string) => {
    console.log("Escalation Submitted");
    console.log("Reasons:", reasons);
    console.log("Notes:", notes);
    // TODO: Add API call to submit escalation
    setShowEscalateDialog(false); // Close dialog handled within EscalateDialog itself via onClose
  };

  // Renamed and adapted from original submitFinalDecision
  const handleSubmitFinalDecision = async (decision: 'approve' | 'reject', rationale?: string) => {
    setIsSubmittingDecision(true); // Use correct state setter
    console.log('Submitting final decision:', decision);
    console.log('Rationale Notes:', rationale);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      alert(`Mock API: Application ${decision === 'approve' ? 'approved' : 'rejected'}. Rationale: ${rationale || 'None'}`);
      // Close the relevant dialog upon success
      if (decision === 'approve') setShowApproveDialog(false);
      if (decision === 'reject') setShowRejectDialog(false);
    } catch (error) {
      console.error('Error submitting final decision:', error);
      alert('Failed to submit decision');
    } finally {
      setIsSubmittingDecision(false); // Use correct state setter
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
  const availableSectionKeys = useMemo(() => {
      if (!applicationData.sections) return [];
      return Object.keys(sectionDefinitions)
            .filter(key => applicationData.sections[key]);
  }, [applicationData.sections, sectionDefinitions]);

  const allSectionsDecided = useMemo(() =>
      availableSectionKeys.every(key => decisions[key] === 'approve' || decisions[key] === 'refer'),
      [availableSectionKeys, decisions]
  );

  // Extract contact details safely based on ApplicationData type
  const applicantContact = useMemo(() => {
      const passportData = applicationData.sections?.passport?.data;
      const name = passportData?.givenNames && passportData?.surname
        ? `${passportData.givenNames} ${passportData.surname}`.trim()
        : null;
      // Use applicantDetails if available
      const email = applicationData.applicantDetails?.email || null;
      const phoneNumber = applicationData.applicantDetails?.phoneNumber || null;

      return { name, email, phoneNumber };
    }, [applicationData.sections?.passport?.data, applicationData.applicantDetails]); // Dependency on passport data

  // --- Access-denied state (Task 5 — per-case ownership guard) ---
  // Checked before the loading state: the fetch effect sets isLoading=false
  // in the same pass it sets accessDenied=true, so by the time either is
  // read here both are already settled. Never falls through to the mock-data
  // rendering path below.
  if (accessDenied) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="text-lg font-semibold text-gray-800">
            This case is assigned to another officer
          </h1>
          <p className="text-sm text-gray-500">
            You don&apos;t have access to review application {applicationId}. Only the
            assigned officer (or an admin) can open it.
          </p>
          <Link
            href="/dashboard/reviewer"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to my queue
          </Link>
        </div>
      </div>
    );
  }

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading application {applicationId}...</p>
        </div>
      </div>
    );
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

          {/* RFI lifecycle scaffold (Slice 3b) — only on DIS completeness-gap cases */}
          {rfi?.enabled && <RFIPanel rfi={rfi} />}

          {/* Panel 1 — DIS Recommendation Summary (V4 §2 / Task 2.1, open by default) */}
          <RecommendationSummaryPanel disView={disView} />

          {/* Panel 2 — Glass Box Rule Trace (V4 §3 / Task 2.2, collapsed by default) */}
          <GlassBoxTracePanel disView={disView} />

          {/* Panel 3 — Evidence (V4 §4 / SCRUM-64 2.3+2.4, collapsed by default) */}
          <EvidencePanel disView={disView} />

          {/* Open Visa Intelligence — OV-IP risk model, the deliberate scores-shown panel
              (replaces the legacy AI Assessment Results). Per-case from the enriched
              deep_set when present (Slice 3a); otherwise the synthetic mock for
              legacy/demo ids until Azure inference — LAUNCH_BLOCKERS LB-6 / V5 §7a. */}
          <OVIntelligencePanel assessment={ovAssessment ?? syntheticOvAssessment()} />

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
              onApprove={handleOpenApproveDialog}
              onReject={handleOpenRejectDialog}
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
          contact={applicantContact}
          onRequestInfo={handleOpenRequestInfoDialog}
          onScheduleCall={handleScheduleCall}
       />

       {/* New Escalate Dialog */}
       <EscalateDialog
          isOpen={showEscalateDialog}
          onClose={() => setShowEscalateDialog(false)}
          applicationData={applicationData}
          onSubmit={handleEscalateSubmit}
       />

       {/* --- Render NEW Approve/Reject Dialogs --- */}
      <ApproveDialog
          isOpen={showApproveDialog}
          onClose={() => setShowApproveDialog(false)}
          applicationData={applicationData}
          onSubmitDecision={handleSubmitFinalDecision} // Use the shared handler
          isSubmitting={isSubmittingDecision} // Pass loading state
      />

      <RejectDialog
          isOpen={showRejectDialog}
          onClose={() => setShowRejectDialog(false)}
          applicationData={applicationData}
          onSubmitDecision={handleSubmitFinalDecision} // Use the shared handler
          isSubmitting={isSubmittingDecision} // Pass loading state
      />
    </div>
  );
}
