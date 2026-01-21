/**
 * Transforms synthetic visa application data to dashboard schema
 */

import type {
  SyntheticApplication,
  SyntheticDocument,
  SyntheticVisaType,
  SyntheticScenario,
} from './types';

import type {
  LiveApplication,
  ApplicationDetail,
  ApplicationSection,
  ApplicationProgress,
  StageProgress,
  TimelineEvent,
  ApplicantDetails,
  ApplicationStatus,
  AIScanResult,
  ScanIssue,
  ScanRecommendation,
} from '@/api-contracts/applications';

import {
  getCountryCode,
  getVisaTypeDisplayName,
  getVisaCategory,
} from './country-codes';

/**
 * Format a relative time string from ISO date
 */
function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Derive flags from synthetic scenario and fraud patterns
 */
function deriveFlags(synthetic: SyntheticApplication): string[] {
  const flags: string[] = [];

  // Scenario-based flags
  if (synthetic.scenario === 'fraudulent') {
    flags.push('Potential Fraud');
  }
  if (synthetic.scenario === 'major_issues') {
    flags.push('High Risk');
  }
  if (synthetic.scenario === 'minor_issues') {
    flags.push('Needs Review');
  }

  // Fraud pattern flags
  synthetic.fraud_patterns.forEach(pattern => {
    const displayName = pattern
      .replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    flags.push(displayName);
  });

  // Document confidence flags
  const lowConfidenceDocs = synthetic.documents.filter(d => d.confidence_score < 0.8);
  if (lowConfidenceDocs.length > 0) {
    flags.push('Document Verification Required');
  }

  return flags;
}

/**
 * Determine processing type based on scenario and visa type
 */
function determineProcessingType(synthetic: SyntheticApplication): string {
  if (synthetic.scenario === 'fraudulent' || synthetic.scenario === 'major_issues') {
    return 'enhanced';
  }
  if (synthetic.visa_type === 'global_talent_visa' || synthetic.visa_type === 'innovator_founder_visa') {
    return 'priority';
  }
  return 'standard';
}

/**
 * Get validation status based on document confidence and scenario
 */
function getValidationStatus(doc: SyntheticDocument, scenario: SyntheticScenario): 'valid' | 'invalid' | 'pending' | 'incomplete' {
  if (scenario === 'fraudulent' && doc.fraud_flags.length > 0) {
    return 'invalid';
  }
  if (doc.confidence_score >= 0.9) {
    return 'valid';
  }
  if (doc.confidence_score >= 0.7) {
    return 'pending';
  }
  return 'incomplete';
}

/**
 * Create passport section from synthetic data
 */
function createPassportSection(synthetic: SyntheticApplication): ApplicationSection {
  const passportDoc = synthetic.documents.find(d => d.document_type === 'passport');
  const applicant = synthetic.applicant;

  return {
    status: passportDoc ? 'complete' : 'pending_upload',
    validationStatus: passportDoc ? getValidationStatus(passportDoc, synthetic.scenario) : 'incomplete',
    data: {
      sectionId: 'passport',
      surname: applicant.last_name,
      givenNames: applicant.first_name,
      dateOfBirth: applicant.date_of_birth,
      nationality: applicant.nationality,
      documentNumber: applicant.passport_number,
      dateOfExpiry: applicant.passport_expiry,
      gender: applicant.gender,
      mrzData: {
        line1: applicant.mrz.split('\n')[0] || '',
        line2: applicant.mrz.split('\n')[1] || '',
      },
      placeOfBirth: passportDoc?.extracted_fields?.place_of_birth || applicant.nationality,
      issueDate: passportDoc?.extracted_fields?.issue_date || null,
      verificationScore: passportDoc?.confidence_score || 0,
      document: passportDoc ? {
        id: passportDoc.document_id,
        fileName: passportDoc.file_name,
        uploadedAt: passportDoc.upload_timestamp,
      } : null,
    },
    updatedAt: passportDoc?.upload_timestamp || synthetic.application_date,
  };
}

