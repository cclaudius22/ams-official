import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { OpenAI } from "openai";
import { ChromaClient } from "chromadb";

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

// Builds or loads the vector store (Chroma) from disk
export async function buildOrLoadVectorStore(
  chunks: PDFChunkMetadata[],
  collectionName: string = "visa_rag_pdf"
) {
  const client = new ChromaClient();
  let collection;
  try {
    collection = await client.getCollection({ name: collectionName, embeddingFunction: undefined });
  } catch {
    collection = await client.createCollection({ name: collectionName, embeddingFunction: undefined });
  }

  // Check if collection already has data
  const count = await collection.count();
  if (count > 0) {
    return collection;
  }

  // Initialize OpenAI client for embeddings
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Generate embeddings for each chunk
  const embeddings = [];
  for (const chunk of chunks) {
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: chunk.text,
    });
    embeddings.push(embeddingResponse.data[0].embedding);
  }

  // Add documents and embeddings to collection
  await collection.add({
    embeddings,
    documents: chunks.map(c => c.text),
    metadatas: chunks.map(c => ({ pageNumber: c.pageNumber, chunkIndex: c.chunkIndex })),
    ids: chunks.map((_, i) => i.toString()),
  });

  return collection;
}

// Retrieves relevant chunks for a query using the vector store
export async function retrieveRelevantChunks(
  query: string,
  collection: any,
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
  const results = await collection.query({
    queryEmbeddings: [queryEmbedding],
    nResults: topK,
    include: ["documents", "metadatas", "distances"],
  });

  const retrievedChunks: RetrievedChunk[] = [];
  for (let i = 0; i < results.documents[0].length; i++) {
    retrievedChunks.push({
      text: results.documents[0][i],
      pageNumber: results.metadatas[0][i].pageNumber,
      chunkIndex: results.metadatas[0][i].chunkIndex,
      similarity: results.distances[0][i],
    });
  }

  return retrievedChunks;
}
