// scripts/ingestVisa.ts
import path from 'path';
import { loadAndChunkPDF, buildOrLoadVectorStore } from '@/lib/api/visaRag';

(async () => {
  try {
    // Update the path to match your actual PDF location
    const pdfPath = path.join(process.cwd(), 'public', 'docs', 'visa_ragchat.pdf');
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