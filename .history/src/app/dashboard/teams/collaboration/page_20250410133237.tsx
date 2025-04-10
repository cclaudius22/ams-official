'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus
} from 'lucide-react';

// Mock data for collaborations
const mockCollaborations = [
  { 
    id: 'collab-1', 
    applicationId: 'UK-2024-1836', 
    applicantName: 'John James Doe',
    status: 'in_progress',
    priority: 'high',
    lastActivity: '10 minutes ago',
    participants: [
      { id: 'user-1', name: 'Sarah Johnson', role: 'Senior Visa Officer', avatar: null },
      { id: 'user-2', name: 'Mike Fitzgerald', role: 'Officer', avatar: null },
      { id: 'user-3', name: 'Uma Mirza', role: 'Visa History Specialist', avatar: null }
    ],
    pendingTasks: 2,
    completedTasks: 3
  },
  { 
    id: 'collab-2', 
    applicationId: 'UK-2024-1840', 
    applicantName: 'Emma Wilson',
    status: 'in_progress',
    priority: 'medium',
    lastActivity: '1 hour ago',
    participants: [
      { id: 'user-1', name: 'Sarah Johnson', role: 'Senior Visa Officer', avatar: null },
      { id: 'user-4', name: 'David Chen', role: 'Financial Verification Specialist', avatar: null }
    ],
    pendingTasks: 1,
    completedTasks: 2
  },
  { 
    id: 'collab-3', 
    applicationId: 'UK-2024-1842', 
    applicantName: 'Robert Chen',
    status: 'pending_review',
    priority: 'low',
    lastActivity: '3 hours ago',
    participants: [
      { id: 'user-2', name: 'Mike Fitzgerald', role: 'Officer', avatar: null }
    ],
    pendingTasks: 0,
    completedTasks: 1
  },
  { 
    id: 'collab-4', 
    applicationId: 'UK-2024-1835', 
    applicantName: 'Fatima Al-Sayed',
    status: 'completed',
    priority: 'high',
    lastActivity: '1 day ago',
    participants: [
      { id: 'user-1', name: 'Sarah Johnson', role: 'Senior Visa Officer', avatar: null },
      { id: 'user-3', name: 'Uma Mirza', role: 'Visa History Specialist', avatar: null },
      { id: 'user-4', name: 'David Chen', role: 'Financial Verification Specialist', avatar: null }
    ],
    pendingTasks: 0,
    completedTasks: 5
  }
];

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

// Participant avatars component
const ParticipantAvatars = ({ participants }: { participants: any[] }) => {
  const maxDisplay = 3;
  const displayParticipants = participants.slice(0, maxDisplay);
  const remaining = participants.length - maxDisplay;
  
  return (
    <div className="flex -space-x-2 overflow-hidden">
      {displayParticipants.map((participant, index) => (
        <div 
          key={participant.id} 
          className="inline-block h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
          title={`${participant.name} (${participant.role})`}
        >
          {participant.avatar ? (
            <img src={participant.avatar} alt={participant.name} className="h-full w-full rounded-full" />
          ) : (
            participant.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div className="inline-block h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default function CollaborationHubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Filter collaborations based on search query and status filter
  const filteredCollaborations = mockCollaborations.filter(collab => {
    const matchesSearch = 
      collab.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collab.applicantName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter ? collab.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Collaboration Hub</h1>
          <p className="text-gray-500 mt-1">Manage and track collaborative work on applications</p>
        </div>
        <Link href="/dashboard/teams">
          <Button variant="outline" size="sm">
            Back to Team Dashboard
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by application ID or applicant name"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={statusFilter === null ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter(null)}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "in_progress" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("in_progress")}
          >
            In Progress
          </Button>
          <Button 
            variant={statusFilter === "pending_review" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("pending_review")}
          >
            Pending Review
          </Button>
          <Button 
            variant={statusFilter === "completed" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("completed")}
          >
            Completed
          </Button>
        </div>
      </div>

      {/* Collaborations List */}
      <div className="space-y-4">
        {filteredCollaborations.length > 0 ? (
          filteredCollaborations.map(collab => (
            <Card key={collab.id} className="overflow-hidden">
              <div className={`h-1 w-full ${collab.priority === 'high' ? 'bg-red-500' : collab.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">
                        <Link href={`/dashboard/teams/collaboration/${collab.applicationId}`} className="hover:text-blue-600 hover:underline">
                          {collab.applicationId}
                        </Link>
                      </h3>
                      <StatusBadge status={collab.status} />
                    </div>
                    <p className="text-gray-600">{collab.applicantName}</p>
                    <PriorityIndicator priority={collab.priority} />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-8">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Participants</span>
                      <ParticipantAvatars participants={collab.participants} />
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-yellow-600" />
                          <span className="font-medium">{collab.pendingTasks}</span>
                        </div>
                        <span className="text-xs text-gray-500">Pending</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          <span className="font-medium">{collab.completedTasks}</span>
                        </div>
                        <span className="text-xs text-gray-500">Completed</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Last activity: {collab.lastActivity}</span>
                      <Link href={`/dashboard/teams/collaboration/${collab.applicationId}`}>
                        <Button size="sm">
                          View
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">No collaborations found matching your filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Start New Collaboration */}
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">Start a New Collaboration</h3>
          <p className="text-gray-500 max-w-md mb-4">
            Invite team members to collaborate on an application review process.
          </p>
          <Button>
            Create Collaboration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
