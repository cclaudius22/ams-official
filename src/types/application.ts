// src/types/application.ts
import type { DISApplicationView, DISApplicationStatus, QueueState } from '@/api-contracts/dis';
import type { TimelineEvent } from '@/api-contracts/applications';

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
    /** Section payload varies by section type; sectionId identifies which renderer applies */
    data: { sectionId?: string } & Record<string, unknown>;
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
    metadata: Record<string, unknown>;
    timeline: TimelineEvent[];
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

    /** Full DIS processing result — recommendation, component scores, rules, OPA, external checks, extractions.
     *  Populated lazily when officer opens the reviewer page; may be undefined while DIS is still processing. */
    disView?: DISApplicationView;

    /** Raw as-built applications.status (V5 §4) — NOT a pipeline state machine.
     *  Display only; never drive queue logic off this. */
    disStatus?: DISApplicationStatus;

    /** Derived queue state (V5 §4) — what the queue view filters and renders. */
    disQueueState?: QueueState;
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