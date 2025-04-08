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
  Clock, Users, AlertTriangle, FileText, Search, Filter, ShieldCheck, Inbox, CheckCircle2, Activity, AlertCircle, MoreHorizontal // Keep necessary icons
} from 'lucide-react'

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
      {/* Alerts */}
      {/* ... (Alert logic based on activeReviews) ... */}

      {/* Quick Stats */}
      {/* ... (Stats cards - maybe update counts based on filtered lists) ... */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <Card className="bg-white"> <CardContent className="p-4"> <div><p className="text-sm text-gray-500">Active Queue</p><p className="text-2xl font-bold">{activeReviews.length}</p></div> <Inbox className="h-8 w-8 text-blue-500" /> </CardContent> </Card>
         {/* ... other stats cards */}
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
        <TabsList>
          <TabsTrigger value="active">Active Reviews ({activeReviews.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingReviews.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="escalated">Escalated ({escalatedReviews.length})</TabsTrigger>
        </TabsList>

        {/* Active Tab */}
        <TabsContent value="active">
          {activeReviews.length > 0 ? (
            // *** Use the imported ReviewCard component ***
            activeReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No active reviews matching your criteria.</div>
          )}
        </TabsContent>

         {/* Pending Tab */}
        <TabsContent value="pending">
          {pendingReviews.length > 0 ? (
            pendingReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
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
            escalatedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))
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