// scripts/ingestVisa.js
const path = require('path');
const { loadAndChunkPDF, buildOrLoadVectorStore } = require('@/lib/api/visaRag');

(async () => {
  try {
    // Use the correct path to your PDF
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