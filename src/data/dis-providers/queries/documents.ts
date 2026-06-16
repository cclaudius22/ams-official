/**
 * E4 — per-document evidence (V5 §6 endpoint 4 → Panel 3 document viewer).
 *
 * Resolves the AMS-facing source_application_id to the DIS application, then
 * returns its documents (gcs_path exchanged for image_url via signUrl),
 * their extractions, and the app-level cross_doc_fraud verdict.
 *
 * KEYING: input is the AMS source_application_id (applications.source_application_id),
 * NOT the DIS UUID. We resolve via `applications a` and filter on a.source_application_id.
 * Returns null when no application matches.
 *
 * SHAPE NOTE: the document_extractions TABLE carries fewer columns than the
 * DocumentExtraction TS type. We JOIN the parent documents row for the missing
 * tier/criticality/document_type, pull source_channel from applications, and
 * default the columns DIS does not persist on this table (extracted_data, the
 * gcs_* paths) sensibly. See the realDataGotchas in the task summary.
 */
import type { DISDocumentsResult } from '../index'
import type {
  DISDocument,
  DocumentExtraction,
  ExtractionMethod,
  ExtractionTier,
  DocumentCriticality,
  DocumentType,
  DocumentProcessingStatus,
  SourceChannel,
  FraudStatus,
  FraudSignals,
} from '@/api-contracts/dis'
import { disQuery } from '@/lib/disDb'
import { signUrl } from '../signUrl'

interface DocumentRow {
  dis_document_id: string
  document_type: DocumentType
  requirement_tier: string | null
  processing_tier: ExtractionTier | null
  criticality: DocumentCriticality
  gcs_path: string | null
  processing_status: DocumentProcessingStatus
  quality_score: string | null // NUMERIC arrives as string from pg
  mime_type: string | null
  file_size_bytes: string | null // BIGINT arrives as string from pg
}

interface ExtractionRow {
  extraction_id: string
  dis_application_id: string
  dis_document_id: string
  extraction_method: string
  extraction_model_version: string
  processor_id: string
  raw_extraction: Record<string, unknown> | null
  normalised_fields: Record<string, unknown> | null
  fraud_score: string | null // NUMERIC -> string
  fraud_status: FraudStatus | null
  fraud_signals: FraudSignals | null
  confidence_score: string | null // NUMERIC -> string
  // JOINed from the parent documents row (absent on the extractions table):
  document_type: DocumentType
  tier: ExtractionTier
  criticality: DocumentCriticality
  // From applications (extractions table has no source_channel):
  source_channel: SourceChannel
  // Only storage location DIS records for the document (extractions table has none):
  doc_gcs_path: string | null
  // ISO strings (cast in SQL so pg returns text, not a JS Date):
  created_at: string
  updated_at: string
}

interface AppRow {
  dis_application_id: string
  cross_doc_fraud: Record<string, unknown> | null
}

const toNum = (v: string | null): number | undefined =>
  v === null || v === undefined ? undefined : Number(v)

export async function queryDocuments(
  sourceApplicationId: string,
): Promise<DISDocumentsResult | null> {
  // Resolve the application by its AMS-facing source id.
  const apps = await disQuery<AppRow>(
    `SELECT dis_application_id, cross_doc_fraud
       FROM applications
      WHERE source_application_id = $1`,
    [sourceApplicationId],
  )
  const app = apps[0]
  if (!app) return null

  const disApplicationId = app.dis_application_id

  // Documents for this application (Panel 3 viewer).
  const docRows = await disQuery<DocumentRow>(
    `SELECT dis_document_id, document_type, requirement_tier, processing_tier,
            criticality, gcs_path, processing_status, quality_score, mime_type,
            file_size_bytes
       FROM documents
      WHERE dis_application_id = $1
      ORDER BY criticality DESC, document_type`,
    [disApplicationId],
  )

  const documents: DISDocument[] = docRows.map((r) => ({
    dis_document_id: r.dis_document_id,
    document_type: r.document_type,
    requirement_tier: r.requirement_tier ?? undefined,
    processing_tier: r.processing_tier ?? undefined,
    criticality: r.criticality,
    gcs_path: r.gcs_path ?? '',
    // signUrl is the 2F.3 stub: returns gcs_path unchanged (no real minting).
    image_url: signUrl(r.gcs_path),
    processing_status: r.processing_status,
    quality_score: toNum(r.quality_score),
    mime_type: r.mime_type ?? undefined,
    file_size_bytes: toNum(r.file_size_bytes),
  }))

  // Extractions — JOIN documents for tier/criticality/document_type, and
  // applications for source_channel (none of which live on the extractions table).
  const exRows = await disQuery<ExtractionRow>(
    `SELECT e.extraction_id, e.dis_application_id, e.dis_document_id,
            e.extraction_method, e.extraction_model_version, e.processor_id,
            e.raw_extraction, e.normalised_fields, e.fraud_score, e.fraud_status,
            e.fraud_signals, e.confidence_score,
            d.document_type, d.processing_tier AS tier, d.criticality,
            d.gcs_path AS doc_gcs_path,
            a.source_channel,
            e.created_at::text AS created_at, e.updated_at::text AS updated_at
       FROM document_extractions e
       JOIN documents d ON d.dis_document_id = e.dis_document_id
       JOIN applications a ON a.dis_application_id = e.dis_application_id
      WHERE e.dis_application_id = $1
      ORDER BY d.criticality DESC, d.document_type`,
    [disApplicationId],
  )

  const document_extractions: DocumentExtraction[] = exRows.map((r) => ({
    extraction_id: r.extraction_id,
    dis_application_id: r.dis_application_id,
    document_id: r.dis_document_id, // TS field document_id <- table dis_document_id
    document_type: r.document_type,
    tier: r.tier,
    criticality: r.criticality,
    // Table stores 'CUSTOM_EXTRACTOR'; the TS enum spells it 'DOC_AI_CUSTOM_EXTRACTOR'.
    // We pass the persisted value through unchanged (cast) — the read layer must
    // not invent a value the source did not write. See realDataGotchas.
    extraction_method: r.extraction_method as ExtractionMethod,
    processor_id: r.processor_id,
    processor_version: r.extraction_model_version, // processor_version <- extraction_model_version
    extraction_confidence: toNum(r.confidence_score) ?? 0, // extraction_confidence <- confidence_score
    raw_extraction: r.raw_extraction ?? {},
    extracted_data: {}, // not persisted on this table; default per task spec
    normalised_fields: r.normalised_fields ?? {},
    fraud_score: r.fraud_score === null ? null : Number(r.fraud_score),
    fraud_status: r.fraud_status,
    fraud_signals: r.fraud_signals,
    source_channel: r.source_channel, // from applications.source_channel
    // gcs_*_path are not persisted on the extractions table; the only storage
    // location DIS records for a document is documents.gcs_path. Use it for both.
    gcs_raw_path: r.doc_gcs_path ?? '',
    gcs_processed_path: r.doc_gcs_path ?? '',
    created_at: r.created_at,
    updated_at: r.updated_at,
  }))

  return {
    documents,
    document_extractions,
    cross_doc_fraud: app.cross_doc_fraud ?? null,
  }
}