/**
 * Create financial section from bank statement documents
 */
function createFinancialSection(synthetic: SyntheticApplication): ApplicationSection {
  const bankDocs = synthetic.documents.filter(d => d.document_type === 'bank_statement');
  const bestDoc = bankDocs[0];

  if (!bestDoc) {
    return {
      status: 'pending_upload',
      validationStatus: 'incomplete',
      data: {},
      updatedAt: synthetic.application_date,
    };
  }

  const fields = bestDoc.extracted_fields as Record<string, unknown>;

  return {
    status: 'complete',
    validationStatus: getValidationStatus(bestDoc, synthetic.scenario),
    data: {
      sectionId: 'financial',
      bankName: fields.bank_name || 'Unknown Bank',
      accountHolder: fields.account_holder,
      accountNumber: fields.account_number,
      sortCode: fields.sort_code,
      currency: fields.currency || 'GBP',
      currentBalance: fields.balance,
      averageBalance: fields.average_balance,
      statementPeriod: {
        start: fields.statement_period_start,
        end: fields.statement_period_end,
      },
      verificationScore: bestDoc.confidence_score,
      documents: bankDocs.map(d => ({
        id: d.document_id,
        fileName: d.file_name,
        uploadedAt: d.upload_timestamp,
      })),
    },
    updatedAt: bestDoc.upload_timestamp,
  };
}

/**
 * Create employment section from CoS and employment letter documents
 */
function createEmploymentSection(synthetic: SyntheticApplication): ApplicationSection {
  const cosDoc = synthetic.documents.find(d => d.document_type === 'cos_letter');
  const empDoc = synthetic.documents.find(d => d.document_type === 'employment_letter');
  const visaData = synthetic.visa_specific_data as Record<string, unknown>;

  const docs = [cosDoc, empDoc].filter(Boolean);

  return {
    status: docs.length > 0 ? 'complete' : 'pending_upload',
    validationStatus: cosDoc ? getValidationStatus(cosDoc, synthetic.scenario) : 'incomplete',
    data: {
      sectionId: 'professional',
      // From visa-specific data (most accurate)
      cosNumber: visaData.cos_number,
      sponsorName: visaData.sponsor_name,
      sponsorLicense: visaData.sponsor_license_number,
      jobTitle: visaData.job_title,
      socCode: visaData.soc_code,
      annualSalary: visaData.annual_salary,
      workingHours: visaData.working_hours,
      startDate: visaData.job_start_date,
      isNewEntrant: visaData.is_new_entrant,
      // For senior specialist worker
      overseasEmployer: visaData.overseas_employer,
      overseasEmploymentStart: visaData.overseas_employment_start,
      overseasEmploymentMonths: visaData.overseas_employment_months,
      // Qualifications
      qualifications: visaData.qualifications,
      // Documents
      documents: docs.map(d => ({
        id: d!.document_id,
        type: d!.document_type,
        fileName: d!.file_name,
        uploadedAt: d!.upload_timestamp,
        confidence: d!.confidence_score,
      })),
    },
    updatedAt: cosDoc?.upload_timestamp || synthetic.application_date,
  };
}

/**
 * Create education section for student visas
 */
