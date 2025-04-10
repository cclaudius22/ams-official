import { NextResponse } from 'next/server';
import { ukVisaTypes } from '@/lib/mockvisas';
import OpenAI from 'openai';

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
    
    // Create system message with context about the visa type if selected
    let systemMessage = "You are a helpful visa knowledge assistant that provides accurate information about UK visas.";
    
    if (visa) {
      systemMessage += ` The user is specifically asking about the ${visa.name}. Provide detailed and accurate information about this visa type, including eligibility requirements, application process, fees, processing times, and any other relevant details.`;
    } else {
      systemMessage += " Provide general information about UK visas, and suggest that the user select a specific visa type for more detailed information.";
    }

    // Create the conversation for OpenAI
    const conversation = [
      { role: "system", content: systemMessage },
      { role: "user", content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: conversation,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Extract the response
    const response = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

    // For now, we'll return a simple response without citations
    // In a real implementation, you might want to use a RAG system to provide citations
    return NextResponse.json({
      response,
      // If you want to add mock citations for demonstration purposes:
      citations: visa ? [
        {
          text: `${visa.name} - UK Government Official Page`,
          link: `https://www.gov.uk/visas-immigration/${visaType}`,
        }
      ] : undefined
    });
  } catch (error) {
    console.error('Error in knowledgebase chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
