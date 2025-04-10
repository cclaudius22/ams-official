'use client'

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  MessageSquare,
  FileText
} from 'lucide-react';

// Mock data for team stats
const mockTeamStats = {
  activeCollaborations: 8,
  pendingTasks: 12,
  completedTasks: 24,
  teamMembers: 6,
  recentActivity: [
    { id: '1', type: 'task_assigned', user: 'Sarah Johnson', target: 'Financial verification', time: '10 minutes ago', applicationId: 'UK-2024-1836' },
    { id: '2', type: 'note_added', user: 'Mike Fitzgerald', target: 'Passport section', time: '25 minutes ago', applicationId: 'UK-2024-1840' },
    { id: '3', type: 'task_completed', user: 'Uma Mirza', target: 'Visa history check', time: '1 hour ago', applicationId: 'UK-2024-1835' },
    { id: '4', type: 'collaboration_started', user: 'Rachel Johnson', target: 'Application review', time: '2 hours ago', applicationId: 'UK-2024-1842' },
    { id: '5', type: 'decision_made', user: 'David Chen', target: 'Application approved', time: '3 hours ago', applicationId: 'UK-2024-1830' },
  ],
  myTasks: [
    { id: 't1', title: 'Verify financial documents', applicationId: 'UK-2024-1836', priority: 'high', dueDate: '2025-10-05', assignedBy: 'Sarah Johnson' },
    { id: 't2', title: 'Check visa history', applicationId: 'UK-2024-1838', priority: 'medium', dueDate: '2025-10-06', assignedBy: 'Mike Fitzgerald' },
    { id: 't3', title: 'Review passport details', applicationId: 'UK-2024-1840', priority: 'low', dueDate: '2025-10-07', assignedBy: 'Uma Mirza' },
  ]
};

// Activity icon mapping
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'task_assigned': return <Clock className="h-4 w-4 text-blue-500" />;
    case 'note_added': return <MessageSquare className="h-4 w-4 text-green-500" />;
    case 'task_completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'collaboration_started': return <Users className="h-4 w-4 text-purple-500" />;
    case 'decision_made': return <FileText className="h-4 w-4 text-blue-600" />;
    default: return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

// Priority badge component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const colorMap: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };
  
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${colorMap[priority] || 'bg-gray-100 text-gray-800'}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

export default function TeamsDashboardPage() {
  const stats = mockTeamStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-2xl font-semibold text-gray-800">Team Collaboration</h1>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Collaborations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCollaborations}</div>
            <p className="text-xs text-muted-foreground">Applications with team collaboration</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks awaiting completion</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks completed this week</p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">Active collaborators</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="myTasks" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="myTasks">My Tasks</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
        </TabsList>
        
        {/* My Tasks Tab */}
        <TabsContent value="myTasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tasks Assigned to Me</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.myTasks.length > 0 ? (
                <div className="space-y-4">
                  {stats.myTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{task.title}</h3>
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <div className="flex gap-4 mt-1 text-sm text-gray-500">
                          <span>App: {task.applicationId}</span>
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          <span>From: {task.assignedBy}</span>
                        </div>
                      </div>
                      <Link href={`/dashboard/reviewer/${task.applicationId}`}>
                        <Button size="sm" variant="outline">
                          View
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>You have no pending tasks.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Team Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map(activity => (
                  <div key={activity.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {' '}
                        {activity.type === 'task_assigned' && 'was assigned to'}
                        {activity.type === 'note_added' && 'added a note to'}
                        {activity.type === 'task_completed' && 'completed'}
                        {activity.type === 'collaboration_started' && 'started collaborating on'}
                        {activity.type === 'decision_made' && 'made a decision on'}
                        {' '}
                        <span className="font-medium">{activity.target}</span>
                        {' '}
                        <Link href={`/dashboard/reviewer/${activity.applicationId}`} className="text-blue-600 hover:underline">
                          ({activity.applicationId})
                        </Link>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Collaborations Tab */}
        <TabsContent value="collaborations" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Active Collaborations</CardTitle>
              <Link href="/dashboard/teams/collaboration">
                <Button size="sm">
                  View All Collaborations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-gray-500">
                View and manage all active collaborations in the collaboration hub.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Link href="/dashboard/teams/collaboration" className="flex-1">
          <Button className="w-full" size="lg">
            Go to Collaboration Hub
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
