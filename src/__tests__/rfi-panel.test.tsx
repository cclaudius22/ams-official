// @vitest-environment node
/**
 * RFIPanel — RFI lifecycle scaffold (Slice 3b). Render tests of the initial
 * (GAP_FLAGGED) state. The interactive advance through the 3 states is exercised
 * via Playwright; here we assert the gap, the prepared request, the lifecycle
 * stepper, and the honest Phase-2 / scaffold labelling — and that it stays
 * status-led (no numeric grades, consistent with the scoring-display policy).
 */
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import RFIPanel from '@/components/application/RFIPanel'
import type { RfiSummary } from '@/data/providers/deepSetRfiAdapter'

const rfi: RfiSummary = {
  enabled: true,
  issue: 'missing payslip month 2',
  missingItems: ['missing payslip month 2'],
  removedDocument: 'PAYSLIPS_002.pdf',
  request: {
    requestedItem: 'missing payslip month 2',
    requestedDocumentType: 'PAYSLIPS',
    caseworkerMessage: 'Please provide the missing February 2026 payslip so the salary evidence covers the full assessed period.',
    issuedAt: '2026-06-24T11:15:00Z',
    dueAt: '2026-07-08T11:15:00Z',
  },
  response: {
    applicantMessage: 'Applicant supplied February 2026 payslip matching the bank BACS salary credit.',
    receivedAt: '2026-06-27T09:40:00Z',
    suppliedDocuments: [{ type: 'PAYSLIPS', filename: 'PAYSLIPS_002.pdf' }],
    postResponseRecommendation: 'MANUAL_REVIEW',
    decisionOptions: ['APPROVE_AFTER_REVIEW', 'REJECT_AFTER_REVIEW', 'REQUEST_MORE_INFO'],
  },
}

describe('RFIPanel — RFI scaffold (initial GAP_FLAGGED state)', () => {
  it('surfaces the DIS-flagged gap and the prepared request to the applicant', () => {
    const html = renderToStaticMarkup(<RFIPanel rfi={rfi} />)
    expect(html).toContain('Request for Information')
    expect(html).toContain('missing payslip month 2')
    expect(html).toContain('February 2026 payslip') // the prepared caseworker message
    expect(html).toContain('Request Information') // the CTA
  })

  it('is honestly labelled a Phase-2 scaffold', () => {
    const html = renderToStaticMarkup(<RFIPanel rfi={rfi} />)
    expect(html).toContain('Phase 2')
    expect(html).toMatch(/Scaffold/i)
  })

  it('renders the 3-step lifecycle stepper', () => {
    const html = renderToStaticMarkup(<RFIPanel rfi={rfi} />)
    expect(html).toContain('Gap flagged')
    expect(html).toContain('Awaiting info')
    expect(html).toContain('Responded')
  })

  it('stays status-led — no numeric grade/score is shown', () => {
    const html = renderToStaticMarkup(<RFIPanel rfi={rfi} />)
    expect(html).not.toMatch(/\d{1,3}\s*\/\s*100/)
  })
})
