// components/application/EvidencePanel.tsx
'use client'

/**
 * Panel 3 — Evidence (V4 §4 UX · V5 data · SCRUM-64 tasks 2.3/2.4)
 *
 * The drill-in evidence behind the recommendation: external-check results and
 * per-document extraction. Collapsed by default; matches the Panel 1/2 pattern
 * (single `disView` prop, Accordion section).
 *
 * Status-led / qualitative-signals-only (scoring-display policy, 19 Jun):
 *   - NO raw DIS grades. We never render fraud_score, the DIS confidence_score,
 *     or extraction_confidence as a number.
 *   - Fraud → fraud_status chip + the fired fraud signals (evidence).
 *   - External risk → risk_level LABEL.
 *   - Extraction confidence → a SUBTLE, field-local "verify if low" nudge only
 *     (extraction/OCR reliability — NOT the reserved recommendation confidence).
 *   - Factual extracted fields + raw external-check responses ARE evidence and
 *     are shown.
 */

import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Layers, Globe, FileText, AlertTriangle, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  DISApplicationView,
  ExternalCheckResult,
  DocumentExtraction,
  DISDocument,
  CheckStatus,
  FraudStatus,
  FraudSignals,
} from '@/api-contracts/dis'

interface EvidencePanelProps {
  disView: DISApplicationView
}

/** Extraction confidence below this prompts a "verify the original" nudge
 *  (aligns with RULE-U05: Tier-1 docs expected ≥ 0.80). */
const LOW_CONFIDENCE = 0.8

const CHECK_STATUS_CLASS: Record<CheckStatus, string> = {
  CLEAR: 'bg-green-50 text-green-700 border-green-200',
  FLAGGED: 'bg-amber-50 text-amber-700 border-amber-200',
  BLOCKED: 'bg-red-50 text-red-700 border-red-200',
  ERROR: 'bg-red-50 text-red-700 border-red-200',
  TIMEOUT: 'bg-gray-50 text-gray-600 border-gray-200',
}

const RISK_CLASS: Record<string, string> = {
  NONE: 'bg-gray-50 text-gray-500 border-gray-200',
  LOW: 'bg-green-50 text-green-700 border-green-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-red-50 text-red-700 border-red-200',
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
}

const FRAUD_STATUS_CLASS: Record<FraudStatus, string> = {
  CLEAR: 'bg-green-50 text-green-700 border-green-200',
  LOW_RISK: 'bg-green-50 text-green-700 border-green-200',
  MEDIUM_RISK: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH_RISK: 'bg-red-50 text-red-700 border-red-200',
  CRITICAL: 'bg-red-100 text-red-800 border-red-300',
}

const CHECK_LABEL: Record<string, string> = {
  WORLDCHECK: 'World-Check',
  INTERPOL: 'Interpol SLTD',
  PASSPORT_VERIFY: 'Passport Verification',
  BORDER_CONTROL: 'Border Control',
  DEVICE_IP_RISK: 'Device / IP Risk',
  EMAIL_PHONE_REPUTATION: 'Email / Phone Reputation',
  COS_CHECK: 'Certificate of Sponsorship',
}

const humanizeKey = (k: string): string => k.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
const humanizeType = (t: string): string => t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

/** Compact, recursive renderer for factual evidence values (extracted fields,
 *  external-check responses). Primitives inline; arrays comma-joined; objects
 *  flattened to "key: value; …". Never receives a DIS grade. */
function EvidenceValue({ value }: { value: unknown }): React.ReactElement {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-400">—</span>
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400">none</span>
    return (
      <span>
        {value.map((v, i) => (
          <span key={i}>
            {i ? '; ' : ''}
            <EvidenceValue value={v} />
          </span>
        ))}
      </span>
    )
  }
  if (typeof value === 'object') {
    return (
      <span className="text-gray-700">
        {Object.entries(value as Record<string, unknown>).map(([k, v], i) => (
          <span key={k}>
            {i ? '; ' : ''}
            {humanizeKey(k)}: <EvidenceValue value={v} />
          </span>
        ))}
      </span>
    )
  }
  return <span>{String(value)}</span>
}

function EvidenceFields({ data }: { data: Record<string, unknown> }): React.ReactElement {
  const entries = Object.entries(data)
  if (!entries.length) return <p className="text-xs text-gray-400">—</p>
  return (
    <div className="space-y-1 text-xs">
      {entries.map(([k, v]) => (
        <div key={k} className="flex flex-wrap gap-x-2">
          <span className="text-gray-500">{humanizeKey(k)}:</span>
          <span className="text-gray-800 font-medium">
            <EvidenceValue value={v} />
          </span>
        </div>
      ))}
    </div>
  )
}

