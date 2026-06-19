// @vitest-environment node
/**
 * Panel 3 (Evidence) — governance + render tests.
 *
 * Enforces the status-led / qualitative-signals-only rule (scoring-display
 * policy, 19 Jun): the officer view shows statuses, labels, fired signals, and
 * factual extracted fields — but NEVER a raw DIS grade (fraud_score, the DIS
 * confidence_score, or extraction_confidence as a number). Cards are rendered
 * directly (the panel's accordion is collapsed by default).
 */

import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import EvidencePanel, { ExternalCheckCard, DocumentEvidenceCard } from '@/components/application/EvidencePanel'
import { mockDISApplicationView } from '@/lib/mockDISData'

const extractions = mockDISApplicationView.document_extractions
const checks = mockDISApplicationView.external_checks

describe('EvidencePanel — status-led, no DIS grades', () => {
  it('panel mounts and shows the Evidence header with counts', () => {
    const html = renderToStaticMarkup(<EvidencePanel disView={mockDISApplicationView} />)
    expect(html).toContain('Evidence')
    expect(html).toContain(`${checks.length} checks`)
  })

  it('document card shows fraud STATUS + fired signals, never the composite fraud_score', () => {
    const emp = extractions.find((e) => e.document_type === 'EMPLOYMENT_LETTER')!
    const html = renderToStaticMarkup(<DocumentEvidenceCard extraction={emp} />)
    expect(html).toContain(emp.fraud_status as string)        // fraud_status chip (CLEAR)
    expect(html).toContain('FONT_INCONSISTENCY_DETECTED')     // fired signal — the evidence
    expect(html).not.toContain(String(emp.fraud_score))       // 0.18 — the grade must NOT render
  })

  it('shows the verify nudge ONLY when extraction confidence is low, and never the number', () => {
    const base = extractions[0]
    const low = renderToStaticMarkup(<DocumentEvidenceCard extraction={{ ...base, extraction_confidence: 0.55 }} />)
    expect(low.toLowerCase()).toContain('verify')             // nudge present
    expect(low).not.toContain('0.55')                         // confidence number never shown
    const high = renderToStaticMarkup(<DocumentEvidenceCard extraction={{ ...base, extraction_confidence: 0.97 }} />)
    expect(high.toLowerCase()).not.toContain('verify')        // no nudge when confident
  })

  it('external-check card shows status + risk label + response evidence, not the confidence_score', () => {
    const wc = checks.find((c) => c.check_type === 'WORLDCHECK')!
    const html = renderToStaticMarkup(<ExternalCheckCard check={wc} />)
    expect(html).toContain('FLAGGED')                         // check_status
    expect(html).toContain('Risk: LOW')                       // risk_level label
    expect(html).toContain('PEP_RELATIVE')                    // response_payload match evidence
    expect(html).not.toContain(String(wc.confidence_score))   // 0.72 — DIS confidence must NOT render
  })
})
