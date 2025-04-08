'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Clock,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import OfficialsPanel from '@/components/dashboard/OfficialsPanel'
import ApplicationRow from '@/components/dashboard/ApplicationRow'
import AdvancedFilterPanel from '@/components/dashboard/AdvancedFilterPanel'
import { LiveApplication, LiveQueueFilters } from '@/types/liveQueue'
import { mockLiveQueue, mockOfficials, calculateQueueStats } from '@/lib/mockdata-livequeue'

// This would be replaced by real data from API call using TanStack Query
// const fetchLiveQueue = async () => {
//   const response = await fetch('/api/livequeue');
//   return response.json();
// };

export default function LiveQueuePage() {
  const router = useRouter()
  const [applications, setApplications] = useState<LiveApplication[]>(mockLiveQueue)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null) // Initialize as null
  const [currentPage, setCurrentPage] = useState(1)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  const [filters, setFilters] = useState<LiveQueueFilters>({
    search: '',
    status: [],
    visaType: [],
    country: [],
    assignedTo: []
  })
  
  const itemsPerPage = 10

  // Set initial date on client-side
  useEffect(() => {
    setLastUpdated(new Date());
  }, []); // Empty dependency array ensures this runs only once on mount
  
  // Stats based on all applications (not just filtered ones)
  const stats = useMemo(() => calculateQueueStats(applications), [applications])
  
  // Get unique filter options
  const filterOptions = useMemo(() => {
    return {
      status: [...new Set(applications.map(app => app.status))],
      visaType: [...new Set(applications.map(app => app.visaType.split(',')[0].trim()))],
      country: [...new Set(applications.map(app => app.country))],
      assignedTo: mockOfficials.map(official => ({ id: official.id, name: official.name }))
    }
  }, [applications])
  
  // Apply filters and search to applications
  const filteredApplications = useMemo(() => {
    let result = [...applications]
    
    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(app => 
        app.id.toLowerCase().includes(query) ||
        app.applicantName.toLowerCase().includes(query)
      )
    }
    
    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter(app => filters.status.includes(app.status))
    }
    
    // Apply visa type filter
    if (filters.visaType.length > 0) {
      result = result.filter(app => 
        filters.visaType.some(type => app.visaType.includes(type))
      )
    }
    
    // Apply country filter
    if (filters.country.length > 0) {
      result = result.filter(app => filters.country.includes(app.country))
    }
    
    // Apply assigned to filter
    // Check if filters.assignedTo is defined and has items
    if (filters.assignedTo && filters.assignedTo.length > 0) {
      // Assign to a const to help TS with type narrowing inside the callback
      const assignedToFilter = filters.assignedTo; 
      result = result.filter(app => 
        // Ensure app.assignedTo exists and its id is included in the filter array
        app.assignedTo && assignedToFilter.includes(app.assignedTo.id)
      )
    }
    
    return result
  }, [applications, searchQuery, filters])
  
  // Pagination
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredApplications.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredApplications, currentPage, itemsPerPage])
  
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  
  // Handle refresh data
  const refreshData = () => {
    setIsRefreshing(true)
    
    // Simulate API call
    setTimeout(() => {
      // This would be replaced with actual data fetching
      // In a real implementation, we would use TanStack Query's refetch function
      setApplications(mockLiveQueue)
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 1000)
  }
  
  // Handle application selection
  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplications(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId)
      } else {
        return [...prev, applicationId]
      }
    })
  }
  
  // Handle bulk select all visible applications
  const toggleSelectAll = () => {
    if (selectedApplications.length === paginatedApplications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(paginatedApplications.map(app => app.id))
    }
  }
  
  // Handle viewing an application
  const viewApplication = (application: LiveApplication) => {
    router.push(`/dashboard/reviewer/${application.id}`)
  }
  
  // Handle assigning to official
  const assignToOfficial = (officialId: string) => {
    if (selectedApplications.length === 0) return
    
    // In a real application, this would make an API call
    setApplications(prev => 
      prev.map(app => 
        selectedApplications.includes(app.id)
          ? {
            ...app,
            assignedTo: {
              id: officialId,
              name: mockOfficials.find(o => o.id === officialId)?.name || ''
            }
          }
        : app
    )
  )
  setSelectedApplications([])
}

// Apply advanced filters
const applyAdvancedFilters = (newFilters: LiveQueueFilters) => {
  setFilters(newFilters)
  setCurrentPage(1) // Reset to first page when filters change
}

return (
  <div className="space-y-6">
    {/* Header and Stats */}
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Live Queue</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Calculating...'}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </div>
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    
    {/* Main content area */}
    <div className="flex gap-6">
      <div className="flex-1">
        {/* Search and filter bar */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by ID or applicant name..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowAdvancedFilters(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {Object.values(filters).flat().filter(Boolean).length > 0 && (
              <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                {Object.values(filters).flat().filter(Boolean).length}
              </Badge>
            )}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            disabled={selectedApplications.length === 0}
          >
            <UserCog className="h-4 w-4 mr-2" />
            Assign
          </Button>
          <Button 
            variant="outline"
            disabled={selectedApplications.length === 0}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Applications table */}
        <div className="bg-white rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 text-left">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 mr-2"
                        checked={selectedApplications.length === paginatedApplications.length && paginatedApplications.length > 0}
                        onChange={toggleSelectAll}
                      />
                      ID
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">Applicant</th>
                  <th className="py-3 px-4 text-left">Visa Type, Category</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Assigned to</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.length > 0 ? (
                  paginatedApplications.map(application => (
                    <ApplicationRow 
                      key={application.id}
                      application={application}
                      onSelect={viewApplication}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No applications matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {filteredApplications.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredApplications.length)}
                </span>{' '}
                of <span className="font-medium">{filteredApplications.length}</span> results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic for showing pagination numbers
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                    }
                    if (currentPage > totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    }
                  }
                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Officials panel */}
      <div className="w-72">
        <OfficialsPanel 
          officials={mockOfficials}
          onAssignApplication={assignToOfficial}
        />
      </div>
    </div>
    
    {/* Advanced filters panel */}
    {showAdvancedFilters && (
      <AdvancedFilterPanel
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={filters}
        onApplyFilters={applyAdvancedFilters}
        availableFilters={filterOptions}
      />
    )}
  </div>
)
}
