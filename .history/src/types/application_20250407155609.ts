// src/types/application.ts
export interface ApplicationStage {
    stage: string;
    status: string;
    completedAt: string | null;
  }
  
  export interface ApplicationProgress {
    stageProgress: ApplicationStage[];
    overallProgress: number;
    lastUpdated: string;
  }
  
  export interface ApplicationSection {
    status: string;
    validationStatus: string;
    data: any;
    updatedAt: string;
  }
  
  export interface ApplicationData {
    applicationId: string;
    userId: string;
    visaTypeId: string;
    currentStage: string;
    verificationPath: string;
    processingType: string;
    status: string;
    sections: Record<string, ApplicationSection>;
    progress: ApplicationProgress;
    metadata: any;
    timeline: Array<any>;
  }
  
  // Specific visa type interfaces for stronger typing
  export interface HighPotentialIndividualApplication extends ApplicationData {
    qualifications?: {
      university: string;
      degree: string;
      graduationDate: string;
      ranking: number;
    }[];
  }
  
  export interface TouristVisaApplication extends ApplicationData {
    travelDetails?: {
      duration: number;
      purpose: string;
      accommodation: string;
    };
  }