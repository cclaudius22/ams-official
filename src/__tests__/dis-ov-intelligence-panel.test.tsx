// @vitest-environment node
/**
 * Open Visa Intelligence panel — render + content tests.
 *
 * This panel is the DELIBERATE scores-shown exception (V5 §7a): unlike the rest
 * of the status-led case view, it renders the model scores — each paired with
 * its "why" reasoning + factors (explainable, not a scoreboard).
 */

import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import OVIntelligencePanel from '@/components/application/OVIntelligencePanel'
import { syntheticOvAssessment } from '@/lib/syntheticOvAssessment'

const a = syntheticOvAssessment()

describe('OVIntelligencePanel — explainable OV-IP assessment', () => {
  it('renders each dimension with its score AND the "why" + a factor', () => {
    const html = renderToStaticMarkup(<OVIntelligencePanel assessment={a} />)
    expect(html).toContain('Open Visa Intelligence')
    for (const d of a.dimensions) {
      expect(html).toContain(d.label)          // Rootedness / Intent / Credibility
      expect(html).toContain(String(d.score))  // the score IS shown here — the deliberate exception
      expect(html).toContain(d.factors[0])     // a contributing factor chip
    }
    expect(html).toContain('Why:')             // the spiel is present
  })

  it('shows the overall band, OV recommendation, and the narrative summary', () => {
    const html = renderToStaticMarkup(<OVIntelligencePanel assessment={a} />)
    expect(html).toContain('Medium risk')
    expect(html).toContain(a.recommendation)
    expect(html).toContain('Rani Kumari')      // narrative relocated here from Panel 1
  })

  it('covers exactly the three model dimensions', () => {
    expect(a.dimensions.map((d) => d.key).sort()).toEqual(['credibility', 'intent', 'rootedness'])
  })
})
