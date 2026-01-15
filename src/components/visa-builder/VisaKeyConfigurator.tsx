'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  ClipboardCheck,
  FileText,
  Smartphone,
  CreditCard,
  ScanFace,
  Home,
  Files,
  Camera,
  Briefcase,
  Wallet,
  Plane,
  Shield,
  GraduationCap,
  Church,
  Stethoscope,
  FolderUp,
  CheckSquare,
  Send,
  Check,
  Zap,
  Lock,
  DollarSign,
  Clock,
  Rocket,
  Timer,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import {
  VISAKEY_FIXED_STAGES,
  VISAKEY_CONDITIONAL_STAGES,
  VISAKEY_FINAL_STAGES,
  createDefaultVisaKeyConfig,
  VisaKeyConfig,
  VisaKeyStageDefinition,
  VisaKeyProcessingTier,
  VisaKeyInsuranceRequirements,
  DEFAULT_INSURANCE_REQUIREMENTS,
  countEnabledStages
} from '@/lib/visakey-stages'
import VisaKeyFlowDiagram from './VisaKeyFlowDiagram'

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardCheck,
  FileText,
  Smartphone,
  CreditCard,
  ScanFace,
  Home,
  Files,
  Camera,
  Briefcase,
  Wallet,
  Plane,
  Shield,
  GraduationCap,
  Church,
  Stethoscope,
  FolderUp,
  CheckSquare,
  Send
}

interface VisaKeyConfiguratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visaName: string
  visaCategory: string
  onSave: (config: VisaKeyConfig) => void
  initialConfig?: VisaKeyConfig
}

