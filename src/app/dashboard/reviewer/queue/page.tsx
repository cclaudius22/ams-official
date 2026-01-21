// src/app/dashboard/reviewer/queue/page.tsx
'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

// Mock data for Rachel Johnson (Demo Officer) to show what the UI looks like
const mockReviewsForDemo: ApplicationReview[] = [
  {
    id: 'VK-2024-1835', applicant: 'Robert Mendoza', riskScore: 78, slaRemaining: '4h 30m', aiRecommendation: 'Review', priority: 'high', status: 'active', flags: ['Background Check Required', 'Multiple Applications'], team: { background: 'Sarah Johnson', identity: 'Uma Khan', document: 'Justin Time' }, lastUpdated: '2 hours ago', documents: ['Passport', 'Bank Statements', 'Employment Letter'], type: 'Business Visa', country: 'Cambodia', submissionDate: '2024-01-10', passport: 'KH12345678'
  },
  {
    id: 'VK-2024-1836', applicant: 'Emma Thompson', riskScore: 45, slaRemaining: '6h 15m', aiRecommendation: 'Approve', priority: 'high', status: 'active', flags: ['First Time Applicant'], team: { background: 'Sarah Johnson', identity: 'Mike Fitzgerald', document: 'Alex Mckenna' }, lastUpdated: '1 hour ago', documents: ['Passport', 'Financial Documents'], type: 'Tourist Visa', country: 'Australia', submissionDate: '2024-01-12', passport: 'AU98765432'
  },
  {
    id: 'UK-2024-1837', applicant: 'Maria Garcia', riskScore: 60, slaRemaining: 'N/A', aiRecommendation: 'Review', priority: 'medium', status: 'pending', flags: ['Incomplete Financials'], team: { background: 'Justin Time', identity: 'Mike Fitzgerald', document: 'Alex Mckenna' }, lastUpdated: '1 day ago', documents: ['Passport'], type: 'Student Visa', country: 'Spain', submissionDate: '2024-01-08', passport: 'ES11223344'
  },
  {
    id: 'UK-2024-1838', applicant: 'Ben Carter', riskScore: 85, slaRemaining: 'N/A', aiRecommendation: 'Reject', priority: 'high', status: 'escalated', flags: ['Potential Fraud Indicators'], team: { background: 'Supervisor', identity: 'Supervisor', document: 'Supervisor' }, lastUpdated: '3 hours ago', documents: ['All'], type: 'Investor Visa', country: 'USA', submissionDate: '2024-01-05', passport: 'US55667788'
  }
];

// Types for application review (matches API response structure)
interface ApplicationReview {
  id: string;
  applicant: string;
  riskScore: number;
  slaRemaining: string;
  aiRecommendation: 'Approve' | 'Reject' | 'Review';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'pending' | 'completed' | 'escalated';
  flags: string[];
  team: { background: string; identity: string; document: string; };
  lastUpdated: string;
  documents: string[];
  type: string;
  country: string;
  submissionDate: string;
  passport: string;
}

// Transform API application data to ReviewCard format
function transformApplicationToReview(app: any): ApplicationReview {
  // Handle both detailed and list API response formats
  const applicantName = app.applicantName ||
    (app.sections?.passport?.data
      ? `${app.sections.passport.data.givenNames || ''} ${app.sections.passport.data.surname || ''}`.trim()
      : 'Unknown Applicant');

  // Parse submittedAt - can be "12h ago" format or ISO date
  let slaRemaining = '48h';
  if (app.submittedAt) {
    if (app.submittedAt.includes('ago')) {
      // Parse "12h ago" format
      const match = app.submittedAt.match(/(\d+)h/);
      if (match) {
        const hoursAgo = parseInt(match[1], 10);
        const remainingHours = Math.max(0, 48 - hoursAgo);
        slaRemaining = remainingHours > 0 ? `${remainingHours}h` : 'Overdue';
      }
    } else {
      // ISO date format
      const submissionDate = new Date(app.submittedAt);
      const now = new Date();
      const hoursSinceSubmission = Math.floor((now.getTime() - submissionDate.getTime()) / (1000 * 60 * 60));
      const remainingHours = Math.max(0, 48 - hoursSinceSubmission);
      slaRemaining = remainingHours > 0 ? `${remainingHours}h` : 'Overdue';
    }
  }

  // Map status - handle both formats
  const statusMap: Record<string, ApplicationReview['status']> = {
    'submitted': 'pending',
    'under_review': 'active',
    'In Progress': 'active',
    'pending_documents': 'pending',
    'Pending': 'pending',
    'approved': 'completed',
    'Approved': 'completed',
    'rejected': 'completed',
    'Rejected': 'completed',
    'escalated': 'escalated',
    'Escalated': 'escalated',
  };

  // Use flags from API if available, otherwise generate based on risk
  const flags: string[] = app.flags || [];

  // Determine priority based on flags
  const hasHighRisk = flags.some((f: string) => f.toLowerCase().includes('high risk'));
  const hasNeedsReview = flags.some((f: string) => f.toLowerCase().includes('needs review'));
  const riskScore = hasHighRisk ? 75 : hasNeedsReview ? 55 : 35;
  const priority: ApplicationReview['priority'] = hasHighRisk ? 'high' : hasNeedsReview ? 'medium' : 'low';

  // Map AI recommendation
  const aiRecommendation: ApplicationReview['aiRecommendation'] =
    hasHighRisk ? 'Review' : hasNeedsReview ? 'Review' : 'Approve';

  return {
    id: app.id || app.applicationId,
    applicant: applicantName,
    riskScore,
    slaRemaining,
    aiRecommendation,
    priority,
    status: statusMap[app.status] || 'active',
    flags,
    team: {
      background: 'Pending',
      identity: 'Pending',
      document: 'Pending',
    },
    lastUpdated: app.submittedAt || 'Recently',
    documents: ['Passport', 'Supporting Documents'],
    type: app.visaType || 'Unknown',
    country: app.country || 'Unknown',
    submissionDate: new Date().toISOString().split('T')[0],
    passport: 'N/A',
  };
}

export default function ReviewQueuePage() {
  const { currentOfficer, isLoading: officerLoading } = useOfficer();
  const [selectedTab, setSelectedTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [applications, setApplications] = useState<ApplicationReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch applications when officer changes
  useEffect(() => {
    async function fetchApplications() {
      if (!currentOfficer) return;

      setIsLoading(true);
      setError(null);

      // Special case: Rachel Johnson (Demo) shows hardcoded mock data
      if (currentOfficer.id === 'officer-demo') {
        console.log('Using mock data for Rachel Johnson (Demo)');
        setApplications(mockReviewsForDemo);
        setIsLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams({
          assignedTo: currentOfficer.id,
          pageSize: '50',
        });

        console.log('Fetching applications for officer:', currentOfficer.id);
        const response = await fetch(`/api/applications?${params}`);
        const data = await response.json();
        console.log('API response:', data);

        if (data.success) {
          const applications = data.data || [];
          const transformed = applications.map(transformApplicationToReview);
          console.log('Transformed applications:', transformed.length);
          setApplications(transformed);
          setError(null);
        } else {
          console.error('API error:', data.error);
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
