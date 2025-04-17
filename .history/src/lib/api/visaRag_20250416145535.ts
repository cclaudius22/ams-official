import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Chroma } from "langchain/vectorstores/chroma";
import { Document } from "langchain/document";
import { OpenAI } from "openai";

// Path to the PDF and persistent vector store directory
const PDF_PATH = path.join(process.cwd(), "public/docs/visa_ragchat.pdf");
const VECTOR_STORE_DIR = path.join(process.cwd(), "tmp/chroma_visa_rag");

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

// Build or load the Chroma vector store for the PDF
export async function getOrCreateVectorStore(openAIApiKey: string): Promise<Chroma> {
  // If the vector store directory exists, load it; otherwise, create it
  if (fs.existsSync(VECTOR_STORE_DIR)) {
    return await Chroma.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey }),
      { collectionName: "visa_rag", url: VECTOR_STORE_DIR }
    );
  } else {
    const docs = await loadAndChunkPdf();
    return await Chroma.fromDocuments(
      docs,
      new OpenAIEmbeddings({ openAIApiKey }),
      { collectionName: "visa_rag", url: VECTOR_STORE_DIR }
    );
  }
}

// Retrieve relevant chunks for a query
export async function retrieveRelevantChunks(query: string, openAIApiKey: string, k = 4) {
  const vectorStore = await getOrCreateVectorStore(openAIApiKey);
  const results = await vectorStore.similaritySearch(query, k);
  return results;
}
