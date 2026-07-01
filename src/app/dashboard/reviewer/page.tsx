// src/app/dashboard/reviewer/page.tsx
'use client' // May need client components for stats fetching later or interactions

import React, { useEffect, useState } from 'react';
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
  ArrowRight,
  BellRing,
} from 'lucide-react'; // Import relevant icons
import { useOfficer } from '@/contexts/OfficerContext';
import type { RfiLaneItem } from '@/data/providers/rfiQueueAdapter';

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

  // RFI lane summary (pre-auth) — derived counts for the officer's "My RFIs" strip.
  // Real data from GET /api/ams-demo/rfis; the strip stays hidden if there are none.
  const { currentOfficer } = useOfficer();
  const officerId = currentOfficer?.id ?? 'officer-demo';
  const [rfis, setRfis] = useState<RfiLaneItem[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ams-demo/rfis?officerId=${encodeURIComponent(officerId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json?.success) setRfis(json.data as RfiLaneItem[]);
      })
      .catch(() => {
        /* strip stays quiet if the lane endpoint is unavailable */
      });
    return () => {
      cancelled = true;
    };
  }, [officerId]);
  const rfiCount = (state: RfiLaneItem['state']) => rfis.filter((r) => r.state === state).length;
  const nearestDue = rfis
    .map((r) => r.dueAt)
    .filter((d): d is string => !!d)
    .sort()[0];

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
             <Alert variant="default" className="bg-orange-50 border-orange-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>High Priority Items</AlertTitle>
                <AlertDescription>
                   You have {stats.highPriorityCount} high priority application(s) in your queue.
                </AlertDescription>
             </Alert>
        )}

      {/* My RFIs strip (pre-auth) — derived from the RFI lane endpoint */}
      {rfis.length > 0 && (
        <Link
          href="/dashboard/reviewer/rfis"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border bg-white px-4 py-3 text-sm transition-colors hover:border-blue-300 hover:bg-blue-50/40"
        >
          <span className="flex items-center gap-2 font-medium text-gray-800">
            <BellRing className="h-4 w-4 text-blue-600" />
            My RFIs
          </span>
          <span className="text-gray-600">{rfiCount('returned')} ready to re-review</span>
          <span className="text-gray-600">{rfiCount('awaiting')} awaiting</span>
          <span className={rfiCount('overdue') > 0 ? 'text-red-600' : 'text-gray-600'}>
            {rfiCount('overdue')} overdue
          </span>
          {nearestDue && (
            <span className="text-gray-500">
              nearest due {new Date(nearestDue).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1 text-blue-600">
            View <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
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

      {/* Doorways */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/reviewer/queue" passHref>
              <Button size="lg">
                 Go to My Review Queue
                 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
          </Link>
          <Link href="/dashboard/reviewer/rfis" passHref>
              <Button size="lg" variant="outline">
                 My RFIs
                 <BellRing className="ml-2 h-4 w-4" />
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