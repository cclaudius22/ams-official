/**
 * Open Visa Intelligence — OV-IP assessment contract.
 *
 * Produced by OV's trained risk models (deployed on Azure for inference), NOT by
 * Deloitte's DIS. See docs/specs/2026-06-11-dis-integration-spec-v5.md §7a and
 * docs/LAUNCH_BLOCKERS.md (LB-6). Mocked until the Azure endpoint is live; the
 * shape is the real-swap contract.
 *
 * Explainable by design: every dimension carries its score AND the reasoning +
 * factors that produced it — no score without a justification (Glass Box for the
 * OV model, mirroring how DIS rules are traceable).
 */

export type OVRiskBand = 'LOW' | 'MEDIUM' | 'HIGH'

export type OVDimensionKey = 'rootedness' | 'intent' | 'credibility'

export interface OVDimension {
  key: OVDimensionKey
  label: string            // e.g. 'Rootedness'
  score: number            // 0–100 (higher = stronger / lower risk)
  status: string           // short verdict, e.g. 'Strong ties'
  reasoning: string        // the "why" — plain-English justification
  factors: string[]        // contributing factors (rendered as chips)
}

export interface OVAssessment {
  model_version: string
  overall: {
    risk_band: OVRiskBand
    score: number          // 0–100
    summary: string        // the model's narrative verdict (the case summary)
  }
  /** OV advisory recommendation — distinct from the DIS rule recommendation. */
  recommendation: string
  dimensions: OVDimension[]
}
