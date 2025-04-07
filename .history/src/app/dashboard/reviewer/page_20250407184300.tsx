// src/app/dashboard/reviewer/page.tsx
'use client'

import React, { useState } from 'react'
import SidebarNavigation from '@/components/dashboard/SidebarNavigation'
import ApplicationHeader from '@/components/application/ApplicationHeader'
// Import the REDESIGNED AI Scan Results component
import AIScanResultsRedesigned from '@/components/application/AIScanResults'
import SectionCard from '@/components/application/SectionCard' // Keep using the refactored SectionCard
import DecisionFooter from '@/components/application/DecisionFooter'
import NoteDialog from '@/components/dialogs/NoteDialog'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog'
import { ApplicationData } from '@/types/application'
import { AIScanResult } from '@/types/aiScan'
import { getApplication } from '@/lib/api/applications' // Assuming these work
import { getAIScanResult, triggerNewScan } from '@/lib/api/scans' // Assuming these work
import { Accordion } from "@/components/ui/accordion"; // Correctly imported
import {
  FileText,
  Fingerprint,
  User,
  MapPin,
  Globe,
  Briefcase,
  CreditCard,
  Plane,
  Shield,
  ArrowLeft,
  Bell,
  MessageSquare,
  Eye,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Mock data imports (keep for now if API isn't ready)
import { mockApplicationData } from '@/lib/mockdata'
import { mockScanResult } from '@/lib/mockdata'

export default function OfficialReviewPage() {
  // --- State management (remains the same) ---
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<Record<string, 'approve' | 'refer' | 'pending'>>({});
  const [activeNoteSection, setActiveNoteSection] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [finalDecision, setFinalDecision] = useState<'approve' | 'refer' | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData>(mockApplicationData);
  const [scanResult, setScanResult] = useState<AIScanResult>(mockScanResult);
  const [isLoading, setIsLoading] = useState(false);

  // --- Event Handlers & Helper Functions (remain the same) ---
  const getIssuesForSection = (sectionId: string) => {
    return scanResult.issues.filter(issue => issue.sectionId === sectionId);
  };
  const handleApproveSection = (sectionId: string) => { /* ... */ };
  const handleReferSection = (sectionId: string) => { /* ... */ };
  const handleAddNote = (sectionId: string) => { /* ... */ };
  const saveNote = () => { /* ... */ };
  const allSectionsDecided = () => { /* ... */ };
  const handleFinalDecision = (decision: 'approve' | 'refer') => { /* ... */ };
  const submitFinalDecision = async () => { /* ... */ };

  // --- Section Definitions (remains the same) ---
  const allSections = [
    { id: 'passport', title: 'Passport Information', icon: <FileText className="h-5 w-5 text-blue-500" /> },
    { id: 'kyc', title: 'Identity Verification', icon: <Fingerprint className="h-5 w-5 text-purple-500" /> },
    // { id: 'photo', title: 'Visa Photo', icon: <User className="h-5 w-5 text-green-500" /> }, // Assuming photo is part of KYC or another section? Remove if not standalone.
    { id: 'residency', title: 'Residence Information', icon: <MapPin className="h-5 w-5 text-red-500" /> },
    // { id: 'visas', title: 'Previous Visas', icon: <Globe className="h-5 w-5 text-indigo-500" /> }, // Assuming visas might be part of travel history or passport? Remove if not standalone.
    { id: 'professional', title: 'Professional Information', icon: <Briefcase className="h-5 w-5 text-orange-500" /> },
    { id: 'financial', title: 'Financial Information', icon: <CreditCard className="h-5 w-5 text-emerald-500" /> },
    { id: 'travel', title: 'Travel Details', icon: <Plane className="h-5 w-5 text-cyan-500" /> },
    // { id: 'travelInsurance', title: 'Travel Insurance', icon: <Shield className="h-5 w-5 text-pink-500" /> }, // Often part of travel or documents. Remove if not standalone.
    // { id: 'documents', title: 'Required Documents', icon: <FileText className="h-5 w-5 text-amber-500" /> } // Often handled within relevant sections. Remove if not standalone.
  ];

  // Filter the sections to only include those present in the application data
  const availableSections = allSections.filter(sectionDef => applicationData.sections[sectionDef.id]);

  // Loading state
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading application data...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* --- Sidebar (remains the same) --- */}
      <SidebarNavigation />

      {/* --- Main Content Area --- */}
      <div className="flex-1 overflow-auto">
        {/* --- Top Navigation Bar (remains the same) --- */}
        <div className="bg-white border-b">
          {/* ... (Top bar content) ... */}
        </div>

        {/* --- Page Content Area --- */}
        <div className="p-6">
          {/* --- Application Header (remains the same) --- */}
          <ApplicationHeader application={applicationData} />

          {/* --- AI Scan Results (Use Redesigned Component) --- */}
          <AIScanResultsRedesigned
            scanResult={scanResult}
            onRefreshScan={() => triggerNewScan(applicationData.applicationId)}
          />

          {/* --- Main Application Sections (Wrapped in Accordion) --- */}
          {/* Use the Accordion component to wrap the mapped SectionCard items */}
          <Accordion type="multiple" className="w-full space-y-3 mt-6">
            {availableSections.map(sectionDef => {
              // We already filtered, so applicationData.sections[sectionDef.id] should exist
              const currentSectionData = applicationData.sections[sectionDef.id];

              return (
                <SectionCard
                  key={sectionDef.id}
                  value={sectionDef.id} // Use the section ID as the unique value
                  title={sectionDef.title}
                  icon={sectionDef.icon}
                  section={currentSectionData} // Pass the specific section data
                  scanIssues={getIssuesForSection(sectionDef.id)}
                  onApprove={() => handleApproveSection(sectionDef.id)}
                  onRefer={() => handleReferSection(sectionDef.id)}
                  onAddNote={() => handleAddNote(sectionDef.id)}
                />
              );
            })}
          </Accordion>

          {/* --- Message if no sections exist --- */}
          {availableSections.length === 0 && !isLoading && (
             <div className="p-6 text-center text-gray-500 border rounded-lg mt-6">
                No application sections found for this applicant.
             </div>
          )}

          {/* --- Decision Footer (remains the same) --- */}
          <DecisionFooter
            totalSections={availableSections.length} // Use filtered length
            decidedSections={Object.keys(decisions).length}
            allDecided={allSectionsDecided()} // Ensure this logic aligns with available sections
            onApprove={() => handleFinalDecision('approve')}
            onRefer={() => handleFinalDecision('refer')}
          />
        </div>
      </div>

      {/* --- Dialogs (remains the same) --- */}
      <NoteDialog
        isOpen={activeNoteSection !== null}
        onClose={() => setActiveNoteSection(null)}
        noteText={noteText}
        onNoteChange={setNoteText}
        onSave={saveNote}
      />
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        decision={finalDecision}
        onConfirm={submitFinalDecision}
      />
    </div>
  );
}