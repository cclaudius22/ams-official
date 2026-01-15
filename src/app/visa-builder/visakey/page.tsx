'use client'

import React, { useState } from 'react'
// VisaKey Visas Page - Admin page for managing VisaKey-enabled visas
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Zap,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Settings2,
  Download,
  Globe,
  Clock,
  Shield,
  DollarSign,
  Rocket,
  Timer,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { SAMPLE_VISA_TYPES, VISA_CATEGORIES } from '@/lib/sample-visa-types'
import { VisaTypeConfig } from '@/types/visaType'
import {
  VisaKeyConfig,
  VisaKeyProcessingTier,
  VisaKeyInsuranceRequirements,
  DEFAULT_PROCESSING_TIERS,
  DEFAULT_INSURANCE_REQUIREMENTS,
  countEnabledStages,
} from '@/lib/visakey-stages'

export default function VisaKeyVisasPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [countryFilter, setCountryFilter] = useState<string>('all')
  const [selectedVisa, setSelectedVisa] = useState<VisaTypeConfig | null>(null)
  const [configSheetOpen, setConfigSheetOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // Local config state for editing
  const [editingTiers, setEditingTiers] = useState<VisaKeyProcessingTier[]>([])
  const [editingInsurance, setEditingInsurance] = useState<VisaKeyInsuranceRequirements | null>(null)

  // Filter to only VisaKey-enabled visas
  const visaKeyVisas = SAMPLE_VISA_TYPES.filter(visa => visa.visaKey?.enabled)

  // Get unique countries from VisaKey visas
  const countries = [...new Set(visaKeyVisas.map(v =>
    typeof v.country === 'string' ? v.country : v.country?.name || 'Unknown'
  ))]

  // Apply search, category and country filters
  const filteredVisas = visaKeyVisas.filter(visa => {
    const matchesSearch = searchQuery === '' ||
      visa.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visa.visaCode.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || visa.category === categoryFilter

    const visaCountry = typeof visa.country === 'string' ? visa.country : visa.country?.name
    const matchesCountry = countryFilter === 'all' || visaCountry === countryFilter

    return matchesSearch && matchesCategory && matchesCountry
  })

  // Stats
  const totalVisaKey = visaKeyVisas.length
  const priorityEnabled = visaKeyVisas.filter(v =>
    v.visaKey?.processingTiers?.find(t => t.id === 'priority' && t.enabled)
  ).length
  const insuranceRequired = visaKeyVisas.filter(v =>
    v.visaKey?.insuranceRequirements?.required
  ).length

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

  const handleOpenConfig = (visa: VisaTypeConfig) => {
    setSelectedVisa(visa)
    // Initialize editing state from visa config or defaults
    setEditingTiers(visa.visaKey?.processingTiers || DEFAULT_PROCESSING_TIERS.map(t => ({ ...t })))
    setEditingInsurance(visa.visaKey?.insuranceRequirements || { ...DEFAULT_INSURANCE_REQUIREMENTS })
    setConfigSheetOpen(true)
  }

  const handleExportJson = (visa: VisaTypeConfig) => {
    const blob = new Blob([JSON.stringify(visa, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${visa.visaCode}-visakey.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const updateTierPrice = (tierId: string, price: number) => {
    setEditingTiers(prev =>
      prev.map(t => t.id === tierId ? { ...t, price } : t)
    )
  }

  const updateTierEnabled = (tierId: string, enabled: boolean) => {
    setEditingTiers(prev =>
      prev.map(t => t.id === tierId ? { ...t, enabled } : t)
    )
  }

  const updateTierTimeframe = (tierId: string, timeframe: string) => {
    setEditingTiers(prev =>
      prev.map(t => t.id === tierId ? { ...t, timeframe } : t)
    )
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
                <Zap className="h-7 w-7 text-amber-500" />
                VisaKey Visas
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Fast-track visa applications with enhanced verification
              </p>
            </div>
            <Link href="/visa-builder">
              <Button>
                <Zap className="h-4 w-4 mr-2" />
                Add Visa to VisaKey
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">VisaKey Enabled</p>
                    <p className="text-2xl font-bold text-amber-700">{totalVisaKey}</p>
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
                    <p className="text-sm text-gray-500">Priority Processing</p>
                    <p className="text-2xl font-bold">{priorityEnabled}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Rocket className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Insurance Required</p>
                    <p className="text-2xl font-bold">{insuranceRequired}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Categories</p>
                    <p className="text-2xl font-bold">
                      {new Set(visaKeyVisas.map(v => v.category)).size}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Globe className="h-6 w-6 text-purple-600" />
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
                      placeholder="Search VisaKey visas..."
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
              </div>
            </CardContent>
          </Card>

          {/* VisaKey Visas Table */}
          <Card>
            <CardHeader>
              <CardTitle>VisaKey-Enabled Visa Types</CardTitle>
              <CardDescription>
                Configure processing tiers, pricing, and insurance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredVisas.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visa</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stages</TableHead>
                      <TableHead>Processing Tiers</TableHead>
                      <TableHead>Insurance</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisas.map((visa) => {
                      const stageCount = visa.visaKey ? countEnabledStages(visa.visaKey) : 0
                      const tiers = visa.visaKey?.processingTiers || []
                      const enabledTiers = tiers.filter(t => t.enabled)

                      return (
                        <TableRow key={visa.visaCode}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-amber-500" />
                              <div>
                                <p className="font-medium">{visa.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{visa.visaCode}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(visa.category as string)}>
                              {visa.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>{stageCount} stages</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {enabledTiers.length > 0 ? (
                                enabledTiers.map(tier => (
                                  <div key={tier.id} className="flex items-center gap-2 text-xs">
                                    {tier.id === 'priority' && <Rocket className="h-3 w-3 text-blue-500" />}
                                    {tier.id === 'premium' && <Timer className="h-3 w-3 text-purple-500" />}
                                    {tier.id === 'standard' && <Clock className="h-3 w-3 text-gray-500" />}
                                    <span className="text-gray-600">{tier.timeframe}</span>
                                    {tier.price > 0 && (
                                      <Badge variant="outline" className="text-xs px-1">
                                        +{tier.currency} {tier.price}
                                      </Badge>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400">Not configured</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {visa.visaKey?.insuranceRequirements?.required ? (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                <Shield className="h-3 w-3 mr-1" />
                                Required
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">Optional</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Globe className="h-3 w-3 text-gray-400" />
                              {typeof visa.country === 'string' ? visa.country : visa.country?.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenConfig(visa)}>
                                  <Settings2 className="h-4 w-4 mr-2" />
                                  Configure Pricing
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedVisa(visa)
                                  setViewDialogOpen(true)
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Config
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleExportJson(visa)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export JSON
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  navigator.clipboard.writeText(JSON.stringify(visa.visaKey, null, 2))
                                }}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy VisaKey Config
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No VisaKey-enabled visas found</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Import a visa JSON and enable VisaKey to get started
                  </p>
                  <Link href="/visa-builder">
                    <Button>
                      <Zap className="h-4 w-4 mr-2" />
                      Go to Visa Builder
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuration Dialog */}
          <Dialog open={configSheetOpen} onOpenChange={setConfigSheetOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  VisaKey Configuration
                </DialogTitle>
                <DialogDescription>
                  Configure processing tiers and insurance for {selectedVisa?.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Processing Tiers */}
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Processing Tiers & Pricing
                  </h3>

                  <div className="space-y-4">
                    {editingTiers.map(tier => (
                      <Card key={tier.id} className={tier.enabled ? '' : 'opacity-60'}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {tier.id === 'priority' && <Rocket className="h-4 w-4 text-blue-500" />}
                              {tier.id === 'premium' && <Timer className="h-4 w-4 text-purple-500" />}
                              {tier.id === 'standard' && <Clock className="h-4 w-4 text-gray-500" />}
                              <span className="font-medium">{tier.name}</span>
                            </div>
                            <Switch
                              checked={tier.enabled}
                              onCheckedChange={(checked) => updateTierEnabled(tier.id, checked)}
                            />
                          </div>

                          {tier.enabled && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs text-gray-500">Timeframe</Label>
                                <Input
                                  value={tier.timeframe}
                                  onChange={(e) => updateTierTimeframe(tier.id, e.target.value)}
                                  placeholder="e.g., 24-48 hours"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-500">Additional Fee ({tier.currency})</Label>
                                <Input
                                  type="number"
                                  value={tier.price}
                                  onChange={(e) => updateTierPrice(tier.id, Number(e.target.value))}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Travel Insurance Requirements */}
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-green-600" />
                    Travel Insurance Requirements
                  </h3>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <Label>Require Travel Insurance</Label>
                        <Switch
                          checked={editingInsurance?.required || false}
                          onCheckedChange={(checked) =>
                            setEditingInsurance(prev =>
                              prev ? { ...prev, required: checked } : null
                            )
                          }
                        />
                      </div>

                      {editingInsurance?.required && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-gray-500">Minimum Coverage</Label>
                              <Input
                                type="number"
                                value={editingInsurance.minimumCoverage || ''}
                                onChange={(e) =>
                                  setEditingInsurance(prev =>
                                    prev ? { ...prev, minimumCoverage: Number(e.target.value) } : null
                                  )
                                }
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500">Currency</Label>
                              <Select
                                value={editingInsurance.coverageCurrency || 'EUR'}
                                onValueChange={(value) =>
                                  setEditingInsurance(prev =>
                                    prev ? { ...prev, coverageCurrency: value } : null
                                  )
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="GBP">GBP</SelectItem>
                                  <SelectItem value="USD">USD</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-gray-500 mb-2 block">Required Coverage Types</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { key: 'medicalInsurance', label: 'Medical Insurance' },
                                { key: 'emergencyEvacuation', label: 'Emergency Evacuation' },
                                { key: 'repatriation', label: 'Repatriation' },
                                { key: 'personalLiability', label: 'Personal Liability' },
                                { key: 'tripCancellation', label: 'Trip Cancellation' },
                                { key: 'luggageLoss', label: 'Luggage Loss' },
                              ].map(({ key, label }) => (
                                <div key={key} className="flex items-center gap-2">
                                  <Switch
                                    id={key}
                                    checked={editingInsurance.requirements?.[key as keyof typeof editingInsurance.requirements] || false}
                                    onCheckedChange={(checked) =>
                                      setEditingInsurance(prev =>
                                        prev ? {
                                          ...prev,
                                          requirements: {
                                            ...prev.requirements,
                                            [key]: checked
                                          }
                                        } : null
                                      )
                                    }
                                  />
                                  <Label htmlFor={key} className="text-xs">{label}</Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Save Button */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1" onClick={() => setConfigSheetOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 bg-amber-500 hover:bg-amber-600">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save Configuration
                  </Button>
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    Changes will be saved to the visa configuration. Connect a database to persist changes across sessions.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* JSON Viewer Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  VisaKey Configuration - {selectedVisa?.visaCode}
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-auto">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto">
                  <code>{selectedVisa?.visaKey ? JSON.stringify(selectedVisa.visaKey, null, 2) : 'No VisaKey config'}</code>
                </pre>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedVisa?.visaKey) {
                      navigator.clipboard.writeText(JSON.stringify(selectedVisa.visaKey, null, 2))
                    }
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
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
