'use client'

import React, { useState } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileCheck,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  Download,
  Plus,
  Filter,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { SAMPLE_VISA_TYPES, VISA_CATEGORIES } from '@/lib/sample-visa-types'
import { VisaTypeConfig } from '@/types/visaType'

export default function PublishedVisaTypesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [visaKeyFilter, setVisaKeyFilter] = useState<string>('all')
  const [selectedVisa, setSelectedVisa] = useState<VisaTypeConfig | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // Get unique countries
  const countries = [...new Set(SAMPLE_VISA_TYPES.map(v =>
    typeof v.country === 'string' ? v.country : v.country?.name || 'Unknown'
  ))]

  // Filter visa types
  const filteredVisaTypes = SAMPLE_VISA_TYPES.filter(visa => {
    const matchesSearch = searchQuery === '' ||
      visa.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visa.visaCode.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || visa.category === categoryFilter

    const visaCountry = typeof visa.country === 'string' ? visa.country : visa.country?.name
    const matchesCountry = countryFilter === 'all' || visaCountry === countryFilter

    const matchesVisaKey = visaKeyFilter === 'all' ||
      (visaKeyFilter === 'enabled' && visa.visaKey?.enabled) ||
      (visaKeyFilter === 'disabled' && !visa.visaKey?.enabled)

    return matchesSearch && matchesCategory && matchesCountry && matchesVisaKey
  })

  // Count VisaKey enabled visas
  const visaKeyEnabledCount = SAMPLE_VISA_TYPES.filter(v => v.visaKey?.enabled).length

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      work: 'bg-blue-100 text-blue-800',
      tourist: 'bg-green-100 text-green-800',
      student: 'bg-purple-100 text-purple-800',
      business: 'bg-orange-100 text-orange-800',
      family: 'bg-pink-100 text-pink-800',
      investor: 'bg-amber-100 text-amber-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleExportJson = (visa: VisaTypeConfig) => {
    const blob = new Blob([JSON.stringify(visa, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${visa.visaCode}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

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
                <FileCheck className="h-7 w-7" />
                Published Visa Types
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {filteredVisaTypes.length} visa types configured and active
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Published</p>
                    <p className="text-2xl font-bold">{SAMPLE_VISA_TYPES.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileCheck className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-2xl font-bold">{SAMPLE_VISA_TYPES.filter(v => v.isActive).length}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">VisaKey Enabled</p>
                    <p className="text-2xl font-bold">{visaKeyEnabledCount}</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Categories</p>
                    <p className="text-2xl font-bold">{VISA_CATEGORIES.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Filter className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Countries</p>
                    <p className="text-2xl font-bold">{countries.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Globe className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {VISA_CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={visaKeyFilter} onValueChange={setVisaKeyFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="VisaKey Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Visas</SelectItem>
                    <SelectItem value="enabled">VisaKey Enabled</SelectItem>
                    <SelectItem value="disabled">Standard (No VisaKey)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Visa Types Table */}
          <Card>
            <CardHeader>
              <CardTitle>Visa Types</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visa Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>VisaKey</TableHead>
                    <TableHead>Processing</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVisaTypes.map((visa) => (
                    <TableRow key={visa.visaCode}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{visa.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-[250px]">
                            {visa.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {visa.visaCode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(visa.category as string)}>
                          {visa.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {typeof visa.country === 'string' ? visa.country : visa.country?.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {visa.visaKey?.enabled ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                            <Zap className="h-3 w-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {visa.processingTier?.[0]?.timeframe || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {visa.metadata?.successRate ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${visa.metadata.successRate}%` }}
                              />
                            </div>
                            <span className="text-sm">{visa.metadata.successRate}%</span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {visa.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(visa.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedVisa(visa)
                              setViewDialogOpen(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedVisa(visa)
                              setViewDialogOpen(true)
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportJson(visa)}>
                              <Download className="h-4 w-4 mr-2" />
                              Export JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(visa, null, 2))
                            }}>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
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

              {filteredVisaTypes.length === 0 && (
                <div className="text-center py-12">
                  <FileCheck className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No visa types found matching your filters</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* JSON Viewer Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {selectedVisa?.visaCode}
                  </Badge>
                  {selectedVisa?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-auto">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
                  <code>{selectedVisa ? JSON.stringify(selectedVisa, null, 2) : ''}</code>
                </pre>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedVisa) {
                      navigator.clipboard.writeText(JSON.stringify(selectedVisa, null, 2))
                    }
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedVisa) {
                      handleExportJson(selectedVisa)
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
