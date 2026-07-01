// components/application/GlassBoxTracePanel.tsx
'use client'

/**
 * Panel 2 — Glass Box Rule Trace (V4 §3 UX · V5 data · Task 2.2, SCRUM-64)
 *
 * THE differentiator: every Drools rule and OPA policy that fired, organised
 * into the 5 assessment stages a caseworker reasons in (Validity →
 * Suitability → Eligibility → Compliance → Soft Flags). No short-circuit —
 * all evaluated checks are shown for the audit trail, including
 * NOT_APPLICABLE ones (greyed, never red).
 *
 * Vocabulary is as-built (V5 §5): Drools outcomes SATISFIED / NOT_SATISFIED /
 * BLOCKED / REVIEW_REQUIRED / NOT_APPLICABLE with `reasoning` +
 * `evidence_refs` + `remediation`; OPA outcomes ALLOW / DENY / FLAG /
 * REVIEW_REQUIRED / PASS with `denial_reasons[]` (table-only — rendered
 * here, which is why the trail must be read from opa_evaluations, not the
 * callback).
 *
 * Evidence chips are inert until Task 2.5 wires cross-panel linking to
 * Panel 3.
 *
 * Collapsed by default — the officer opens it to drill into "why?".
 */

import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
  Box,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MinusCircle,
  FileSearch,
  Gavel,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  DISApplicationView,
  DroolsRuleResult,
  OPAPolicyResult,
} from '@/api-contracts/dis'

interface GlassBoxTracePanelProps {
  disView: DISApplicationView
}

// ---------------------------------------------------------------------------
// Stage model (V4 §3 — rule-to-stage mapping)
// ---------------------------------------------------------------------------

interface StageDef {
  key: string
  name: string
  short: string
  description: string
  ruleIds: string[]
  policyIds: string[]
}

const STAGES: StageDef[] = [
  {
    key: 'validity',
    name: 'Stage 1 — Validity',
    short: 'Validity',
    description: 'Application form, CoS, sponsor licence, start date',
    ruleIds: ['RULE-W01', 'RULE-W02', 'RULE-W15'],
    policyIds: [],
  },
  {
    key: 'suitability',
    name: 'Stage 2 — Suitability',
    short: 'Suitability',
    description: 'Criminality, immigration history, sanctions',
    ruleIds: ['RULE-U03', 'RULE-W11', 'RULE-W12'],
    policyIds: ['OPA-H01', 'OPA-H03'],
  },
  {
    key: 'eligibility',
    name: 'Stage 3 — Eligibility (Points)',
    short: 'Eligibility',
    description: 'Sponsorship, skill level, English, salary',
    ruleIds: ['RULE-W03', 'RULE-W04', 'RULE-W05', 'RULE-W06', 'RULE-W07', 'RULE-W08'],
    policyIds: [],
  },
  {
    key: 'compliance',
    name: 'Stage 4 — Compliance',
    short: 'Compliance',
    description: 'Document quality, fraud, TB, completeness, funds',
    ruleIds: ['RULE-U01', 'RULE-U02', 'RULE-U04', 'RULE-U05', 'RULE-W09', 'RULE-W10', 'RULE-W13', 'RULE-W14', 'RULE-W16'],
    policyIds: ['OPA-H02', 'OPA-H04', 'OPA-H05', 'OPA-H06'],
  },
  {
    key: 'soft-flags',
    name: 'Stage 5 — Soft Flags',
    short: 'Soft Flags',
    description: 'Policies that flag for officer review',
    ruleIds: [],
    policyIds: ['OPA-S01', 'OPA-S02', 'OPA-S03', 'OPA-S04', 'OPA-S05', 'OPA-S06'],
  },
]

/** A stage with its resolved rule/policy results and a rolled-up verdict. */
export interface StageWithResults extends StageDef {
  stageRules: DroolsRuleResult[]
  stagePolicies: OPAPolicyResult[]
  verdict: Verdict
}

// ---------------------------------------------------------------------------
// Verdict mapping (as-built vocabularies → display)
// ---------------------------------------------------------------------------

type Verdict = 'pass' | 'fail' | 'review' | 'na'

const ruleVerdict = (outcome: DroolsRuleResult['outcome']): Verdict => {
  switch (outcome) {
    case 'SATISFIED': return 'pass'
    case 'NOT_SATISFIED':
    case 'BLOCKED': return 'fail'
    case 'REVIEW_REQUIRED': return 'review'
    case 'NOT_APPLICABLE': return 'na'
  }
}

