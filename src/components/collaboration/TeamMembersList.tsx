'use client'

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  PlusCircle,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface TeamMembersListProps {
  applicationId: string;
}

// Mock team members data
const mockTeamMembers = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    role: 'Senior Visa Officer',
    avatar: null,
    status: 'active',
    lastActive: '2 minutes ago',
    assignedTasks: 3,
    completedTasks: 5,
    email: 'sarah.johnson@example.gov.uk'
  },
  {
    id: 'user-2',
    name: 'Mike Fitzgerald',
    role: 'Officer',
    avatar: null,
    status: 'active',
    lastActive: '15 minutes ago',
    assignedTasks: 1,
    completedTasks: 2,
    email: 'mike.fitzgerald@example.gov.uk'
  },
  {
    id: 'user-3',
    name: 'Uma Mirza',
    role: 'Visa History Specialist',
    avatar: null,
    status: 'away',
    lastActive: '1 hour ago',
    assignedTasks: 1,
    completedTasks: 0,
    email: 'uma.mirza@example.gov.uk'
  }
];

// Status indicator component
const StatusIndicator = ({ status }: { status: string }) => {
  const statusMap: Record<string, { color: string, label: string }> = {
    active: { color: 'bg-green-500', label: 'Active' },
    away: { color: 'bg-yellow-500', label: 'Away' },
    offline: { color: 'bg-gray-400', label: 'Offline' },
    busy: { color: 'bg-red-500', label: 'Busy' }
  };
  
  const statusInfo = statusMap[status] || { color: 'bg-gray-400', label: 'Unknown' };
  
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-2.5 w-2.5 rounded-full ${statusInfo.color}`} title={statusInfo.label} />
      <span className="text-xs text-gray-500">{statusInfo.label}</span>
    </div>
  );
};

export default function TeamMembersList({ applicationId }: TeamMembersListProps) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  
  const handleInviteTeamMember = () => {
    if (!inviteEmail.trim() || !inviteRole.trim()) return;
    
    // In a real implementation, this would call an API to send an invitation
    console.log('Inviting team member:', { 
      applicationId, 
      email: inviteEmail,
      role: inviteRole
    });
    
    // Reset form
    setInviteEmail('');
    setInviteRole('');
    setShowInviteForm(false);
    
    // For demo purposes
    alert('Invitation sent! (This would send an email in a real implementation)');
  };

  return (
    <div className="space-y-6">
      {/* Team members list */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members ({mockTeamMembers.length})
          </h3>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowInviteForm(!showInviteForm)}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            {showInviteForm ? 'Cancel' : 'Invite Member'}
          </Button>
        </div>
        
        {/* Invite form */}
        {showInviteForm && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-4 border">
            <h4 className="font-medium">Invite Team Member</h4>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Email</div>
              <input
                type="email"
                className="w-full p-2 border rounded-md"
                placeholder="colleague@example.gov.uk"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Role</div>
              <select 
                className="w-full p-2 border rounded-md"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                required
              >
                <option value="">Select role</option>
                <option value="Officer">Officer</option>
                <option value="Senior Visa Officer">Senior Visa Officer</option>
                <option value="Visa History Specialist">Visa History Specialist</option>
                <option value="Financial Verification Specialist">Financial Verification Specialist</option>
                <option value="Document Verification Specialist">Document Verification Specialist</option>
              </select>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={handleInviteTeamMember}
                disabled={!inviteEmail.trim() || !inviteRole.trim()}
              >
                <Mail className="h-4 w-4 mr-1.5" />
                Send Invitation
              </Button>
            </div>
          </div>
        )}
        
        {/* Team members list */}
        <div className="space-y-3">
          {mockTeamMembers.map(member => (
            <div key={member.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar || undefined} alt={member.name} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.role}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <StatusIndicator status={member.status} />
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {member.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-yellow-600" />
                      <span className="font-medium">{member.assignedTasks}</span>
                    </div>
                    <span className="text-xs text-gray-500">Pending</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      <span className="font-medium">{member.completedTasks}</span>
                    </div>
                    <span className="text-xs text-gray-500">Completed</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-3">
                <Button variant="outline" size="sm">
                  <Mail className="h-3.5 w-3.5 mr-1.5" />
                  Contact
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