export default function VisaKeyConfigurator({
  open,
  onOpenChange,
  visaName,
  visaCategory,
  onSave,
  initialConfig
}: VisaKeyConfiguratorProps) {
  const [config, setConfig] = useState<VisaKeyConfig>(() =>
    initialConfig || createDefaultVisaKeyConfig(visaCategory)
  )
  const [expandedSections, setExpandedSections] = useState({
    pricing: true,
    insurance: visaCategory === 'tourist'
  })

  // Reset config when dialog opens with new visa
  useEffect(() => {
    if (open) {
      setConfig(initialConfig || createDefaultVisaKeyConfig(visaCategory))
      setExpandedSections({
        pricing: true,
        insurance: visaCategory === 'tourist'
      })
    }
  }, [open, visaCategory, initialConfig])

  const toggleSection = (section: 'pricing' | 'insurance') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const updateTier = (tierId: string, updates: Partial<VisaKeyProcessingTier>) => {
    setConfig(prev => ({
      ...prev,
      processingTiers: prev.processingTiers.map(tier =>
        tier.id === tierId ? { ...tier, ...updates } : tier
      )
    }))
  }

  const updateInsurance = (updates: Partial<VisaKeyInsuranceRequirements>) => {
    setConfig(prev => ({
      ...prev,
      insuranceRequirements: prev.insuranceRequirements
        ? { ...prev.insuranceRequirements, ...updates }
        : { ...DEFAULT_INSURANCE_REQUIREMENTS, ...updates }
    }))
  }

  const toggleInsuranceRequirement = (key: keyof VisaKeyInsuranceRequirements['requirements']) => {
    setConfig(prev => ({
      ...prev,
      insuranceRequirements: prev.insuranceRequirements
        ? {
            ...prev.insuranceRequirements,
            requirements: {
              ...prev.insuranceRequirements.requirements,
              [key]: !prev.insuranceRequirements.requirements[key]
            }
          }
        : {
            ...DEFAULT_INSURANCE_REQUIREMENTS,
            requirements: {
              ...DEFAULT_INSURANCE_REQUIREMENTS.requirements,
              [key]: !DEFAULT_INSURANCE_REQUIREMENTS.requirements[key]
            }
          }
    }))
  }

  const toggleConditionalStage = (stageId: string) => {
    setConfig(prev => ({
      ...prev,
      conditionalStages: prev.conditionalStages.map(stage =>
        stage.stageId === stageId ? { ...stage, enabled: !stage.enabled } : stage
      )
    }))
  }

  const handleSave = () => {
    onSave(config)
    onOpenChange(false)
  }

  const StageItem = ({
    stage,
    enabled,
    locked = false,
    onToggle
  }: {
    stage: VisaKeyStageDefinition
    enabled: boolean
    locked?: boolean
    onToggle?: () => void
  }) => {
    const IconComponent = iconMap[stage.icon] || FileText

    return (
      <div
        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
          enabled ? 'bg-gray-50' : 'bg-gray-50/50 opacity-60'
        }`}
      >
        {locked ? (
          <div className="flex items-center justify-center w-5 h-5">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        ) : (
          <Checkbox
            id={stage.stageId}
            checked={enabled}
            onCheckedChange={onToggle}
          />
        )}
        <div className={`p-1.5 rounded ${enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <IconComponent className={`h-4 w-4 ${enabled ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <Label
            htmlFor={stage.stageId}
            className={`text-sm font-medium cursor-pointer ${!enabled && 'text-gray-400'}`}
          >
            {stage.name}
          </Label>
          <p className="text-xs text-gray-500 truncate">{stage.description}</p>
        </div>
        {locked && (
          <Lock className="h-3 w-3 text-gray-400" />
        )}
      </div>
    )
  }

  const enabledCount = countEnabledStages(config)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Enable VisaKey for &quot;{visaName}&quot;
          </DialogTitle>
          <DialogDescription>
            Configure the VisaKey verification stages for this visa type.
            Fixed stages are always required. Conditional stages can be enabled based on visa requirements.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Flow Diagram Preview */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <VisaKeyFlowDiagram config={config} />
          </div>

          {/* Fixed Stages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Fixed Verification Stages</h3>
                <p className="text-xs text-gray-500">Always required for VisaKey applications</p>
              </div>
              <Badge variant="secondary">{VISAKEY_FIXED_STAGES.length} stages</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 border rounded-lg bg-green-50/30 border-green-200">
              {VISAKEY_FIXED_STAGES.map((stage) => (
                <StageItem
                  key={stage.stageId}
                  stage={stage}
                  enabled={true}
                  locked={true}
                />
              ))}
            </div>
          </div>

          {/* Conditional Stages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Conditional Stages</h3>
                <p className="text-xs text-gray-500">
                  Category: <Badge variant="outline" className="ml-1 capitalize">{visaCategory}</Badge>
                </p>
              </div>
              <Badge variant="secondary">
                {config.conditionalStages.filter(s => s.enabled).length} / {VISAKEY_CONDITIONAL_STAGES.length} enabled
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 border rounded-lg">
              {VISAKEY_CONDITIONAL_STAGES.map((stage) => {
                const stageConfig = config.conditionalStages.find(s => s.stageId === stage.stageId)
                const isRecommended = stage.categories?.includes('all') || stage.categories?.includes(visaCategory)

                return (
                  <div key={stage.stageId} className="relative">
                    <StageItem
                      stage={stage}
                      enabled={stageConfig?.enabled || false}
                      onToggle={() => toggleConditionalStage(stage.stageId)}
                    />
                    {isRecommended && (
                      <Badge
                        variant="outline"
                        className="absolute -top-1 -right-1 text-[10px] px-1 py-0 bg-amber-50 text-amber-700 border-amber-200"
                      >
                        Recommended
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Final Stages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Final Stages</h3>
                <p className="text-xs text-gray-500">Review, payment, and submission</p>
              </div>
              <Badge variant="secondary">{VISAKEY_FINAL_STAGES.length} stages</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border rounded-lg bg-purple-50/30 border-purple-200">
              {VISAKEY_FINAL_STAGES.map((stage) => (
                <StageItem
                  key={stage.stageId}
                  stage={stage}
                  enabled={true}
                  locked={true}
                />
              ))}
            </div>
          </div>

          {/* Processing Tiers & Pricing */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('pricing')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-sm">Processing Tiers & Pricing</span>
              </div>
              {expandedSections.pricing ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {expandedSections.pricing && (
              <div className="p-4 space-y-4">
                <p className="text-xs text-gray-500">
                  Configure processing speed options and additional fees for applicants
                </p>

                {config.processingTiers?.map(tier => (
                  <div
                    key={tier.id}
                    className={`p-3 border rounded-lg ${tier.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {tier.id === 'priority' && <Rocket className="h-4 w-4 text-blue-500" />}
                        {tier.id === 'premium' && <Timer className="h-4 w-4 text-purple-500" />}
                        {tier.id === 'standard' && <Clock className="h-4 w-4 text-gray-500" />}
                        <span className="font-medium text-sm">{tier.name}</span>
                        {tier.id === 'priority' && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">Fastest</Badge>
                        )}
                      </div>
                      <Switch
                        checked={tier.enabled}
                        onCheckedChange={(enabled) => updateTier(tier.id, { enabled })}
                        disabled={tier.id === 'standard'} // Standard is always enabled
                      />
                    </div>

                    {tier.enabled && (
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs text-gray-500">Timeframe</Label>
                          <Input
                            value={tier.timeframe}
                            onChange={(e) => updateTier(tier.id, { timeframe: e.target.value })}
                            placeholder="e.g., 24-48 hours"
                            className="mt-1 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Additional Fee</Label>
                          <Input
                            type="number"
                            value={tier.price}
                            onChange={(e) => updateTier(tier.id, { price: Number(e.target.value) })}
                            className="mt-1 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Currency</Label>
                          <Select
                            value={tier.currency}
                            onValueChange={(currency) => updateTier(tier.id, { currency })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Travel Insurance Requirements */}
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('insurance')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-sm">Travel Insurance Requirements</span>
                {config.insuranceRequirements?.required && (
                  <Badge className="bg-green-100 text-green-700 text-xs">Required</Badge>
                )}
              </div>
              {expandedSections.insurance ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {expandedSections.insurance && (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Require Travel Insurance</Label>
                    <p className="text-xs text-gray-500">
                      Applicants must provide valid travel insurance documentation
                    </p>
                  </div>
                  <Switch
                    checked={config.insuranceRequirements?.required || false}
                    onCheckedChange={(required) => updateInsurance({ required })}
                  />
                </div>

                {config.insuranceRequirements?.required && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">Minimum Coverage Amount</Label>
                        <Input
                          type="number"
                          value={config.insuranceRequirements.minimumCoverage || ''}
                          onChange={(e) => updateInsurance({ minimumCoverage: Number(e.target.value) })}
                          placeholder="e.g., 30000"
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">Coverage Currency</Label>
                        <Select
                          value={config.insuranceRequirements.coverageCurrency || 'EUR'}
                          onValueChange={(coverageCurrency) => updateInsurance({ coverageCurrency })}
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
                          { key: 'medicalInsurance' as const, label: 'Medical Insurance', critical: true },
                          { key: 'emergencyEvacuation' as const, label: 'Emergency Evacuation', critical: true },
                          { key: 'repatriation' as const, label: 'Repatriation' },
                          { key: 'personalLiability' as const, label: 'Personal Liability' },
                          { key: 'tripCancellation' as const, label: 'Trip Cancellation' },
                          { key: 'luggageLoss' as const, label: 'Luggage Loss' },
                        ].map(({ key, label, critical }) => (
                          <div
                            key={key}
                            className={`flex items-center gap-2 p-2 rounded ${
                              config.insuranceRequirements?.requirements[key] ? 'bg-green-50' : 'bg-gray-50'
                            }`}
                          >
                            <Checkbox
                              id={key}
                              checked={config.insuranceRequirements?.requirements[key] || false}
                              onCheckedChange={() => toggleInsuranceRequirement(key)}
                            />
                            <Label htmlFor={key} className="text-xs cursor-pointer flex items-center gap-1">
                              {label}
                              {critical && (
                                <span className="text-amber-600 text-[10px]">*</span>
                              )}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-amber-600 mt-2">* Recommended for most visa types</p>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Minimum Duration</Label>
                      <Input
                        value={config.insuranceRequirements.minimumDuration || ''}
                        onChange={(e) => updateInsurance({ minimumDuration: e.target.value })}
                        placeholder="e.g., Duration of stay + 15 days"
                        className="mt-1 text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex-1 text-sm text-gray-500">
            Total: <strong>{enabledCount}</strong> stages enabled
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600">
            <Zap className="h-4 w-4 mr-2" />
            Enable VisaKey
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
