/**
 * Deep-set ApplicationDetail adapter (Slice 3a — header/sections).
 *
 * The reviewer page's HEADER and SECTION ACCORDION render the legacy
 * `ApplicationData` (fetched from /api/applications/:id → getApplicationById).
 * For ams-demo deep_set ids that endpoint returned null, so the page fell back
 * to the hardcoded `mockApplicationData` ("John James Doe / High Potential
 * Individual") — the SAME mock on every case. This maps the deep_set record →
 * a real per-applicant `ApplicationDetail` so the header and the Skilled-Worker
 * sections show the actual applicant being processed.
 *
 * Scope: the Skilled-Worker-relevant sections we can fill faithfully from the
 * corpus answers — passport, sponsorshipAndRole, financial, englishProficiency,
 * documents. (The DIS/OV panels are served separately by getDeepSetReview.)
 */
import type { ApplicationDetail, ApplicationSection } from '@/api-contracts/applications'
import { mapDisAlignedApp } from './disAlignedAdapter'

/* eslint-disable @typescript-eslint/no-explicit-any */

function sec(
  status: string,
  validationStatus: ApplicationSection['validationStatus'],
  data: Record<string, unknown>,
  updatedAt: string
): ApplicationSection {
  return { status, validationStatus, data, updatedAt }
}

