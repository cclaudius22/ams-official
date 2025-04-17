// /api/knowledgebase/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// ---> Use require for the CommonJS module <---
const { retrieveRelevantChunks } = require('@/lib/api/visaRag'); // Adjust path if needed

// ---> Import visa data source <---
import { ukVisaTypes, VisaType } from '@/lib/mockvisas'; // Adjust path if needed

// Define type for chunks returned by the RAG function
// Ensure this matches the structure returned by retrieveRelevantChunks
interface RagChunk {
  pageNumber: number;
  chunkIndex: number;
  text: string;
  visaTypeId: string | null; // Keep this, might be useful for logging even if mostly null
  score?: number;
}

export async function POST(req: NextRequest) {
  console.log("[API Route] Received POST request to /api/knowledgebase/chat");

  try {
    const { message, visaType: visaTypeId } = await req.json();
    console.log(`[API Route] Parsed request body: message="${message}", visaTypeId="${visaTypeId}"`);

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.error("[API Route] Error: No message provided or message is empty.");
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      console.error("[API Route] Error: OPENAI_API_KEY environment variable not set.");
      return NextResponse.json({ error: 'OpenAI API key not set' }, { status: 500 });
    }

    // --- 1. Determine Visa Context ---
    const selectedVisa = visaTypeId
      ? ukVisaTypes.find((visa: VisaType) => visa.id === visaTypeId)
      : null;
    const visaName = selectedVisa ? selectedVisa.name : null;
    console.log(`[API Route] Determined context: ${visaName ? `Visa Type: ${visaName} (ID: ${visaTypeId})` : 'General Query'}`);

    // --- 2. Prepare RAG Search Query ---
    let searchQuery = message;
    // If a specific visa is selected, prepend its name to the query for better semantic search focus
    if (visaName) {
      searchQuery = `Information about the ${visaName}: ${message}`;
      console.log(`[API Route] Modified search query for RAG: "${searchQuery}"`);
    } else {
      console.log(`[API Route] Using original message as search query for RAG: "${searchQuery}"`);
    }

    // --- 3. Retrieve Relevant Chunks (Semantic Search Only) ---
    let relevantChunks: RagChunk[] = [];
    const RAG_TOP_N = 5; // How many chunks to retrieve
    try {
      console.log(`[API Route] Calling retrieveRelevantChunks. Query: "${searchQuery}", Filter ID: null (searching all), TopN: ${RAG_TOP_N}`);
      // Pass null for visaTypeId to disable metadata filtering and rely on semantic search
      relevantChunks = await retrieveRelevantChunks(
          searchQuery,
          "local", // This argument seems unused in your RAG function but kept for consistency
          RAG_TOP_N,
          null // IMPORTANT: Disable filtering by ID, rely on semantic search of the modified query
      );
      console.log(`[API Route] RAG retrieved ${relevantChunks.length} chunks based on semantic similarity.`);
      if (relevantChunks.length > 0) {
          console.log(`[API Route] Top RAG chunk score: ${relevantChunks[0].score?.toFixed(4)}`);
      }

    } catch (error: any) {
      console.error("[API Route] Error calling retrieveRelevantChunks:", error);
      // Proceed without context, LLM will rely on general knowledge
      relevantChunks = [];
    }

    // --- 4. Build Context String for LLM ---
    const context = relevantChunks.length > 0
      ? relevantChunks
        .map((chunk, index) => `Source [${index + 1}] (Page ${chunk.pageNumber}):\n${chunk.text}`)
        .join('\n\n---\n\n') // Separator between chunks
      : "No specific documents matching the query were found in the knowledge base."; // Informative fallback

    // Log context snippet for debugging
    // console.log("[API Route] Context Snippet for LLM:", context.substring(0, 400) + (context.length > 400 ? "..." : ""));

    // --- 5. Prepare Prompt for OpenAI ---
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    const userFocus = visaName
        ? `The user is specifically asking about the "${visaName}".`
        : `The user is asking a general question about UK visas.`;

    // *** Enhanced Prompt ***
    const systemPrompt = `You are a highly knowledgeable and helpful UK Visa assistant. Your goal is to provide comprehensive, accurate, and user-friendly information.

Instructions:
1.  **Prioritize Context:** First, carefully review the provided context documents below ("--- START CONTEXT ---" to "--- END CONTEXT ---"). If they directly and sufficiently answer the user's question, base your response primarily on them. Cite the sources used (e.g., "According to Source [1]...").
2.  **Use General Knowledge:** If the context is insufficient, irrelevant to the specific question, or the context section indicates no documents were found, use your extensive general knowledge about UK visas to answer the question thoroughly. Clearly state when you are using general knowledge because the provided documents didn't contain the specific answer (e.g., "The provided documents don't detail X, but based on general knowledge...").
3.  **Be Comprehensive:** Provide detailed explanations. Address different aspects of the question if appropriate.
4.  **Include Clickable Links:** Whenever relevant, include official and helpful external links using Markdown format: [Link Text](URL). Prioritize links to the official UK government website (gov.uk). Examples: eligibility criteria, application forms, official guidance PDFs, relevant Home Office pages.
5.  **Address User Focus:** Keep in mind the user's focus (${userFocus}).
6.  **Format Clearly:** Use paragraphs, bullet points, or numbered lists for readability.

--- START CONTEXT ---
${context}
--- END CONTEXT ---

User Question: ${message}`;

    console.log("[API Route] Sending request to OpenAI Chat Completion API...");

    // --- 6. Call OpenAI ---
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // Or 'gpt-3.5-turbo' - GPT-4 is better at following complex instructions and finding links
       messages: [
          // Using a single system prompt containing all instructions, context, and the user query
          { role: 'system', content: systemPrompt }
       ],
      temperature: 0.4, // Slightly increased for more comprehensive answers and link generation, but still fact-focused
      max_tokens: 1000, // Adjust as needed
    });

    const answer = completion.choices[0].message.content?.trim() || 'Sorry, I could not generate a response at this time.';
    console.log("[API Route] Received response from OpenAI.");
    // Optional: Log token usage
    // console.log("[API Route] OpenAI Token Usage:", completion.usage);


    // --- 7. Prepare Citations (from RAG results) ---
    // These citations refer to the chunks retrieved by RAG, which the LLM was asked to prioritize
    const citations = relevantChunks.map((chunk, index) => ({
        text: `Source [${index + 1}]: Page ${chunk.pageNumber}`, // Reference the source number used in the prompt
        link: '#' // No specific deep link available from PDF chunks
        // You could potentially add the chunk text itself here if needed frontend:
        // context: chunk.text.substring(0, 100) + "..."
    }));

    // --- 8. Return Response ---
    console.log("[API Route] Sending final response to client.");
    return NextResponse.json({
      response: answer,
      citations: citations,
    });

  } catch (err: any) {
    console.error('[API Route] Unhandled Error:', err);
    const errorMessage = err.message || 'An internal server error occurred.';
    // Avoid exposing sensitive error details to the client in production
    const clientErrorMessage = process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred while processing your request.'
      : `Failed to process chat request: ${errorMessage}`;
    return NextResponse.json({ error: clientErrorMessage }, { status: 500 });
  }
}