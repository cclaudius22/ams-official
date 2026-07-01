/**
 * Deep-set RFI adapter (Slice 3b — SCAFFOLD).
 *
 * Surfaces the corpus's Request-For-Information context so the reviewer page can
 * *walk through* what happens when DIS flags a completeness gap and the officer
 * asks the applicant for more information:
 *
 *   gap flagged → request issued → case parked (awaiting) → applicant responds
 *   (supplies the missing doc) → gap resolves → ready to decide.
 *
 * This is a SCAFFOLD: it's robust enough to demo the full intended flow (every
 * state is real, data-driven from the corpus), but the production guts —
 * applicant notifications, the applicant portal, re-running DIS on the new
 * evidence, persistence, the SLA clock, the actual decision — are Phase 2 and
 * need Home Office input before we build them out. The panel labels them as such.
 *
 * Data sources (all already in the corpus, no synthesis): the application's
 * `rfi_lifecycle` block + `completeness.missing_or_insufficient`, plus the
 * issued `request.json` and the applicant's `response.json` artifacts (read by
 * the provider and passed in here). Pure — no fs.
 */

export type RfiPhase = 'GAP_FLAGGED' | 'AWAITING_INFO' | 'RESPONDED'

export interface RfiSuppliedDocument {
  type?: string
  filename?: string
}

/** The prepared / issued information request (request.json). */
export interface RfiRequest {
  requestedItem?: string
  requestedDocumentType?: string
  caseworkerMessage?: string
  issuedAt?: string
  dueAt?: string
}

/** The applicant's response (response.json) — the "more information acquired" beat. */
export interface RfiResponse {
  applicantMessage?: string
  receivedAt?: string
  suppliedDocuments: RfiSuppliedDocument[]
  /** DIS's recommendation re-stated after the new evidence (officer still decides). */
  postResponseRecommendation?: string
  /** The caseworker's options once the gap is resolved. */
  decisionOptions: string[]
}

export interface RfiSummary {
  enabled: true
  /** Headline gap, e.g. "missing payslip month 2". */
  issue: string
  /** completeness.missing_or_insufficient — what DIS flagged short. */
  missingItems: string[]
  /** rfi_lifecycle.removed_initial_document — the doc dropped from the bundle. */
  removedDocument?: string
  request: RfiRequest
  /** null until/unless the corpus ships an applicant response artifact. */
  response: RfiResponse | null
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)

/**
 * Build the RFI scaffold summary from the corpus record + the issued request and
 * applicant response artifacts. Returns null unless `rfi_lifecycle.enabled` is
 * true, so non-RFI cases never render the panel.
 */
export function mapRfi(raw: unknown, requestArtifact?: unknown, responseArtifact?: unknown): RfiSummary | null {
  if (!isObject(raw)) return null
  const lc = raw.rfi_lifecycle
  if (!isObject(lc) || lc.enabled !== true) return null

  const completeness = isObject(raw.completeness) ? raw.completeness : {}
  const missingItems = Array.isArray(completeness.missing_or_insufficient)
    ? (completeness.missing_or_insufficient as unknown[]).filter((x): x is string => typeof x === 'string')
    : []

  const req = isObject(requestArtifact) ? requestArtifact : {}
  const request: RfiRequest = {
    requestedItem: str(req.requested_item),
    requestedDocumentType: str(req.requested_document_type),
    caseworkerMessage: str(req.caseworker_message),
    issuedAt: str(req.issued_at),
    dueAt: str(req.due_at),
  }

  let response: RfiResponse | null = null
  if (isObject(responseArtifact)) {
    const supplied = Array.isArray(responseArtifact.supplied_documents)
      ? (responseArtifact.supplied_documents as unknown[]).filter(isObject).map((d) => ({
          type: str(d.type),
          filename: str(d.filename),
        }))
      : []
    const options = Array.isArray(responseArtifact.caseworker_decision_options)
      ? (responseArtifact.caseworker_decision_options as unknown[]).filter((x): x is string => typeof x === 'string')
      : []
    response = {
      applicantMessage: str(responseArtifact.applicant_message),
      receivedAt: str(responseArtifact.received_at),
      suppliedDocuments: supplied,
      postResponseRecommendation: str(responseArtifact.post_response_recommendation),
      decisionOptions: options,
    }
  }

  return {
    enabled: true,
    issue: str(lc.issue) ?? 'Further information required',
    missingItems,
    removedDocument: str(lc.removed_initial_document),
    request,
    response,
  }
}
