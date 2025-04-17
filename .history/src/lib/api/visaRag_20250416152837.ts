// src/lib/api/visaRag.ts

import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { OpenAIEmbeddings, RecursiveCharacterTextSplitter, Chroma, HNSWLib } from "langchain";
import type { Document, VectorStore } from "langchain";

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

// Loads and chunks the PDF using pdf-parse and langchain text splitter
export async function loadAndChunkPDF(
  pdfPath: string
): Promise<PDFChunkMetadata[]> {
  // Read PDF file buffer
  const pdfBuffer = fs.readFileSync(pdfPath);
  // Parse PDF to extract text
  const pdfData = await pdfParse(pdfBuffer);

  // Use langchain's text splitter to chunk the text
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  // Split the text into chunks
  const chunks = await splitter.splitText(pdfData.text);

  // Map chunks to PDFChunkMetadata (pageNumber = 1 for all, as pdf-parse does not provide per-chunk page info)
  // TODO: Enhance to map chunks to actual page numbers if needed
  return chunks.map((text, idx) => ({
    pageNumber: 1,
    text,
    chunkIndex: idx,
  }));
}

// Builds or loads the vector store (Chroma or HNSWLib) from disk
export async function buildOrLoadVectorStore(
  chunks: PDFChunkMetadata[],
  storePath: string,
  useChroma: boolean = true
): Promise<VectorStore> {
  // Convert PDFChunkMetadata[] to langchain Document[]
  const documents: Document[] = chunks.map((chunk) => ({
    pageContent: chunk.text,
    metadata: {
      pageNumber: chunk.pageNumber,
      chunkIndex: chunk.chunkIndex,
    },
  }));

  // Use OpenAI embeddings
  const embeddings = new OpenAIEmbeddings();

  if (useChroma) {
    // Chroma: persist to disk
    if (fs.existsSync(storePath)) {
      // Load existing Chroma vector store
      return await Chroma.load(storePath, embeddings);
    } else {
      // Create new Chroma vector store and persist
      const chromaStore = await Chroma.fromDocuments(documents, embeddings, {
        collectionName: "visa_rag_pdf",
        url: undefined,
        collectionMetadata: {},
        persistDirectory: storePath,
      });
      await chromaStore.persist();
      return chromaStore;
    }
  } else {
    // HNSWLib: persist to disk
    if (fs.existsSync(storePath)) {
      return await HNSWLib.load(storePath, embeddings);
    } else {
      const hnswStore = await HNSWLib.fromDocuments(documents, embeddings, {
        persistDirectory: storePath,
      });
      await hnswStore.save();
      return hnswStore;
    }
  }
}

// Retrieves relevant chunks for a query using the vector store
export async function retrieveRelevantChunks(
  query: string,
  vectorStore: VectorStore,
  topK: number = 5
): Promise<RetrievedChunk[]> {
  // Use similarity search with score to get topK relevant chunks
  // @ts-ignore: similaritySearchWithScore is available on Chroma/HNSWLib
  const results: [Document, number][] = await vectorStore.similaritySearchWithScore(query, topK);

  return results.map(([doc, score]) => ({
    text: doc.pageContent,
    pageNumber: doc.metadata?.pageNumber ?? 1,
    chunkIndex: doc.metadata?.chunkIndex ?? -1,
    similarity: score,
  }));
}
