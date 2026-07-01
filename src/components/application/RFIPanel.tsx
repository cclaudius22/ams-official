'use client'

/**
 * RFIPanel — Request-For-Information lifecycle (Slice 3b SCAFFOLD).
 *
 * Renders only for cases where DIS flagged a completeness gap and the corpus
 * ships an `rfi_lifecycle` (the 3 heroes). It lets the officer *walk through* the
 * intended flow so the demo can answer "what happens when more information is
 * acquired?":
 *
 *   ① Gap flagged → ② Request issued / case parked → ③ Applicant responds, gap
 *   resolves, case ready to decide.
 *
 * Every state is real and data-driven from the corpus. It is deliberately a
 * SCAFFOLD: the production guts (applicant notifications, the applicant portal,
 * re-running DIS on the new evidence, persistence, the SLA clock, the actual
 * decision write) are Phase 2 and need Home Office sign-off — the panel says so.
 * Status-led only; no numeric grades (consistent with the scoring-display policy).
 */
import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileWarning, Send, Clock, CheckCircle2, FileCheck2, RotateCcw, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RfiSummary, RfiPhase } from '@/data/providers/deepSetRfiAdapter'

const PHASE2_NOTE =
  'Phase 2 — lifecycle shown for review. Applicant notifications, the applicant portal, DIS re-evaluation on the new evidence, persistence and the SLA clock are built out after Home Office sign-off.'

const STEPS: { key: RfiPhase; label: string }[] = [
  { key: 'GAP_FLAGGED', label: 'Gap flagged' },
  { key: 'AWAITING_INFO', label: 'Awaiting info' },
  { key: 'RESPONDED', label: 'Responded' },
]

