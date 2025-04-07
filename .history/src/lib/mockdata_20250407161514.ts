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
        issueDate: '2020-01-01',
        placeOfIssue: 'Washington D.C.',
        mrzData: {
          line1: 'P<USADOE<<JOHN<JAMES<<<<<<<<<<<<<<<<<<<<<',
          line2: 'P1234567890USA9001017M3001017<<<<<<<<<<<04',
          type: 'P',
          country: 'USA',
          number: 'P123456789',
          checkDigit1: '0',
          nationality: 'USA',
          dateOfBirth: '900101',
          checkDigit2: '7',
          sex: 'M',
          expiryDate: '300101',
          checkDigit3: '7',
          personalNumber: '',
          checkDigit4: '0',
          checkDigit5: '4'
        },
        scanQuality: 'high',
        passportPhotoUrl: 'https://placehold.co/400x500/png?text=Passport+Photo',
        scanDate: '2025-03-21T18:45:54.500Z',
        scanMethod: 'nfc-chip',
        verificationScore: 98.5,
        verificationNotes: 'NFC chip data matches OCR. All security features verified.'
      },
      updatedAt: '2025-03-21T18:45:54.500Z'
    },
    kyc: {
      status: 'verified',
      validationStatus: 'success',
      data: {
        sectionId: 'kyc',
        selfieId: 'demo-selfie-001',
        facematchScore: 98.2,
        livenessScore: 99.5,
        livenessChecks: ['blink', 'turn_head', 'smile'],
        completedAt: '2025-03-21T18:35:54.500Z',
        selfieImageUrl: 'https://placehold.co/400x400/png?text=Verified+Selfie',
        metadataCapture: {
          deviceModel: 'iPhone 15 Pro',
          deviceIp: '192.168.1.1',
          location: {
            latitude: 51.5074,
            longitude: -0.1278,
            accuracy: 10.5
          }
        }
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
            fileName: 'utility_bill.pdf',
            issueDate: '2025-02-15',
            issuer: 'London Electricity Ltd',
            addressLines: [
              '125 High Street',
              'Kensington',
              'London',
              'SW7 2DE'
            ]
          },
          {
            type: 'council_tax',
            fileUrl: 'https://placehold.co/400x500/png?text=Council+Tax',
            fileName: 'council_tax.pdf',
            issueDate: '2025-01-10',
            issuer: 'Royal Borough of Kensington and Chelsea',
            addressLines: [
              '125 High Street',
              'Kensington',
              'London',
              'SW7 2DE'
            ]
          }
        ],
        verificationTimestamp: '2025-03-20T05:54:23.614Z',
        countryCode: 'GB',
        verificationCompletedTimestamp: '2025-03-20T05:54:24.812Z',
        residencyAddress: {
          line1: '125 High Street',
          line2: 'Kensington',
          city: 'London',
          postalCode: 'SW7 2DE',
          country: 'United Kingdom',
          countryCode: 'GB',
          verificationMethod: 'document_upload',
          residenceDuration: {
            years: 3,
            months: 6
          }
        }
      },
      updatedAt: '2025-03-21T18:45:54.500Z'
    },
    // Continue with all other sections...
    
    // Just adding one more example
    professional: {
      status: 'verified',
      validationStatus: 'success',
      data: {
        sectionId: 'professional',
        employmentStatus: 'employed',
        companyName: 'Open Visa Ltd',
        jobRole: 'Senior Software Engineer',
        yearsInRole: 4,
        annualSalary: {
          amount: 85000,
          currency: 'GBP'
        },
        industry: 'Information Technology',
        employmentDocuments: [
          {
            type: 'employment_contract',
            fileUrl: 'https://placehold.co/400x500/png?text=Employment+Contract',
            fileName: 'contract.pdf',
            uploadedAt: '2025-03-20T06:12:45.123Z'
          },
          {
            type: 'payslip',
            fileUrl: 'https://placehold.co/400x500/png?text=Payslip',
            fileName: 'recent_payslip.pdf',
            uploadedAt: '2025-03-20T06:14:22.456Z'
          }
        ],
        employerAddress: {
          line1: '45 Tech Avenue',
          line2: 'Silicon Roundabout',
          city: 'London',
          postalCode: 'EC1V 2PY',
          country: 'United Kingdom'
        },
        completedAt: '2025-03-21T18:34:49.552Z'
      },
      updatedAt: '2025-03-21T18:45:54.501Z'
    }
  }
};