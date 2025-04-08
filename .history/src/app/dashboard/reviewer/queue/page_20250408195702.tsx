// src/app/dashboard/reviewer/queue/page.tsx
'use client'

import React, { useState, useMemo } from 'react' // Make sure useMemo is imported
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import ReviewCard from '@/components/dashboard/ReviewCard'; // Import ReviewCard
import { Input } from '@/components/ui/input'; // Import Input
import { Button } from '@/components/ui/button';
import {
  Clock, Users, AlertTriangle, FileText, Search, Filter, ShieldCheck, Inbox, 
  CheckCircle2, Activity, AlertCircle, MoreHorizontal, 
 
} from 'lucide-react'
import { cn } from '@/lib/utils';

// Types (Move to shared types/review.ts ideally)
interface ApplicationReview {
  id: string; // Should match the ID used for routing (e.g., '#UK-2024-1835')
  applicant: string;
  riskScore: number;
  slaRemaining: string;
  aiRecommendation: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'pending' | 'completed' | 'escalated';
  flags: string[];
  team: { background: string; identity: string; document: string; };
  lastUpdated: string;
  documents: string[];
  type: string;
  country: string;
}

// Mock Data (Keep this within the component for now, or import from lib/mockdata)
const mockReviews: ApplicationReview[] = [
  {
    id: '#UK-2024-1835', // ID used for display
    applicant: 'Robert Chen', riskScore: 78, slaRemaining: '4h 30m', aiRecommendation: 'Manual Review', priority: 'high', status: 'active', flags: ['Background Check Required', 'Multiple Applications'], team: { background: 'Sarah Johnson', identity: 'Uma Khan', document: 'Justin Time' }, lastUpdated: '2 hours ago', documents: ['Passport', 'Bank Statements', 'Employment Letter'], type: 'Business Visa', country: 'Cambodia'
  },
  {
    id: '#UK-2024-1836', // ID used for display
    applicant: 'Emma Thompson', riskScore: 45, slaRemaining: '6h 15m', aiRecommendation: 'Approve', priority: 'high', status: 'active', flags: ['First Time Applicant'], team: { background: 'Sarah Johnson', identity: 'Mike Fitzgerald', document: 'Alex Mckenna' }, lastUpdated: '1 hour ago', documents: ['Passport', 'Financial Documents'], type: 'Tourist Visa', country: 'Australia'
  },
   { // Add examples for other tabs if needed
     id: '#UK-2024-1837', applicant: 'Maria Garcia', riskScore: 60, slaRemaining: 'N/A', aiRecommendation: 'Refer', priority: 'medium', status: 'pending', flags: ['Incomplete Financials'], team: { background: 'Justin Time', identity: 'Mike Fitzgerald', document: 'Alex Mckenna' }, lastUpdated: '1 day ago', documents: ['Passport'], type: 'Student Visa', country: 'Spain'
   },
    { id: '#UK-2024-1838', applicant: 'Ben Carter', riskScore: 85, slaRemaining: 'N/A', aiRecommendation: 'Escalate', priority: 'high', status: 'escalated', flags: ['Potential Fraud Indicators'], team: { background: 'Supervisor', identity: 'Supervisor', document: 'Supervisor' }, lastUpdated: '3 hours ago', documents: ['All'], type: 'Investor Visa', country: 'USA'
   }
];
// --- End Mock Data ---

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
}

const StatsCard = ({ title, value, subtitle, icon, iconColor }: StatsCardProps) => (
  <Card className="bg-white shadow-sm">
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-5xl font-bold">{value}</p>
          <p className="text-sm text-green-600">{subtitle}</p>
        </div>
        <div className={`rounded-full p-3 ${iconColor}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function ReviewQueuePage() {
  const [selectedTab, setSelectedTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic using useMemo for slight optimization
  const getFilteredReviews = (status: string) => {
    return mockReviews.filter(review =>
      review.status === status &&
      (searchQuery === '' ||
       review.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
       review.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const activeReviews = useMemo(() => getFilteredReviews('active'), [searchQuery]);
  const pendingReviews = useMemo(() => getFilteredReviews('pending'), [searchQuery]);
  const escalatedReviews = useMemo(() => getFilteredReviews('escalated'), [searchQuery]);
  // Add completedReviews later if needed

  return (
    <div className="space-y-6">
      {/* SLA Breach Alert */}
      <Alert variant="destructive" className="bg-red-50 border border-red-200 text-red-600">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-red-600 font-semibold">SLA Breach Alert</AlertTitle>
        <AlertDescription>
          3 applications approaching SLA breach in the next 2 hours
        </AlertDescription>
      </Alert>

      {/* Stats Cards - Styled like the image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Tasks Card */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Today's Tasks</p>
                <p className="text-5xl font-bold">15/20</p>
                <p className="text-sm text-green-600">On Track</p>
              </div>
              <div className="text-blue-500">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SLA Status Card */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">SLA Status</p>
                <p className="text-5xl font-bold">97%</p>
                <p className="text-sm text-green-600">Within Target</p>
              </div>
              <div className="text-green-500">
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
                <p className="text-5xl font-bold">4</p>
                <p className="text-sm text-orange-500">Needs Attention</p>
              </div>
              <div className="text-orange-500">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accuracy Rate Card */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Accuracy Rate</p>
                <p className="text-5xl font-bold">99.2%</p>
                <p className="text-sm text-purple-600">Last 30 Days</p>
              </div>
              <div className="text-purple-500">
                <ShieldCheck className="h-6 w-6" />
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

      {/* Main Content Tabs */}
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
            Active Reviews ({activeReviews.length})
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
            Completed
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
           {/* Replace with actual completed list later */}
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Completed reviews will appear here</p>
          </div>
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
    </div>
  )
}