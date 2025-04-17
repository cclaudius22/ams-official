// src/lib/api/visaRag.js
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

const VECTOR_STORE_PATH = path.join(__dirname, 'vector_store.json');
let vectorStore = []; // In-memory array of { embedding, metadata }

function splitText(text, chunkSize = 1000, chunkOverlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - chunkOverlap;
  }
  return chunks;
}

function cosineSimilarity(a, b) {
  let dot = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function saveVectorStore() {
  fs.writeFileSync(VECTOR_STORE_PATH, JSON.stringify(vectorStore, null, 2), 'utf-8');
}

function loadVectorStore() {
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    vectorStore = JSON.parse(fs.readFileSync(VECTOR_STORE_PATH, 'utf-8'));
  }
}

async function buildOrLoadVectorStore(
  chunks,
  indexName = "local"
) {
  // Try to load from disk first
  loadVectorStore();
  if (vectorStore.length > 0) {
    console.log("Loaded vector store from disk");
    return;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const batchSize = 100;
  const totalChunks = chunks.length;

  for (let i = 0; i < totalChunks; i += batchSize) {
    const batchChunks = chunks.slice(i, i + batchSize);
    const texts = batchChunks.map(chunk => chunk.text);

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: texts,
      dimensions: 2048,
    });

    for (let idx = 0; idx < batchChunks.length; idx++) {
      vectorStore.push({
        embedding: embeddingResponse.data[idx].embedding,
        metadata: {
          pageNumber: batchChunks[idx].pageNumber,
          chunkIndex: batchChunks[idx].chunkIndex,
          text: batchChunks[idx].text,
        },
      });
    }
    console.log(`Embedded batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(totalChunks / batchSize)}`);
  }

  saveVectorStore();
  console.log("Vector store built and saved to disk");
}

async function retrieveRelevantChunks(
  query,
  index = "local",
  topK = 5
) {
  loadVectorStore();
  if (vectorStore.length === 0) {
    throw new Error("Vector store is empty. Please build it first.");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const queryEmbeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query,
    dimensions: 2048,
  });
  const queryEmbedding = queryEmbeddingResponse.data[0].embedding;

  // Compute cosine similarity for all vectors
  const similarities = vectorStore.map((item, idx) => ({
    idx,
    similarity: cosineSimilarity(queryEmbedding, item.embedding),
  }));

  // Sort by similarity descending
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Return topK matches
  const retrievedChunks = similarities.slice(0, topK).map(({ idx, similarity }) => ({
    text: vectorStore[idx].metadata.text,
    pageNumber: vectorStore[idx].metadata.pageNumber,
    chunkIndex: vectorStore[idx].metadata.chunkIndex,
    similarity,
  }));

  return retrievedChunks;
}

module.exports = {
  buildOrLoadVectorStore,
  retrieveRelevantChunks,
  splitText,
  saveVectorStore,
  loadVectorStore,
};
