// src/lib/api/visaRag.js
const fs = require('fs');
const path = require('path');
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


async function initPineconeClient() {
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    return pinecone;
  } catch (error) {
    console.error("Error initializing Pinecone client:", error);
    throw error; // Re-throw the error to stop further execution
  }
}

async function buildOrLoadVectorStore(
  chunks,
  indexName = process.env.PINECONE_INDEX || "visarag"
) {
  const pinecone = await initPineconeClient();
  const index = pinecone.index(indexName);

  try {
    const queryResponse = await index.query({
      vector: Array(2048).fill(0), // Assuming your index is 2048 dimension
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
      model: "text-embedding-3-large",
      input: texts,
      dimensions: 2048, // Ensure this matches your Pinecone index
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
    model: "text-embedding-3-large",
    input: query,
    dimensions: 2048, // Ensure this matches your Pinecone index
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
  buildOrLoadVectorStore,
  retrieveRelevantChunks
};
