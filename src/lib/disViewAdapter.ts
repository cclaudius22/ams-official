/**
 * Bridge adapter: DISApplicationView → AIScanResult
 *
 * Temporary adapter used during Phase 2 migration. The reviewer page
 * carries DISApplicationView as its primary state, but the legacy
 * AIScanResultsRedesigned component still expects AIScanResult.
 *
 * This adapter maps DIS data into the legacy shape so the page keeps
 * rendering during the transition. The Phase 2A panels replace the legacy
 * component — at that point this adapter is deleted.
 *
 * V5 spec §8: as-built vocabularies — rule outcomes SATISFIED/NOT_SATISFIED/
 * BLOCKED/REVIEW_REQUIRED/NOT_APPLICABLE, OPA outcomes ALLOW/DENY/FLAG/
 * REVIEW_REQUIRED/PASS with denial_reasons arrays, nullable component scores.
 */

import type { DISApplicationView, ComponentScore } from '@/api-contracts/dis'
import type { AIScanResult, ScanIssue } from '@/types/aiScan'

/**
 * Convert a DISApplicationView into the legacy AIScanResult shape.
 */
export function disViewToLegacyScan(view: DISApplicationView): AIScanResult {
  const issues: ScanIssue[] = []

  // Failed/flagged Drools rules → scan issues.
  // SATISFIED and NOT_APPLICABLE produce no issue.
  for (const rule of view.rule_results) {
    if (rule.outcome === 'NOT_SATISFIED' || rule.outcome === 'BLOCKED') {
      issues.push({
        id: rule.rule_id,
        sectionId: mapRuleToSection(rule.rule_id),
        type: 'invalid',
        severity: rule.outcome === 'BLOCKED' || rule.severity === 'MANDATORY' ? 'high' : 'medium',
        message: rule.reasoning,
      })
    } else if (rule.outcome === 'REVIEW_REQUIRED') {
      issues.push({
        id: rule.rule_id,
        sectionId: mapRuleToSection(rule.rule_id),
        type: 'inconsistent',
        severity: 'medium',
        message: rule.reasoning,
      })
    }
  }

  // OPA outcomes → scan issues. DENY is the hard stop (there is no BLOCK
  // value as-built); FLAG / REVIEW_REQUIRED are soft.
  for (const opa of view.opa_results) {
    if (opa.outcome === 'DENY') {
      issues.push({
        id: opa.policy_id,
        sectionId: 'security',
        type: 'suspicious',
        severity: 'critical',
        message: `${opa.policy_name}: ${opa.denial_reasons.join('; ')}`,
      })
    } else if (opa.outcome === 'FLAG' || opa.outcome === 'REVIEW_REQUIRED') {
      issues.push({
        id: opa.policy_id,
        sectionId: 'security',
        type: 'inconsistent',
        severity: 'medium',
        message: `${opa.policy_name}: ${opa.denial_reasons.join('; ')}`,
      })
    }
  }

  // Flagged external checks → scan issues
  view.external_checks.forEach((check, i) => {
    if (check.check_status === 'FLAGGED' || check.check_status === 'BLOCKED') {
      issues.push({
        id: check.check_id ?? `${check.check_type}-${i}`,
        sectionId: 'security',
        type: check.check_status === 'BLOCKED' ? 'suspicious' : 'inconsistent',
        severity: check.check_status === 'BLOCKED' ? 'critical' : 'medium',
        message: `${check.check_type}: ${check.risk_level} risk — ${JSON.stringify(check.flags)}`,
      })
    }
  })

  return {
    status: 'completed',
    scanStartedAt: new Date(view.submitted_at),
    scanCompletedAt: new Date(view.recommendation.generated_at),
    // RecommendationOutcome has no REJECTED value (disabled as-built — V5 §5
    // quirk 2), so every Phase 1 recommendation is "valid" in the legacy sense.
    isValid: true,
    score: deriveOverallScore(view.component_scores),
    issues,
    recommendations: [],
    rootednessScore: undefined,
    intentScore: undefined,
    rootednessSummary: undefined,
    intentSummary: undefined,
    documentSummary: view.llm_summary || undefined,
  }
}

/**
 * There is no overall_score as-built (V5 §8) — derive a display score as the
 * null-safe mean of component scores. NOT_APPLICABLE components (null entry
 * or null score) are excluded, never counted as 0.
 */
function deriveOverallScore(scores: DISApplicationView['component_scores']): number {
  const values = Object.values(scores)
    .filter((c): c is ComponentScore => c !== null && c.score !== null)
    .map((c) => c.score as number)
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, s) => sum + s, 0) / values.length)
}

/**
 * Map a Drools rule ID to a legacy section ID for grouping in the
 * existing ScanIssue-based display.
 */
function mapRuleToSection(ruleId: string): string {
  if (ruleId.startsWith('RULE-U01') || ruleId.startsWith('RULE-U02')) return 'passport'
  if (ruleId.startsWith('RULE-U03')) return 'security'
  if (ruleId.startsWith('RULE-U04')) return 'kyc'
  if (ruleId.startsWith('RULE-U05')) return 'documents'
  if (ruleId.startsWith('RULE-W01') || ruleId.startsWith('RULE-W02') || ruleId.startsWith('RULE-W15')) return 'sponsorshipAndRole'
  if (ruleId.startsWith('RULE-W03') || ruleId.startsWith('RULE-W04') || ruleId.startsWith('RULE-W06') || ruleId.startsWith('RULE-W09')) return 'financial'
  if (ruleId.startsWith('RULE-W05') || ruleId.startsWith('RULE-W07')) return 'professional'
  if (ruleId.startsWith('RULE-W08')) return 'academicQualifications'
  if (ruleId.startsWith('RULE-W10')) return 'medical'
  if (ruleId.startsWith('RULE-W11') || ruleId.startsWith('RULE-W12')) return 'travel'
  if (ruleId.startsWith('RULE-W13')) return 'documents'
  if (ruleId.startsWith('RULE-W14')) return 'documents'
  return 'documents'
}
