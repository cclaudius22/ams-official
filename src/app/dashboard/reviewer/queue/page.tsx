// src/app/dashboard/reviewer/queue/page.tsx
'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ReviewCard from '@/components/dashboard/ReviewCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Clock, AlertTriangle, Search, Filter, ShieldCheck,
  CheckCircle2, Activity, AlertCircle, MoreHorizontal, Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils';
import { useOfficer, getOfficerFullName } from '@/contexts/OfficerContext';
import { transformApplicationToReview, type ApplicationReview } from '@/lib/officerQueue';
import type { LiveApplication } from '@/api-contracts/applications';

// `ApplicationReview` + the transform live in `@/lib/officerQueue` (Slice 2, unit-tested).
// The Rachel-demo hardcoded mock was removed — every officer now shows their REAL assigned cases.

export default function ReviewQueuePage() {
  const { currentOfficer, isLoading: officerLoading } = useOfficer();
  const [selectedTab, setSelectedTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState<ApplicationReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the current officer's assigned applications whenever the officer changes.
  useEffect(() => {
    async function fetchApplications() {
      if (!currentOfficer) return;

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          assignedTo: currentOfficer.id,
          pageSize: '50',
        });

        const response = await fetch(`/api/applications?${params}`);
        const data = await response.json();

        if (data.success) {
          const apps: LiveApplication[] = data.data || [];
          const now = new Date();
          setApplications(apps.map((app) => transformApplicationToReview(app, now)));
          setError(null);
        } else {
          setError(data.error || 'Failed to fetch applications');
          setApplications([]);
        }
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to fetch applications');
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchApplications();
  }, [currentOfficer?.id]);

  // Filter logic - inline in useMemo to avoid dependency issues
  const activeReviews = useMemo(() => {
    return applications.filter(review =>
      review.status === 'active' &&
      (searchQuery === '' ||
       review.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
       review.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [applications, searchQuery]);

  const pendingReviews = useMemo(() => {
    return applications.filter(review =>
      review.status === 'pending' &&
      (searchQuery === '' ||
       review.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
       review.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [applications, searchQuery]);

  const escalatedReviews = useMemo(() => {
    return applications.filter(review =>
      review.status === 'escalated' &&
      (searchQuery === '' ||
       review.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
       review.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [applications, searchQuery]);

  const completedReviews = useMemo(() => {
    return applications.filter(review =>
      review.status === 'completed' &&
      (searchQuery === '' ||
       review.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
       review.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [applications, searchQuery]);

  // Stats
  const totalAssigned = applications.length;
  const highPriorityCount = applications.filter(a => a.priority === 'high').length;

  if (officerLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Officer Context Header */}
      {currentOfficer && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Review Queue</h1>
            <p className="text-sm text-gray-500">
              Viewing applications assigned to {getOfficerFullName(currentOfficer)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{totalAssigned}</p>
            <p className="text-sm text-gray-500">Total Assigned</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Tasks Card */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Active Cases</p>
                <p className="text-2xl font-bold">{activeReviews.length}</p>
                <p className="text-sm text-green-600">In Progress</p>
              </div>
              <div className="text-blue-500">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Card */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold">{pendingReviews.length}</p>
                <p className="text-sm text-amber-600">Awaiting Action</p>
              </div>
              <div className="text-amber-500">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* High Priority Card */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-2xl font-bold">{highPriorityCount}</p>
                <p className="text-sm text-orange-500">Needs Attention</p>
              </div>
              <div className="text-orange-500">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed Card */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Completed Today</p>
                <p className="text-2xl font-bold">{completedReviews.length}</p>
                <p className="text-sm text-green-600">Decisions Made</p>
              </div>
              <div className="text-green-500">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative w-full sm:w-auto sm:flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by ID or Applicant Name..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
        <Button variant="outline"><MoreHorizontal className="h-4 w-4 mr-2" /> Sort</Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
          <span className="text-gray-600">Loading applications...</span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">
            Try assigning applications to this officer from the Live Queue.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && applications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Assigned</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {currentOfficer
              ? `${getOfficerFullName(currentOfficer)} has no applications assigned yet. `
              : 'No applications assigned. '}
            Go to the Live Queue to auto-assign applications.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.href = '/dashboard/livequeue'}
          >
            Go to Live Queue
          </Button>
        </div>
      )}

      {/* Main Content Tabs */}
      {!isLoading && !error && applications.length > 0 && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger
              value="active"
              className={cn(
                "data-[state=active]:bg-blue-50",
                "data-[state=active]:text-blue-600",
                "data-[state=active]:shadow-none"
              )}
            >
              Active ({activeReviews.length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className={cn(
                "data-[state=active]:bg-blue-50",
                "data-[state=active]:text-blue-600",
                "data-[state=active]:shadow-none"
              )}
            >
              Pending ({pendingReviews.length})
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className={cn(
                "data-[state=active]:bg-blue-50",
                "data-[state=active]:text-blue-600",
                "data-[state=active]:shadow-none"
              )}
            >
              Completed ({completedReviews.length})
            </TabsTrigger>
            <TabsTrigger
              value="escalated"
              className={cn(
                "data-[state=active]:bg-blue-50",
                "data-[state=active]:text-blue-600",
                "data-[state=active]:shadow-none"
              )}
            >
              Escalated ({escalatedReviews.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Tab */}
          <TabsContent value="active">
            {activeReviews.length > 0 ? (
              <div className="space-y-4">
                {activeReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No active reviews matching your criteria.</div>
            )}
          </TabsContent>

          {/* Pending Tab */}
          <TabsContent value="pending">
            {pendingReviews.length > 0 ? (
              <div className="space-y-4">
                {pendingReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No pending reviews</p>
              </div>
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed">
            {completedReviews.length > 0 ? (
              <div className="space-y-4">
                {completedReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Completed reviews will appear here</p>
              </div>
            )}
          </TabsContent>

          {/* Escalated Tab */}
          <TabsContent value="escalated">
            {escalatedReviews.length > 0 ? (
              <div className="space-y-4">
                {escalatedReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No escalated cases</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
