// src/app/dashboard/livequeue/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Inbox, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'

// Import the LiveMetricsSection component
import LiveMetricsSection from '@/components/dashboard/LiveMetricsSection'

export default function SimplifiedLiveQueuePage() {
  // State for toggling the metrics section
  const [showMetrics, setShowMetrics] = useState(true); // Set to true to show metrics by default
  const [lastUpdated] = useState(new Date());

  // Mock stats for the example
  const stats = {
    total: 85,
    inProgress: 32,
    approved: 18,
    rejected: 7
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with toggle button */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="mr-2" 
            onClick={() => setShowMetrics(!showMetrics)}
          >
            {showMetrics ? 'Hide Metrics' : 'Show Metrics'}
          </Button>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          <span>Queue Last updated: {lastUpdated.toLocaleTimeString('en-GB')}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications Card */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total in Queue</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        {/* In Progress Card */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        
        {/* Approved Card */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>
        
        {/* Rejected Card */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Live Metrics Section - This is where the charts will appear */}
      {showMetrics && (
        <div className="mt-8">
          <LiveMetricsSection />
        </div>
      )}

      {/* Placeholder for the rest of your content */}
      <div className="bg-white p-6 rounded-md border">
        <h3 className="text-lg font-medium mb-4">Queue Content would go here</h3>
        <p>This is a simplified example to focus on the charts integration.</p>
      </div>
    </div>
  )
}