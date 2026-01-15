'use client'

import React, { useState } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  FilePlus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  Plus,
  Clock,
  AlertCircle,
  FileEdit
} from 'lucide-react'
import Link from 'next/link'

// Draft visa types (simulated)
interface DraftVisaType {
  id: string
  name: string
  visaCode: string
  category: string
  country: string
  createdAt: string
  updatedAt: string
  completeness: number
  status: 'draft' | 'review' | 'rejected'
  issues?: string[]
}

const DRAFT_VISA_TYPES: DraftVisaType[] = [
  {
    id: 'draft-1',
    name: 'Digital Nomad Visa',
    visaCode: 'UK-DNV',
    category: 'work',
    country: 'United Kingdom',
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-14T15:30:00Z',
    completeness: 75,
    status: 'draft',
    issues: ['Missing processing tiers', 'KYC requirements incomplete']
  },
  {
    id: 'draft-2',
    name: 'Start-up Visa',
    visaCode: 'UK-SUV',
    category: 'business',
    country: 'United Kingdom',
    createdAt: '2024-12-08T09:00:00Z',
    updatedAt: '2024-12-12T11:00:00Z',
    completeness: 90,
    status: 'review'
  },
  {
    id: 'draft-3',
    name: 'Graduate Visa',
    visaCode: 'UK-GRD',
    category: 'work',
    country: 'United Kingdom',
    createdAt: '2024-12-05T14:00:00Z',
    updatedAt: '2024-12-06T10:00:00Z',
    completeness: 45,
    status: 'draft',
    issues: ['Missing eligibility criteria', 'No document requirements', 'Processing info incomplete']
  },
  {
    id: 'draft-4',
    name: 'Youth Mobility Scheme',
    visaCode: 'UK-YMS',
    category: 'work',
    country: 'United Kingdom',
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-03T16:00:00Z',
    completeness: 100,
    status: 'rejected',
    issues: ['Duplicate of existing visa type']
  }
]

export default function NewVisaTypesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDraft, setSelectedDraft] = useState<DraftVisaType | null>(null)

  const filteredDrafts = DRAFT_VISA_TYPES.filter(draft =>
    searchQuery === '' ||
    draft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.visaCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status: DraftVisaType['status']) => {
    switch (status) {
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
      case 'review':
        return <Badge className="bg-blue-100 text-blue-800">In Review</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
    }
  }

  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 90) return 'bg-green-500'
    if (completeness >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleDelete = (draft: DraftVisaType) => {
    setSelectedDraft(draft)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    console.log('Deleting draft:', selectedDraft?.id)
    setDeleteDialogOpen(false)
    setSelectedDraft(null)
  }

  const draftCount = DRAFT_VISA_TYPES.filter(d => d.status === 'draft').length
  const reviewCount = DRAFT_VISA_TYPES.filter(d => d.status === 'review').length
  const rejectedCount = DRAFT_VISA_TYPES.filter(d => d.status === 'rejected').length

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <FilePlus className="h-7 w-7" />
                New Visa Types
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Draft visa types pending review and publication
              </p>
            </div>
            <Link href="/visa-builder">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Drafts</p>
                    <p className="text-2xl font-bold">{DRAFT_VISA_TYPES.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileEdit className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In Progress</p>
                    <p className="text-2xl font-bold">{draftCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">In Review</p>
                    <p className="text-2xl font-bold">{reviewCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold">{rejectedCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search drafts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Drafts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Draft Visa Types</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visa Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completeness</TableHead>
                    <TableHead>Issues</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrafts.map((draft) => (
                    <TableRow key={draft.id}>
                      <TableCell>
                        <p className="font-medium">{draft.name}</p>
                        <p className="text-xs text-gray-500">{draft.country}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {draft.visaCode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {draft.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(draft.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getCompletenessColor(draft.completeness)}`}
                              style={{ width: `${draft.completeness}%` }}
                            />
                          </div>
                          <span className="text-sm">{draft.completeness}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {draft.issues && draft.issues.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-amber-600">{draft.issues.length}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-green-600">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(draft.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Continue Editing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            {draft.completeness === 100 && draft.status === 'draft' && (
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                Submit for Review
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(draft)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredDrafts.length === 0 && (
                <div className="text-center py-12">
                  <FilePlus className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No draft visa types found</p>
                  <Link href="/visa-builder">
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Visa Type
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Draft?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;{selectedDraft?.name}&quot;? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
