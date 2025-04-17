import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

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

// Helper function to split text into chunks by size and overlap
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

// Loads and chunks the PDF using pdf-parse and custom splitter
export async function loadAndChunkPDF(pdfPath: string): Promise<PDFChunkMetadata[]> {
  const pdfBuffer = fs.readFileSync(pdfPath);
  const pdfData = await pdfParse(pdfBuffer);

  const chunks = splitText(pdfData.text, 1000, 200);

  return chunks.map((text, idx) => ({
    pageNumber: 1, // TODO: improve page number extraction if needed
    text,
    chunkIndex: idx,
  }));
}

// Initialize Pinecone client
function initPineconeClient() {
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
    environment: process.env.PINECONE_ENVIRONMENT!,
  });
  
  return pinecone;
}

// Builds or loads the vector store (Pinecone) 
export async function buildOrLoadVectorStore(
  chunks: PDFChunkMetadata[],
  indexName: string = process.env.PINECONE_INDEX || "visa_rag_pdf"
) {
  const pinecone = initPineconeClient();
  const index = pinecone.index(indexName);
  
  // Check if index is empty - we'll query for a single vector
  // This is a simple check, but not foolproof for production
  try {
    const queryResponse = await index.query({
      vector: Array(1536).fill(0), // Default embedding dimension for text-embedding-3-large
      topK: 1,
      includeMetadata: true,
    });
    
    // If index already has data, return it
    if (queryResponse.matches.length > 0) {
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

  // Generate embeddings and upsert vectors in batches
  const batchSize = 100; // Adjust based on your needs
  const totalChunks = chunks.length;
  
  for (let i = 0; i < totalChunks; i += batchSize) {
    const batchChunks = chunks.slice(i, i + batchSize);
    const texts = batchChunks.map(chunk => chunk.text);
    
    // Get embeddings for this batch
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-large",
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
    
    // Upsert to Pinecone
    await index.upsert(vectors);
    console.log(`Upserted batch ${i/batchSize + 1} of ${Math.ceil(totalChunks/batchSize)}`);
  }

  return index;
}

// Retrieves relevant chunks for a query using the vector store
export async function retrieveRelevantChunks(
  query: string,
  index: any,
  topK: number = 5
): Promise<RetrievedChunk[]> {
  // Initialize OpenAI client for query embedding
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const queryEmbeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query,
  });
  const queryEmbedding = queryEmbeddingResponse.data[0].embedding;

  // Query the vector store
  const queryResponse = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    includeValues: false,
  });

  // Format results
  const retrievedChunks: RetrievedChunk[] = queryResponse.matches.map(match => ({
    text: match.metadata.text,
    pageNumber: match.metadata.pageNumber,
    chunkIndex: match.metadata.chunkIndex,
    similarity: 1 - match.score, // Convert score to similarity
  }));

  return retrievedChunks;
}