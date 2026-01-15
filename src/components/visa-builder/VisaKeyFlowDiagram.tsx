'use client'

import React from 'react'
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
  ChevronRight
} from 'lucide-react'
import {
  VISAKEY_FIXED_STAGES,
  VISAKEY_CONDITIONAL_STAGES,
  VISAKEY_FINAL_STAGES,
  VisaKeyConfig,
  VisaKeyStageDefinition
} from '@/lib/visakey-stages'

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

interface VisaKeyFlowDiagramProps {
  config: VisaKeyConfig
}

export default function VisaKeyFlowDiagram({ config }: VisaKeyFlowDiagramProps) {
  // Get enabled conditional stages
  const enabledConditionalIds = new Set(
    config.conditionalStages.filter(s => s.enabled).map(s => s.stageId)
  )

  const enabledConditionalStages = VISAKEY_CONDITIONAL_STAGES.filter(
    s => enabledConditionalIds.has(s.stageId)
  )

  const StageNode = ({
    stage,
    colorClass,
    bgClass
  }: {
    stage: VisaKeyStageDefinition
    colorClass: string
    bgClass: string
  }) => {
    const IconComponent = iconMap[stage.icon] || FileText

    return (
      <div className="flex flex-col items-center group" title={stage.name}>
        <div
          className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center border-2 ${colorClass} transition-transform group-hover:scale-110`}
        >
          <IconComponent className={`h-5 w-5 ${colorClass.replace('border-', 'text-')}`} />
        </div>
        <span className="text-[10px] text-gray-600 mt-1 text-center max-w-[60px] leading-tight">
          {stage.shortName}
        </span>
      </div>
    )
  }

  const Connector = ({ dashed = false }: { dashed?: boolean }) => (
    <div className="flex items-center justify-center h-10">
      <div
        className={`w-4 h-0.5 ${dashed ? 'border-t border-dashed border-gray-300' : 'bg-gray-300'}`}
      />
    </div>
  )

  const SectionDivider = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center mx-1">
      <div className="h-10 flex items-center">
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </div>
      <span className="text-[9px] text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Application Flow Preview</h4>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-400" />
            <span className="text-gray-500">Fixed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-100 border border-green-400" />
            <span className="text-gray-500">Conditional</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-400" />
            <span className="text-gray-500">Final</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex items-start gap-1 min-w-max">
          {/* Fixed Stages */}
          {VISAKEY_FIXED_STAGES.map((stage, index) => (
            <React.Fragment key={stage.stageId}>
              <StageNode
                stage={stage}
                colorClass="border-blue-400"
                bgClass="bg-blue-50"
              />
              {index < VISAKEY_FIXED_STAGES.length - 1 && <Connector />}
            </React.Fragment>
          ))}

          {/* Divider to Conditional */}
          {enabledConditionalStages.length > 0 && (
            <SectionDivider label="" />
          )}

          {/* Conditional Stages (only enabled ones) */}
          {enabledConditionalStages.map((stage, index) => (
            <React.Fragment key={stage.stageId}>
              <StageNode
                stage={stage}
                colorClass="border-green-400"
                bgClass="bg-green-50"
              />
              {index < enabledConditionalStages.length - 1 && <Connector dashed />}
            </React.Fragment>
          ))}

          {/* Divider to Final */}
          <SectionDivider label="" />

          {/* Final Stages */}
          {VISAKEY_FINAL_STAGES.map((stage, index) => (
            <React.Fragment key={stage.stageId}>
              <StageNode
                stage={stage}
                colorClass="border-purple-400"
                bgClass="bg-purple-50"
              />
              {index < VISAKEY_FINAL_STAGES.length - 1 && <Connector />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Stage counts */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2 border-t">
        <span>
          <strong className="text-blue-600">{VISAKEY_FIXED_STAGES.length}</strong> Fixed
        </span>
        <span>+</span>
        <span>
          <strong className="text-green-600">{enabledConditionalStages.length}</strong> Conditional
        </span>
        <span>+</span>
        <span>
          <strong className="text-purple-600">{VISAKEY_FINAL_STAGES.length}</strong> Final
        </span>
        <span>=</span>
        <span>
          <strong>
            {VISAKEY_FIXED_STAGES.length + enabledConditionalStages.length + VISAKEY_FINAL_STAGES.length}
          </strong> Total Steps
        </span>
      </div>
    </div>
  )
}
