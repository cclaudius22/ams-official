// types/aiScan.ts
export interface ScanIssue {
    id: string;
    sectionId: string;
    fieldId?: string;
    type: 'missing' | 'invalid' | 'inconsistent' | 'suspicious' | 'incomplete';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    context?: Record<string, unknown>;
  }
  
  export interface ScanRecommendation {
    id: string;
    relatedIssueIds: string[];
    message: string;
    actionType: 'update' | 'upload' | 'verify' | 'contact_support' | 'resubmit';
    actionLink?: string;
  }
  
  export interface AIScanResult {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    scanStartedAt?: Date;
    scanCompletedAt?: Date;
    isValid: boolean;
    issues: ScanIssue[];
    recommendations: ScanRecommendation[];
    score: number;
    rootednessScore?: number; // Optional scores for different visa types
    rootednessSummary?: string; // Summary text for rootedness analysis
    intentScore?: number;
    intentSummary?: string; // Summary text for intent analysis
    documentSummary?: string; // Summary text for document analysis
    error?: string;
  }
  
  // Add visa-type specific scan interfaces
  export interface HighPotentialIndividualScan extends AIScanResult {
    educationVerification?: {
      universityRank: number;
      degreeLevel: string;
      verificationStatus: 'verified' | 'pending' | 'failed';
    };
  }
  
  export interface TouristVisaScan extends AIScanResult {
    travelPatterns?: {
      previousVisits: number;
      averageStayDuration: number;
      returnRate: number;
    };
  }