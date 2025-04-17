// scripts/ingestVisa.js
require('dotenv').config(); // Load environment variables from .env

const path = require('path');
const { loadAndChunkPDF, buildOrLoadVectorStore } = require('../src/lib/api/visaRag');

async function main() {
  const pdfPath = path.join(__dirname, '../public/docs/visa_ragchat.pdf');
  console.log(`Loading and chunking PDF from: ${pdfPath}`);
  const chunks = await loadAndChunkPDF(pdfPath);
  console.log(`Generated ${chunks.length} chunks from the PDF`);

  try {
    const index = await buildOrLoadVectorStore(chunks);
    console.log("Ingestion complete.");
  } catch (error) {
    console.error("Error during ingestion:", error);
  }
}

main();