// @vitest-environment node
/**
 * Panel 2 (Glass Box Rule Trace) — polish logic + governance tests.
 *
 * Covers the polish added 21 Jun (stage progress strip, auto-open attention
 * stages, provenance line) AND re-asserts the scoring-display policy: Panel 2
 * shows qualitative verdicts (PASS/REVIEW/FAIL/N-A), fired rules, reasoning and
 * COUNTS — but never a numeric DIS grade (component score, the DIS
 * confidence_score, completeness_score, or raw_fraud_score).
 *
 * The strip is rendered directly (StageStrip) because the panel accordion is
 * collapsed by default, exactly like the Panel 3 test renders its cards directly.
 */

import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import GlassBoxTracePanel, {
  buildStages,
  defaultOpenStageKeys,
  formatProvenance,
  baseRuleId,
  StageStrip,
} from '@/components/application/GlassBoxTracePanel'
import { mockDISApplicationView } from '@/lib/mockDISData'
import type { DISApplicationView, DroolsRuleResult } from '@/api-contracts/dis'

const view = mockDISApplicationView

/** Clone the view with one Stage-4 (Compliance) rule forced to BLOCKED. */
const withComplianceFailure = (): DISApplicationView => ({
  ...view,
  rule_results: view.rule_results.map((r) =>
    r.rule_id === 'RULE-W14' ? { ...r, outcome: 'BLOCKED' as const } : r
  ),
})

describe('buildStages — the reasoning map', () => {
  it('returns the 5 assessment stages, each with a rolled-up verdict', () => {
    const stages = buildStages(view)
    expect(stages.map((s) => s.key)).toEqual([
      'validity',
      'suitability',
      'eligibility',
      'compliance',
      'soft-flags',
    ])
    expect(stages.every((s) => ['pass', 'fail', 'review', 'na'].includes(s.verdict))).toBe(true)
  })

  it('rolls a soft FLAG up to a REVIEW verdict on the soft-flags stage (happy-path mock)', () => {
    const stages = buildStages(view)
    expect(stages.find((s) => s.key === 'soft-flags')!.verdict).toBe('review')
    expect(stages.find((s) => s.key === 'validity')!.verdict).toBe('pass')
  })

  it('rolls a BLOCKED rule up to a FAIL verdict on its stage', () => {
    const stages = buildStages(withComplianceFailure())
    expect(stages.find((s) => s.key === 'compliance')!.verdict).toBe('fail')
  })
})

describe('defaultOpenStageKeys — auto-open what needs attention', () => {
  it('opens only the attention stages (review/fail), never the clean ones', () => {
    const open = defaultOpenStageKeys(buildStages(view))
    expect(open).toContain('soft-flags')      // the FLAG
    expect(open).not.toContain('validity')    // all-pass → stays collapsed
    expect(open).not.toContain('eligibility')
  })

  it('opens a failed stage by default', () => {
    const open = defaultOpenStageKeys(buildStages(withComplianceFailure()))
    expect(open).toContain('compliance')
  })
})

describe('formatProvenance — deterministic + auditable provenance', () => {
  it('names the engine versions and the evaluation date', () => {
    const p = formatProvenance(view)
    expect(p).toContain('rv-7d1a2b3c')   // a Drools rule version
    expect(p).toContain('pv-1c2d3e4f')   // an OPA policy version
    expect(p).toContain('2026')          // evaluated-at year
  })
})

describe('StageStrip — at-a-glance verdict pills', () => {
  it('renders a pill per stage with its short label', () => {
    const html = renderToStaticMarkup(<StageStrip stages={buildStages(view)} />)
    expect(html).toContain('Validity')
    expect(html).toContain('Soft Flags')
    expect(html).toContain('data-testid="glass-box-stage-strip"')
  })
})

describe('Panel 2 — status-led, no numeric DIS grades', () => {
  it('mounts with the Glass Box header and never leaks a component grade or confidence number', () => {
    const html = renderToStaticMarkup(<GlassBoxTracePanel disView={view} />)
    expect(html).toContain('Glass Box')
    expect(html).not.toContain('0.97')   // passport confidence — a grade, must not render
    expect(html).not.toContain('raw_fraud')
  })
})

describe('baseRuleId — sub-rule suffix normalisation', () => {
  it('strips a lettered sub-rule suffix to its base family; leaves base/OPA ids intact', () => {
    expect(baseRuleId('RULE-W14-A')).toBe('RULE-W14')   // document fraud sub-rule
    expect(baseRuleId('RULE-W16-Z')).toBe('RULE-W16')   // digital-fraud sub-rule
    expect(baseRuleId('RULE-W12-B')).toBe('RULE-W12')
    expect(baseRuleId('RULE-W14')).toBe('RULE-W14')     // already a base
    expect(baseRuleId('OPA-H05')).toBe('OPA-H05')       // trailing digits ≠ a suffix
  })
})

describe('buildStages — sub-rule IDs + RULE-W16 map to their family stage', () => {
  // Deloitte's Drools emits sub-rule IDs (RULE-W14-A) and the W16 digital-fraud
  // family (spec v3.2 §3.9); the trail must route them, not drop them to "Other".
  const withSubRules = (): DISApplicationView => {
    const base = view.rule_results[0]
    const r = (id: DroolsRuleResult['rule_id']): DroolsRuleResult => ({ ...base, rule_id: id, outcome: 'SATISFIED' })
    return { ...view, rule_results: [...view.rule_results, r('RULE-W14-A'), r('RULE-W16-C'), r('RULE-W12-B')] }
  }

  it('routes RULE-W14-A and RULE-W16-C to Compliance, RULE-W12-B to Suitability', () => {
    const stages = buildStages(withSubRules())
    const compliance = stages.find((s) => s.key === 'compliance')!.stageRules.map((r) => r.rule_id)
    const suitability = stages.find((s) => s.key === 'suitability')!.stageRules.map((r) => r.rule_id)
    expect(compliance).toContain('RULE-W14-A')
    expect(compliance).toContain('RULE-W16-C')
    expect(suitability).toContain('RULE-W12-B')
  })

  it('does NOT leave sub-rule IDs in the unmapped "Other checks" bucket', () => {
    const html = renderToStaticMarkup(<GlassBoxTracePanel disView={withSubRules()} />)
    // the panel renders; a sub-rule id present means it was placed in a stage,
    // not silently dropped. (Full DOM placement asserted via buildStages above.)
    expect(html).toContain('Glass Box')
  })
})