function createEducationSection(synthetic: SyntheticApplication): ApplicationSection {
  const casDoc = synthetic.documents.find(d => d.document_type === 'cas_letter');
  const englishDoc = synthetic.documents.find(d => d.document_type === 'english_test');
  const visaData = synthetic.visa_specific_data as Record<string, unknown>;

  return {
    status: casDoc ? 'complete' : 'pending_upload',
    validationStatus: casDoc ? getValidationStatus(casDoc, synthetic.scenario) : 'incomplete',
    data: {
      sectionId: 'study',
      // CAS details
      casNumber: visaData.cas_number,
      institutionName: visaData.institution_name,
      courseTitle: visaData.course_title,
      courseLevel: visaData.course_level,
      courseStartDate: visaData.course_start_date,
      courseEndDate: visaData.course_end_date,
      tuitionFees: visaData.tuition_fees,
      tuitionPaid: visaData.tuition_paid,
      maintenanceFunds: visaData.maintenance_funds,
      // English proficiency
      englishTest: {
        type: visaData.english_test_type || englishDoc?.extracted_fields?.test_type,
        overallScore: visaData.english_overall_score || englishDoc?.extracted_fields?.overall_score,
        componentScores: visaData.english_component_scores || {
          listening: englishDoc?.extracted_fields?.listening,
          reading: englishDoc?.extracted_fields?.reading,
          writing: englishDoc?.extracted_fields?.writing,
          speaking: englishDoc?.extracted_fields?.speaking,
        },
        testDate: englishDoc?.extracted_fields?.test_date,
      },
      // ATAS
      atasRequired: visaData.atas_required,
      atasCertificateNumber: visaData.atas_certificate_number,
    },
    updatedAt: casDoc?.upload_timestamp || synthetic.application_date,
  };
}

/**
 * Create family/relationship section for family visas
 */
function createFamilySection(synthetic: SyntheticApplication): ApplicationSection {
  const marriageDoc = synthetic.documents.find(d => d.document_type === 'marriage_certificate');
  const visaData = synthetic.visa_specific_data as Record<string, unknown>;

  return {
    status: 'complete',
    validationStatus: marriageDoc ? getValidationStatus(marriageDoc, synthetic.scenario) : 'pending',
    data: {
      sectionId: 'family',
      relationshipType: visaData.relationship_type,
      sponsorName: visaData.sponsor_name,
      sponsorNationality: visaData.sponsor_nationality,
      sponsorImmigrationStatus: visaData.sponsor_immigration_status,
      relationshipStartDate: visaData.relationship_start_date,
      cohabitationStartDate: visaData.cohabitation_start_date,
      marriageDate: visaData.marriage_date,
      annualIncome: visaData.annual_income,
      incomeSource: visaData.income_source,
      accommodationType: visaData.accommodation_type,
      accommodationAddress: visaData.accommodation_address,
    },
    updatedAt: marriageDoc?.upload_timestamp || synthetic.application_date,
  };
}

/**
 * Create residency section from applicant's current address
 */
function createResidencySection(synthetic: SyntheticApplication): ApplicationSection {
  const address = synthetic.applicant.current_address;

  return {
    status: 'complete',
    validationStatus: 'valid',
    data: {
      sectionId: 'residency',
      residencyAddress: {
        line1: address.line1 || '',
        line2: address.line2 || '',
        city: address.city || '',
        postalCode: address.postcode || '',
        country: address.country,
        countryCode: getCountryCode(address.country),
      },
      residenceDuration: {
        years: 2, // Simulated
        months: 6,
      },
      verificationMethod: 'document_upload',
    },
    updatedAt: synthetic.application_date,
  };
}

/**
 * Create CAS section for student visas (separate from study section)
 */
function createCasSection(synthetic: SyntheticApplication): ApplicationSection {
  const casDoc = synthetic.documents.find(d => d.document_type === 'cas_letter');
  const visaData = synthetic.visa_specific_data as Record<string, unknown>;

  return {
    status: casDoc ? 'verified' : 'pending_upload',
    validationStatus: casDoc ? getValidationStatus(casDoc, synthetic.scenario) : 'incomplete',
    data: {
      sectionId: 'cas',
      casNumber: visaData.cas_number,
      casStatus: 'assigned',
      casIssueDate: synthetic.application_date,
      sponsorLicenseNumber: 'SPONSOR-LIC-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      institutionMatch: true,
      courseMatch: true,
      isATASRequired: visaData.atas_required,
      atasCertificateNumber: visaData.atas_certificate_number,
      verificationChecks: {
        casNumberVerified: synthetic.scenario !== 'fraudulent',
        verificationMethod: 'internal_database_check',
        verificationDate: synthetic.application_date,
      },
    },
    updatedAt: casDoc?.upload_timestamp || synthetic.application_date,
  };
}

