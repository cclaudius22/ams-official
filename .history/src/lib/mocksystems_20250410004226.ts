// mockSystems.ts

const MOCK_DATA = {
    passports: {
      "AB123456": {
        status: "valid",
        holder: "John Smith",
        nationality: "GBR",
        dateOfBirth: "1990-01-01",
        issuedBy: "HMPO",
        warnings: []
      },
      "CD789012": {
        status: "alert",
        holder: "Jane Doe",
        nationality: "FRA",
        dateOfBirth: "1985-05-15",
        issuedBy: "French Ministry",
        warnings: ["Document reported stolen"]
      }
    },
  
    interpol: {
      "CD789012": {
        redNotice: true,
        category: "Fraud",
        issuedDate: "2024-01-15",
        issuingCountry: "Germany",
        warningLevel: "Medium"
      }
    },
  
    sanctions: {
      "XY789012": {
        listed: true,
        sanctions: [
          {
            authority: "UN Security Council",
            reason: "Financial sanctions",
            dateImposed: "2023-12-01",
            restrictions: ["Asset freeze", "Travel ban"]
          },
          {
            authority: "EU",
            reason: "Economic restrictions",
            dateImposed: "2024-01-15",
            restrictions: ["Financial services"]
          }
        ]
      }
    },
  
    immigration: {
      "CD789012": {
        previousRefusals: [
          {
            country: "USA",
            date: "2023-11-15",
            reason: "False documentation"
          }
        ],
        deportations: [],
        overstays: [
          {
            country: "UK",
            period: "15 days",
            date: "2023-08-01"
          }
        ]
      }
    },
  
    biometric: {
      "AB123456": {
        matches: [],
        lastChecked: "2024-03-15",
        confidence: 0.98
      },
      "CD789012": {
        matches: [
          {
            system: "INTERPOL AFIS",
            confidence: 0.95,
            category: "Identity Fraud",
            date: "2024-01-10"
          }
        ],
        lastChecked: "2024-03-15",
        confidence: 0.95
      }
    },
  
    travelHistory: {
      "AB123456": [
        { date: "2024-03-01", type: "EXIT", port: "LHR", destination: "JFK" },
        { date: "2024-02-15", type: "ENTRY", port: "LHR", origin: "DXB" },
        { date: "2024-01-20", type: "EXIT", port: "CDG", destination: "DXB" }
      ]
    }
  };
  
  // Add realistic checking delays per system
  const SYSTEM_DELAYS = {
    document: { min: 1000, max: 2000 },    // 1-2 seconds
    interpol: { min: 2000, max: 4000 },    // 2-4 seconds (international)
    sanctions: { min: 1500, max: 3000 },   // 1.5-3 seconds
    immigration: { min: 1000, max: 2500 }, // 1-2.5 seconds
    biometric: { min: 3000, max: 5000 },   // 3-5 seconds (complex check)
    travel: { min: 1500, max: 2500 }       // 1.5-2.5 seconds
  };
  
  function getRandomDelay(system: string) {
    const delay = SYSTEM_DELAYS[system] || { min: 1000, max: 2000 };
    return Math.random() * (delay.max - delay.min) + delay.min;
  }
  
  async function checkSystem(system: string, documentId: string) {
    const delay = getRandomDelay(system);
    await new Promise(resolve => setTimeout(resolve, delay));
  
    switch(system) {
      case 'document':
        return MOCK_DATA.passports[documentId] || { status: "not_found" };
      
      case 'interpol':
        return MOCK_DATA.interpol[documentId] || { status: "no_record" };
      
      case 'sanctions':
        return MOCK_DATA.sanctions[documentId] || { listed: false };
      
      case 'immigration':
        return MOCK_DATA.immigration[documentId] || { status: "no_adverse_history" };
      
      case 'biometric':
        return MOCK_DATA.biometric[documentId] || { matches: [], confidence: 0 };
      
      case 'travel':
        return MOCK_DATA.travelHistory[documentId] || [];
      
      default:
        return { error: "System not available" };
    }
  }
  
  export { MOCK_DATA, checkSystem };