import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "langchain/document";
import { OpenAI } from "openai";

const PDF_PATH = path.join(process.cwd(), "public/docs/visa_ragchat.pdf");

// Load and chunk the PDF, returning an array of Document objects
export async function loadAndChunkPdf(): Promise<Document[]> {
  const dataBuffer = fs.readFileSync(PDF_PATH);
  const pdfData = await pdfParse(dataBuffer);

  // Split text into chunks (e.g., 1000 characters, with 200 overlap)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.createDocuments([pdfData.text]);
  // Optionally, add metadata (e.g., page numbers) here if needed
  return chunks;
}

/**
/**
 * Build the in-memory vector store for the PDF.
 * This is NOT persistent and is for demo/testing only.
 */
export async function getOrCreateVectorStore(openAIApiKey: string): Promise<MemoryVectorStore> {
  const docs = await loadAndChunkPdf();
  const store = await MemoryVectorStore.fromDocuments(
    docs,
    new OpenAIEmbeddings({ openAIApiKey })
  );
  return store;
}

/**
 * Retrieve relevant chunks for a query using the in-memory vector store.
 */
export async function retrieveRelevantChunks(query: string, openAIApiKey: string, k = 4) {
  const vectorStore = await getOrCreateVectorStore(openAIApiKey);
  const results = await vectorStore.similaritySearch(query, k);
  return results;
}
