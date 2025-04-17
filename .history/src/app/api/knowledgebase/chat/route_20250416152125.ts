import { NextResponse } from 'next/server';
import { ukVisaTypes } from '@/lib/mockvisas';
import OpenAI from 'openai';
import path from 'path';
import { loadAndChunkPDF, buildOrLoadVectorStore, retrieveRelevantChunks } from '@/lib/api/visaRag';

// PDF and vector store paths
const PDF_PATH = path.join(process.cwd(), 'public', 'docs', 'visa_ragchat.pdf');
const VECTOR_STORE_PATH = path.join(process.cwd(), 'vector_store');

// Static variable to cache the vector store
let vectorStorePromise: Promise<any> | null = null;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, visaType } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Find the visa type from our list if provided
    const visa = visaType ? ukVisaTypes.find(v => v.id === visaType) : null;

    // Build/load the vector store on first request
    if (!vectorStorePromise) {
      vectorStorePromise = (async () => {
        const chunks = await loadAndChunkPDF(PDF_PATH);
        return buildOrLoadVectorStore(chunks, VECTOR_STORE_PATH, true);
      })();
    }
    const vectorStore = await vectorStorePromise;

    // Retrieve relevant PDF chunks for the user query
    const relevantChunks = await retrieveRelevantChunks(message, vectorStore, 5);

    // Build PDF context string for the prompt
    const pdfContext = relevantChunks.map(
      (chunk, i) =>
        `Chunk ${i + 1} (Page ${chunk.pageNumber}):\n${chunk.text.trim()}`
    ).join('\n\n');

    // Create system message with context about the visa type and PDF context
    let systemMessage = "You are a helpful visa knowledge assistant that provides accurate information about UK visas. Use the following PDF context to answer the user's question. Only answer questions related to UK visas.";

    if (visa) {
      systemMessage += ` The user is specifically asking about the ${visa.name}. Provide detailed and accurate information about this visa type, including eligibility requirements, application process, fees, processing times, and any other relevant details.`;
    } else {
      systemMessage += " Provide general information about UK visas, and suggest that the user select a specific visa type for more detailed information.";
    }

    if (pdfContext) {
      systemMessage += `\n\nRelevant PDF context:\n${pdfContext}`;
    }

    // Create the conversation for OpenAI with proper types
    const messages = [
      { role: "system" as const, content: systemMessage },
      { role: "user" as const, content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract the response
    const response = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

    // Return the LLM response and citations for the PDF chunks
    return NextResponse.json({
      response,
      citations: relevantChunks.map(chunk => ({
        text: chunk.text.slice(0, 120) + (chunk.text.length > 120 ? "..." : ""),
        pageNumber: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
      })),
    });
  } catch (error) {
    console.error('Error in knowledgebase chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
