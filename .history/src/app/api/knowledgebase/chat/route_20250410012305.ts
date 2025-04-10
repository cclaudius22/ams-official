import { NextResponse } from 'next/server';
import { ukVisaTypes } from '@/lib/mockvisas';

// Mock function to simulate getting a response from a RAG system
function getMockResponse(message: string, visaType?: string): { response: string; citations?: { text: string; link: string }[] } {
  // Default response if no visa type is selected
  if (!visaType) {
    return {
      response: `I can help you with information about UK visas. For more specific information, please select a visa type from the list on the left.`,
    };
  }

  // Find the visa type from our list
  const visa = ukVisaTypes.find(v => v.id === visaType);
  if (!visa) {
    return {
      response: `I couldn't find information about the selected visa type. Please try selecting a different visa type.`,
    };
  }

  // Generate a response based on the visa type and message
  // This is a very simple mock - in a real system, this would query a vector database or LLM
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('requirement') || lowerMessage.includes('eligibility')) {
    return {
      response: `For the ${visa.name}, the main requirements include proof of identity, financial stability, and purpose of visit. Specific requirements vary based on your nationality and circumstances.`,
      citations: [
        {
          text: `${visa.name} Requirements - UK Government`,
          link: `https://www.gov.uk/visas-immigration/${visaType}`,
        },
      ],
    };
  }
  
  if (lowerMessage.includes('cost') || lowerMessage.includes('fee') || lowerMessage.includes('price')) {
    return {
      response: `The application fee for a ${visa.name} varies depending on your circumstances. Standard applications typically cost between £300 and £1,500. There may be additional costs for healthcare surcharges and biometric information.`,
      citations: [
        {
          text: `${visa.name} Fees - UK Government`,
          link: `https://www.gov.uk/visa-fees`,
        },
      ],
    };
  }
  
  if (lowerMessage.includes('time') || lowerMessage.includes('processing') || lowerMessage.includes('wait')) {
    return {
      response: `Processing times for ${visa.name} applications typically take 3-8 weeks, depending on your location and the complexity of your application. Premium services are available for faster processing.`,
      citations: [
        {
          text: `Visa Processing Times - UK Government`,
          link: `https://www.gov.uk/visa-processing-times`,
        },
      ],
    };
  }
  
  if (lowerMessage.includes('document') || lowerMessage.includes('need to provide')) {
    return {
      response: `For a ${visa.name}, you'll typically need to provide your passport, proof of financial means, accommodation details, and documents specific to your purpose of visit. The exact requirements depend on your personal circumstances.`,
      citations: [
        {
          text: `Required Documents for ${visa.name} - UK Government`,
          link: `https://www.gov.uk/visas-immigration/${visaType}/documents`,
        },
      ],
    };
  }

  // Default response for the selected visa
  return {
    response: `The ${visa.name} allows you to [purpose based on visa type]. You can find detailed information on the UK government website. How else can I help you with this visa type?`,
    citations: [
      {
        text: `${visa.name} Overview - UK Government`,
        link: `https://www.gov.uk/visas-immigration/${visaType}`,
      },
    ],
  };
}

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

    // Add a small delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get mock response
    const responseData = getMockResponse(message, visaType);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in knowledgebase chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
