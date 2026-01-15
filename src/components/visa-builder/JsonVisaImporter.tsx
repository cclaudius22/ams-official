'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileJson,
  Upload,
  Check,
  X,
  AlertCircle,
  Copy,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
  Trash2,
  Save,
  Eye,
  Zap
} from 'lucide-react'
import {
  VisaTypeConfig,
  VISA_TYPE_TEMPLATE,
  validateVisaTypeConfig
} from '@/types/visaType'
import { VisaKeyConfig } from '@/lib/visakey-stages'
import VisaKeyConfigurator from './VisaKeyConfigurator'

interface ValidationResult {
  valid: boolean
  errors: string[]
}

interface ParsedVisa {
  config: VisaTypeConfig
  validation: ValidationResult
}

const JsonVisaImporter: React.FC = () => {
  const [jsonInput, setJsonInput] = useState('')
  const [parsedVisa, setParsedVisa] = useState<ParsedVisa | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [savedVisas, setSavedVisas] = useState<VisaTypeConfig[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState('import')

  // VisaKey state
  const [visaKeyDialogOpen, setVisaKeyDialogOpen] = useState(false)
  const [visaKeyTargetVisa, setVisaKeyTargetVisa] = useState<VisaTypeConfig | null>(null)
  const [visaKeyTargetIndex, setVisaKeyTargetIndex] = useState<number | null>(null)

  // Parse JSON input
  const handleParseJson = useCallback(() => {
    setParseError(null)
    setParsedVisa(null)

    if (!jsonInput.trim()) {
      setParseError('Please enter JSON configuration')
      return
    }

    try {
      const parsed = JSON.parse(jsonInput)
      const validation = validateVisaTypeConfig(parsed)

      setParsedVisa({
        config: parsed as VisaTypeConfig,
        validation
      })

      if (validation.valid) {
        setShowPreview(true)
      }
    } catch (e) {
      setParseError(`Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`)
    }
  }, [jsonInput])

  // Load template
  const handleLoadTemplate = () => {
    setJsonInput(JSON.stringify(VISA_TYPE_TEMPLATE, null, 2))
    setParseError(null)
    setParsedVisa(null)
  }

  // Copy to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonInput)
  }

  // Save visa type
  const handleSaveVisa = () => {
    if (parsedVisa && parsedVisa.validation.valid) {
      const newVisa: VisaTypeConfig = {
        ...parsedVisa.config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setSavedVisas(prev => [...prev, newVisa])
      setJsonInput('')
      setParsedVisa(null)
      setShowPreview(false)
      setActiveTab('saved')

      // TODO: API call to save to backend
      console.log('Visa type saved:', JSON.stringify(newVisa, null, 2))
    }
  }

  // Delete saved visa
  const handleDeleteVisa = (index: number) => {
    setSavedVisas(prev => prev.filter((_, i) => i !== index))
  }

  // Open VisaKey configurator for parsed visa
  const handleAddToVisaKey = () => {
    if (parsedVisa && parsedVisa.validation.valid) {
      setVisaKeyTargetVisa(parsedVisa.config)
      setVisaKeyTargetIndex(null)
      setVisaKeyDialogOpen(true)
    }
  }

  // Open VisaKey configurator for saved visa
  const handleEnableVisaKeyForSaved = (visa: VisaTypeConfig, index: number) => {
    setVisaKeyTargetVisa(visa)
    setVisaKeyTargetIndex(index)
    setVisaKeyDialogOpen(true)
  }

  // Save VisaKey configuration
  const handleSaveVisaKeyConfig = (visaKeyConfig: VisaKeyConfig) => {
    if (visaKeyTargetIndex !== null) {
      // Update existing saved visa
      setSavedVisas(prev => prev.map((visa, i) =>
        i === visaKeyTargetIndex
          ? { ...visa, visaKey: visaKeyConfig, updatedAt: new Date().toISOString() }
          : visa
      ))
    } else if (visaKeyTargetVisa) {
      // Save new visa with VisaKey config
      const newVisa: VisaTypeConfig = {
        ...visaKeyTargetVisa,
        visaKey: visaKeyConfig,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setSavedVisas(prev => [...prev, newVisa])
      setJsonInput('')
      setParsedVisa(null)
      setShowPreview(false)
      setActiveTab('saved')
      console.log('Visa type with VisaKey saved:', JSON.stringify(newVisa, null, 2))
    }
    setVisaKeyTargetVisa(null)
    setVisaKeyTargetIndex(null)
  }

  // Export saved visa as JSON
  const handleExportVisa = (visa: VisaTypeConfig) => {
    const blob = new Blob([JSON.stringify(visa, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${visa.visaCode || 'visa-type'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Render preview section
  const renderPreview = () => {
    if (!parsedVisa) return null

    const { config, validation } = parsedVisa

    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {showPreview && (
          <CardContent className="space-y-4">
            {/* Validation Status */}
            {validation.valid ? (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Valid Configuration</AlertTitle>
                <AlertDescription className="text-green-700">
                  All required fields are present. Ready to save.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Validation Errors</AlertTitle>
                <AlertDescription className="text-red-700">
                  <ul className="list-disc list-inside mt-1">
                    {validation.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Visa Name</p>
                <p className="font-medium">{config.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Visa Code</p>
                <Badge variant="outline">{config.visaCode || '-'}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <Badge>{config.category || '-'}</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Country</p>
                <p className="font-medium">
                  {typeof config.country === 'string' ? config.country : config.country?.name || '-'}
                </p>
              </div>
            </div>

            {/* Description */}
            {config.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm mt-1">{config.description}</p>
              </div>
            )}

            {/* Requirements Summary */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {config.eligibilityCriteria?.length || 0}
                </p>
                <p className="text-xs text-gray-500">Eligibility Criteria</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {config.kycRequirements?.length || 0}
                </p>
                <p className="text-xs text-gray-500">KYC Requirements</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {config.documentsRequirements?.length || 0}
                </p>
                <p className="text-xs text-gray-500">Documents Required</p>
              </div>
            </div>

            {/* Processing Tiers */}
            {config.processingTier && config.processingTier.length > 0 && (
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-500 mb-2">Processing Tiers</p>
                <div className="flex flex-wrap gap-2">
                  {config.processingTier.map((tier, i) => (
                    <Badge key={i} variant="secondary" className="capitalize">
                      {tier.type}: {tier.visaCost?.currency} {tier.visaCost?.amount} ({tier.timeframe})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            {config.metadata && (
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-500 mb-2">Metadata</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  {config.metadata.validityPeriod && (
                    <span>Validity: {config.metadata.validityPeriod} months</span>
                  )}
                  {config.metadata.maxExtensions !== undefined && (
                    <span>Max Extensions: {config.metadata.maxExtensions}</span>
                  )}
                  {config.metadata.successRate !== undefined && (
                    <span>Success Rate: {config.metadata.successRate}%</span>
                  )}
                </div>
              </div>
            )}

            {/* Save Buttons */}
            {validation.valid && (
              <div className="pt-4 border-t space-y-2">
                <Button onClick={handleAddToVisaKey} className="w-full bg-amber-500 hover:bg-amber-600">
                  <Zap className="h-4 w-4 mr-2" />
                  Add to VisaKey & Save
                </Button>
                <Button onClick={handleSaveVisa} variant="outline" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Without VisaKey
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileJson className="h-6 w-6" />
            JSON Visa Type Builder
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Import visa type configurations from JSON or create from template
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="import">Import JSON</TabsTrigger>
          <TabsTrigger value="saved">
            Saved Types ({savedVisas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4 mt-4">
          {/* JSON Input Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">JSON Configuration</CardTitle>
              <CardDescription>
                Paste your visa type JSON configuration below or load a template to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleLoadTemplate}>
                  <FileText className="h-4 w-4 mr-2" />
                  Load Template
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyJson} disabled={!jsonInput}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setJsonInput('')
                    setParsedVisa(null)
                    setParseError(null)
                  }}
                  disabled={!jsonInput}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>

              {/* JSON Textarea */}
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={`{
  "name": "Sample Visa Type",
  "visaCode": "VIS-001",
  "category": "work",
  "country": "United Kingdom",
  ...
}`}
                className="font-mono text-sm min-h-[400px]"
              />

              {/* Parse Error */}
              {parseError && (
                <Alert className="bg-red-50 border-red-200">
                  <X className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-800">Parse Error</AlertTitle>
                  <AlertDescription className="text-red-700 font-mono text-sm">
                    {parseError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Parse Button */}
              <Button onClick={handleParseJson} disabled={!jsonInput.trim()}>
                <Upload className="h-4 w-4 mr-2" />
                Parse & Validate
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          {parsedVisa && renderPreview()}
        </TabsContent>

        <TabsContent value="saved" className="mt-4">
          {savedVisas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileJson className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No visa types saved yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Import a JSON configuration to get started
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setActiveTab('import')}
                >
                  Go to Import
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {savedVisas.map((visa, index) => (
                <Card key={index} className={visa.visaKey?.enabled ? 'border-amber-200' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{visa.name}</h3>
                          <Badge variant="outline">{visa.visaCode}</Badge>
                          <Badge>{visa.category}</Badge>
                          {visa.visaKey?.enabled && (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                              <Zap className="h-3 w-3 mr-1" />
                              VisaKey
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {typeof visa.country === 'string' ? visa.country : visa.country?.name}
                        </p>
                        {visa.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{visa.description}</p>
                        )}
                        <div className="flex gap-4 text-xs text-gray-400 pt-2">
                          <span>{visa.eligibilityCriteria?.length || 0} eligibility criteria</span>
                          <span>{visa.kycRequirements?.length || 0} KYC requirements</span>
                          <span>{visa.documentsRequirements?.length || 0} documents</span>
                          <span>{visa.processingTier?.length || 0} processing tiers</span>
                          {visa.visaKey?.enabled && (
                            <span className="text-amber-600">
                              {visa.visaKey.fixedStages.length +
                                visa.visaKey.conditionalStages.filter(s => s.enabled).length +
                                visa.visaKey.finalStages.length} VisaKey stages
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!visa.visaKey?.enabled && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            onClick={() => handleEnableVisaKeyForSaved(visa, index)}
                          >
                            <Zap className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportVisa(visa)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setJsonInput(JSON.stringify(visa, null, 2))
                            setActiveTab('import')
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteVisa(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Export All */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(savedVisas, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'visa-types-export.json'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export All ({savedVisas.length}) as JSON
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Schema Reference */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-600">Schema Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="font-medium text-gray-700">Required Fields</p>
              <ul className="text-gray-500 mt-1 space-y-0.5">
                <li>name</li>
                <li>visaCode</li>
                <li>category</li>
                <li>country</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-700">Optional Arrays</p>
              <ul className="text-gray-500 mt-1 space-y-0.5">
                <li>eligibilityCriteria[]</li>
                <li>kycRequirements[]</li>
                <li>documentsRequirements[]</li>
                <li>processingTier[]</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-700">Categories</p>
              <ul className="text-gray-500 mt-1 space-y-0.5">
                <li>tourist, business</li>
                <li>work, student</li>
                <li>family, medical</li>
                <li>investor, etc.</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-700">KYC Types</p>
              <ul className="text-gray-500 mt-1 space-y-0.5">
                <li>Passport verification</li>
                <li>Identity verification</li>
                <li>Liveness Check</li>
                <li>AML/PEP/Sanctions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VisaKey Configurator Dialog */}
      {visaKeyTargetVisa && (
        <VisaKeyConfigurator
          open={visaKeyDialogOpen}
          onOpenChange={setVisaKeyDialogOpen}
          visaName={visaKeyTargetVisa.name}
          visaCategory={typeof visaKeyTargetVisa.category === 'string' ? visaKeyTargetVisa.category : 'work'}
          onSave={handleSaveVisaKeyConfig}
          initialConfig={visaKeyTargetVisa.visaKey}
        />
      )}
    </div>
  )
}

export default JsonVisaImporter
