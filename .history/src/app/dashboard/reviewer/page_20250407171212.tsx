// src/app/dashboard/reviewer/page.tsx
'use client'

import React, { useState } from 'react'
import SidebarNavigation from '@/components/dashboard/SidebarNavigation'
import ApplicationHeader from '@/components/application/ApplicationHeader'
import AIScanResults from '@/components/application/AIScanResults'
import SectionCard from '@/components/application/SectionCard'
import DecisionFooter from '@/components/application/DecisionFooter'
import NoteDialog from '@/components/dialogs/NoteDialog'
import ConfirmationDialog from '@/components/dialogs/ConfirmationDialog'
import { ApplicationData } from '@/types/application'
import { AIScanResult } from '@/types/aiScan'
import { getApplication } from '@/lib/api/applications'
import { getAIScanResult, triggerNewScan } from '@/lib/api/scans'
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

// Mock data imports (will be removed once API is complete)
import { mockApplicationData } from '@/lib/mockData'
import { mockScanResult } from '@/lib/mockData'

export default function OfficialReviewPage() {
  // State management
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [decisions, setDecisions] = useState<Record<string, 'approve' | 'refer' | 'pending'>>({});
  const [activeNoteSection, setActiveNoteSection] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [finalDecision, setFinalDecision] = useState<'approve' | 'refer' | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Application data state
  const [applicationData, setApplicationData] = useState<ApplicationData>(mockApplicationData);
  const [scanResult, setScanResult] = useState<AIScanResult>(mockScanResult);
  const [isLoading, setIsLoading] = useState(false);

  // Get issues for a specific section
  const getIssuesForSection = (sectionId: string) => {
    return scanResult.issues.filter(issue => issue.sectionId === sectionId);
  };

  // Handle section approval
  const handleApproveSection = (sectionId: string) => {
    setDecisions(prev => ({
      ...prev,
      [sectionId]: 'approve'
    }));
  };

  // Handle section referral
  const handleReferSection = (sectionId: string) => {
    setDecisions(prev => ({
      ...prev,
      [sectionId]: 'refer'
    }));
  };

  // Handle adding a note to a section
  const handleAddNote = (sectionId: string) => {
    setActiveNoteSection(sectionId);
    setNoteText(notes[sectionId] || '');
  };

  // Save the note for a section
  const saveNote = () => {
    if (activeNoteSection) {
      setNotes(prev => ({
        ...prev,
        [activeNoteSection]: noteText
      }));
      setActiveNoteSection(null);
      setNoteText('');
    }
  };

  // Check if all sections have been decided (approved or referred)
  const allSectionsDecided = () => {
    const enabledSections = Object.keys(applicationData.sections);
    return enabledSections.every(section => decisions[section] === 'approve' || decisions[section] === 'refer');
  };

  // Handle final application decision
  const handleFinalDecision = (decision: 'approve' | 'refer') => {
    setFinalDecision(decision);
    setShowConfirmDialog(true);
  };

  // Submit final decision
  const submitFinalDecision = async () => {
    setIsLoading(true);
    try {
      console.log('Submitting final decision:', finalDecision);
      console.log('Section decisions:', decisions);
      console.log('Notes:', notes);
      
      alert(`Application ${finalDecision === 'approve' ? 'approved' : 'referred for additional review'}`);
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert('Failed to submit decision');
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  // Combine all sections into a single array for one-column layout
  const allSections = [
    { id: 'passport', title: 'Passport Information', icon: <FileText className="h-5 w-5 text-blue-500" /> },
    { id: 'kyc', title: 'Identity Verification', icon: <Fingerprint className="h-5 w-5 text-purple-500" /> },
    { id: 'photo', title: 'Visa Photo', icon: <User className="h-5 w-5 text-green-500" /> },
    { id: 'residency', title: 'Residence Information', icon: <MapPin className="h-5 w-5 text-red-500" /> },
    { id: 'visas', title: 'Previous Visas', icon: <Globe className="h-5 w-5 text-indigo-500" /> },
    { id: 'professional', title: 'Professional Information', icon: <Briefcase className="h-5 w-5 text-orange-500" /> },
    { id: 'financial', title: 'Financial Information', icon: <CreditCard className="h-5 w-5 text-emerald-500" /> },
    { id: 'travel', title: 'Travel Details', icon: <Plane className="h-5 w-5 text-cyan-500" /> },
    { id: 'travelInsurance', title: 'Travel Insurance', icon: <Shield className="h-5 w-5 text-pink-500" /> },
    { id: 'documents', title: 'Required Documents', icon: <FileText className="h-5 w-5 text-amber-500" /> }
  ];

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading application data...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <SidebarNavigation />

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b">
          <div className="flex justify-between items-center px-6 py-3">
            <div className="flex items-center">
              <Button variant="ghost" className="mr-2">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Queue
              </Button>
              <h1 className="text-xl font-medium ml-2">Application Review</h1>
            </div>
            <div className="flex items-center space-x-6">
              <button className="relative">
                <Bell className="h-6 w-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="relative">
                <MessageSquare className="h-6 w-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                  5
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Application Header */}
          <ApplicationHeader application={applicationData} />

          {/* AI Scan Results */}
          <AIScanResults 
            scanResult={scanResult}
            onRefreshScan={() => triggerNewScan(applicationData.applicationId)}
          />

          {/* Main Application Sections - Single Column Layout */}
          <div className="space-y-6">
            {allSections.map(section => (
              applicationData.sections[section.id] && (
                <SectionCard 
                  key={section.id}
                  title={section.title}
                  icon={section.icon}
                  section={applicationData.sections[section.id]}
                  scanIssues={getIssuesForSection(section.id)}
                  onApprove={() => handleApproveSection(section.id)}
                  onRefer={() => handleReferSection(section.id)}
                  onAddNote={() => handleAddNote(section.id)}
                />
              )
            ))}
          </div>

          {/* Decision Footer */}
          <DecisionFooter 
            totalSections={Object.keys(applicationData.sections).length}
            decidedSections={Object.keys(decisions).length}
            allDecided={allSectionsDecided()}
            onApprove={() => handleFinalDecision('approve')}
            onRefer={() => handleFinalDecision('refer')}
          />
        </div>
      </div>

      {/* Dialogs */}
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