const opaVerdict = (outcome: OPAPolicyResult['outcome']): Verdict => {
  switch (outcome) {
    case 'ALLOW':
    case 'PASS': return 'pass'
    case 'DENY': return 'fail'
    case 'FLAG':
    case 'REVIEW_REQUIRED': return 'review'
  }
}

const VERDICT_STYLES: Record<Verdict, { icon: React.ElementType; text: string; chip: string; row: string }> = {
  pass: { icon: CheckCircle2, text: 'text-green-600', chip: 'bg-green-50 text-green-700 border-green-200', row: 'border-gray-200' },
  fail: { icon: XCircle, text: 'text-red-600', chip: 'bg-red-50 text-red-700 border-red-200', row: 'border-red-200 bg-red-50/40' },
  review: { icon: AlertCircle, text: 'text-amber-600', chip: 'bg-amber-50 text-amber-700 border-amber-200', row: 'border-amber-200 bg-amber-50/40' },
  na: { icon: MinusCircle, text: 'text-gray-400', chip: 'bg-gray-50 text-gray-500 border-gray-200', row: 'border-gray-200 opacity-70' },
}

const stageVerdict = (verdicts: Verdict[]): Verdict => {
  if (verdicts.includes('fail')) return 'fail'
  if (verdicts.includes('review')) return 'review'
  if (verdicts.every((v) => v === 'na') && verdicts.length > 0) return 'na'
  return 'pass'
}

