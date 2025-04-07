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
        },
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
        verificationCompletedTimestamp: '2025-03-20T05:54:24.812Z'
      },
      updatedAt: '2025-03-21T18:45:54.500Z'
    },
    professional: {
      status: 'verified',
      validationStatus: 'success',
      data: {
        sectionId: 'professional',
        employmentStatus: 'employed',
        companyName: 'Quantum Technologies Ltd',
        jobRole: 'Lead Machine Learning Engineer',
        startDate: '2021-06-15',
        yearsInRole: 3.8,
        annualSalary: {
          amount: 95000,
          currency: 'GBP'
        },
        previousSalary: {
          amount: 78000,
          currency: 'GBP'
        },
        industry: 'Artificial Intelligence & Machine Learning',
        jobLevel: 'senior',
        employmentType: 'full-time',
        department: 'Research & Development',
        responsibilities: [
          'Lead a team of 5 machine learning engineers',
          'Design and implement neural network architectures',
          'Collaborate with product teams on AI features',
          'Manage research budget of £2M annually'
        ],
        skills: [
          'Python',
          'TensorFlow',
          'PyTorch',
          'Computer Vision',
          'Natural Language Processing',
          'Deep Learning'
        ],
        employmentDocuments: [
          {
            type: 'employment_contract',
            fileUrl: 'https://placehold.co/400x500/png?text=Employment+Contract',
            fileName: 'quantum_technologies_contract.pdf',
            uploadedAt: '2025-03-20T06:12:45.123Z',
            verificationStatus: 'verified'
          },
          {
            type: 'reference_letter',
            fileUrl: 'https://placehold.co/400x500/png?text=Reference+Letter',
            fileName: 'reference_letter_cto.pdf',
            uploadedAt: '2025-03-20T06:13:22.456Z',
            verificationStatus: 'verified'
          },
          {
            type: 'payslip',
            fileUrl: 'https://placehold.co/400x500/png?text=Recent+Payslip',
            fileName: 'payslip_feb_2025.pdf',
            uploadedAt: '2025-03-20T06:14:22.456Z',
            verificationStatus: 'verified'
          }
        ],
        employerAddress: {
          line1: '45 Innovation Hub',
          line2: 'Silicon Roundabout',
          city: 'London',
          postalCode: 'EC1V 2PY',
          country: 'United Kingdom'
        },
        employerContact: {
          name: 'Sarah Johnson',
          position: 'HR Director',
          email: 'sjohnson@quantumtech.example',
          phone: '+44 20 1234 5678'
        },
        previousEmployment: [
          {
            companyName: 'DataViz Solutions',
            jobRole: 'Senior ML Engineer',
            startDate: '2018-08-01',
            endDate: '2021-06-01',
            reasonForLeaving: 'Career advancement opportunity'
          },
          {
            companyName: 'Tech Innovations Inc',
            jobRole: 'Data Scientist',
            startDate: '2016-03-15',
            endDate: '2018-07-25',
            reasonForLeaving: 'Seeking specialization in machine learning'
          }
        ],
        qualifications: [
          {
            type: 'degree',
            name: 'PhD in Computer Science',
            institution: 'University of Cambridge',
            yearCompleted: 2016,
            specialization: 'Machine Learning & Artificial Intelligence'
          },
          {
            type: 'degree',
            name: 'MSc in Data Science',
            institution: 'Imperial College London',
            yearCompleted: 2013,
            specialization: 'Statistical Learning'
          }
        ],
        verificationChecks: {
          employmentVerified: true,
          salaryVerified: true,
          roleVerified: true,
          verificationMethod: 'document_and_employer_contact',
          verificationDate: '2025-03-21T15:32:45.123Z',
          verificationNotes: 'All employment details confirmed with HR department. Salary and role match provided documents.'
        },
        completedAt: '2025-03-21T18:34:49.552Z'
      },
      updatedAt: '2025-03-21T18:45:54.501Z'
    },
    financial: {
      status: 'complete',
      validationStatus: 'success',
      data: {
        sectionId: 'financial',
        bankName: 'Barclays',
        accountNumber: '78654321',
        sortCode: '43-03-45',
        accountHolderName: 'John James Doe', // Assuming name matches passport
        accountType: 'Current Account',
        currency: 'GBP',
        documents: [
          {
            type: 'bank_statement',
            fileUrl: 'https://placehold.co/400x500/png?text=Bank+Statement',
            fileName: 'bank_statement_apr_2025.pdf',
            uploadedAt: '2025-04-06T10:00:00Z', // From user input
            uploadedBy: 'J Macdonald', // From user input
            verificationStatus: 'pending'
          }
        ],
        verificationChecks: {
          fundsVerified: false,
          sourceOfFundsVerified: false,
          verificationMethod: 'document_upload',
          verificationDate: null,
          verificationNotes: 'Awaiting document verification.'
        },
        completedAt: '2025-04-06T10:05:00Z'
      },
      updatedAt: '2025-04-06T10:05:00Z'
    },
    travel: {
      status: 'complete',
      validationStatus: 'success',
      data: {
        sectionId: 'travel',
        dateOfArrival: '2025-05-31',
        dateOfDeparture: '2025-07-31',
        durationOfStayDays: 61,
        intendedEntries: 'single',
        arrivalCity: 'London',
        modeOfTransport: 'Air',
        accommodation: {
          type: 'Other',
          name: '49 Hubert Grove',
          address: 'London SW9 9PA',
          proofDocument: {
            type: 'accommodation_proof',
            fileUrl: 'https://placehold.co/400x500/png?text=Accommodation+Proof',
            fileName: 'accommodation_proof.pdf',
            uploadedAt: '2025-04-06T11:00:00Z', // Assuming upload time
            verificationStatus: 'verified',
            verifiedAt: '2025-04-06T11:05:00Z' // Assuming verification time
          }
        },
        completedAt: '2025-04-06T11:10:00Z'
      },
      updatedAt: '2025-04-06T11:10:00Z'
    },
    // --- Correct placement for Travel Insurance ---
    travelInsurance: {
      status: 'complete',
      validationStatus: 'success',
      data: {
          sectionId: 'travelInsurance',
          providerName: 'Allianz Global Assistance',
          policyNumber: 'AZP-UK-987654321',
          coverageAmount: { amount: 30000, currency: 'GBP' },
          startDate: '2025-05-30',
          endDate: '2025-08-01',
          durationDays: 64,
          keyCoverages: ['emergency_medical', 'repatriation', 'lost_luggage'],
          notes: 'Policy meets standard requirements for Schengen area, but verify specific country needs.',
          insuranceDocument: {
              type: 'insurance_policy',
              fileUrl: 'https://placehold.co/400x500/png?text=Insurance+Policy',
              fileName: 'allianz_policy_jjdoe.pdf',
              uploadedAt: '2025-04-06T11:15:00Z',
              verificationStatus: 'verified',
              verifiedAt: '2025-04-06T11:20:00Z'
          },
          completedAt: '2025-04-06T11:25:00Z'
      },
      updatedAt: '2025-04-06T11:25:00Z'
  },
  // --- Correct placement for Documents ---
  documents: {
      status: 'pending_upload',
      validationStatus: 'pending',
      data: {
          sectionId: 'documents',
          requiredDocumentsList: [
              { docType: 'birth_certificate', docTypeName: 'Birth Certificate (Original or Certified Copy)', status: 'uploaded', notes: 'Uploaded copy seems clear.', uploadedDocument: { type: 'birth_certificate', fileUrl: '...', fileName: 'birth_cert_jjdoe.pdf', uploadedAt: '2025-04-07T09:30:00Z', verificationStatus: 'pending', verifiedAt: null } },
              { docType: 'police_clearance_certificate', docTypeName: 'Police Clearance Certificate (Home Country)', status: 'required', notes: 'Must be issued within the last 6 months.', uploadedDocument: null },
              { docType: 'police_clearance_certificate_residence', docTypeName: 'Police Clearance Certificate (Country of Residence > 1 yr)', status: 'not_required', notes: 'Applicant resided in UK < 5 years.', uploadedDocument: null },
              { docType: 'tuberculosis_test_certificate', docTypeName: 'Tuberculosis (TB) Test Certificate', status: 'uploaded', notes: 'Certificate from approved clinic.', uploadedDocument: { type: 'tb_test_certificate', fileUrl: '...', fileName: 'tb_test_clinic_london.pdf', uploadedAt: '2025-04-07T09:35:00Z', verificationStatus: 'verified', verifiedAt: '2025-04-07T10:00:00Z' } }
          ],
          completedAt: null
      },
      updatedAt: '2025-04-07T09:35:00Z'
  },
  // --- Correct placement for Study ---
  study: {
      status: 'complete',
      validationStatus: 'success',
      data: {
          sectionId: 'study',
          institutionName: 'University College London (UCL)',
          // ... other study fields ...
          courseName: 'MSc Data Science and Machine Learning', courseLevel: 'Postgraduate (RQF Level 7)', courseStartDate: '2025-09-22', courseEndDate: '2026-09-21', courseDurationMonths: 12, studyMode: 'full-time', tuitionFees: { amount: 28500, currency: 'GBP', paymentStatus: 'deposit_paid', amountPaid: 5000, paymentDueDate: '2025-08-01' }, completedAt: '2025-04-05T10:00:00Z'
      },
      updatedAt: '2025-04-05T10:00:00Z'
  },
  // --- Correct placement for CAS ---
  cas: {
      status: 'verified',
      validationStatus: 'success',
      data: {
          sectionId: 'cas',
          casNumber: 'E123456789GBXYZ0',
          // ... other cas fields ...
          casStatus: 'assigned', casIssueDate: '2025-04-01', casExpiryDate: '2025-09-15', sponsorLicenseNumber: 'AB12CD345', isATASRequired: false, atasCertificateNumber: null, verificationChecks: { casNumberVerified: true, institutionMatch: true, courseMatch: true, verificationMethod: 'internal_database_check', verificationDate: '2025-04-05T11:00:00Z' }, completedAt: '2025-04-05T10:05:00Z'
      },
      updatedAt: '2025-04-05T11:00:00Z'
  },
  // --- Correct placement for English Proficiency ---
  englishProficiency: {
      status: 'complete',
      validationStatus: 'success',
      data: {
          sectionId: 'englishProficiency',
          testType: 'IELTS Academic',
           // ... other english fields ...
          testDate: '2025-03-10', testReportFormNumber: '123456-7890-ABC', overallScore: 6.0, componentScores: { listening: 6.5, reading: 6.5, writing: 5.5, speaking: 6.0 }, requiredScores: { overall: 6.5, minimumComponent: 6.0 }, document: { type: 'english_test_report', fileUrl: '...', fileName: 'ielts_report_jjdoe.pdf', uploadedAt: '2025-04-05T10:15:00Z', verificationStatus: 'verified', verifiedAt: '2025-04-05T11:30:00Z' }, completedAt: '2025-04-05T10:20:00Z'
      },
      updatedAt: '2025-04-05T11:30:00Z'
  },
  // --- Correct placement for Academic Qualifications ---
  academicQualifications: {
      status: 'complete',
      validationStatus: 'success',
      data: {
          sectionId: 'academicQualifications',
          qualifications: [
              { type: 'degree', level: 'Undergraduate (RQF Level 6)', name: 'BSc Computer Science', institution: 'University of California, Berkeley', country: 'USA', yearCompleted: 2023, gradeOrResult: 'GPA 3.8/4.0', specialization: 'Software Engineering', document: { type: 'degree_certificate', fileUrl: '...', fileName: 'bsc_ucb_cert.pdf', uploadedAt: '2025-04-04T15:00:00Z', verificationStatus: 'verified' } },
              { type: 'transcript', level: 'Undergraduate (RQF Level 6)', name: 'Academic Transcript - BSc Computer Science', institution: 'University of California, Berkeley', country: 'USA', yearCompleted: 2023, document: { type: 'academic_transcript', fileUrl: '...', fileName: 'bsc_ucb_transcript.pdf', uploadedAt: '2025-04-04T15:05:00Z', verificationStatus: 'verified' } }
          ],
          completedAt: '2025-04-04T15:10:00Z'
      },
       updatedAt: '2025-04-04T15:10:00Z'
  }

} 
}; 