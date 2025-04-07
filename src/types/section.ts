// src/types/section.ts
export interface PassportData {
    sectionId: string;
    documentNumber: string;
    surname: string;
    givenNames: string;
    dateOfBirth: string;
    dateOfExpiry: string;
    nationality: string;
    gender: string;
    documentType: string;
    issuingCountry: string;
    mrzData?: string;
  }
  
  export interface ResidencyData {
    sectionId: string;
    documents: {
      type: string;
      fileUrl: string;
      fileName: string;
    }[];
    verificationTimestamp: string;
    countryCode: string;
    verificationCompletedTimestamp: string;
  }
  
  export interface ProfessionalData {
    sectionId: string;
    employmentStatus: string;
    companyName: string;
    jobRole: string;
    completedAt: string;
  }
  
  export interface FinancialData {
    sectionId: string;
    statements: {
      id: string;
      accountName: string;
      bank: string;
      accountNumber: string;
      bankIdentifier: string;
      bankIdentifierType: string;
      fileUrl: string;
      uploadedAt: string;
    }[];
    verifiedAt: string;
    sufficientFunds: boolean;
  }
  
  export interface TravelData {
    sectionId: string;
    intendedDateOfArrival: string;
    intendedDateOfDeparture: string;
    arrivalCity: string;
    modeOfTransport: string[];
    numberOfIntendedEntries: string;
    costOfTravellingAndLiving: {
      coveredBy: string[];
      meansOfSupport: string[];
      amountAvailable: string;
    };
    accommodation: {
      type: string;
      name: string;
      address: string;
      bookingReference: string;
      telephoneNumber: string;
      emailAddress: string;
    };
    documents: {
      id: string;
      type: string;
      fileUrl: string;
      uploadedAt: string;
    }[];
    verifiedAt: string;
    completedAt: string;
  }
  
  export interface TravelInsuranceData {
    sectionId: string;
    policy: {
      id: string;
      provider: string;
      policyNumber: string;
      effectiveDate: string;
      expirationDate: string;
      coverageAmount: number;
      currency: string;
      coverageType: string[];
      fileUrl: string;
      uploadedAt: string;
    };
    verifiedAt: string;
    isValid: boolean;
  }