/**
 * Create English proficiency section for student visas
 */
function createEnglishProficiencySection(synthetic: SyntheticApplication): ApplicationSection {
  const englishDoc = synthetic.documents.find(d => d.document_type === 'english_test');
  const visaData = synthetic.visa_specific_data as Record<string, unknown>;
  const componentScores = visaData.english_component_scores as Record<string, number> | undefined;

  return {
    status: 'complete',
    validationStatus: englishDoc ? getValidationStatus(englishDoc, synthetic.scenario) : 'valid',
    data: {
      sectionId: 'englishProficiency',
      testType: visaData.english_test_type || 'IELTS Academic',
      testDate: englishDoc?.extracted_fields?.test_date || synthetic.application_date,
      overallScore: visaData.english_overall_score || 7.0,
      componentScores: componentScores || {
        listening: 7.0,
        reading: 7.0,
        writing: 6.5,
        speaking: 7.0,
      },
      requiredScores: {
        overall: 6.0,
        minimumComponent: 5.5,
      },
      document: englishDoc ? {
        type: 'english_test_report',
        fileName: englishDoc.file_name,
        uploadedAt: englishDoc.upload_timestamp,
        verificationStatus: 'verified',
      } : null,
    },
    updatedAt: englishDoc?.upload_timestamp || synthetic.application_date,
  };
}

/**
 * Create sponsorship and role section for worker visas
 */
function createSponsorshipAndRoleSection(synthetic: SyntheticApplication): ApplicationSection {
  const cosDoc = synthetic.documents.find(d => d.document_type === 'cos_letter');
  const visaData = synthetic.visa_specific_data as Record<string, unknown>;

  return {
    status: 'complete',
    validationStatus: cosDoc ? getValidationStatus(cosDoc, synthetic.scenario) : 'valid',
    data: {
      sectionId: 'sponsorshipAndRole',
      certificateOfSponsorship: {
        cosNumber: visaData.cos_number,
        status: 'Assigned',
        issueDate: synthetic.application_date,
      },
      localEmployer: {
        name: visaData.sponsor_name,
        sponsorLicenseNumber: visaData.sponsor_license_number,
      },
      localRole: {
        jobTitle: visaData.job_title,
        socCode: visaData.soc_code,
        salaryGbpAnnual: visaData.annual_salary,
        workHoursWeekly: visaData.working_hours,
        startDate: visaData.job_start_date,
      },
      overseasEmployment: visaData.overseas_employer ? {
        employerName: visaData.overseas_employer,
        startDate: visaData.overseas_employment_start,
        continuousEmploymentVerified: true,
      } : null,
    },
    updatedAt: cosDoc?.upload_timestamp || synthetic.application_date,
  };
}

/**
 * Create photo section (simulated)
 */
function createPhotoSection(synthetic: SyntheticApplication): ApplicationSection {
  const isFraudulent = synthetic.scenario === 'fraudulent';

  return {
    status: 'complete',
    validationStatus: isFraudulent ? 'invalid' : 'valid',
    data: {
      sectionId: 'photo',
      photoUrl: 'https://placehold.co/400x500/png?text=Visa+Photo',
      uploadTimestamp: synthetic.application_date,
      verificationChecks: {
        complianceCheck: {
          status: isFraudulent ? 'failed' : 'passed',
          checksPerformed: ['background', 'lighting', 'face_position', 'expression'],
          issuesFound: isFraudulent ? [{ check: 'background', message: 'Background not plain.' }] : [],
        },
        passportMatch: {
          status: isFraudulent ? 'no_match' : 'match',
          score: isFraudulent ? 45.2 : 94.5,
        },
        kycMatch: {
          status: isFraudulent ? 'no_match' : 'match',
          score: isFraudulent ? 38.1 : 92.3,
        },
        overallStatus: isFraudulent ? 'issues_found' : 'verified',
      },
    },
    updatedAt: synthetic.application_date,
  };
}

