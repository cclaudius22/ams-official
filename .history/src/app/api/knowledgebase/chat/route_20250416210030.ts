import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { retrieveRelevantChunks } from '@/lib/api/visaRag'; // Assuming your visaRag.js now uses the local vector store

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not set in environment' }, { status: 500 });
    }

    // No need for Pinecone credentials or initialization anymore

    let relevantChunks: any[] = [];
    try {
      // Call your local retrieveRelevantChunks function
      relevantChunks = await retrieveRelevantChunks(message, "local", 5); // Assuming "local" is a valid index identifier in your local implementation
    } catch (error) {
      console.error("Error retrieving relevant chunks:", error);
      relevantChunks = [];
    }

    const context = relevantChunks
      .map(chunk => `[Page ${chunk.pageNumber}, Chunk ${chunk.chunkIndex}]: ${chunk.text}`)
      .join('\n\n');

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Build prompt with context
    const prompt = `
You are an assistant that answers questions based on the provided context.
Answer the question based only on the following context:

${context}

Question: ${message}

If the context doesn't contain enough information to answer the question confidently,
say that you don't have enough information, but you can try to provide a general answer.
`;

    console.log("Prompt sent to OpenAI:", prompt);
    // Get completion from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    return NextResponse.json({
      response: completion.choices[0].message.content || '',
      context: relevantChunks,
    });
  } catch (err: any) {
    console.error('Error processing request:', err);
    console.error('Error stack:', err.stack);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}