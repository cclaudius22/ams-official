'use client'

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  MessageSquare, 
  CheckSquare, 
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  PenSquare,
  Eye
} from 'lucide-react';

interface ActivityTimelineProps {
  applicationId: string;
  sectionId?: string;
}

// Mock activity data
const mockActivities = [
  {
    id: 'activity-1',
    applicationId: 'UK-2024-1836',
    sectionId: 'passport',
    type: 'note_added',
    content: 'Added a note about passport expiration date.',
    timestamp: '2025-10-03T14:30:00Z',
    user: {
      id: 'user-1',
      name: 'Sarah Johnson',
      role: 'Senior Visa Officer',
      avatar: null
    }
  },
  {
    id: 'activity-2',
    applicationId: 'UK-2024-1836',
    sectionId: 'passport',
    type: 'task_assigned',
    content: 'Assigned "Verify passport against external database" to Mike Fitzgerald.',
    timestamp: '2025-10-03T14:35:00Z',
    user: {
      id: 'user-1',
      name: 'Sarah Johnson',
      role: 'Senior Visa Officer',
      avatar: null
    }
  },
  {
    id: 'activity-3',
    applicationId: 'UK-2024-1836',
    sectionId: 'passport',
    type: 'section_viewed',
    content: 'Viewed passport section details.',
    timestamp: '2025-10-03T15:20:00Z',
    user: {
      id: 'user-2',
      name: 'Mike Fitzgerald',
      role: 'Officer',
      avatar: null
    }
  },
  {
    id: 'activity-4',
    applicationId: 'UK-2024-1836',
    sectionId: 'passport',
    type: 'task_completed',
    content: 'Completed "Verify passport against external database".',
    timestamp: '2025-10-03T16:45:00Z',
    user: {
      id: 'user-2',
      name: 'Mike Fitzgerald',
      role: 'Officer',
      avatar: null
    }
  },
  {
    id: 'activity-5',
    applicationId: 'UK-2024-1836',
    sectionId: 'passport',
    type: 'note_added',
    content: 'Added a note about passport verification.',
    timestamp: '2025-10-03T16:50:00Z',
    user: {
      id: 'user-2',
      name: 'Mike Fitzgerald',
      role: 'Officer',
      avatar: null
    }
  },
  {
    id: 'activity-6',
    applicationId: 'UK-2024-1836',
    sectionId: 'passport',
    type: 'task_assigned',
    content: 'Assigned "Check if passport has been reported stolen" to Uma Mirza.',
    timestamp: '2025-10-04T09:30:00Z',
    user: {
      id: 'user-1',
      name: 'Sarah Johnson',
      role: 'Senior Visa Officer',
      avatar: null
    }
  },
  {
    id: 'activity-7',
    applicationId: 'UK-2024-1836',
    sectionId: 'passport',
    type: 'note_added',
    content: 'Added a question about checking if the passport has been reported stolen.',
    timestamp: '2025-10-04T09:35:00Z',
    user: {
      id: 'user-1',
      name: 'Sarah Johnson',
      role: 'Senior Visa Officer',
      avatar: null
    }
  },
  {
    id: 'activity-8',
    applicationId: 'UK-2024-1836',
    sectionId: 'financial',
    type: 'section_edited',
    content: 'Updated financial information section.',
    timestamp: '2025-10-04T10:15:00Z',
    user: {
      id: 'user-4',
      name: 'David Chen',
      role: 'Financial Verification Specialist',
      avatar: null
    }
  }
];

// Activity icon mapping
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'note_added': return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case 'task_assigned': return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'task_completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'section_viewed': return <Eye className="h-4 w-4 text-gray-500" />;
    case 'section_edited': return <PenSquare className="h-4 w-4 text-purple-500" />;
    case 'collaboration_started': return <Users className="h-4 w-4 text-indigo-500" />;
    case 'decision_made': return <CheckSquare className="h-4 w-4 text-green-600" />;
    default: return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

export default function ActivityTimeline({ applicationId, sectionId }: ActivityTimelineProps) {
  // Filter activities for this application and section (if provided)
  const filteredActivities = mockActivities.filter(activity => {
    const matchesApplication = activity.applicationId === applicationId;
    const matchesSection = sectionId ? activity.sectionId === sectionId : true;
    return matchesApplication && matchesSection;
  });

  // Group activities by date
  const groupedActivities: Record<string, typeof mockActivities> = {};
  
  filteredActivities.forEach(activity => {
    const date = new Date(activity.timestamp).toLocaleDateString();
    if (!groupedActivities[date]) {
      groupedActivities[date] = [];
    }
    groupedActivities[date].push(activity);
  });

  return (
    <div className="space-y-6">
      <h3 className="font-medium flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Activity Timeline
      </h3>
      
      {Object.keys(groupedActivities).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, activities]) => (
            <div key={date} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-sm font-medium text-gray-500">{date}</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              
              <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                {activities.map(activity => (
                  <div key={activity.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[21px] mt-1.5 h-4 w-4 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="bg-white border rounded-lg p-3 ml-2">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.user.avatar || undefined} alt={activity.user.name} />
                          <AvatarFallback>
                            {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap justify-between items-baseline gap-2">
                            <span className="font-medium text-sm">{activity.user.name}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">{activity.content}</p>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs font-normal">
                              {activity.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                            {activity.sectionId && (
                              <Badge variant="outline" className="text-xs font-normal bg-gray-50">
                                {activity.sectionId.replace(/\b\w/g, l => l.toUpperCase())} Section
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <p>No activity recorded yet.</p>
        </div>
      )}
    </div>
  );
}
