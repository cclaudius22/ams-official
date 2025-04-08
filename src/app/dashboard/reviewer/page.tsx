// src/app/dashboard/reviewer/page.tsx
'use client' // May need client components for stats fetching later or interactions

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Use Card for stats
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // For alerts
import {
  Clock,
  Inbox,
  AlertTriangle,
  CheckCircle2,
  Activity,
  AlertCircle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react'; // Import relevant icons

// Mock data for stats (replace with TanStack Query later)
const mockDashboardStats = {
  activeQueueCount: 23,
  pendingReviewsCount: 12,
  slaWarningsCount: 3,
  highPriorityCount: 4,
  accuracyRate: 99.2, // Example
  completedToday: 15,
  targetToday: 20,
};

export default function ReviewerDashboardPage() {
  // In the future, fetch stats using useQuery from TanStack Query
  const stats = mockDashboardStats;

  const tasksOnTrack = stats.completedToday >= stats.targetToday; // Simple example logic

  return (
    <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
           <h1 className="text-2xl font-semibold text-gray-800">Reviewer Dashboard</h1>
           {/* Maybe add a date/time display here */}
        </div>

       {/* Priority Alerts */}
       {stats.slaWarningsCount > 0 && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>SLA Breach Alert</AlertTitle>
            <AlertDescription>
               {stats.slaWarningsCount} application(s) are approaching SLA breach soon. Please prioritize accordingly.
            </AlertDescription>
          </Alert>
       )}
       {stats.highPriorityCount > 0 && !stats.slaWarningsCount && ( // Show only if no SLA warning
             <Alert variant="warning" className="bg-orange-50 border-orange-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>High Priority Items</AlertTitle>
                <AlertDescription>
                   You have {stats.highPriorityCount} high priority application(s) in your queue.
                </AlertDescription>
             </Alert>
        )}


      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Active Queue</CardTitle>
               <Inbox className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{stats.activeQueueCount}</div>
               <p className="text-xs text-muted-foreground">Applications needing review</p>
             </CardContent>
          </Card>

          <Card className="bg-white">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
               <Activity className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{stats.completedToday}/{stats.targetToday}</div>
               <p className={`text-xs ${tasksOnTrack ? 'text-green-600' : 'text-amber-600'}`}>
                   {tasksOnTrack ? 'Target met/exceeded' : 'Below daily target'}
               </p>
             </CardContent>
          </Card>

          <Card className="bg-white">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">SLA Warnings</CardTitle>
               <Clock className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className={`text-2xl font-bold ${stats.slaWarningsCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{stats.slaWarningsCount}</div>
               <p className="text-xs text-muted-foreground">Applications nearing breach</p>
             </CardContent>
          </Card>

          <Card className="bg-white">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Accuracy Rate (Avg)</CardTitle>
               <ShieldCheck className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{stats.accuracyRate}%</div>
                <p className="text-xs text-muted-foreground">Based on recent reviews</p>
             </CardContent>
          </Card>
      </div>

      {/* Action / Link to Queue */}
      <div className="mt-8 text-center sm:text-left">
          <Link href="/dashboard/reviewer/queue" passHref>
              <Button size="lg">
                 Go to My Review Queue
                 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
          </Link>
      </div>

      {/* Placeholder for other potential dashboard widgets */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card> <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader> <CardContent>...</CardContent> </Card>
          <Card> <CardHeader><CardTitle>Team Updates</CardTitle></CardHeader> <CardContent>...</CardContent> </Card>
      </div> */}

    </div>
  );
}