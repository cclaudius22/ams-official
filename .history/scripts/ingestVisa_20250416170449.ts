// scripts/ingestVisa.ts
import path from 'path';
import { loadAndChunkPDF, buildOrLoadVectorStore } from '@/lib/api/visaRag';

(async () => {
  try {
    // Replace with the actual PDF location; here it's assumed to be in public/documents.
    const pdfPath = path.join(process.cwd(), 'public', 'documents', 'visa_ragchat.pdf');
    console.log('Loading and chunking PDF from:', pdfPath);
    const chunks = await loadAndChunkPDF(pdfPath);
    console.log(`Generated ${chunks.length} chunks from the PDF`);

    // Build (or load) the Pinecone vector store.
    await buildOrLoadVectorStore(chunks);
    console.log('Embeddings have been upserted into Pinecone');
  } catch (err) {
    console.error("Error during ingestion:", err);
  }
})();
