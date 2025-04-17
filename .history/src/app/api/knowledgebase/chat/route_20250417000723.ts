// /api/knowledgebase/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
// Removed OpenAI import: import { OpenAI } from 'openai';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'; // <-- Import Google AI SDK

// ---> Use require for the CommonJS module <---
const { retrieveRelevantChunks } = require('@/lib/api/visaRag'); // Adjust path if needed

// ---> Import visa data source <---
import { ukVisaTypes, VisaType } from '@/lib/mockvisas'; 

// Define type for chunks returned by the RAG function (remains the same)
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

    // --- Get Google API Key ---
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (!GOOGLE_API_KEY) {
      console.error("[API Route] Error: GOOGLE_API_KEY environment variable not set.");
      return NextResponse.json({ error: 'Google API key not set' }, { status: 500 });
    }

    // --- RAG Steps (1-4 remain the same) ---

    // 1. Determine Visa Context
    const selectedVisa = visaTypeId ? ukVisaTypes.find(v => v.id === visaTypeId) : null;
    const visaName = selectedVisa ? selectedVisa.name : null;
    console.log(`[API Route] Determined context: ${visaName ? `Visa Type: ${visaName} (ID: ${visaTypeId})` : 'General Query'}`);

    // 2. Prepare RAG Search Query
    let searchQuery = message;
    if (visaName) {
      searchQuery = `Information about the ${visaName}: ${message}`;
    }
    console.log(`[API Route] Using search query for RAG: "${searchQuery}"`);

    // 3. Retrieve Relevant Chunks (Semantic Search Only)
    let relevantChunks: RagChunk[] = [];
    const RAG_TOP_N = 5;
    try {
      console.log(`[API Route] Calling retrieveRelevantChunks. Query: "${searchQuery}", Filter ID: null (searching all), TopN: ${RAG_TOP_N}`);
      relevantChunks = await retrieveRelevantChunks(searchQuery, "local", RAG_TOP_N, null);
      console.log(`[API Route] RAG retrieved ${relevantChunks.length} chunks based on semantic similarity.`);
      if (relevantChunks.length > 0) console.log(`[API Route] Top RAG chunk score: ${relevantChunks[0].score?.toFixed(4)}`);
    } catch (error: any) { /* ... error handling ... */ relevantChunks = []; }

    // 4. Build Context String for LLM
    const context = relevantChunks.length > 0
      ? relevantChunks.map((chunk, index) => `Source [${index + 1}] (Page ${chunk.pageNumber}):\n${chunk.text}`).join('\n\n---\n\n')
      : "No specific documents matching the query were found in the knowledge base.";

    // --- 5. Prepare Prompt for Google Gemini ---
    // Gemini works well with a single structured prompt string.
    const userFocus = visaName ? `The user is specifically asking about the "${visaName}".` : `The user is asking a general question about UK visas.`;

    const promptString = `You are a highly knowledgeable and helpful UK Visa assistant. Your goal is to provide comprehensive, accurate, and user-friendly information.

Instructions:
1.  **Prioritize Context:** First, carefully review the provided context documents below ("--- START CONTEXT ---" to "--- END CONTEXT ---"). If they directly and sufficiently answer the user's question, base your response primarily on them.
2.  **Use General Knowledge:** If the context is insufficient, irrelevant to the specific question, or the context section indicates no documents were found, use your extensive general knowledge about UK visas to answer the question thoroughly. Clearly state when you are using general knowledge because the provided documents didn't contain the specific answer.
3.  **Be Comprehensive:** Provide detailed explanations.
4.  **Include Clickable Links:** If discussing the general online application process, include the main UK government visa portal: [Apply for a UK visa](https://www.gov.uk/apply-to-come-to-the-uk). For other specific details, include official gov.uk links using Markdown format ([Link Text](URL)) only if you are confident they are accurate. Do not guess URLs.
5.  **Address User Focus:** Keep in mind the user's focus (${userFocus}).
6.  **Format Clearly:** Use Markdown for formatting like bold text (\`**bold**\`), headings (\`### Heading\`), paragraphs, bullet points, or numbered lists.

--- START CONTEXT ---
${context}
--- END CONTEXT ---

User Question: ${message}`;

    // --- 6. Call Google Gemini API ---
    let answer = 'Sorry, I could not generate a response at this time.'; // Default answer
    try {
        console.log("[API Route] Initializing Google Generative AI Client...");
        const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
        // Choose a model - 'gemini-1.5-flash-latest' is fast and capable for free tier
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-latest" });

        console.log("[API Route] Sending request to Google Gemini API (model: gemini-1.5-flash-latest)...");

        const generationConfig = {
            temperature: 0.5, // Adjust creativity (0.0 - 1.0)
            topK: 1,
            topP: 1,
            maxOutputTokens: 700, // Max length of the response
        };

        // Safety settings - adjust as needed, BLOCK_MEDIUM_AND_ABOVE is a reasonable default
        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: promptString }] }], // Pass the combined prompt as user input
            generationConfig,
            safetySettings,
        });

        if (result.response) {
            const responseText = result.response.text();
            if (responseText) {
                answer = responseText.trim();
                 console.log("[API Route] Received response from Google Gemini API.");
            } else {
                // Handle cases where the response might be blocked or empty
                const blockReason = result.response.promptFeedback?.blockReason;
                console.warn(`[API Route] Google Gemini API returned an empty response. Block Reason: ${blockReason || 'Unknown'}`);
                answer = `Sorry, I couldn't generate a response. ${blockReason ? `Reason: ${blockReason}` : 'Please try rephrasing your question.'}`;
            }
        } else {
             console.error("[API Route] Google Gemini API did not return a valid response structure.");
             // You might want to inspect the 'result' object here for more details
             answer = "Sorry, there was an issue communicating with the AI service.";
        }

    } catch(error: any) {
        console.error("[API Route] Error calling Google Gemini API:", error);
        // Provide a generic error message to the client
        answer = `Sorry, an error occurred while processing your request with the AI service. ${error.message || ''}`;
         // Optionally, you could return a 500 error here instead of just changing the answer text
        // return NextResponse.json({ error: `Failed to process chat request via Gemini: ${error.message}` }, { status: 500 });
    }


    // --- 7. Prepare Citations (Code not needed as citations are removed) ---
    // const citations = ... (Removed)


    // --- 8. Return Response (WITHOUT CITATIONS) ---
    console.log("[API Route] Sending final response to client.");
    return NextResponse.json({
      response: answer,
      // citations: undefined // Explicitly not sending citations
    });

  } catch (err: any) {
    // Catch errors from RAG or other parts before the Gemini call
    console.error('[API Route] Unhandled Error in POST handler:', err);
    const errorMessage = err.message || 'An internal server error occurred.';
    const clientErrorMessage = process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred while processing your request.'
      : `Failed to process chat request: ${errorMessage}`;
    return NextResponse.json({ error: clientErrorMessage }, { status: 500 });
  }
}