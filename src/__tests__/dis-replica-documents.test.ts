// @vitest-environment node
/**
 * 2F.3 integration test for queryDocuments (E4 — per-document evidence).
 *
 * Runs against the local DIS replica (docker container 'dis-replica'). Gated on
 * DIS_REPLICA_URL so CI without docker stays green:
 *   DIS_REPLICA_URL=postgres://dis:dis@localhost:5499/openvisa_pg_db \
 *     npx vitest run src/__tests__/dis-replica-documents.test.ts
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { disQuery } from '@/lib/disDb'
import { queryDocuments } from '@/data/dis-providers/queries/documents'

const RUN = !!process.env.DIS_REPLICA_URL

describe.skipIf(!RUN)('queryDocuments (DIS replica E4)', () => {
  let seededId: string
  let flaggedId: string | undefined

  beforeAll(async () => {
    // Pick a real seeded application that has documents + extractions.
    const rows = await disQuery<{ source_application_id: string }>(
      `SELECT a.source_application_id
         FROM applications a
         JOIN recommendations r USING (dis_application_id)
        WHERE r.outcome = 'MANUAL_REVIEW'
          AND EXISTS (SELECT 1 FROM documents d WHERE d.dis_application_id = a.dis_application_id)
        ORDER BY a.source_application_id
        LIMIT 1`,
    )
    seededId = rows[0]?.source_application_id
    expect(seededId, 'expected at least one seeded MANUAL_REVIEW app with documents').toBeTruthy()

    // An app whose cross_doc_fraud is FLAGGED (W14), to exercise the JSONB path.
    const flagged = await disQuery<{ source_application_id: string }>(
      `SELECT source_application_id FROM applications
        WHERE cross_doc_fraud->>'cross_doc_consistency' = 'FLAGGED'
        LIMIT 1`,
    )
    flaggedId = flagged[0]?.source_application_id
  })

  it('returns documents + extractions + cross_doc_fraud for a known seeded id', async () => {
    const result = await queryDocuments(seededId)
    expect(result).not.toBeNull()
    if (!result) return

    // documents
    expect(Array.isArray(result.documents)).toBe(true)
    expect(result.documents.length).toBeGreaterThanOrEqual(1)
    for (const doc of result.documents) {
      expect(typeof doc.dis_document_id).toBe('string')
      expect(typeof doc.document_type).toBe('string')
      expect(typeof doc.criticality).toBe('string')
      // signUrl stub echoes gcs_path -> image_url must be a non-null string
      expect(typeof doc.image_url).toBe('string')
      expect(doc.image_url).toBe(doc.gcs_path)
      expect(typeof doc.processing_status).toBe('string')
    }

    // extractions: an array, may be shorter than documents (PHOTO is not extractable)
    expect(Array.isArray(result.document_extractions)).toBe(true)
    expect(result.document_extractions.length).toBeLessThanOrEqual(result.documents.length)
    const docIds = new Set(result.documents.map((d) => d.dis_document_id))
    for (const ex of result.document_extractions) {
      expect(typeof ex.extraction_id).toBe('string')
      // document_id maps from dis_document_id and references a real document
      expect(docIds.has(ex.document_id)).toBe(true)
      expect(typeof ex.processor_id).toBe('string')
      expect(typeof ex.processor_version).toBe('string')
      expect(typeof ex.extraction_confidence).toBe('number')
      // mapped/derived fields are always present (not undefined)
      expect(ex.extracted_data).toBeTypeOf('object')
      expect(ex.raw_extraction).toBeTypeOf('object')
      expect(ex.normalised_fields).toBeTypeOf('object')
      expect(['TIER_1', 'TIER_2']).toContain(ex.tier)
      expect(['CRITICAL', 'SUPPORTING']).toContain(ex.criticality)
      expect(['visakey', 'govdirect']).toContain(ex.source_channel)
      expect(typeof ex.created_at).toBe('string')
    }

    // cross_doc_fraud is the applications JSONB (object, has the consistency key)
    expect(result.cross_doc_fraud).not.toBeNull()
    expect(result.cross_doc_fraud).toHaveProperty('cross_doc_consistency')
  })

  it('surfaces a FLAGGED cross_doc_fraud verdict', async () => {
    if (!flaggedId) return
    const result = await queryDocuments(flaggedId)
    expect(result).not.toBeNull()
    expect(result?.cross_doc_fraud?.cross_doc_consistency).toBe('FLAGGED')
  })

  it('returns null for an unknown source id', async () => {
    expect(await queryDocuments('NOPE-DOES-NOT-EXIST-404')).toBeNull()
  })
})
