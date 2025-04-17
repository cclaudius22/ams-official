// src/lib/api/visaRag.js
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

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

async function loadAndChunkPDF(pdfPath) {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfData = await pdfParse(pdfBuffer);

  // Create chunks from the entire text.
  const chunks = splitText(pdfData.text, 1000, 200);

  return chunks.map((text, idx) => ({
    pageNumber: 1, // For simplicity. Extend this if you want proper page numbers.
    text,
    chunkIndex: idx,
  }));
}

function initPineconeClient() {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });
  return pinecone;
}

async function buildOrLoadVectorStore(
  chunks,
  indexName = process.env.PINECONE_INDEX || "visa_rag_pdf"
) {
  const pinecone = initPineconeClient();
  const index = pinecone.index(indexName);

  try {
    const queryResponse = await index.query({
      vector: Array(1536).fill(0),
      topK: 1,
      includeMetadata: true,
    });
    if (queryResponse.matches && queryResponse.matches.length > 0) {
      console.log("Using existing vectors in Pinecone index");
      return index;
    }
  } catch (error) {
    console.log("Index might be empty or there was an error checking it");
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
      model: "text-embedding-ada-002",
      input: texts,
    });
    
    const vectors = batchChunks.map((chunk, idx) => ({
      id: `chunk_${chunk.chunkIndex}`,
      values: embeddingResponse.data[idx].embedding,
      metadata: {
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
      },
    }));
    
    await index.upsert(vectors);
    console.log(`Upserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(totalChunks / batchSize)}`);
  }

  return index;
}

async function retrieveRelevantChunks(
  query,
  index,
  topK = 5
) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const queryEmbeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: query,
  });
  const queryEmbedding = queryEmbeddingResponse.data[0].embedding;

  const queryResponse = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    includeValues: false,
  });

  const retrievedChunks = queryResponse.matches.map((match) => ({
    text: match.metadata.text,
    pageNumber: match.metadata.pageNumber,
    chunkIndex: match.metadata.chunkIndex,
    similarity: 1 - match.score,
  }));

  return retrievedChunks;
}

module.exports = {
  loadAndChunkPDF,
  buildOrLoadVectorStore,
  retrieveRelevantChunks
};