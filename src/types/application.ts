// src/types/application.ts
import type { DISApplicationView } from '@/api-contracts/dis';

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

  export interface ApplicantDetails {
    email?: string;
    emailVerified?: boolean;
    phoneNumber?: string;
    phoneVerified?: boolean;
    name?: string;
    givenNames?: string;
    surname?: string;
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
    // Contact/applicant fields
    applicantDetails?: ApplicantDetails;
    email?: string;
    emailVerified?: boolean;
    phoneNumber?: string;
    phoneVerified?: boolean;
    // Timestamps
    createdAt?: string;
    updatedAt?: string;

    // ========================================================================
    // DIS integration fields (V3 spec — Phase 1 Task 1.3)
    // ========================================================================
    // All optional — added additively so existing code keeps compiling.
    // Populated for applications that have been processed by the Deloitte DIS
    // pipeline. Legacy applications predating DIS integration won't have these.

    /** Which channel submitted the application to DIS */
    sourceChannel?: 'visakey' | 'govdirect';

    /** DIS's canonical UUID for this application (separate from AMS applicationId) */
    disApplicationId?: string;

    /** Full DIS processing result — decision, component scores, rules, OPA, external checks, extractions.
     *  Populated lazily when officer opens the reviewer page; may be undefined while DIS is still processing. */
    disView?: DISApplicationView;
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