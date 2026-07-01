/**
 * DIS-aligned corpus adapter — maps a raw GovDirect/DIS-shaped application
 * (the `data/demo-corpus/bulk` schema) to the internal `LiveApplication` the
 * queue speaks. Pure + unit-tested so the corpus stays untouched (map, don't
 * rename). See docs/specs/2026-06-24-multi-visa-queue-allocation-design.md §5.2.
 */
import type { LiveApplication } from '@/api-contracts/applications'
import type { RecommendationOutcome } from '@/api-contracts/dis'
import { normalizeVisaType, visaTypeLabel } from '@/config/visaTypes'

type Recommendation = RecommendationOutcome

const ANOMALY_TO_REC: Record<string, Recommendation> = {
  clean: 'RECOMMEND_APPROVE',
  fail_rules: 'RECOMMEND_REJECT',
  suspicious: 'MANUAL_REVIEW',
  edge_case: 'MANUAL_REVIEW',
}

const REC_VALUES: Recommendation[] = ['RECOMMEND_APPROVE', 'RECOMMEND_REJECT', 'MANUAL_REVIEW']

/** Explicit `recommendation` field wins; else deterministic from `anomaly_type`. */
export function deriveRecommendation(raw: { recommendation?: unknown; anomaly_type?: unknown }): Recommendation {
  if (typeof raw?.recommendation === 'string' && (REC_VALUES as string[]).includes(raw.recommendation)) {
    return raw.recommendation as Recommendation
  }
  const anomaly = typeof raw?.anomaly_type === 'string' ? raw.anomaly_type : ''
  return ANOMALY_TO_REC[anomaly] ?? 'MANUAL_REVIEW'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDisAlignedApp(raw: any): LiveApplication {
  const visaTypeId = normalizeVisaType(String(raw?.visa_type ?? '')) ?? String(raw?.visa_type ?? 'unknown')
  const first = raw?.applicant?.first_name ?? ''
  const last = raw?.applicant?.last_name ?? ''
  return {
    id: String(raw?.source_application_id ?? ''),
    applicantName: `${first} ${last}`.trim(),
    country: String(raw?.country_code ?? ''),
    visaType: visaTypeLabel(visaTypeId),
    submittedAt: String(raw?.submitted_at ?? ''),
    status: 'Received',
    visaTypeId,
    recommendation: deriveRecommendation(raw),
    anomalyType: raw?.anomaly_type ? String(raw.anomaly_type) : undefined,
    sourceReference: raw?.source_reference ? String(raw.source_reference) : undefined,
  }
}
