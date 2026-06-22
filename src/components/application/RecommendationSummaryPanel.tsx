// components/application/RecommendationSummaryPanel.tsx
'use client'

/**
 * Panel 1 — Recommendation Summary (V4 §2 UX · V5 data · Task 2.1, SCRUM-63)
 *
 * The officer reads this first: the DIS recommendation (advisory), the
 * AI-generated narrative summary, the per-engine evaluation breakdown, and the
 * statutory note. Open by default.
 *
 * Language rule: DIS RECOMMENDS — the officer decides. "Decision" never appears
 * for DIS output; the recommendation is framed as a recommendation ("DIS
 * recommends approval/refusal", "DIS flags for attention").
 *
 * Status-led, no numbers (17 Jun): the recommendation is rule-driven, not
 * score-driven (Component Scoring spec v3.0). Scores are background-only and are
 * NOT shown to the officer — there is no aggregate/overall score in this panel.
 * Data sources (V5 §7): recommendation artifact from DISApplicationView;
 * narrative from llm_summary (OV-IP — mock until the Azure endpoint is wired).
 */

import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Scale, Info, ShieldCheck, Globe, Gavel } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DISApplicationView, DecisionOutcome } from '@/api-contracts/dis'
import { normalizeOutcome, outcomeColor } from '@/lib/normalizeOutcome'

interface RecommendationSummaryPanelProps {
  disView: DISApplicationView
}

const OUTCOME_BADGE_CLASSES: Record<ReturnType<typeof outcomeColor>, string> = {
  green: 'bg-green-100 text-green-800 border-green-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  red: 'bg-red-100 text-red-800 border-red-200',
}

/**
 * Caseworker-facing recommendation phrasing (Phase 1, human-in-the-loop): DIS
 * RECOMMENDS, the officer decides. Maps the canonical outcome to advisory text.
 */
const RECOMMENDATION_PHRASING: Record<DecisionOutcome, string> = {
  APPROVED: 'DIS recommends approval',
  REJECTED: 'DIS recommends refusal',
  MANUAL_REVIEW: 'DIS flags for attention',
}

const SummaryStat: React.FC<{
  label: string
  value: string
  colorClass?: string
  testId: string
}> = ({ label, value, colorClass = 'text-gray-900', testId }) => (
  <div data-testid={testId} className="p-3 bg-gray-50 rounded-lg border text-center">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className={`text-lg font-semibold ${colorClass}`}>{value}</div>
  </div>
)

const formatGeneratedAt = (iso: string): string => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(iso)).replace(',', '')
  } catch {
    return iso
  }
}

