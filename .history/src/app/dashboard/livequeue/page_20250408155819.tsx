// src/app/dashboard/reviewer/live-queue/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Clock, Search, Filter, RefreshCw, CheckCircle2, XCircle, AlertCircle, UserCog,
  ChevronLeft, ChevronRight, Download, MoreHorizontal, Inbox
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// --- Local Component Imports (Assume these exist or create placeholders) ---
import ApplicationRow from '@/components/dashboard/ApplicationRow'
import AdvancedFilterPanel from '@/components/dashboard/AdvancedFilterPanel'

// --- Type and Mock Data Imports ---
import { LiveApplication, LiveQueueFilters, QueueStats, Official } from '@/types/liveQueue' // Adjust path if needed
import { mockLiveQueue, mockOfficials, calculateQueueStats } from '@/lib/mockdata-livequeue' // Adjust path if needed

export default function LiveQueuePage() {
  const router = useRouter();

  // --- State Management ---
  // Replace mockLiveQueue with [] when using TanStack Query
  const [applications, setApplications] = useState<LiveApplication[]>(mockLiveQueue);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<LiveQueueFilters>({
    // Initialize filter arrays as empty
    status: [],
    visaType: [],
    country: [],
    assignedTo: []
  });

  const itemsPerPage = 10; // Or make this configurable

  // --- Effects ---
  // Set initial date on client-side mount
  useEffect(() => {
    setLastUpdated(new Date());
  }, []);

  // --- Data Calculations (using useMemo) ---
  // Calculate stats based on the *source* application list (before filtering)
  const stats: QueueStats = useMemo(() => calculateQueueStats(applications), [applications]);

  // Derive filter options from the *source* application list
  const filterOptions = useMemo(() => {
    const uniqueStatuses = [...new Set(applications.map(app => app.status))];
    // Extract base visa type (e.g., "Student Visa" from "Student Visa, MSc")
    const uniqueVisaTypes = [...new Set(applications.map(app => app.visaType.split(',')[0].trim()))];
    const uniqueCountries = [...new Set(applications.map(app => app.country))];
    // Assuming mockOfficials holds the list of assignable officers
    const assignableOfficials = mockOfficials.map(official => ({ id: official.id, name: official.name }));

    return {
      status: uniqueStatuses,
      visaType: uniqueVisaTypes,
      country: uniqueCountries,
      assignedTo: assignableOfficials // Use mockOfficials for dropdown
    };
  }, [applications]); // Recalculate if source applications change

  // Apply filters and search to applications
  const filteredApplications = useMemo(() => {
    let result = [...applications]; // Start with all applications

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

    // Apply visa type filter (match base type)
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
    if (filters.assignedTo?.length > 0) {
      const assignedToFilter = filters.assignedTo; // Help TS narrowing
      result = result.filter(app =>
        app.assignedTo && assignedToFilter.includes(app.assignedTo.id)
      );
    }

    return result;
  }, [applications, searchQuery, filters]);

  // Calculate paginated applications based on the filtered list
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredApplications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredApplications, currentPage, itemsPerPage]);

  // Calculate total pages based on the filtered list
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

  // --- Event Handlers ---
  const refreshData = () => {
    // Replace with TanStack Query refetch logic later
    setIsRefreshing(true);
    console.log("Refreshing data...");
    setTimeout(() => {
      // Simulate fetching new data or re-using mock
      // setApplications(prev => [...prev]); // Could shuffle or update mock data here
      setLastUpdated(new Date());
      setIsRefreshing(false);
      console.log("Refresh complete.");
    }, 1000);
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
      // Deselect all on current page if all are selected
      setSelectedApplications(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      // Select all unique IDs on current page
      setSelectedApplications(prev => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  // Navigate to individual review page
  const viewApplication = (application: LiveApplication) => {
    const appIdForUrl = application.id.startsWith('#') ? application.id.substring(1) : application.id;
    router.push(`/dashboard/reviewer/${appIdForUrl}`);
  };

  // Placeholder for assigning selected applications
  const handleAssign = () => {
     if (selectedApplications.length === 0) return;
     // Open an assignment modal/dropdown here, passing selectedApplications
     alert(`Assign ${selectedApplications.length} application(s) - Functionality TBD`);
     // Inside the modal's confirm: call assignToOfficial(officialId)
  }

  // Placeholder function simulating backend update for assignment
  const assignToOfficial = (officialId: string) => {
    if (selectedApplications.length === 0) return;
    const official = mockOfficials.find(o => o.id === officialId);
    if (!official) return;

    console.log(`Assigning ${selectedApplications.join(', ')} to ${official.name}`);
    setApplications(prev =>
      prev.map(app =>
        selectedApplications.includes(app.id)
          ? { ...app, assignedTo: { id: official.id, name: official.name } }
          : app
      )
    );
    setSelectedApplications([]); // Clear selection after assignment
  };

  // Apply filters from the AdvancedFilterPanel
  const applyAdvancedFilters = (newFilters: LiveQueueFilters) => {
    console.log("Applying advanced filters:", newFilters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    setShowAdvancedFilters(false); // Close panel
  };

  // --- Component Render ---
  return (
    <div className="space-y-6">
      {/* Last Updated Timestamp & Refresh */}
      <div className="flex justify-end items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Queue Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString('en-GB') : 'Calculating...'}</span>
          <Button variant="ghost" size="sm" className="ml-2 h-8 w-8 p-0" onClick={refreshData} disabled={isRefreshing} title="Refresh Queue" >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {/* Total Applications Card */}
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">Total in Queue</CardTitle> <Inbox className="h-4 w-4 text-muted-foreground" /> </CardHeader>
              <CardContent> <div className="text-2xl font-bold">{stats.total}</div> </CardContent>
            </Card>
             {/* In Progress Card */}
             <Card className="bg-white">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">In Progress</CardTitle> <AlertCircle className="h-4 w-4 text-muted-foreground" /> </CardHeader>
               <CardContent> <div className="text-2xl font-bold">{stats.inProgress}</div> </CardContent>
             </Card>
             {/* Approved Card */}
              <Card className="bg-white">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">Approved Today</CardTitle> <CheckCircle2 className="h-4 w-4 text-muted-foreground" /> </CardHeader>
               <CardContent> <div className="text-2xl font-bold">{stats.approved}</div> </CardContent>
             </Card>
              {/* Rejected Card */}
              <Card className="bg-white">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"> <CardTitle className="text-sm font-medium">Rejected Today</CardTitle> <XCircle className="h-4 w-4 text-muted-foreground" /> </CardHeader>
               <CardContent> <div className="text-2xl font-bold">{stats.rejected}</div> </CardContent>
             </Card>
      </div>

      {/* Main content block (Search, Filter, Table, Pagination) */}
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
                {Object.values(filters).flat().filter(Boolean).length > 0 && ( <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100"> {Object.values(filters).flat().filter(Boolean).length} </Badge> )}
              </Button>
              <Button variant="outline"> <Download className="h-4 w-4 mr-2" /> Export </Button>
              <Button variant="outline" disabled={selectedApplications.length === 0} onClick={handleAssign}>
                 <UserCog className="h-4 w-4 mr-2" /> Assign ({selectedApplications.length})
              </Button>
              {/* Placeholder for More Actions Dropdown */}
              {/* <Button variant="outline" size="icon"> <MoreHorizontal className="h-4 w-4" /> </Button> */}
          </div>
        </div>

        {/* Applications table */}
        <div className="bg-white rounded-md border shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
                <tr>
                   <th className="py-3 px-4 w-12"> <div className="flex items-center justify-center"> <input type="checkbox" className="rounded border-gray-300" checked={selectedApplications.length === paginatedApplications.length && paginatedApplications.length > 0} onChange={toggleSelectAll} disabled={paginatedApplications.length === 0}/> </div> </th>
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
                      // Pass viewApplication to the row if clicking the row should navigate
                      // onSelect={() => viewApplication(application)}
                    />
                  ))
                ) : ( <tr> <td colSpan={7} className="text-center py-8 text-gray-500"> No applications matching your criteria. </td> </tr> )}
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

      {/* Advanced filters panel (Modal/Drawer) */}
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