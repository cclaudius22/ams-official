// src/app/dashboard/live-intelligence/page.tsx
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  RefreshCw, 
  Clock, 
  ChevronDown,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  TrendingUp
} from 'lucide-react'

// Import the LiveMetricsSection component
import LiveMetricsSection from '@/components/dashboard/LiveMetricsSection'
import { ProcessingMetricsTab } from '@/components/dashboard/ProcessingMetricsTab'

export default function LiveIntelligencePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeframe, setTimeframe] = useState('today');

  // Function to refresh data
  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  // Options for timeframe dropdown
  const timeframeOptions = {
    'today': 'Today',
    'week': 'This Week',
    'month': 'This Month',
    'quarter': 'This Quarter',
    'year': 'This Year'
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with title, timeframe selector, and refresh button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
        <h1 className="text-2xl font-semibold text-gray-800">Live Intelligence Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time analytics and insights
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="relative">
            <Button variant="outline" className="flex items-center gap-2">
              {timeframeOptions[timeframe]}
              <ChevronDown className="h-4 w-4" />
            </Button>
            {/* Dropdown would go here in a production app */}
          </div>
          
          {/* Last Updated */}
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Last updated: </span>
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </div>
          
          {/* Refresh Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={refreshData} 
            disabled={isRefreshing} 
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <BarChartIcon className="h-4 w-4" />
            Processing Metrics
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="geographic" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Geographic Analysis
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab Content */}
        <TabsContent value="overview" className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Processing Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,543</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">↑12%</span> from previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Processing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42min</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-500">↑8%</span> from previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">87.3%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">↑1.2%</span> from previous period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">96.8%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500">↑0.5%</span> from previous period
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Charts from LiveMetricsSection */}
          <LiveMetricsSection />
        </TabsContent>
        
          {/* --- Processing Metrics Tab Content --- */}
          <TabsContent value="processing"> {/* Removed space-y-4, let the Tab component handle internal spacing */}
               
                <ProcessingMetricsTab />

            </TabsContent>

        {/* Predictions Tab Content */}
        <TabsContent value="predictions" className="space-y-4">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Future Predictions</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-6">
              <p className="text-gray-500">Predictive analytics are being developed. Check back soon for updates.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Geographic Analysis Tab Content */}
        <TabsContent value="geographic" className="space-y-4">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle>Geographic Analysis</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-6">
              <p className="text-gray-500">Geographic analysis tools are being developed. Check back soon for updates.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}