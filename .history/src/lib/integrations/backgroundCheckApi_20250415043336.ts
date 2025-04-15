// lib/integrations/backgroundCheckApi.ts

// Mapping for each background check service
const apiConfig: Record<string, { endpoint: string; apiKey: string }> = {
    interpol: {
      endpoint: `${process.env.NEXT_PUBLIC_INTERPOL_API_URL}/check`,
      apiKey: process.env.NEXT_PUBLIC_INTERPOL_API_KEY || '',
    },
    sanctions: {
      endpoint: `${process.env.NEXT_PUBLIC_SANCTIONS_API_URL}/check`,
      apiKey: process.env.NEXT_PUBLIC_SANCTIONS_API_KEY || '',
    },
    criminal: {
      endpoint: `${process.env.NEXT_PUBLIC_CRIMINAL_API_URL}/check`,
      apiKey: process.env.NEXT_PUBLIC_CRIMINAL_API_KEY || '',
    },
    // Add more mappings for other systems as needed.
  };
  
  // Generic function for checking a system
  export async function checkBackgroundSystem(systemId: string, documentId: string) {
    const config = apiConfig[systemId];
  
    if (!config) {
      throw new Error(`Unsupported system: ${systemId}`);
    }
  
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Provide authentication header based on vendor specs.
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({ documentId }),
    });
  
    if (!response.ok) {
      // Optionally, extract more error details from the response
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${errorData?.message || response.statusText}`);
    }
  
    return response.json();
  }
  