/** Fired fraud signals as evidence chips — signal name + flag. NO score. */
function FiredFraudSignals({ signals }: { signals: FraudSignals | null }): React.ReactElement | null {
  if (!signals) return null
  const fired = Object.entries(signals).filter(([, s]) => Array.isArray(s.flags) && s.flags.length > 0)
  if (!fired.length) return null
  return (
    <div className="mt-2">
      <span className="text-[11px] text-gray-500">Fraud signals</span>
      <div className="mt-0.5 flex flex-wrap gap-1">
        {fired.flatMap(([name, s]) =>
          s.flags.map((f) => (
            <Badge
              key={`${name}-${f}`}
              variant="outline"
              className="text-[10px] font-medium bg-amber-50 text-amber-700 border-amber-200"
            >
              {humanizeKey(name)}: {f}
            </Badge>
          )),
        )}
      </div>
    </div>
  )
}

/** Subtle, field-local verify nudge — shown ONLY when extraction confidence is
 *  low. No number, no gauge. Confidence = OCR/extraction reliability. */
function ConfidenceNudge({ confidence }: { confidence: number }): React.ReactElement | null {
  if (confidence >= LOW_CONFIDENCE) return null
  return (
    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-700">
      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
      <span>Low extraction confidence — verify against the original document.</span>
    </div>
  )
}

export function ExternalCheckCard({ check }: { check: ExternalCheckResult }): React.ReactElement {
  const hasPayload = check.response_payload && Object.keys(check.response_payload).length > 0
  return (
    <div data-testid={`evidence-check-${check.check_type}`} className="border rounded-lg p-3 bg-white">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-800">{CHECK_LABEL[check.check_type] ?? check.check_type}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge variant="outline" className={cn('text-[10px] border', CHECK_STATUS_CLASS[check.check_status])}>
            {check.check_status}
          </Badge>
          <Badge variant="outline" className={cn('text-[10px] border', RISK_CLASS[check.risk_level] ?? RISK_CLASS.NONE)}>
            Risk: {check.risk_level}
          </Badge>
        </div>
      </div>
      {hasPayload && <EvidenceFields data={check.response_payload as Record<string, unknown>} />}
    </div>
  )
}

export function DocumentEvidenceCard({
  extraction,
  document,
}: {
  extraction: DocumentExtraction
  document?: DISDocument
}): React.ReactElement {
  return (
    <div data-testid={`evidence-doc-${extraction.document_type}`} className="border rounded-lg p-3 bg-white">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-800">{humanizeType(extraction.document_type)}</span>
          <span className="text-[10px] text-gray-400">{extraction.criticality}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {extraction.fraud_status && (
            <Badge variant="outline" className={cn('text-[10px] border', FRAUD_STATUS_CLASS[extraction.fraud_status])}>
              {extraction.fraud_status}
            </Badge>
          )}
          {document?.processing_status && (
            <Badge variant="outline" className="text-[10px] text-gray-600 border-gray-200">
              {document.processing_status}
            </Badge>
          )}
        </div>
      </div>

      <ConfidenceNudge confidence={extraction.extraction_confidence} />
      <EvidenceFields data={extraction.normalised_fields} />
      <FiredFraudSignals signals={extraction.fraud_signals} />

      <div className="mt-2">
        <button
          type="button"
          disabled
          title="Signed URLs pending (2F.5)"
          className="inline-flex items-center gap-1 text-[11px] text-gray-400 cursor-not-allowed"
        >
          <Eye className="h-3 w-3" /> View original
        </button>
      </div>
    </div>
  )
}

export default function EvidencePanel({ disView }: EvidencePanelProps): React.ReactElement {
  const checks = disView.external_checks ?? []
  const extractions = disView.document_extractions ?? []
  const documents = disView.documents ?? []
  const docById = new Map(documents.map((d) => [d.dis_document_id, d]))

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full mb-6 border rounded-lg overflow-hidden shadow-sm"
    >
      <AccordionItem value="evidence" className="border-b-0">
        <AccordionTrigger
          data-testid="evidence-trigger"
          className="bg-gray-50 hover:bg-gray-100 px-4 py-3 text-base hover:no-underline data-[state=open]:border-b"
        >
          <div className="flex items-center">
            <Layers className="h-5 w-5 text-blue-600 mr-3" />
            <span className="font-semibold text-gray-800">Evidence</span>
            <span className="ml-2 text-xs text-gray-500">
              {checks.length} checks · {extractions.length} documents
            </span>
          </div>
        </AccordionTrigger>

        <AccordionContent className="p-4 md:p-6 bg-white space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Globe className="h-4 w-4 mr-2 text-blue-500" />
              External Checks
            </h3>
            {checks.length ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {checks.map((c) => (
                  <ExternalCheckCard key={c.check_id ?? c.check_type} check={c} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No external checks.</p>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2 text-amber-500" />
              Documents &amp; Extraction
            </h3>
            {extractions.length ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {extractions.map((e) => (
                  <DocumentEvidenceCard key={e.extraction_id} extraction={e} document={docById.get(e.document_id)} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No document extractions.</p>
            )}
          </section>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
