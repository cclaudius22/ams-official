// src/app/dashboard/livequeue/page.tsx
'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Clock, Search, Filter, RefreshCw, UserCog,
  ChevronLeft, ChevronRight, Download, Loader2, Sparkles, Wand2, CheckCircle, XCircle, RotateCcw
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// --- Local Component Imports ---
import ApplicationRow from '@/components/dashboard/ApplicationRow'
import AdvancedFilterPanel from '@/components/dashboard/AdvancedFilterPanel'
import LiveQueueMetrics from '@/components/dashboard/LiveQueueMetrics'
import AssignmentModal from '@/components/dashboard/AssignmentModal'

// --- Type Imports ---
import { LiveApplication, LiveQueueFilters, LiveQueueStats } from '@/types/liveQueue'
import { ConsulateOfficial } from '@/api-contracts/users'

// Calculate queue stats from applications
function calculateQueueStats(applications: LiveApplication[] | undefined): LiveQueueStats {
  const stats: LiveQueueStats = {
    total: applications?.length ?? 0,
    pending: 0,
    inProgress: 0,
    awaitingDecision: 0,
    escalated: 0,
    avgWaitTime: 0,
    oldestApplication: null,
  };

  if (applications) {
    applications.forEach(app => {
      // Count by status - handle both display and internal status formats
      const status = app.status;
      if (status === 'Pending' || status === 'Pending Assignment') {
        stats.pending++;
      } else if (status === 'In Progress') {
        stats.inProgress++;
      } else if (status === 'Awaiting Info') {
        stats.awaitingDecision++;
      } else if (status === 'Escalated') {
        stats.escalated++;
      }

      // Track oldest application
      if (!stats.oldestApplication) {
        stats.oldestApplication = app.id;
      }
    });
  }

  // Avg wait time would be calculated from actual timestamps in production
  stats.avgWaitTime = 45; // Mock value

  return stats;
}

