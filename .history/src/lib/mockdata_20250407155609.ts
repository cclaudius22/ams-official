// src/lib/mockData.ts
import { ApplicationData } from '@/types/application';
import { AIScanResult } from '@/types/aiScan';

export const mockScanResult: AIScanResult = {
  status: 'completed',
  scanStartedAt: new Date('2025-03-25T14:30:00Z'),
  scanCompletedAt: new Date('2025-03-25T14:32:15Z'),
  isValid: false,
  rootednessScore: 84,
  intentScore: 76,
  issues: [
    {
      id: 'suspicious-travel-pattern',
      sectionId: 'travel',
      type: 'suspicious',
      severity: 'medium',
      message: 'Multiple short tourism trips detected - may require additional scrutiny',
    },
    {
      id: 'inconsistent-name-professional',
      sectionId: 'professional',
      fieldId: 'fullName',
      type: 'inconsistent',
      severity: 'medium',
      message: 'Name in professional section does not match passport',
      context: {
        passportName: 'john james doe',
        professionalName: 'john j. doe',
      }
    }
  ],
  recommendations: [
    {
      id: 'check-name-consistency',
      relatedIssueIds: ['inconsistent-name-professional'],
      message: 'Verify name consistency across all documents',
      actionType: 'verify',
    },
    {
      id: 'verify-travel-history',
      relatedIssueIds: ['suspicious-travel-pattern'],
      message: 'Review travel history for patterns',
      actionType: 'verify',
    }
  ],
  score: 78
};

export const mockApplicationData: ApplicationData = {
  applicationId: 'VK-2503-HPI-HD0',
  userId: '67dbacf5adfab99d238910bd',
  visaTypeId: 'high-potential-individual',
  currentStage: 'REVIEW_AND_CONFIRM',
  verificationPath: 'standard',
  processingType: 'standard',
  status: 'draft',
  progress: {
    stageProgress: [
      {
        stage: 'ELIGIBILITY_CHECK',
        status: 'completed',
        completedAt: '2025-03-20T05:52:52.723Z'
      },
      {
        stage: 'PASSPORT_UPLOAD',
        status: 'completed',
        completedAt: '2025-03-21T18:45:54.501Z'
      },
      {
        stage: 'KYC_LIVENESS',
        status: 'completed',
        completedAt: '2025-03-21T18:45:54.501Z'
      },
    ],
    overallProgress: 77,
    lastUpdated: '2025-03-21T18:46:10.986Z'
  },
  metadata: {
    score: 135,
    visaTracking: {
      initializedFrom: 'local_file',
      visaTypeRecordId: {
        $oid: '67561713fa523141f088ec81'
      }
    }
  },
  timeline: [],
  sections: {
    passport: {
      status: 'verified',
      validationStatus: 'success',
      data: {
        sectionId: 'passport',
        documentNumber: 'P123456789',
        surname: 'Doe',
        givenNames: 'John James',
        dateOfBirth: '1990-01-01',
        dateOfExpiry: '2030-01-01',
        nationality: 'USA',
        gender: 'M',
        documentType: 'Passport',
        issuingCountry: 'USA',
        mrzData: 'P<USADOE<<JOHN<JAMES<<<<<<<<<<<<<<<<<<<<<<<<<<'
      },
      updatedAt: '2025-03-21T18:45:54.500Z'
    },
    kyc: {
      status: 'verified',
      validationStatus: 'success',
      data: {
        sectionId: 'kyc',
        selfieId: 'demo-selfie-001'
      },
      updatedAt: '2025-03-21T18:45:54.500Z'
    },
    residency: {
      status: 'complete',
      validationStatus: 'success',
      data: {
        sectionId: 'residency',
        documents: [
          {
            type: 'utility_bill',
            fileUrl: 'https://placehold.co/400x500/png?text=Utility+Bill',
            fileName: 'utility_bill.pdf'
          },
          {
            type: 'council_tax',
            fileUrl: 'https://placehold.co/400x500/png?text=Council+Tax',
            fileName: 'council_tax.pdf'
          }
        ],
        verificationTimestamp: '2025-03-20T05:54:23.614Z',
        countryCode: 'GB',
        verificationCompletedTimestamp: '2025-03-20T05:54:24.812Z'
      },
      updatedAt: '2025-03-21T18:45:54.500Z'
    },
    // ... other sections
  }
};