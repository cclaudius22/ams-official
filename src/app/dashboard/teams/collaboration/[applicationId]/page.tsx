'use client'

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  MessageSquare,
  CheckSquare
} from 'lucide-react';
import CollaborationCanvas from '@/components/collaboration/CollaborationCanvas';

// Mock application data
const mockApplicationData = {
  'UK-2024-1836': {
    id: 'UK-2024-1836',
    applicantName: 'John James Doe',
    applicantNationality: 'United States',
    visaType: 'Tourist',
    submissionDate: '2025-09-30T10:15:00Z',
    status: 'in_review',
    priority: 'high',
    sections: {
      passport: { status: 'in_review', validationStatus: 'pending', data: {} },
      financial: { status: 'in_review', validationStatus: 'pending', data: {} },
      travel: { status: 'in_review', validationStatus: 'pending', data: {} },
      visas: { status: 'in_review', validationStatus: 'pending', data: {} },
      documents: { status: 'in_review', validationStatus: 'pending', data: {} }
    }
  },
  'UK-2024-1840': {
    id: 'UK-2024-1840',
    applicantName: 'Emma Wilson',
    applicantNationality: 'Canada',
    visaType: 'Student',
    submissionDate: '2025-10-01T14:30:00Z',
    status: 'in_review',
    priority: 'medium',
    sections: {
      passport: { status: 'approved', validationStatus: 'valid', data: {} },
      financial: { status: 'in_review', validationStatus: 'pending', data: {} },
      travel: { status: 'in_review', validationStatus: 'pending', data: {} },
      visas: { status: 'in_review', validationStatus: 'pending', data: {} },
      documents: { status: 'in_review', validationStatus: 'pending', data: {} }
    }
  }
};

// Mock collaboration data
const mockCollaborationData = {
  'UK-2024-1836': {
    id: 'collab-1',
    applicationId: 'UK-2024-1836',
    status: 'in_progress',
    startedAt: '2025-10-03T14:30:00Z',
    startedBy: {
      id: 'user-1',
      name: 'Sarah Johnson',
      role: 'Senior Visa Officer',
      avatar: null
    },
    participants: [
      { id: 'user-1', name: 'Sarah Johnson', role: 'Senior Visa Officer', avatar: null },
      { id: 'user-2', name: 'Mike Fitzgerald', role: 'Officer', avatar: null },
      { id: 'user-3', name: 'Uma Mirza', role: 'Visa History Specialist', avatar: null }
    ],
    pendingTasks: 2,
    completedTasks: 3,
    notes: 5,
    lastActivity: '10 minutes ago'
  },
  'UK-2024-1840': {
    id: 'collab-2',
    applicationId: 'UK-2024-1840',
    status: 'in_progress',
    startedAt: '2025-10-02T09:15:00Z',
    startedBy: {
      id: 'user-1',
      name: 'Sarah Johnson',
      role: 'Senior Visa Officer',
      avatar: null
    },
    participants: [
      { id: 'user-1', name: 'Sarah Johnson', role: 'Senior Visa Officer', avatar: null },
      { id: 'user-4', name: 'David Chen', role: 'Financial Verification Specialist', avatar: null }
    ],
    pendingTasks: 1,
    completedTasks: 2,
    notes: 3,
    lastActivity: '1 hour ago'
  }
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { label: string, className: string }> = {
    in_progress: { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
    pending_review: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-800' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-800' },
    blocked: { label: 'Blocked', className: 'bg-red-100 text-red-800' }
  };
  
  const statusInfo = statusMap[status] || { label: 'Unknown', className: 'bg-gray-100 text-gray-800' };
  
  return (
    <Badge className={`${statusInfo.className} font-normal`}>
      {statusInfo.label}
    </Badge>
  );
};

// Priority indicator component
const PriorityIndicator = ({ priority }: { priority: string }) => {
  const priorityMap: Record<string, { color: string, label: string }> = {
    high: { color: 'bg-red-500', label: 'High Priority' },
    medium: { color: 'bg-yellow-500', label: 'Medium Priority' },
    low: { color: 'bg-green-500', label: 'Low Priority' }
  };
  
  const priorityInfo = priorityMap[priority] || { color: 'bg-gray-500', label: 'Unknown Priority' };
  
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-2.5 w-2.5 rounded-full ${priorityInfo.color}`} title={priorityInfo.label} />
      <span className="text-xs text-gray-500">{priorityInfo.label}</span>
    </div>
  );
};

export default function ApplicationCollaborationPage() {
  const params = useParams();
  const applicationId = params.applicationId as string;
  
  const [application, setApplication] = useState<any>(null);
  const [collaboration, setCollaboration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // In a real implementation, this would fetch data from an API
    setLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const appData = mockApplicationData[applicationId as keyof typeof mockApplicationData];
      const collabData = mockCollaborationData[applicationId as keyof typeof mockCollaborationData];
      
      setApplication(appData || null);
      setCollaboration(collabData || null);
      setLoading(false);
    }, 500);
  }, [applicationId]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading collaboration data...</p>
        </div>
      </div>
    );
  }
  
  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Application Not Found</h2>
        <p className="text-gray-500 mb-6">The application with ID {applicationId} could not be found.</p>
        <Link href="/dashboard/teams/collaboration">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collaboration Hub
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/teams/collaboration" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-semibold text-gray-800">
              Application {applicationId}
            </h1>
            <StatusBadge status={collaboration?.status || 'in_progress'} />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">{application.applicantName}</p>
            <PriorityIndicator priority={application.priority} />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/dashboard/reviewer/${applicationId}`}>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View Application
            </Button>
          </Link>
        </div>
      </div>

      {/* Collaboration Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collaboration?.participants.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active collaborators</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collaboration?.pendingTasks || 0}</div>
            <p className="text-xs text-muted-foreground">Tasks awaiting completion</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collaboration?.completedTasks || 0}</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collaboration?.notes || 0}</div>
            <p className="text-xs text-muted-foreground">Collaborative notes</p>
          </CardContent>
        </Card>
      </div>

      {/* Collaboration Canvas */}
      <CollaborationCanvas 
        applicationId={applicationId} 
        applicationData={application}
      />
    </div>
  );
}