/**
 * Create all sections based on visa type
 */
function createSections(synthetic: SyntheticApplication): Record<string, ApplicationSection> {
  const sections: Record<string, ApplicationSection> = {};

  // Always include passport
  sections.passport = createPassportSection(synthetic);

  // Always include financial
  sections.financial = createFinancialSection(synthetic);

  // KYC section (simulated)
  sections.kyc = {
    status: 'complete',
    validationStatus: synthetic.scenario === 'fraudulent' ? 'invalid' : 'valid',
    data: {
      sectionId: 'kyc',
      livenessCheck: { passed: synthetic.scenario !== 'fraudulent', score: synthetic.scenario === 'fraudulent' ? 0.45 : 0.98 },
      faceMatch: { passed: synthetic.scenario !== 'fraudulent', score: synthetic.scenario === 'fraudulent' ? 0.52 : 0.96 },
      selfieImageUrl: 'https://placehold.co/400x400/png?text=Verified+Selfie',
      facematchScore: synthetic.scenario === 'fraudulent' ? 52.0 : 96.0,
      livenessScore: synthetic.scenario === 'fraudulent' ? 45.0 : 98.0,
    },
    updatedAt: synthetic.application_date,
  };

  // Always include residency
  sections.residency = createResidencySection(synthetic);

  // Always include photo section
  sections.photo = createPhotoSection(synthetic);

  // Visa-type specific sections
  switch (synthetic.visa_type) {
    case 'student_visa':
      sections.study = createEducationSection(synthetic);
      sections.cas = createCasSection(synthetic);
      sections.englishProficiency = createEnglishProficiencySection(synthetic);
      break;

    case 'skilled_worker_visa':
    case 'senior_specialist_worker_visa':
      sections.professional = createEmploymentSection(synthetic);
      sections.sponsorshipAndRole = createSponsorshipAndRoleSection(synthetic);
      break;

    case 'global_talent_visa':
      sections.professional = {
        status: 'complete',
        validationStatus: 'valid',
        data: {
          sectionId: 'professional',
          ...(synthetic.visa_specific_data as Record<string, unknown>),
        },
        updatedAt: synthetic.application_date,
      };
      break;

    case 'spouse_partner_visa':
      sections.family = createFamilySection(synthetic);
      break;

    case 'innovator_founder_visa':
      sections.business = {
        status: 'complete',
        validationStatus: 'valid',
        data: {
          sectionId: 'business',
          ...(synthetic.visa_specific_data as Record<string, unknown>),
        },
        updatedAt: synthetic.application_date,
      };
      break;
  }

  return sections;
}

/**
 * Create initial progress for a new application
 */
