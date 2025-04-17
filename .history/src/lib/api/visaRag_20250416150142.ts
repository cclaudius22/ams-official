import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "langchain/vectorstores/faiss";
import { Document } from "langchain/document";
import { OpenAI } from "openai";

const PDF_PATH = path.join(process.cwd(), "public/docs/visa_ragchat.pdf");
const VECTOR_STORE_PATH = path.join(process.cwd(), "tmp/faiss_visa_rag");

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
 * Build or load the Faiss vector store for the PDF.
 * The vector store is persisted to disk for reuse.
 */
export async function getOrCreateVectorStore(openAIApiKey: string): Promise<FaissStore> {
  if (fs.existsSync(VECTOR_STORE_PATH)) {
    return await FaissStore.load(
      VECTOR_STORE_PATH,
      new OpenAIEmbeddings({ openAIApiKey })
    );
  } else {
    const docs = await loadAndChunkPdf();
    const store = await FaissStore.fromDocuments(
      docs,
      new OpenAIEmbeddings({ openAIApiKey })
    );
    await store.save(VECTOR_STORE_PATH);
    return store;
  }
}

/**
 * Retrieve relevant chunks for a query using the Faiss vector store.
 */
export async function retrieveRelevantChunks(query: string, openAIApiKey: string, k = 4) {
  const vectorStore = await getOrCreateVectorStore(openAIApiKey);
  const results = await vectorStore.similaritySearch(query, k);
  return results;
}
