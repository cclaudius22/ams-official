// src/lib/api/visaRag.js

// Required dependencies:
//   npm install openai pdf-parse
//   (or use pdfjs-dist if you prefer, but pdf-parse is simpler for Node.js)

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const pdfParse = require('pdf-parse');

// Path to the PDF and vector store
const PDF_PATH = path.join(process.cwd(), 'public', 'docs', 'visa_ragchat.pdf');
const VECTOR_STORE_PATH = path.join(process.cwd(), 'public', 'docs', 'visa_ragchat_vectors.json');

// Helper: Split text into chunks (simple by N sentences, or N chars)
function chunkText(text, chunkSize = 1000) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

// Helper: Compute cosine similarity between two vectors
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Build the vector store from the PDF (run manually, not exported)
async function buildVectorStore() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const dataBuffer = fs.readFileSync(PDF_PATH);
  const pdfData = await pdfParse(dataBuffer);

  // Split by page, then chunk each page
  const pages = pdfData.text.split('\f');
  let allChunks = [];
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const pageText = pages[pageIndex].trim();
    if (!pageText) continue;
    const chunks = chunkText(pageText, 1000);
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      allChunks.push({
        pageNumber: pageIndex + 1,
        chunkIndex,
        text: chunks[chunkIndex]
      });
    }
  }

  // Embed all chunks
  const chunkTexts = allChunks.map(c => c.text);
  const embeddings = [];
  for (let i = 0; i < chunkTexts.length; i += 10) {
    // Batch up to 10 at a time (OpenAI API limit)
    const batch = chunkTexts.slice(i, i + 10);
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: batch
    });
    for (const emb of response.data) {
      embeddings.push(emb.embedding);
    }
  }

  // Save vector store
  const vectorStore = allChunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i]
  }));
  fs.writeFileSync(VECTOR_STORE_PATH, JSON.stringify(vectorStore, null, 2));
  console.log(`Vector store created at ${VECTOR_STORE_PATH} with ${vectorStore.length} chunks.`);
}

// Main export: retrieveRelevantChunks
/**
 * Retrieve the top N relevant chunks for a query.
 * @param {string} query - The user query.
 * @param {string} index - (ignored, for API compatibility)
 * @param {number} topN - Number of chunks to return.
 * @returns {Promise<Array<{pageNumber: number, chunkIndex: number, text: string}>>}
 */
async function retrieveRelevantChunks(query, index = "local", topN = 5) {
  if (!fs.existsSync(VECTOR_STORE_PATH)) {
    throw new Error('Vector store not found. Please run buildVectorStore() first.');
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const vectorStore = JSON.parse(fs.readFileSync(VECTOR_STORE_PATH, 'utf-8'));

  // Embed the query
  const embResponse = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: [query]
  });
  const queryEmbedding = embResponse.data[0].embedding;

  // Compute similarity for each chunk
  const scored = vectorStore.map(chunk => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));

  // Sort by score descending and return topN
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map(({ pageNumber, chunkIndex, text }) => ({
    pageNumber, chunkIndex, text
  }));
}

// Export only the retrieval function
module.exports = {
  retrieveRelevantChunks,
  buildVectorStore
};

/*
Instructions:
1. Set your OPENAI_API_KEY in the environment.
2. Run the following in a Node.js script or REPL to build the vector store:
   const { buildVectorStore } = require('./src/lib/api/visaRag.js');
   buildVectorStore();
3. The retrieveRelevantChunks function will then work for RAG chat.
*/
