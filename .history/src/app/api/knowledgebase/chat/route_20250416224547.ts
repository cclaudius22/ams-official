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

    // Build prompt with context and explicit instructions for extra knowledge and URLs
    const prompt = `
You are an assistant that answers questions using both the provided context and your own knowledge.

First, answer the question using ONLY the following context:
${context}

Then, if you know additional relevant information or reputable resources (such as URLs), provide them in a separate section labeled "Extra Knowledge & Resources". If you suggest URLs, ensure they are reputable and relevant.

Format your answer as follows:

[Context-Based Answer]

Extra Knowledge & Resources:
- [Any extra info or URLs, each on a new line]

Question: ${message}
`;

    console.log("Prompt sent to OpenAI:", prompt);
    // Get completion from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    // Extract URLs from the LLM's response (simple regex)
    const answer = completion.choices[0].message.content || '';
    const urlRegex = /(https?:\/\/[^\s\]\)]+[^\s\]\)\.])/gim;
    const suggestedUrls = Array.from(new Set((answer.match(urlRegex) || []).map(url => url.replace(/[.,;!?]+$/, ""))));

    // Build suggestedLinks with HTML anchor tags
    const suggestedLinks = suggestedUrls.map(url => ({
      url,
      html: `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
    }));

    return NextResponse.json({
      response: answer,
      context: relevantChunks,
      suggestedUrls,
      suggestedLinks,
    });
  } catch (err: any) {
    console.error('Error processing request:', err);
    console.error('Error stack:', err.stack);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
