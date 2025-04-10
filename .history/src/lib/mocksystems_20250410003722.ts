// mockSystems.ts

// Sample data for different passport statuses
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
    travelHistory: {
      "AB123456": [
        { date: "2024-03-01", type: "EXIT", port: "LHR" },
        { date: "2024-02-15", type: "ENTRY", port: "LHR" },
        { date: "2024-01-20", type: "EXIT", port: "CDG" }
      ]
    },
    watchlist: {
      "CD789012": {
        status: "ALERT",
        reason: "Document reported stolen on 2024-01-15",
        priority: "HIGH"
      }
    }
  };
  
  // Simulate system checks with realistic delays
  async function checkSystem(system: string, documentId: string) {
    // Random delay between 1-3 seconds
    const delay = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  
    switch(system) {
      case 'document':
        return MOCK_DATA.passports[documentId] || { status: "not_found" };
      
      case 'travel':
        return MOCK_DATA.travelHistory[documentId] || [];
      
      case 'watchlist':
        return MOCK_DATA.watchlist[documentId] || { status: "NO_RECORD" };
      
      default:
        return { error: "System not available" };
    }
  }
  
  export { MOCK_DATA, checkSystem };