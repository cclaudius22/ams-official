'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { LiveQueueFilters } from '@/types/liveQueue'
import { fetchLiveQueue, fetchOfficials, assignApplications, exportApplications } from '@/lib/api/liveQueue'

export default function LiveQueuePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  // State for pagination, filtering, and selection
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState<LiveQueueFilters>({
    search: '',
    status: [],
    visaType: [],
    country: [],
    assignedTo: []
  })
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Fetch applications with TanStack Query
  const { 
    data: queueData, 
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['liveQueue', currentPage, pageSize, filters],
    queryFn: () => fetchLiveQueue(filters, currentPage, pageSize),
    staleTime: 1000 * 60, // 1 minute
  })
  
  // Fetch officials
  const { 
    data: officials,
    isLoading: isLoadingOfficials
  } = useQuery({
    queryKey: ['officials'],
    queryFn: fetchOfficials,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
  
  // Mutation for assigning applications
  const assignMutation = useMutation({
    mutationFn: ({ applicationIds, officialId }: { applicationIds: string[], officialId: string }) => 
      assignApplications(applicationIds, officialId),
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['liveQueue'] })
      setSelectedApplications([])
    }
  })
  
  // Export mutation
  const exportMutation = useMutation({
    mutationFn: () => exportApplications(filters),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `visa-applications-export-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    }
  })
  
  // Handle view application
  const viewApplication = (applicationId: string) => {
    router.push(`/dashboard/reviewer/${applicationId}`)
  }
  
  // Handle assigning to an official
  const handleAssignToOfficial = (officialId: string) => {
    if (selectedApplications.length === 0) return
    
    assignMutation.mutate({
      applicationIds: selectedApplications,
      officialId
    })
  }
  
  // Handle bulk select/deselect
  const toggleSelectAll = () => {
    if (!queueData?.data) return
    
    if (selectedApplications.length === queueData.data.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(queueData.data.map(app => app.id))
    }
  }
  
  // Toggle individual application selection
  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplications(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId)
      } else {
        return [...prev, applicationId]
      }
    })
  }
  
  // Update filters
  const applyAdvancedFilters = (newFilters: LiveQueueFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }
  
  // Calculate total pages
  const totalPages = queueData?.total 
    ? Math.ceil(queueData.total / pageSize)
    : 0
  
  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Live Queue</h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Last refreshed: {new Date().toLocaleTimeString()}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* These would be dynamic based on query response */}
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Total Applications</p>
                <p className="text-2xl font-bold">{queueData?.total || 0}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          {/* Other stats cards would go here */}
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
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <Button variant="outline" onClick={() => setShowAdvancedFilters(true)}>
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {Object.values(filters).flat().filter(Boolean).length > 0 && (
                <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {Object.values(filters).flat().filter(Boolean).length}
                </Badge>
              )}
              </Button>
            <Button 
              variant="outline"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isLoading}
            >
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
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p>Error loading applications: {error instanceof Error ? error.message : 'Unknown error'}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => refetch()}
                >
                  Try Again
                </Button>
              </div>
            ) : queueData?.data.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No applications matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 text-left">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 mr-2"
                            checked={selectedApplications.length === queueData?.data.length && queueData?.data.length > 0}
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
                    {queueData?.data.map(application => (
                      <ApplicationRow 
                        key={application.id}
                        application={application}
                        onSelect={() => viewApplication(application.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination */}
            {(queueData?.total ?? 0) > pageSize && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, queueData?.total || 0)}
                  </span>{' '}
                  of <span className="font-medium">{queueData?.total || 0}</span> results
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
                    disabled={currentPage === totalPages || totalPages === 0}
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
          {isLoadingOfficials ? (
            <Card className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </Card>
          ) : (
            <OfficialsPanel 
              officials={officials || []}
              onAssignApplication={handleAssignToOfficial}
            />
          )}
        </div>
      </div>
      
      {/* Advanced filters panel */}
      {showAdvancedFilters && (
        <AdvancedFilterPanel
          isOpen={showAdvancedFilters}
          onClose={() => setShowAdvancedFilters(false)}
          filters={filters}
          onApplyFilters={applyAdvancedFilters}
          availableFilters={{
            status: ['In Progress', 'Approved', 'Pending', 'Rejected'],
            visaType: ['Tourist', 'Business', 'Student', 'Work', 'Family', 'Medical', 'Religious'],
            country: ['us', 'gb', 'ca', 'au', 'fr', 'de', 'jp', 'cn', 'in', 'br', 'eg', 'pl', 'gr', 'hk', 'th'],
            assignedTo: officials?.map(o => ({ id: o.id, name: o.name })) || []
          }}
        />
      )}
    </div>
  )
}