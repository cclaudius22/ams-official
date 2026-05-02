/**
 * Bridge adapter: DISApplicationView → AIScanResult
 *
 * Temporary adapter used during Phase 2 migration. The reviewer page
 * carries DISApplicationView as its primary state, but the legacy
 * AIScanResultsRedesigned component still expects AIScanResult.
 *
 * This adapter maps DIS data into the legacy shape so the page keeps
 * rendering during the transition. Task 2.1 (Component Scores Dashboard)
 * replaces the legacy component entirely — at that point this adapter
 * is deleted.
 *
 * V3 spec: Phase 2A Task 2.0
 */

import type { DISApplicationView } from '@/api-contracts/dis'
import type { AIScanResult, ScanIssue } from '@/types/aiScan'

/**
 * Convert a DISApplicationView into the legacy AIScanResult shape.
 * Maps DIS component scores, rule failures, and OPA flags into the
 * format the existing AIScanResultsRedesigned component expects.
 */
export function disViewToLegacyScan(view: DISApplicationView): AIScanResult {
  const issues: ScanIssue[] = []

  // Convert failed Drools rules to scan issues
  for (const rule of view.rule_results) {
    if (rule.result === 'FAIL') {
      issues.push({
        id: rule.rule_id,
        sectionId: mapRuleToSection(rule.rule_id),
        type: 'invalid',
        severity: rule.severity === 'MANDATORY' ? 'high' : 'medium',
        message: rule.detail,
      })
    }
  }

  // Convert OPA flags to scan issues
  for (const opa of view.opa_results) {
    if (opa.result === 'BLOCK') {
      issues.push({
        id: opa.policy_id,
        sectionId: 'security',
        type: 'suspicious',
        severity: 'critical',
        message: `${opa.policy_name}: ${opa.reason}`,
      })
    } else if (opa.result === 'REVIEW_REQUIRED') {
      issues.push({
        id: opa.policy_id,
        sectionId: 'security',
        type: 'inconsistent',
        severity: 'medium',
        message: `${opa.policy_name}: ${opa.reason}`,
      })
    }
  }

  // Convert flagged external checks to scan issues
  for (const check of view.external_checks) {
    if (check.check_status === 'FLAGGED' || check.check_status === 'BLOCKED') {
      issues.push({
        id: check.request_id,
        sectionId: 'security',
        type: check.check_status === 'BLOCKED' ? 'suspicious' : 'inconsistent',
        severity: check.check_status === 'BLOCKED' ? 'critical' : 'medium',
        message: `${check.check_type}: ${check.risk_level} risk — ${JSON.stringify(check.flags)}`,
      })
    }
  }

  return {
    status: 'completed',
    scanStartedAt: new Date(view.submitted_at),
    scanCompletedAt: view.audit_log ? new Date() : undefined,
    isValid: view.decision.outcome !== 'REJECTED',
    score: Math.round(view.decision.overall_score),
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
