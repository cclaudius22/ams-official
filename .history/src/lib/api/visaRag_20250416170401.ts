// lib/api/visaRag.ts
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

// Types for chunk metadata and retrieval results
export interface PDFChunkMetadata {
  pageNumber: number;
  text: string;
  chunkIndex: number;
}

export interface RetrievedChunk {
  text: string;
  pageNumber: number;
  chunkIndex: number;
  similarity: number;
}

/**
 * Splits the provided text into chunks.
 * @param text The full text to split.
 * @param chunkSize The maximum size of each chunk.
 * @param chunkOverlap The number of characters that each chunk should overlap.
 * @returns An array of text chunks.
 */
function splitText(text: string, chunkSize = 1000, chunkOverlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - chunkOverlap;
  }
  return chunks;
}

/**
 * Loads a PDF from the provided path and returns an array of PDFChunkMetadata.
 * @param pdfPath Path to the PDF file.
 */
export async function loadAndChunkPDF(pdfPath: string): Promise<PDFChunkMetadata[]> {
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

/**
 * Initializes and returns a Pinecone client instance.
 */
function initPineconeClient() {
  // Note: Depending on your version of the Pinecone client, you might need
  // to use the property "environment" instead of "baseUrl".
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!,
  });
  return pinecone;
}

/**
 * Builds or loads the vector store by generating embeddings for the PDF chunks
 * and upserting them into the Pinecone index.
 * @param chunks Array of PDFChunkMetadata.
 * @param indexName Pinecone index name.
 */
export async function buildOrLoadVectorStore(
  chunks: PDFChunkMetadata[],
  indexName: string = process.env.PINECONE_INDEX || "visa_rag_pdf"
) {
  const pinecone = initPineconeClient();
  const index = pinecone.index(indexName);

  // Check if the index already has data.
  try {
    const queryResponse = await index.query({
      vector: Array(1536).fill(0), // Default embedding dimension for text-embedding-ada-002
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

  // Initialize OpenAI client for embeddings
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const batchSize = 100;
  const totalChunks = chunks.length;

  for (let i = 0; i < totalChunks; i += batchSize) {
    const batchChunks = chunks.slice(i, i + batchSize);
    const texts = batchChunks.map(chunk => chunk.text);
    
    // Get embeddings for this batch
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: texts,
    });
    
    // Prepare vectors for upsert
    const vectors = batchChunks.map((chunk, idx) => ({
      id: `chunk_${chunk.chunkIndex}`,
      values: embeddingResponse.data[idx].embedding,
      metadata: {
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
      },
    }));
    
    // Upsert batch into Pinecone
    await index.upsert(vectors);
    console.log(`Upserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(totalChunks / batchSize)}`);
  }

  return index;
}

/**
 * Retrieves the top matching chunks from the Pinecone vector store for a query.
 * @param query The query string.
 * @param index The Pinecone index.
 * @param topK The number of top results to return.
 */
export async function retrieveRelevantChunks(
  query: string,
  index: any,
  topK: number = 5
): Promise<RetrievedChunk[]> {
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

  const retrievedChunks: RetrievedChunk[] = queryResponse.matches.map((match: any) => ({
    text: match.metadata.text,
    pageNumber: match.metadata.pageNumber,
    chunkIndex: match.metadata.chunkIndex,
    similarity: 1 - match.score, // Adjust as needed depending on your scoring
  }));

  return retrievedChunks;
}