export default function RecommendationSummaryPanel({ disView }: RecommendationSummaryPanelProps) {
  const rec = disView.recommendation
  const { rules, opa_policies, external_checks } = rec.rules_summary

  // Wire value APPROVE/MANUAL_REVIEW → canonical → display label/colour
  const canonicalOutcome = normalizeOutcome(rec.recommendation) ?? 'MANUAL_REVIEW'
  const badgeClasses = OUTCOME_BADGE_CLASSES[outcomeColor(canonicalOutcome)]

  const flaggedRules = [...(rec.hard_fail_rules ?? []), ...(rec.soft_flag_rules ?? [])]

  const breakdown = [
    { key: 'drools', label: 'Rules Engine', icon: Gavel, text: rec.evaluation_breakdown?.drools_evaluation },
    { key: 'external', label: 'External Checks', icon: Globe, text: rec.evaluation_breakdown?.external_checks_evaluation },
    { key: 'opa', label: 'Policy Compliance', icon: ShieldCheck, text: rec.evaluation_breakdown?.opa_evaluation },
  ].filter((b) => b.text)

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full mb-6 border rounded-lg overflow-hidden shadow-sm"
      defaultValue="recommendation-summary"
    >
      <AccordionItem value="recommendation-summary" className="border-b-0">
        <AccordionTrigger
          data-testid="recommendation-summary-trigger"
          className="bg-gray-50 hover:bg-gray-100 px-4 py-3 text-base hover:no-underline data-[state=open]:border-b"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              <Scale className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-semibold text-gray-800 text-left">DIS Recommendation</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                data-testid="recommendation-summary-outcome-badge"
                variant="outline"
                className={cn('px-2 py-0.5 text-xs font-semibold border', badgeClasses)}
              >
                {RECOMMENDATION_PHRASING[canonicalOutcome]}
              </Badge>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="p-4 md:p-6 bg-white">
          {/* Statutory note — rendered verbatim, near the badge (V5 §5) */}
          <div
            data-testid="recommendation-summary-note"
            className="flex items-start p-3 mb-4 border border-blue-200 bg-blue-50 rounded-md text-xs text-blue-800"
          >
            <Info className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
            <span>{rec.note}</span>
          </div>

          {/* Recommendation reason */}
          <p data-testid="recommendation-summary-reason" className="text-sm font-medium text-gray-800 mb-4">
            {rec.recommendation_reason}
          </p>

          {/* Engine summary tiles (from rules_summary) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <SummaryStat
              testId="recommendation-summary-stat-rules"
              label="Drools Rules"
              value={`${rules.drools_rules_passed}/${rules.drools_rules_evaluated}`}
              colorClass={rules.drools_rules_failed > 0 ? 'text-red-600' : 'text-green-600'}
            />
            <SummaryStat
              testId="recommendation-summary-stat-opa"
              label="OPA Policies"
              value={`${opa_policies.opa_total_passed}/${opa_policies.opa_total_evaluated}`}
              colorClass={opa_policies.opa_hard_failed > 0 ? 'text-red-600' : opa_policies.opa_soft_failed > 0 ? 'text-amber-600' : 'text-green-600'}
            />
            <SummaryStat
              testId="recommendation-summary-stat-checks"
              label="External Checks"
              value={`${external_checks.external_checks_passed}/${external_checks.external_checks_evaluated}`}
              colorClass={external_checks.external_checks_failed > 0 ? 'text-amber-600' : 'text-green-600'}
            />
            {/* Neutral — completeness is a document-presence figure, not a
                quality verdict; no red/amber/green band (status-led, 18 Jun). */}
            <SummaryStat
              testId="recommendation-summary-stat-completeness"
              label="Completeness"
              value={`${rec.completeness_score}/100`}
            />
          </div>

          {/* Flagged rule/policy/check chips */}
          {flaggedRules.length > 0 && (
            <div data-testid="recommendation-summary-flags" className="mb-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-700">Flagged for review</h3>
              <div className="flex flex-wrap gap-2">
                {(rec.hard_fail_rules ?? []).map((id) => (
                  <Badge key={id} variant="outline" className="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 border-red-200">
                    {id}
                  </Badge>
                ))}
                {(rec.soft_flag_rules ?? []).map((id) => (
                  <Badge key={id} variant="outline" className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border-amber-200">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Case Summary (AI narrative) relocated to the Open Visa Intelligence panel — V5 §7a */}

          {/* Per-engine evaluation breakdown */}
          {breakdown.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
              {breakdown.map(({ key, label, icon: BIcon, text }) => (
                <div
                  key={key}
                  data-testid={`recommendation-summary-breakdown-${key}`}
                  className="p-3 border rounded-md bg-gray-50/80"
                >
                  <h4 className="font-semibold mb-1 text-gray-800 text-xs flex items-center">
                    <BIcon className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                    {label}
                  </h4>
                  <p className="text-gray-600 text-xs leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Footer: provenance */}
          <div
            data-testid="recommendation-summary-footer"
            className="border-t mt-4 pt-3 text-xs text-gray-500 flex flex-col sm:flex-row sm:justify-between gap-1"
          >
            <span>Generated: {formatGeneratedAt(rec.generated_at)}</span>
            <span>
              Drools: {rec.drools_version.length} active rule file{rec.drools_version.length === 1 ? '' : 's'}
              <span className="mx-1.5">·</span>
              OPA: {rec.opa_version.length} active policy file{rec.opa_version.length === 1 ? '' : 's'}
            </span>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
