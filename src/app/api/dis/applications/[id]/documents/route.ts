/**
 * GET /api/dis/applications/:id/documents
 * V5 §6 endpoint 4 — per-document evidence: documents joined to their
 * extractions, plus application-level cross_doc_fraud. image_url is a signed
 * URL minted by the read layer (2F.3 stub: echoes gcs_path; real signing 2F.5).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDISProvider } from '@/data/dis-providers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const provider = await getDISProvider();

    const documents = await provider.getDocuments(id);
    if (!documents) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    console.error('[API] GET /dis/applications/:id/documents error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