const STAGE_BADGE: Record<Verdict, { label: string; classes: string }> = {
  pass: { label: 'PASS', classes: 'bg-green-100 text-green-800 border-green-200' },
  fail: { label: 'FAIL', classes: 'bg-red-100 text-red-800 border-red-200' },
  review: { label: 'REVIEW', classes: 'bg-amber-100 text-amber-800 border-amber-200' },
  na: { label: 'N/A', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
}

// ---------------------------------------------------------------------------
// Stage assembly + provenance (pure — exported for tests)
// ---------------------------------------------------------------------------

/** Strip a lettered sub-rule suffix to its base family: RULE-W14-A → RULE-W14.
 *  Leaves bases (RULE-W14) and OPA ids (OPA-H05 — trailing digits) untouched.
 *  Deloitte/the spec emit sub-rule IDs; the stage map keys on base families. */
export const baseRuleId = (id: string): string => id.replace(/-[A-Z]+$/, '')

/** Resolve each stage's rule/policy results — matching sub-rule IDs (RULE-W14-A)
 *  to their base family (RULE-W14) — and roll them up to one verdict. */
export function buildStages(disView: DISApplicationView): StageWithResults[] {
  return STAGES.map((stage) => {
    const stageRules = disView.rule_results.filter((r) => stage.ruleIds.includes(baseRuleId(r.rule_id)))
    const stagePolicies = disView.opa_results.filter((p) => stage.policyIds.includes(baseRuleId(p.policy_id)))
    const verdict = stageVerdict([
      ...stageRules.map((r) => ruleVerdict(r.outcome)),
      ...stagePolicies.map((p) => opaVerdict(p.outcome)),
    ])
    return { ...stage, stageRules, stagePolicies, verdict }
  })
}

/** Stages that warrant attention (fail/review) open by default; clean ones stay collapsed. */
export function defaultOpenStageKeys(stages: StageWithResults[]): string[] {
  return stages.filter((s) => s.verdict === 'fail' || s.verdict === 'review').map((s) => s.key)
}

/** "Drools <ver> (+N) · OPA <ver> (+N) · evaluated <date>" — reinforces the
 *  deterministic + auditable story. Null-safe; omits any empty segment. */
export function formatProvenance(disView: DISApplicationView): string {
  const r = disView.recommendation
  const fmtEngine = (label: string, ids: string[]): string | null => {
    if (ids.length === 0) return null
    const extra = ids.length - 1
    return `${label} ${ids[0]}${extra > 0 ? ` (+${extra})` : ''}`
  }
  const drools = fmtEngine('Drools', (r.drools_version ?? []).map((v) => v.rule_version_id))
  const opa = fmtEngine('OPA', (r.opa_version ?? []).map((v) => v.policy_version_id))
  const ts = r.recommendation_at ?? r.generated_at
  const date = ts
    ? `evaluated ${new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : null
  return [drools, opa, date].filter(Boolean).join(' · ')
}

// ---------------------------------------------------------------------------
// Stage progress strip — the at-a-glance reasoning map
// ---------------------------------------------------------------------------

export const StageStrip: React.FC<{ stages: StageWithResults[] }> = ({ stages }) => (
  <div data-testid="glass-box-stage-strip" className="flex flex-wrap items-stretch gap-1.5 mb-4">
    {stages.map((stage, i) => {
      const style = VERDICT_STYLES[stage.verdict]
      const Icon = style.icon
      const checkCount = stage.stageRules.length + stage.stagePolicies.length
      return (
        <React.Fragment key={stage.key}>
          <div
            data-testid={`glass-box-strip-${stage.key}`}
            className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium', style.chip)}
            title={`${stage.name} — ${checkCount} checks`}
          >
            <Icon className={cn('h-3.5 w-3.5', style.text)} />
            <span>{stage.short}</span>
          </div>
          {i < stages.length - 1 && (
            <span className="self-center text-gray-300 select-none" aria-hidden>
              →
            </span>
          )}
        </React.Fragment>
      )
    })}
  </div>
)

// ---------------------------------------------------------------------------
// Check row (one rule or policy)
// ---------------------------------------------------------------------------

const CheckRow: React.FC<{
  id: string
  name: string
  verdict: Verdict
  outcomeLabel: string
  severityLabel?: string
  severityEmphasis?: boolean
  body: React.ReactNode
  evidenceRefs?: string[]
  remediation?: string
  kindIcon: React.ElementType
  testId: string
}> = ({ id, name, verdict, outcomeLabel, severityLabel, severityEmphasis, body, evidenceRefs, remediation, kindIcon: KindIcon, testId }) => {
  const style = VERDICT_STYLES[verdict]
  const Icon = style.icon
  return (
    <div data-testid={testId} className={cn('p-3 border rounded-md text-sm', style.row)}>
      <div className="flex items-start">
        <Icon className={cn('h-4 w-4 mt-0.5 mr-2 flex-shrink-0', style.text)} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-xs font-semibold text-gray-700">{id}</span>
            <span className="font-medium text-gray-800 text-xs">{name}</span>
            <Badge variant="outline" className={cn('px-1.5 py-0 text-[10px] font-semibold border', style.chip)}>
              {outcomeLabel}
            </Badge>
            {severityLabel && (
              <Badge
                variant="outline"
                className={cn(
                  'px-1.5 py-0 text-[10px] font-medium border',
                  severityEmphasis && verdict === 'fail'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                )}
              >
                {severityLabel}
              </Badge>
            )}
            <KindIcon className="h-3 w-3 text-gray-400 ml-auto flex-shrink-0" />
          </div>
          <div className="text-xs text-gray-600 mt-1 leading-relaxed">{body}</div>
          {remediation && (
            <p className="text-xs text-blue-700 mt-1.5">
              <span className="font-semibold">Remediation:</span> {remediation}
            </p>
          )}
          {evidenceRefs && evidenceRefs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {evidenceRefs.map((ref) => (
                <Badge
                  key={ref}
                  data-testid={`${testId}-evidence-link`}
                  variant="outline"
                  className="px-1.5 py-0 text-[10px] font-mono bg-blue-50/60 text-blue-700 border-blue-200"
                  title="Evidence linking to Panel 3 arrives with Task 2.5"
                >
                  <FileSearch className="h-2.5 w-2.5 mr-1" />
                  {ref}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export default function GlassBoxTracePanel({ disView }: GlassBoxTracePanelProps) {
  const { rules, opa_policies } = disView.recommendation.rules_summary

  // Anything not covered by the V4 stage mapping still gets rendered —
  // no silent omissions in an audit trail.
  const mappedIds = new Set(STAGES.flatMap((s) => [...s.ruleIds, ...s.policyIds]))
  const unmappedRules = disView.rule_results.filter((r) => !mappedIds.has(baseRuleId(r.rule_id)))
  const unmappedPolicies = disView.opa_results.filter((p) => !mappedIds.has(baseRuleId(p.policy_id)))

  const stages = buildStages(disView)
  const defaultOpen = defaultOpenStageKeys(stages)
  const provenance = formatProvenance(disView)

  // Summary stat chips — COUNTS only, never a score (scoring-display policy).
  const stats: { label: string; value: string; icon: React.ElementType; tone: string }[] = [
    { label: 'rules satisfied', value: `${rules.drools_rules_passed}/${rules.drools_rules_evaluated}`, icon: CheckCircle2, tone: 'text-green-600' },
    { label: 'hard policies', value: `${opa_policies.opa_hard_passed}/${opa_policies.opa_hard_evaluated}`, icon: ShieldCheck, tone: 'text-blue-600' },
    {
      label: opa_policies.opa_soft_failed > 0 ? 'soft flags' : 'soft policies',
      value: opa_policies.opa_soft_failed > 0 ? `${opa_policies.opa_soft_failed}` : `${opa_policies.opa_soft_passed}/${opa_policies.opa_soft_evaluated}`,
      icon: opa_policies.opa_soft_failed > 0 ? AlertCircle : ShieldCheck,
      tone: opa_policies.opa_soft_failed > 0 ? 'text-amber-600' : 'text-gray-500',
    },
  ]
  if (rules.drools_rules_not_applicable > 0) {
    stats.push({ label: 'not applicable', value: `${rules.drools_rules_not_applicable}`, icon: MinusCircle, tone: 'text-gray-400' })
  }

  const anyFail = stages.some((s) => s.verdict === 'fail')
  const anyReview = stages.some((s) => s.verdict === 'review')
  const headerBadge = anyFail ? STAGE_BADGE.fail : anyReview ? STAGE_BADGE.review : STAGE_BADGE.pass

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full mb-6 border rounded-lg overflow-hidden shadow-sm"
    >
      <AccordionItem value="glass-box-trace" className="border-b-0">
        <AccordionTrigger
          data-testid="glass-box-trigger"
          className="bg-gray-50 hover:bg-gray-100 px-4 py-3 text-base hover:no-underline data-[state=open]:border-b"
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              <Box className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
              <div className="text-left">
                <span className="font-semibold text-gray-800 block leading-tight">Glass Box Rule Trace</span>
                <span className="hidden sm:block text-xs font-normal text-gray-500 leading-tight">
                  Every deterministic check, in the order an officer reasons — AI extracts, rules decide
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                data-testid="glass-box-status-badge"
                variant="outline"
                className={cn('px-2 py-0.5 text-xs font-semibold border', headerBadge.classes)}
              >
                {anyFail ? 'Checks failed' : anyReview ? 'Review required' : 'All checks passed'}
              </Badge>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="p-4 md:p-6 bg-white">
          {/* Stage progress strip — the at-a-glance reasoning map */}
          <StageStrip stages={stages} />

          {/* Summary stat chips (counts only) */}
          <div data-testid="glass-box-summary-bar" className="flex flex-wrap gap-2 mb-4">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-1.5 px-2.5 py-1 border rounded-md bg-gray-50 text-xs"
                >
                  <Icon className={cn('h-3.5 w-3.5', s.tone)} />
                  <span className="font-semibold text-gray-800">{s.value}</span>
                  <span className="text-gray-500">{s.label}</span>
                </div>
              )
            })}
          </div>

          {/* 5 assessment stages — attention stages (fail/review) open by default */}
          <Accordion type="multiple" defaultValue={defaultOpen} className="w-full space-y-2">
            {stages.map((stage) => {
              const badge = STAGE_BADGE[stage.verdict]
              const checkCount = stage.stageRules.length + stage.stagePolicies.length
              return (
                <AccordionItem
                  key={stage.key}
                  value={stage.key}
                  className="border rounded-md overflow-hidden"
                >
                  <AccordionTrigger
                    data-testid={`glass-box-stage-${stage.key}-trigger`}
                    className="px-3 py-2.5 text-sm hover:bg-gray-50 hover:no-underline data-[state=open]:border-b"
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="text-left">
                        <span className="font-semibold text-gray-800 text-sm">{stage.name}</span>
                        <span className="hidden md:inline text-xs text-gray-500 ml-2">{stage.description}</span>
                      </div>
                      <div className="flex items-center space-x-2 mr-1">
                        <span className="text-xs text-gray-400">{checkCount} checks</span>
                        <Badge
                          variant="outline"
                          className={cn('px-1.5 py-0 text-[10px] font-semibold border', badge.classes)}
                        >
                          {badge.label}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-3 space-y-2 bg-white">
                    {stage.stageRules.map((rule) => (
                      <CheckRow
                        key={rule.rule_id}
                        testId={`glass-box-rule-${rule.rule_id.toLowerCase()}`}
                        id={rule.rule_id}
                        name={rule.rule_name}
                        verdict={ruleVerdict(rule.outcome)}
                        outcomeLabel={rule.outcome.replace(/_/g, ' ')}
                        severityLabel={rule.severity}
                        severityEmphasis={rule.severity === 'MANDATORY'}
                        body={rule.reasoning}
                        evidenceRefs={rule.evidence_refs}
                        remediation={rule.remediation}
                        kindIcon={Gavel}
                      />
                    ))}
                    {stage.stagePolicies.map((policy) => (
                      <CheckRow
                        key={policy.policy_id}
                        testId={`glass-box-policy-${policy.policy_id.toLowerCase()}`}
                        id={policy.policy_id}
                        name={policy.policy_name.replace(/_/g, ' ')}
                        verdict={opaVerdict(policy.outcome)}
                        outcomeLabel={policy.outcome.replace(/_/g, ' ')}
                        severityLabel={policy.policy_type}
                        severityEmphasis={policy.policy_type === 'HARD'}
                        body={
                          policy.denial_reasons.length > 0 ? (
                            <ul className="list-disc list-inside space-y-0.5">
                              {policy.denial_reasons.map((reason, i) => (
                                <li key={i}>{reason}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-500">No issues raised by this policy.</span>
                          )
                        }
                        kindIcon={ShieldCheck}
                      />
                    ))}
                    {checkCount === 0 && (
                      <p className="text-xs text-gray-400 text-center py-2">
                        No checks evaluated in this stage for this application.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            })}

            {/* Unmapped checks — audit trail must never silently drop a result */}
            {(unmappedRules.length > 0 || unmappedPolicies.length > 0) && (
              <AccordionItem value="unmapped" className="border rounded-md overflow-hidden">
                <AccordionTrigger
                  data-testid="glass-box-stage-unmapped-trigger"
                  className="px-3 py-2.5 text-sm hover:bg-gray-50 hover:no-underline data-[state=open]:border-b"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-semibold text-gray-800 text-sm">Other checks</span>
                    <span className="text-xs text-gray-400 mr-1">
                      {unmappedRules.length + unmappedPolicies.length} checks
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-3 space-y-2 bg-white">
                  {unmappedRules.map((rule) => (
                    <CheckRow
                      key={rule.rule_id}
                      testId={`glass-box-rule-${rule.rule_id.toLowerCase()}`}
                      id={rule.rule_id}
                      name={rule.rule_name}
                      verdict={ruleVerdict(rule.outcome)}
                      outcomeLabel={rule.outcome.replace(/_/g, ' ')}
                      severityLabel={rule.severity}
                      severityEmphasis={rule.severity === 'MANDATORY'}
                      body={rule.reasoning}
                      evidenceRefs={rule.evidence_refs}
                      remediation={rule.remediation}
                      kindIcon={Gavel}
                    />
                  ))}
                  {unmappedPolicies.map((policy) => (
                    <CheckRow
                      key={policy.policy_id}
                      testId={`glass-box-policy-${policy.policy_id.toLowerCase()}`}
                      id={policy.policy_id}
                      name={policy.policy_name.replace(/_/g, ' ')}
                      verdict={opaVerdict(policy.outcome)}
                      outcomeLabel={policy.outcome.replace(/_/g, ' ')}
                      severityLabel={policy.policy_type}
                      severityEmphasis={policy.policy_type === 'HARD'}
                      body={
                        policy.denial_reasons.length > 0 ? (
                          <ul className="list-disc list-inside space-y-0.5">
                            {policy.denial_reasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-500">No issues raised by this policy.</span>
                        )
                      }
                      kindIcon={ShieldCheck}
                    />
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          {/* Footer — provenance + principle */}
          <div className="mt-4 pt-3 border-t space-y-1">
            {provenance && (
              <p data-testid="glass-box-provenance" className="text-[11px] text-gray-600 font-mono flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-gray-400 flex-shrink-0" />
                {provenance}
              </p>
            )}
            <p className="text-[11px] text-gray-500">
              Every evaluated rule and policy is shown — including those not applicable to this
              application. Deterministic rules decide; AI only extracts and summarises.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
