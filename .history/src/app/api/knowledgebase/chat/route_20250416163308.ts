import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { retrieveRelevantChunks } from '@/lib/api/visaRag';

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

    const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
    const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
    const PINECONE_INDEX = process.env.PINECONE_INDEX;

    if (!PINECONE_API_KEY || !PINECONE_ENVIRONMENT || !PINECONE_INDEX) {
      return NextResponse.json({ error: 'Pinecone credentials not set in environment' }, { status: 500 });
    }

    // Initialize Pinecone client
    const pinecone = new Pinecone({
      apiKey: PINECONE_API_KEY,
      environment: PINECONE_ENVIRONMENT,
    });
    
    const index = pinecone.index(PINECONE_INDEX);

    let relevantChunks = [];
    try {
      relevantChunks = await retrieveRelevantChunks(message, index, 5);
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
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
