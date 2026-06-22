import type { OVAssessment } from '@/api-contracts/ov'

/**
 * Open Visa Intelligence — Phase-1 MOCK assessment.
 *
 * The OV risk models are not yet deployed (LB-6); the AMS dashboard synthesises a
 * realistic, scenario-consistent assessment so the OV-IP panel is demo-complete.
 *
 * ⚠️ PRODUCTION BLOCKER: replace with real Azure model output before production —
 * a synthesised score must never be shown on a live applicant. The real model
 * emits the scores + factor attributions; the narrative layer turns them into the
 * prose. Shape is identical, so the swap is zero-UI-change. Tracked:
 * docs/LAUNCH_BLOCKERS.md (LB-6), docs/specs/…-v5.md §7a.
 */
export function syntheticOvAssessment(): OVAssessment {
  return {
    model_version: 'ov-risk-v0.9-mock',
    overall: {
      risk_band: 'MEDIUM',
      score: 72,
      summary:
        'Rani Kumari presents as a credible Skilled Worker applicant: strong home-country ties, a genuine role match, and finances comfortably above the maintenance and salary thresholds, with a clean immigration history. Two items temper confidence — a minor font inconsistency on the employment letter and a low-risk PEP relative match on World-Check — both warranting officer assessment rather than refusal.',
    },
    recommendation: 'Proceed to officer review — no hard risk indicators; two soft signals to confirm.',
    dimensions: [
      {
        key: 'rootedness',
        label: 'Rootedness',
        score: 84,
        status: 'Strong ties',
        reasoning:
          'Strong, verifiable ties to the home country: property ownership, immediate family resident there, and six years of stable employment. Prior UK visa compliance and a consistent return-travel history reinforce an intent to return.',
        factors: ['Home property', 'Immediate family resident', '6-yr stable employment', 'Clean visa history'],
      },
      {
        key: 'intent',
        label: 'Intent',
        score: 76,
        status: 'Credible',
        reasoning:
          'The sponsored role (IT Business Analyst, SOC 2135) aligns with the applicant’s qualifications and career trajectory, and the finances are consistent with the stated plans. A short, unexplained gap in the travel record slightly lowers confidence.',
        factors: ['Role matches background', 'Finances consistent', 'Minor travel-history gap'],
      },
      {
        key: 'credibility',
        label: 'Credibility',
        score: 69,
        status: 'Review advised',
        reasoning:
          'Documents are internally consistent and cross-check against the Certificate of Sponsorship. Two soft signals lower the score: a font inconsistency detected on the employment letter (below the fraud threshold) and a low-risk PEP relative match returned by World-Check.',
        factors: ['Docs cross-check CoS', 'Font inconsistency (soft)', 'PEP relative match (low)'],
      },
    ],
  }
}