function createInitialProgress(): ApplicationProgress {
  const stages = [
    'DOCUMENT_UPLOAD',
    'INITIAL_REVIEW',
    'VERIFICATION',
    'DECISION',
  ];

  return {
    stageProgress: stages.map((stage, index) => ({
      stage,
      status: index === 0 ? 'completed' : index === 1 ? 'in_progress' : 'pending',
      completedAt: index === 0 ? new Date().toISOString() : null,
    })),
    overallProgress: 25,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Create initial timeline for a new application
 */
function createInitialTimeline(synthetic: SyntheticApplication): TimelineEvent[] {
  return [
    {
      id: `timeline-${synthetic.application_id}-1`,
      type: 'document_upload',
      description: 'Application submitted with documents',
      timestamp: synthetic.application_date,
      metadata: {
        documentCount: synthetic.documents.length,
      },
    },
    {
      id: `timeline-${synthetic.application_id}-2`,
      type: 'status_change',
      description: 'Application moved to queue for assignment',
      timestamp: new Date().toISOString(),
      metadata: {
        fromStatus: 'Submitted',
        toStatus: 'Pending Assignment',
      },
    },
  ];
}

/**
 * Transform synthetic application to LiveApplication (list view)
 */
export function transformToLiveApplication(synthetic: SyntheticApplication): LiveApplication {
  return {
    id: synthetic.application_id,
    applicantName: `${synthetic.applicant.first_name} ${synthetic.applicant.last_name}`,
    country: getCountryCode(synthetic.applicant.nationality),
    visaType: getVisaTypeDisplayName(synthetic.visa_type),
    category: getVisaCategory(synthetic.visa_type),
    submittedAt: formatRelativeTime(synthetic.application_date),
    status: 'Pending Assignment',
    flags: deriveFlags(synthetic),
  };
}

/**
 * Transform synthetic application to full ApplicationDetail
 */
export function transformToApplicationDetail(synthetic: SyntheticApplication): ApplicationDetail {
  const liveApp = transformToLiveApplication(synthetic);

  return {
    ...liveApp,
    userId: synthetic.applicant.application_id,
    visaTypeId: synthetic.visa_type,
    currentStage: 'INITIAL_REVIEW',
    processingType: determineProcessingType(synthetic),
    sections: createSections(synthetic),
    progress: createInitialProgress(),
    timeline: createInitialTimeline(synthetic),
    applicantDetails: {
      email: synthetic.applicant.email,
      emailVerified: true,
      phoneNumber: synthetic.applicant.phone,
      phoneVerified: true,
      name: `${synthetic.applicant.first_name} ${synthetic.applicant.last_name}`,
      givenNames: synthetic.applicant.first_name,
      surname: synthetic.applicant.last_name,
    },
    createdAt: synthetic.application_date,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate mock AI scan result based on synthetic scenario
 */
export function generateScanResult(synthetic: SyntheticApplication): AIScanResult {
  const issues: ScanIssue[] = [];
  const recommendations: ScanRecommendation[] = [];

  // Generate issues based on scenario
  if (synthetic.scenario === 'fraudulent') {
    issues.push({
      id: 'issue-1',
      sectionId: 'passport',
      type: 'suspicious',
      severity: 'critical',
      message: 'Document authenticity concerns detected',
    });
    recommendations.push({
      id: 'rec-1',
      relatedIssueIds: ['issue-1'],
      message: 'Escalate for manual document verification',
      actionType: 'escalate',
    });
  }

  if (synthetic.scenario === 'major_issues') {
    issues.push({
      id: 'issue-2',
      sectionId: 'financial',
      type: 'inconsistent',
      severity: 'high',
      message: 'Financial documentation shows inconsistencies',
    });
    recommendations.push({
      id: 'rec-2',
      relatedIssueIds: ['issue-2'],
      message: 'Request additional financial evidence',
      actionType: 'request_info',
    });
  }

  if (synthetic.scenario === 'minor_issues') {
    issues.push({
      id: 'issue-3',
      sectionId: 'professional',
      type: 'incomplete',
      severity: 'medium',
      message: 'Employment dates require verification',
    });
    recommendations.push({
      id: 'rec-3',
      relatedIssueIds: ['issue-3'],
      message: 'Verify employment history with sponsor',
      actionType: 'verify',
    });
  }

  // Calculate score based on scenario
  const scoreMap: Record<SyntheticScenario, number> = {
    'clean_approve': 95,
    'minor_issues': 75,
    'major_issues': 55,
    'fraudulent': 25,
    'edge_case': 65,
  };

  return {
    status: 'completed',
    scanStartedAt: synthetic.application_date,
    scanCompletedAt: new Date().toISOString(),
    isValid: synthetic.scenario === 'clean_approve' || synthetic.scenario === 'minor_issues',
    score: scoreMap[synthetic.scenario],
    rootednessScore: synthetic.scenario === 'clean_approve' ? 85 : 60,
    intentScore: synthetic.scenario === 'fraudulent' ? 30 : 80,
    issues,
    recommendations,
  };
}