/** "EMPLOYMENT_LETTER" → "Employment Letter", "PAYSLIPS" → "Payslips". */
function humanizeDocType(t: string): string {
  return String(t)
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function mapDeepSetApplicationDetail(raw: any): ApplicationDetail | null {
  if (!raw || typeof raw !== 'object' || typeof raw.source_application_id !== 'string') return null

  const base = mapDisAlignedApp(raw)
  const applicant = raw.applicant ?? {}
  const passport = raw.passport_data ?? {}
  const answers = raw.answers ?? {}
  const employment = answers.employment ?? {}
  const english = answers.englishLanguage ?? {}
  const documents: any[] = Array.isArray(raw.documents) ? raw.documents : []
  const assessments: any[] = Array.isArray(raw.document_assessments) ? raw.document_assessments : []
  const extractions: any[] = Array.isArray(raw?.dis_application_view?.document_extractions)
    ? raw.dis_application_view.document_extractions
    : []

  const givenNames = [applicant.first_name, applicant.middle_name].filter(Boolean).join(' ') || applicant.first_name || ''
  const surname = applicant.last_name ?? ''
  const fullName = `${givenNames} ${surname}`.trim()
  const submittedAt = String(raw.submitted_at ?? '')
  const visaTypeId = typeof raw.visa_type === 'string' ? raw.visa_type : 'skilled-worker' // hyphenated → "Skilled Worker"

  const sections: Record<string, ApplicationSection> = {}

  // --- Passport (carries the header name: givenNames + surname) ---
  sections.passport = sec('verified', 'valid', {
    sectionId: 'passport',
    documentNumber: passport.number ?? '',
    surname,
    givenNames,
    dateOfBirth: passport.date_of_birth ?? applicant.date_of_birth ?? '',
    dateOfExpiry: passport.expiry_date ?? '',
    nationality: passport.nationality ?? applicant.nationality_code ?? '',
    gender: passport.gender ?? applicant.gender ?? '',
    documentType: 'Passport',
    issuingCountry: passport.issuing_country ?? '',
    issueDate: passport.issue_date ?? '',
    mrzData: { line1: passport.mrz_line1 ?? '', line2: passport.mrz_line2 ?? '' },
    scanQuality: 'high',
    verificationNotes: raw?.biometric_verification?.mrz_check_passed
      ? 'MRZ checksum passed; identity verified at VAC.'
      : 'Identity verification on record.',
  }, submittedAt)

  // --- Sponsorship & Role (the Skilled Worker headline: CoS, sponsor, SOC) ---
  if (Object.keys(employment).length > 0) {
    sections.sponsorshipAndRole = sec('complete', 'valid', {
      sectionId: 'sponsorshipAndRole',
      certificateOfSponsorship: {
        cosNumber: employment.cosReferenceNumber ?? '',
        status: 'Assigned',
        issueDate: employment.cosIssueDate ?? '',
        expiryDate: employment.cosExpiryDate ?? '',
      },
      localEmployer: {
        name: employment.employerName ?? '',
        sponsorLicenseNumber: employment.sponsorLicenceNumber ?? '',
        sponsorRating: employment.sponsorRating ?? '',
      },
      localRole: {
        jobTitle: employment.jobTitle ?? '',
        socCode: employment.socCode ?? '',
        socTitle: employment.socTitle ?? '',
        salaryGbpAnnual: employment.annualIncome ?? null,
        goingRateGbpAnnual: employment.socGoingRateAnnual ?? null,
        workHoursWeekly: employment.hoursPerWeek ?? null,
        startDate: employment.startDate ?? '',
      },
    }, submittedAt)
  }

  // --- Financial (bank evidence — fields from the bank-statement extraction) ---
  const bankExtraction = extractions.find((e) => e.document_type === 'BANK_STATEMENT')
  const bf = bankExtraction?.normalised_fields ?? {}
  const bankDocs = documents.filter((d) => d.type === 'BANK_STATEMENT')
  sections.financial = sec('complete', 'valid', {
    sectionId: 'financial',
    bankName: bf.bank_name ?? 'Bank',
    accountHolderName: bf.account_holder_name ?? fullName,
    accountNumber: bf.account_number_last4 ? `••••${bf.account_number_last4}` : undefined,
    sortCode: bf.sort_code,
    currency: 'GBP',
    documents: bankDocs.map((d) => ({
      type: 'bank_statement',
      fileName: d.filename,
      fileUrl: d.signed_url,
      uploadedAt: d.uploaded_at,
      verificationStatus: 'verified',
    })),
  }, submittedAt)

  // --- English language proficiency (IELTS) ---
  if (Object.keys(english).length > 0) {
    sections.englishProficiency = sec('complete', 'valid', {
      sectionId: 'englishProficiency',
      testType: english.testType ?? '',
      testDate: english.testDate ?? '',
      testReportFormNumber: english.testReferenceNumber ?? '',
      overallScore: english.overallScore ?? null,
      componentScores: {
        listening: english.listeningScore ?? null,
        reading: english.readingScore ?? null,
        writing: english.writingScore ?? null,
        speaking: english.speakingScore ?? null,
      },
    }, submittedAt)
  }

  // --- Documents (the uploaded bundle + extraction status) ---
  if (documents.length > 0) {
    sections.documents = sec('complete', 'valid', {
      sectionId: 'documents',
      requiredDocumentsList: documents.map((d) => {
        const a = assessments.find((x) => x.document_id === d.document_id)
        return {
          docType: String(d.type ?? '').toLowerCase(),
          docTypeName: humanizeDocType(d.type ?? ''),
          status: 'uploaded',
          uploadedDocument: {
            type: String(d.type ?? '').toLowerCase(),
            fileName: d.filename,
            fileUrl: d.signed_url,
            uploadedAt: d.uploaded_at,
            verificationStatus: a?.extraction_status === 'EXTRACTED' ? 'verified' : 'pending',
          },
        }
      }),
    }, submittedAt)
  }

  return {
    ...base, // LiveApplication base incl. status: 'Received' (valid ApplicationStatus)
    visaTypeId,
    userId: '',
    currentStage: 'OFFICER_REVIEW',
    processingType: 'standard',
    sections,
    progress: {
      stageProgress: [],
      overallProgress: 100,
      lastUpdated: submittedAt,
    },
    timeline: [],
    applicantDetails: {
      name: fullName,
      givenNames,
      surname,
      email: applicant.email ?? undefined,
    },
    createdAt: submittedAt,
    updatedAt: submittedAt,
  }
}
