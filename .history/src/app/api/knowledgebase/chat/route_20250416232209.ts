// /api/knowledgebase/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const { retrieveRelevantChunks } = require('@/lib/api/visaRag'); // Adjust path
import { ukVisaTypes, VisaType } from '@/lib/mockvisas'; // Adjust path

interface RagChunk {
  pageNumber: number;
  chunkIndex: number;
  text: string;
  visaTypeId: string | null;
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
    if (!OPENAI_API_KEY) { /* ... error handling ... */ }

    // --- 1. Determine Visa Context ---
    const selectedVisa = visaTypeId ? ukVisaTypes.find(v => v.id === visaTypeId) : null;
    const visaName = selectedVisa ? selectedVisa.name : null;
    console.log(`[API Route] Determined context: ${visaName ? `Visa Type: ${visaName} (ID: ${visaTypeId})` : 'General Query'}`);

    // --- 2. Prepare RAG Search Query ---
    let searchQuery = message;
    if (visaName) {
      searchQuery = `Information about the ${visaName}: ${message}`;
    }
    console.log(`[API Route] Using search query for RAG: "${searchQuery}"`);


    // --- 3. Retrieve Relevant Chunks (Semantic Search Only) ---
    let relevantChunks: RagChunk[] = [];
    const RAG_TOP_N = 5;
    try {
      console.log(`[API Route] Calling retrieveRelevantChunks. Query: "${searchQuery}", Filter ID: null (searching all), TopN: ${RAG_TOP_N}`);
      relevantChunks = await retrieveRelevantChunks(searchQuery, "local", RAG_TOP_N, null);
      console.log(`[API Route] RAG retrieved ${relevantChunks.length} chunks based on semantic similarity.`);
      if (relevantChunks.length > 0) console.log(`[API Route] Top RAG chunk score: ${relevantChunks[0].score?.toFixed(4)}`);
    } catch (error: any) { /* ... error handling ... */ relevantChunks = []; }

    // --- 4. Build Context String for LLM ---
    const context = relevantChunks.length > 0
      ? relevantChunks.map((chunk, index) => `Source [${index + 1}] (Page ${chunk.pageNumber}):\n${chunk.text}`).join('\n\n---\n\n')
      : "No specific documents matching the query were found in the knowledge base.";

    // --- 5. Prepare Prompt for OpenAI ---
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const userFocus = visaName ? `The user is specifically asking about the "${visaName}".` : `The user is asking a general question about UK visas.`;

    const systemPrompt = `You are a highly knowledgeable and helpful UK Visa assistant. Your goal is to provide comprehensive, accurate, and user-friendly information.

Instructions:
1.  **Prioritize Context:** First, carefully review the provided context documents below ("--- START CONTEXT ---" to "--- END CONTEXT ---"). If they directly and sufficiently answer the user's question, base your response primarily on them. Cite the sources used (e.g., "According to Source [1]...").
2.  **Use General Knowledge:** If the context is insufficient, irrelevant to the specific question, or the context section indicates no documents were found, use your extensive general knowledge about UK visas to answer the question thoroughly. Clearly state when you are using general knowledge because the provided documents didn't contain the specific answer (e.g., "The provided documents don't detail X, but based on general knowledge...").
3.  **Be Comprehensive:** Provide detailed explanations. Address different aspects of the question if appropriate.
4.  **Include Clickable Links:** If you can confidently identify relevant, official **gov.uk** pages (like specific guidance sections, application portals, or eligibility checkers), please include them using Markdown format: [Link Text](URL). **If you are unsure or cannot find a specific, verifiable official link, do not include one or state that you couldn't find a specific link.** Do not guess URLs.
5.  **Address User Focus:** Keep in mind the user's focus (${userFocus}).
6.  **Format Clearly:** Use paragraphs, bullet points, or numbered lists for readability.

--- START CONTEXT ---
${context}
--- END CONTEXT ---

User Question: ${message}`;

    console.log("[API Route] Sending request to OpenAI Chat Completion API...");

    // --- 6. Call OpenAI ---
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // <--- Using faster model
       messages: [
          { role: 'system', content: systemPrompt }
       ],
      temperature: 0.4,
      max_tokens: 700, // <--- Reduced max_tokens slightly
      // stream: false, // Set to true if implementing streaming
    });

    const answer = completion.choices[0].message.content?.trim() || 'Sorry, I could not generate a response at this time.';
    console.log("[API Route] Received response from OpenAI.");

    // --- 7. Prepare Citations (from RAG results) ---
    const citations = relevantChunks.map((chunk, index) => ({
        text: `Source [${index + 1}]: Page ${chunk.pageNumber}`,
        link: '#'
    }));

    // --- 8. Return Response ---
    console.log("[API Route] Sending final response to client.");
    return NextResponse.json({
      response: answer,
      citations: citations,
    });

  } catch (err: any) { /* ... error handling ... */ }
}