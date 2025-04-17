// /api/knowledgebase/chat/route.ts (TypeScript)
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// ---> Use require for the CommonJS module <---
const { retrieveRelevantChunks } = require('@/lib/api/visaRag'); // Adjust path if needed

// ---> Import visa data source (assuming TS works here or you have a JS version) <---
import { ukVisaTypes, VisaType } from '@/lib/mockvisas'; // Adjust path if needed

// Define type for chunks returned by the potentially modified RAG function
interface RagChunk {
  pageNumber: number;
  chunkIndex: number;
  text: string;
  visaTypeId: string | null; // Expecting visaTypeId in the result
  score?: number; // Optional score
  sourceUrl?: string; // Add other potential fields
}


export async function POST(req: NextRequest) {
  try {
    const { message, visaType: visaTypeId } = await req.json(); // Get visaTypeId

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not set' }, { status: 500 });
    }

    // Find the selected visa name for the prompt
    const selectedVisa = visaTypeId
      ? ukVisaTypes.find((visa: VisaType) => visa.id === visaTypeId)
      : null;
    const visaName = selectedVisa ? selectedVisa.name : null;

    let relevantChunks: RagChunk[] = []; // Use defined interface
    try {
      // ---> Pass visaTypeId to the retrieveRelevantChunks function <---
      console.log(`[API Route] Calling retrieveRelevantChunks. Query: "${message}", Filter ID: ${visaTypeId || 'None'}`);
      relevantChunks = await retrieveRelevantChunks(
          message,
          "local", // index name (ignored by your current function)
          5,       // topN
          visaTypeId // Pass the ID for filtering
      );
      console.log(`[API Route] Retrieved ${relevantChunks.length} chunks.`);

    } catch (error: any) {
      console.error("[API Route] Error retrieving relevant chunks:", error);
      // Proceed without context, but maybe log or return a specific message?
      relevantChunks = []; // Ensure it's an empty array on error
       // Optionally return an error if RAG is essential
      // return NextResponse.json({ error: `Failed to retrieve context: ${error.message}` }, { status: 500 });
    }

    // Build context string *only* from retrieved chunks
    const context = relevantChunks.length > 0
      ? relevantChunks
        .map(chunk => `Source (Page ${chunk.pageNumber}, Chunk ${chunk.chunkIndex}): ${chunk.text}`)
        .join('\n\n')
      : "No specific context documents were found matching the query and selected visa type."; // More informative fallback

    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

    // Build contextual prompt
    const systemInstruction = `You are a helpful assistant specializing in UK Visas. Answer the user's question based ONLY on the provided context documents below. If the context is empty or irrelevant, state that you cannot answer from the provided documents.`;

    const userQueryPrefix = visaName
        ? `The user is asking specifically about the "${visaName}". `
        : `The user is asking a general question about UK visas. `;

     const prompt = `
${userQueryPrefix}

Use ONLY the following context documents to answer the question:
--- START CONTEXT ---
${context}
--- END CONTEXT ---

If the context does not contain the answer, state that the information is not available in the provided documents. Do not use external knowledge.

User Question: ${message}
`;
    // Simplified prompt focusing strictly on context for RAG
    // Alternative Prompt (Allowing some general knowledge IF context insufficient):
    /*
    const prompt = `
    You are a helpful assistant specializing in UK Visas.
    ${userQueryPrefix}
    First, try to answer the question using ONLY the following context documents:
    --- START CONTEXT ---
    ${context}
    --- END CONTEXT ---
    If the context provides a relevant answer, use it.
    If the context is empty, insufficient, or irrelevant to the question about ${visaName || 'UK visas'}, use your general knowledge about ${visaName || 'UK visas'} to answer, but clearly state that the answer is based on general knowledge because the documents didn't contain the specific information.
    Always prioritize information from the context if it's relevant and sufficient.

    User Question: ${message}
    `;
    */

    console.log("[API Route] Sending prompt to OpenAI...");
    // console.log("Context Snippet:", context.substring(0, 200)); // Log snippet for debugging

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or 'gpt-4-turbo-preview'
       messages: [
          // Let's use a simpler user message approach for this prompt structure
          { role: 'user', content: prompt }
       ],
      temperature: 0.1, // Very low temperature for sticking to context
      max_tokens: 800,
    });

    const answer = completion.choices[0].message.content?.trim() || 'Sorry, I could not generate a response.';

    // Build citations from the *actually used* relevant chunks
    const citations = relevantChunks.map(chunk => ({
        text: `Source: Page ${chunk.pageNumber}`, // Simpler citation text
        link: '#' // No specific URL available from PDF chunks usually
        // link: chunk.sourceUrl || '#' // If you add sourceUrl metadata later
    }));

    return NextResponse.json({
      response: answer,
      citations: citations,
    });

  } catch (err: any) {
    console.error('[API Route] Error processing request:', err);
    const errorMessage = err.message || 'An internal server error occurred.';
    return NextResponse.json({ error: `Failed to process chat request: ${errorMessage}` }, { status: 500 });
  }
}