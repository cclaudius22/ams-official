'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

// Mock data for available applications
const mockAvailableApplications = [
  { id: 'UK-2024-1845', applicantName: 'James Wilson', status: 'in_review' },
  { id: 'UK-2024-1846', applicantName: 'Maria Garcia', status: 'in_review' },
  { id: 'UK-2024-1847', applicantName: 'Ahmed Hassan', status: 'in_review' },
  { id: 'UK-2024-1848', applicantName: 'Li Wei', status: 'in_review' },
  { id: 'UK-2024-1849', applicantName: 'Sofia Petrovic', status: 'in_review' }
];

// Mock data for team members
const mockTeamMembers = [
  { id: 'user-1', name: 'Sarah Johnson', role: 'Senior Visa Officer', avatar: null },
  { id: 'user-2', name: 'Mike Fitzgerald', role: 'Officer', avatar: null },
  { id: 'user-3', name: 'Uma Mirza', role: 'Visa History Specialist', avatar: null },
  { id: 'user-4', name: 'David Chen', role: 'Financial Verification Specialist', avatar: null },
  { id: 'user-5', name: 'Priya Patel', role: 'Document Verification Specialist', avatar: null },
  { id: 'user-6', name: 'Thomas Brown', role: 'Security Specialist', avatar: null }
];

interface CreateCollaborationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCollaboration: (collaborationData: any) => void;
}

export default function CreateCollaborationDialog({ 
  open, 
  onOpenChange,
  onCreateCollaboration
}: CreateCollaborationDialogProps) {
  const router = useRouter();
  
  // Form state
  const [applicationId, setApplicationId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!open) {
      setApplicationId('');
      setPriority('medium');
      setDescription('');
      setSelectedTeamMembers([]);
      setError(null);
    }
  }, [open]);
  
  // Handle team member selection
  const toggleTeamMember = (memberId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!applicationId) {
      setError('Please select an application');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get application details
      const application = mockAvailableApplications.find(app => app.id === applicationId);
      
      if (!application) {
        throw new Error('Application not found');
      }
      
      // Create collaboration data
      const collaborationData = {
        id: `collab-${Date.now()}`,
        applicationId,
        applicantName: application.applicantName,
        status: 'in_progress',
        priority,
        lastActivity: 'Just now',
        participants: [
          // Current user (assumed to be Sarah Johnson for mock)
          { id: 'user-1', name: 'Sarah Johnson', role: 'Senior Visa Officer', avatar: null },
          // Selected team members
          ...mockTeamMembers
            .filter(member => selectedTeamMembers.includes(member.id) && member.id !== 'user-1')
            .map(member => ({
              id: member.id,
              name: member.name,
              role: member.role,
              avatar: member.avatar
            }))
        ],
        pendingTasks: 0,
        completedTasks: 0,
        description
      };
      
      // Call the onCreateCollaboration callback
      onCreateCollaboration(collaborationData);
      
      // Close the dialog
      onOpenChange(false);
      
      // Redirect to the new collaboration page
      router.push(`/dashboard/teams/collaboration/${applicationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Collaboration</DialogTitle>
          <DialogDescription>
            Start a new collaboration on an application. Invite team members to work together.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {/* Application selection */}
          <div className="space-y-2">
            <Label htmlFor="application">Select Application</Label>
            <Select value={applicationId} onValueChange={setApplicationId}>
              <SelectTrigger id="application">
                <SelectValue placeholder="Select an application" />
              </SelectTrigger>
              <SelectContent>
                {mockAvailableApplications.map(app => (
                  <SelectItem key={app.id} value={app.id}>
                    {app.id} - {app.applicantName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Priority selection */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup 
              value={priority} 
              onValueChange={setPriority}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="flex items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 mr-1.5"></span>
                  High
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="flex items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 mr-1.5"></span>
                  Medium
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="flex items-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500 mr-1.5"></span>
                  Low
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Team members selection */}
          <div className="space-y-2">
            <Label>Invite Team Members</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
              {mockTeamMembers.map(member => (
                <div 
                  key={member.id}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${
                    selectedTeamMembers.includes(member.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleTeamMember(member.id)}
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.role}</p>
                  </div>
                  {selectedTeamMembers.includes(member.id) && (
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Selected: {selectedTeamMembers.length} team members
            </p>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a description or initial notes for this collaboration..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !applicationId}
            >
              {isSubmitting ? 'Creating...' : 'Create Collaboration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