function Stepper({ phase }: { phase: RfiPhase }) {
  const activeIdx = STEPS.findIndex((s) => s.key === phase)
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.key}>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-medium',
              i < activeIdx && 'bg-green-100 text-green-700',
              i === activeIdx && 'bg-amber-500 text-white',
              i > activeIdx && 'bg-gray-100 text-gray-400'
            )}
          >
            {s.label}
          </span>
          {i < STEPS.length - 1 && <ArrowRight className="h-3 w-3 text-gray-300" />}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function RFIPanel({ rfi }: { rfi: RfiSummary }) {
  const [phase, setPhase] = useState<RfiPhase>('GAP_FLAGGED')
  const hasResponse = rfi.response != null
  const resolved = phase === 'RESPONDED'
  const accent = resolved ? 'border-l-green-500' : 'border-l-amber-500'

  const fmtDate = (iso?: string) => {
    if (!iso) return undefined
    const d = new Date(iso)
    return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div
      data-testid="rfi-panel"
      className={cn('bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 p-4 md:p-5 mb-4', accent)}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {resolved ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <FileWarning className="h-5 w-5 text-amber-600" />
          )}
          <h2 className="text-base font-semibold text-gray-800">Request for Information</h2>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-[11px]">
            DIS: completeness gap
          </Badge>
          <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-500 text-[11px]">
            Scaffold · Phase 2
          </Badge>
        </div>
        <Stepper phase={phase} />
      </div>

      {/* ① Gap flagged */}
      {phase === 'GAP_FLAGGED' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            DIS flagged this application for missing or insufficient evidence. Rather than refuse, the officer can
            request the missing item from the applicant — the case then parks until they respond.
          </p>
          <div className="rounded-md bg-amber-50 border border-amber-100 p-3">
            <div className="text-xs font-medium text-amber-800 uppercase tracking-wide mb-1">Identified gap</div>
            <div className="text-sm font-medium text-gray-800 capitalize">{rfi.issue}</div>
            {rfi.missingItems.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {rfi.missingItems.map((m) => (
                  <span key={m} className="text-xs rounded bg-white border border-amber-200 text-amber-700 px-1.5 py-0.5">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
          {rfi.request.caseworkerMessage && (
            <div className="rounded-md border border-gray-200 p-3">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Prepared request to applicant</div>
              <p className="text-sm text-gray-700 italic">“{rfi.request.caseworkerMessage}”</p>
              <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                {rfi.request.requestedDocumentType && <span>Requested: <span className="font-medium text-gray-700">{rfi.request.requestedDocumentType}</span></span>}
                {fmtDate(rfi.request.dueAt) && <span>Respond by: <span className="font-medium text-gray-700">{fmtDate(rfi.request.dueAt)}</span></span>}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 pt-1">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setPhase('AWAITING_INFO')}>
              <Send className="h-4 w-4 mr-1.5" /> Request Information
            </Button>
            <span className="text-xs text-gray-400">{PHASE2_NOTE}</span>
          </div>
        </div>
      )}

      {/* ② Awaiting info (parked) */}
      {phase === 'AWAITING_INFO' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-gray-800">Awaiting applicant response</span>
            <Badge className="bg-amber-100 text-amber-800 text-[11px]">Case parked</Badge>
          </div>
          <p className="text-sm text-gray-600">
            The applicant has been asked to supply <span className="font-medium">{rfi.issue}</span>. The case is parked
            (would move to <span className="font-mono text-xs">AWAITING_INFO</span> and drop off the active decision
            list) until they respond.
          </p>
          {fmtDate(rfi.request.dueAt) && (
            <div className="text-xs text-gray-500">Response due by <span className="font-medium text-gray-700">{fmtDate(rfi.request.dueAt)}</span></div>
          )}
          <div className="flex items-center gap-3 pt-1">
            <Button
              size="sm"
              variant="outline"
              disabled={!hasResponse}
              onClick={() => setPhase('RESPONDED')}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <ArrowRight className="h-4 w-4 mr-1.5" /> Simulate applicant response
            </Button>
            <span className="text-xs text-gray-400">
              {hasResponse ? 'Demo control — injects the corpus response artifact.' : 'No response artifact in the corpus for this case.'}
            </span>
          </div>
        </div>
      )}

      {/* ③ Responded — gap resolved, ready to decide ("more information acquired") */}
      {phase === 'RESPONDED' && rfi.response && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-800">Applicant responded — gap resolved</span>
            <Badge className="bg-green-100 text-green-800 text-[11px]">Ready for review</Badge>
          </div>
          {rfi.response.applicantMessage && (
            <p className="text-sm text-gray-700 italic">“{rfi.response.applicantMessage}”</p>
          )}
          {rfi.response.suppliedDocuments.length > 0 && (
            <div className="rounded-md border border-green-100 bg-green-50/60 p-3">
              <div className="text-xs font-medium text-green-800 uppercase tracking-wide mb-2">Supplied evidence</div>
              <div className="space-y-1.5">
                {rfi.response.suppliedDocuments.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <FileCheck2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="font-medium">{d.filename ?? d.type ?? 'Document'}</span>
                    {d.type && <span className="text-xs text-gray-400">({d.type})</span>}
                    <button className="text-xs text-blue-600 hover:underline ml-1" title="Document viewer — Phase 2" disabled>
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-md bg-gray-50 border border-gray-200 p-3 text-sm text-gray-600">
            <span className="font-medium text-gray-800">What changes:</span> the missing evidence is now on file, DIS&apos;s
            completeness flag clears, and the case returns for a decision.
            {rfi.response.postResponseRecommendation && (
              <span className="block mt-1">
                DIS (re-stated): <span className="font-mono text-xs text-gray-800">{rfi.response.postResponseRecommendation}</span> — the officer decides.
              </span>
            )}
          </div>
          {rfi.response.decisionOptions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {rfi.response.decisionOptions.map((o) => (
                <span key={o} className="text-xs rounded-full bg-white border border-gray-200 text-gray-600 px-2 py-0.5">
                  {o.replace(/_/g, ' ').toLowerCase()}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 pt-1">
            <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700" onClick={() => setPhase('GAP_FLAGGED')}>
              <RotateCcw className="h-4 w-4 mr-1.5" /> Reset walkthrough
            </Button>
            <span className="text-xs text-gray-400">{PHASE2_NOTE}</span>
          </div>
        </div>
      )}
    </div>
  )
}