export default function LiveQueuePage() {
  const router = useRouter();

  // --- State Management ---
  const [applications, setApplications] = useState<LiveApplication[]>([]);
  const [officers, setOfficers] = useState<ConsulateOfficial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [autoAssignResult, setAutoAssignResult] = useState<{
    assigned: number;
    failed: number;
    byOfficer: Record<string, { name: string; count: number; visaTypes: string[] }>;
  } | null>(null);
  const [filters, setFilters] = useState<LiveQueueFilters>({
    search: '',
    status: [],
    visaType: [],
    country: [],
    assignedTo: []
  });

  const itemsPerPage = 20;

  // --- Data Fetching ---
  const fetchApplications = useCallback(async () => {
    try {
      // Load all applications for demo (pageSize=1000)
      const response = await fetch('/api/applications?pageSize=1000');
      const data = await response.json();

      if (data.success) {
        setApplications(data.data);
        setLastUpdated(new Date());
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch applications');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Fetch applications error:', err);
    }
  }, []);

  const fetchOfficers = useCallback(async () => {
    try {
      const response = await fetch('/api/officers');
      const data = await response.json();

      if (data.success) {
        setOfficers(data.data);
      }
    } catch (err) {
      console.error('Fetch officers error:', err);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchApplications(), fetchOfficers()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchApplications, fetchOfficers]);

  // --- Data Calculations ---
  const stats: LiveQueueStats = useMemo(() => calculateQueueStats(applications), [applications]);

  // Derive filter options from applications
  const filterOptions = useMemo(() => {
    const uniqueStatuses = [...new Set(applications.map(app => app.status))];
    const uniqueVisaTypes = [...new Set(applications.map(app => app.visaType.split(',')[0].trim()))];
    const uniqueCountries = [...new Set(applications.map(app => app.country))];
    const assignableOfficials = officers.map(official => ({
      id: official.id,
      name: `${official.firstName} ${official.lastName}`
    }));

    return {
      status: uniqueStatuses,
      visaType: uniqueVisaTypes,
      country: uniqueCountries,
      assignedTo: assignableOfficials
    };
  }, [applications, officers]);

  // Sync searchQuery with filters.search
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchQuery
    }));
  }, [searchQuery]);

  // Apply filters and search to applications
  const filteredApplications = useMemo(() => {
    let result = [...applications];

    // Apply text search (ID or Applicant Name)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        result = result.filter(app =>
          app.id.toLowerCase().includes(query) ||
          app.applicantName.toLowerCase().includes(query)
        );
      }
    }

    // Apply status filter
    if (filters.status?.length > 0) {
      result = result.filter(app => filters.status.includes(app.status));
    }

    // Apply visa type filter
    if (filters.visaType?.length > 0) {
      result = result.filter(app =>
        filters.visaType.some(type => app.visaType.toLowerCase().startsWith(type.toLowerCase()))
      );
    }

    // Apply country filter
    if (filters.country?.length > 0) {
      result = result.filter(app => filters.country.includes(app.country));
    }

    // Apply assigned to filter
    if (filters.assignedTo && filters.assignedTo.length > 0) {
      const assignedToFilter = filters.assignedTo;
      result = result.filter(app =>
        app.assignedTo && assignedToFilter.includes(app.assignedTo.id)
      );
    }

    return result;
  }, [applications, searchQuery, filters]);

  // Calculate paginated applications
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplications, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  // --- Event Handlers ---
  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchApplications();
    setIsRefreshing(false);
  };

  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplications(prev =>
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const toggleSelectAll = () => {
    const currentPageIds = paginatedApplications.map(app => app.id);
    if (selectedApplications.length === currentPageIds.length && currentPageIds.length > 0) {
      setSelectedApplications(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedApplications(prev => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const viewApplication = (application: LiveApplication) => {
    const appIdForUrl = application.id.startsWith('#') ? application.id.substring(1) : application.id;
    router.push(`/dashboard/reviewer/${appIdForUrl}`);
  };

  const handleAssign = () => {
    if (selectedApplications.length === 0) return;
    setShowAssignmentModal(true);
  };

  const handleAssignToOfficer = async (officerId: string) => {
    if (selectedApplications.length === 0) return;

    setIsAssigning(true);
    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationIds: selectedApplications,
          officerId
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh applications to show updated assignments
        await fetchApplications();
        setSelectedApplications([]);
        setShowAssignmentModal(false);
      } else {
        alert(`Assignment failed: ${data.error}`);
      }
    } catch (err) {
      console.error('Assignment error:', err);
      alert('Failed to assign applications');
    } finally {
      setIsAssigning(false);
    }
  };

  const applyAdvancedFilters = (newFilters: LiveQueueFilters) => {
    setFilters(newFilters);
    setSearchQuery(newFilters.search);
    setCurrentPage(1);
    setShowAdvancedFilters(false);
  };

  // Auto-assign all unassigned applications
  const handleAutoAssignAll = async () => {
    const unassignedCount = applications.filter(
      app => app.status === 'Pending Assignment' && !app.assignedTo
    ).length;

    if (unassignedCount === 0) {
      alert('No unassigned applications to process');
      return;
    }

    if (!confirm(`Auto-assign ${unassignedCount} applications to officers based on specialization?`)) {
      return;
    }

    setIsAutoAssigning(true);
    setAutoAssignResult(null);

    try {
      const response = await fetch('/api/assignments/auto-assign-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setAutoAssignResult(data.data);
        // Refresh to show updated assignments
        await fetchApplications();
      } else {
        alert(`Auto-assign failed: ${data.error}`);
      }
    } catch (err) {
      console.error('Auto-assign error:', err);
      alert('Failed to auto-assign applications');
    } finally {
      setIsAutoAssigning(false);
    }
  };

  // Count unassigned applications
  const unassignedCount = useMemo(() =>
    applications.filter(app => app.status === 'Pending Assignment' && !app.assignedTo).length,
    [applications]
  );

  // Reset all assignments (for demo)
  const handleResetAssignments = async () => {
    if (!confirm('Reset all assignments? This will set all applications back to "Pending Assignment".')) {
      return;
    }

    try {
      const response = await fetch('/api/assignments/reset', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setAutoAssignResult(null);
        await fetchApplications();
      } else {
        alert(`Reset failed: ${data.error}`);
      }
    } catch (err) {
      console.error('Reset error:', err);
      alert('Failed to reset assignments');
    }
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading applications...</span>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={refreshData}>Retry</Button>
      </div>
    );
  }

  // --- Component Render ---
  return (
    <div className="space-y-6">
      {/* Live Queue Metrics Section */}
      <LiveQueueMetrics applications={applications} officials={officers} />

      {/* Header with Title and Last Updated */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Applications Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total in Queue: {stats.total}
            {applications.length === 1000 && (
              <Badge variant="outline" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Synthetic Demo Data
              </Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString('en-GB') : 'Calculating...'}</span>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={refreshData} disabled={isRefreshing} title="Refresh Queue" >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          {unassignedCount < applications.length && (
            <Button variant="ghost" size="sm" className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={handleResetAssignments} title="Reset all assignments (Demo)">
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Main content block */}
      <div>
        {/* Search and filter bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-4">
          <div className="relative flex-grow w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input type="text" placeholder="Search ID or applicant name..." className="pl-9 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" onClick={() => setShowAdvancedFilters(true)}>
              <Filter className="h-4 w-4 mr-2" /> Filters
              {(filters.status.length > 0 || filters.visaType.length > 0 ||
                filters.country.length > 0 || (filters.assignedTo && filters.assignedTo.length > 0)) && (
                <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {filters.status.length + filters.visaType.length +
                   filters.country.length + (filters.assignedTo?.length || 0)}
                </Badge>
              )}
            </Button>
            <Button variant="outline"> <Download className="h-4 w-4 mr-2" /> Export </Button>
            <Button variant="outline" disabled={selectedApplications.length === 0} onClick={handleAssign}>
              <UserCog className="h-4 w-4 mr-2" /> Assign ({selectedApplications.length})
            </Button>
            {unassignedCount > 0 && (
              <Button
                onClick={handleAutoAssignAll}
                disabled={isAutoAssigning}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isAutoAssigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Auto-Assign All ({unassignedCount})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Auto-Assign Results Banner */}
        {autoAssignResult && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    Auto-Assignment Complete
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Successfully assigned <span className="font-bold text-green-700">{autoAssignResult.assigned}</span> applications
                  {autoAssignResult.failed > 0 && (
                    <span className="text-red-600"> ({autoAssignResult.failed} failed)</span>
                  )}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(autoAssignResult.byOfficer).map(([id, data]) => (
                    <div key={id} className="bg-white rounded-md p-2 border border-gray-200">
                      <div className="font-medium text-sm">{data.name}</div>
                      <div className="text-lg font-bold text-blue-600">{data.count}</div>
                      <div className="text-xs text-gray-500">
                        {data.visaTypes.slice(0, 2).join(', ')}
                        {data.visaTypes.length > 2 && ` +${data.visaTypes.length - 2}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAutoAssignResult(null)}
                className="text-gray-500"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Applications table */}
        <div className="bg-white rounded-md border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <tr>
                  <th className="py-3 px-4 w-12">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedApplications.length === paginatedApplications.length && paginatedApplications.length > 0}
                        onChange={toggleSelectAll}
                        disabled={paginatedApplications.length === 0}
                      />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Applicant</th>
                  <th className="py-3 px-4 text-left">Visa Details</th>
                  <th className="py-3 px-4 text-left">Submitted</th>
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
                      isSelected={selectedApplications.includes(application.id)}
                      onCheckboxChange={() => toggleApplicationSelection(application.id)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No applications matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between border-t px-4 py-3 text-sm">
              <div className="text-gray-500 mb-2 sm:mb-0">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>-<span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredApplications.length)}</span> of <span className="font-medium">{filteredApplications.length}</span> results
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="px-2 text-gray-700">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</Button>
              </div>
            </div>
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
          availableFilters={filterOptions}
        />
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <AssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => setShowAssignmentModal(false)}
          selectedApplicationIds={selectedApplications}
          officers={officers}
          onAssign={handleAssignToOfficer}
          isAssigning={isAssigning}
        />
      )}
    </div>
  )
}
