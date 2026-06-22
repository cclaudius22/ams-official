// components/application/OVIntelligencePanel.tsx
'use client'

/**
 * Open Visa Intelligence — the OV-IP risk-model showcase (replaces the legacy
 * "AI Assessment Results" panel). V5 §7a.
 *
 * THE deliberate exception to the status-led policy: this panel SHOWS the model
 * scores (Rootedness / Intent / Credibility + overall), because the OV
 * assessment is the product differentiator. Every score is paired with the
 * "why" reasoning + the factors that drove it — an explainable assessment, not a
 * scoreboard.
 *
 * OV IP, separate from DIS. Mocked until the Azure model endpoint is live
 * (docs/LAUNCH_BLOCKERS.md LB-6); reads an `OVAssessment` so the real swap is
 * zero UI change.
 */

import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Brain, Sparkles, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OVAssessment, OVRiskBand } from '@/api-contracts/ov'

const BAND: Record<OVRiskBand, { label: string; chip: string; ring: string }> = {
  LOW: { label: 'Low risk', chip: 'bg-green-100 text-green-800 border-green-200', ring: '#16a34a' },
  MEDIUM: { label: 'Medium risk', chip: 'bg-amber-100 text-amber-800 border-amber-200', ring: '#d97706' },
  HIGH: { label: 'High risk', chip: 'bg-red-100 text-red-800 border-red-200', ring: '#dc2626' },
}

const scoreHex = (s: number): string => (s >= 80 ? '#16a34a' : s >= 60 ? '#d97706' : '#dc2626')
const scoreBar = (s: number): string => (s >= 80 ? 'bg-green-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500')

/** Circular score ring (SVG) — the overall index hero. */
const ScoreRing: React.FC<{ score: number; color: string }> = ({ score, color }) => {
  const r = 32
  const circ = 2 * Math.PI * r
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circ
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" className="flex-shrink-0" aria-hidden>
      <circle cx="42" cy="42" r={r} fill="none" stroke="#e5e7eb" strokeWidth="7" />
      <circle
        cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} transform="rotate(-90 42 42)"
      />
      <text x="42" y="42" textAnchor="middle" dominantBaseline="central" fontSize="22" fontWeight="700" fill="#1f2937">
        {score}
      </text>
    </svg>
  )
}

export default function OVIntelligencePanel({ assessment }: { assessment: OVAssessment }) {
  const band = BAND[assessment.overall.risk_band]

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="ov-intelligence"
      className="w-full mb-6 border border-indigo-200 rounded-lg overflow-hidden shadow-sm"
    >
      <AccordionItem value="ov-intelligence" className="border-b-0">
        <AccordionTrigger
          data-testid="ov-intelligence-trigger"
          className="bg-gradient-to-r from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 px-4 py-3 text-base hover:no-underline data-[state=open]:border-b border-indigo-100"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-3 flex-shrink-0">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="text-left">
                <span className="font-semibold text-gray-900 block leading-tight">Open Visa Intelligence</span>
                <span className="hidden sm:block text-xs font-normal text-indigo-700/70 leading-tight">
                  OV risk model — explainable assessment
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mr-1">
              <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200">
                <Sparkles className="h-2.5 w-2.5 mr-1" /> AI MODEL
              </Badge>
              <Badge
                data-testid="ov-overall-band"
                variant="outline"
                className={cn('px-2 py-0.5 text-xs font-semibold border', band.chip)}
              >
                {band.label}
              </Badge>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="p-4 md:p-6 bg-white">
          {/* Overall: ring + recommendation + narrative */}
          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="flex items-center gap-4 flex-shrink-0">
              <ScoreRing score={assessment.overall.score} color={band.ring} />
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">Overall risk</div>
                <div className="text-lg font-bold text-gray-900 leading-tight">{band.label}</div>
                <div data-testid="ov-recommendation" className="text-xs text-indigo-700 font-medium mt-1 max-w-[16rem]">
                  {assessment.recommendation}
                </div>
              </div>
            </div>
            <p
              data-testid="ov-summary"
              className="text-sm text-gray-700 leading-relaxed flex-1 sm:border-l sm:pl-4 border-gray-100"
            >
              {assessment.overall.summary}
            </p>
          </div>

          {/* Per-dimension: score + bar + why + factors */}
          <div className="space-y-3">
            {assessment.dimensions.map((d) => (
              <div key={d.key} data-testid={`ov-dimension-${d.key}`} className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-800">{d.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">{d.status}</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: scoreHex(d.score) }}>
                      {d.score}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden mb-2">
                  <div className={cn('h-full rounded-full', scoreBar(d.score))} style={{ width: `${d.score}%` }} />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-2">
                  <span className="font-semibold text-gray-700">Why: </span>{d.reasoning}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {d.factors.map((f) => (
                    <Badge
                      key={f}
                      variant="outline"
                      className="px-1.5 py-0 text-[10px] font-medium bg-indigo-50/60 text-indigo-700 border-indigo-200"
                    >
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer — provenance + advisory disclaimer */}
          <div className="mt-4 pt-3 border-t flex items-start gap-1.5">
            <Info className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-gray-500">
              Open Visa proprietary risk model (<span className="font-mono">{assessment.model_version}</span>) — an
              explainable, advisory assessment to assist the caseworker. It is not a decision; the deciding officer
              holds final authority.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
