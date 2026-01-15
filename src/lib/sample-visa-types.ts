/**
 * Sample Visa Types Data
 * Based on ams-visabase schema structure
 * Used for demo/development purposes
 */

import { VisaTypeConfig, VisaCategory } from '@/types/visaType'
import { createDefaultVisaKeyConfig, DEFAULT_PROCESSING_TIERS } from '@/lib/visakey-stages'

// Visa Categories with metadata
export interface VisaCategoryInfo {
  id: string
  name: string
  description: string
  icon: string
  count: number
  color: string
}

export const VISA_CATEGORIES: VisaCategoryInfo[] = [
  {
    id: 'work',
    name: 'Work Visas',
    description: 'Employment-based immigration for skilled workers, professionals, and specialists',
    icon: 'Briefcase',
    count: 5,
    color: 'blue'
  },
  {
    id: 'tourist',
    name: 'Tourist Visas',
    description: 'Short-term visas for tourism, leisure, and visiting friends/family',
    icon: 'Plane',
    count: 3,
    color: 'green'
  },
  {
    id: 'student',
    name: 'Student Visas',
    description: 'Visas for international students pursuing education',
    icon: 'GraduationCap',
    count: 2,
    color: 'purple'
  },
  {
    id: 'business',
    name: 'Business Visas',
    description: 'Visas for business meetings, conferences, and short-term assignments',
    icon: 'Building2',
    count: 2,
    color: 'orange'
  },
  {
    id: 'family',
    name: 'Family Visas',
    description: 'Visas for family reunification and dependent immigration',
    icon: 'Users',
    count: 2,
    color: 'pink'
  },
  {
    id: 'investor',
    name: 'Investor Visas',
    description: 'Visas for investors and entrepreneurs bringing capital',
    icon: 'TrendingUp',
    count: 1,
    color: 'amber'
  }
]

// Sample Visa Types
export const SAMPLE_VISA_TYPES: VisaTypeConfig[] = [
  // UK Work Visas
  {
    name: "Skilled Worker Visa",
    visaCode: "UK-SWV",
    category: "work",
    description: "For workers who have been offered a skilled job in the UK by a licensed sponsor. This is the main route for skilled migration to the UK.",
    country: "United Kingdom",
    eVisaAvailable: false,
    eligibilityCriteria: [
      {
        name: "Job Offer from Licensed Sponsor",
        required: true,
        description: "Must have a valid job offer from a UK employer with a sponsor licence",
        supportingDocuments: ["Certificate of Sponsorship (CoS)"]
      },
      {
        name: "Skill Level",
        required: true,
        description: "Job must be at RQF Level 3 or above (A-Level equivalent)",
        minimumScore: null
      },
      {
        name: "English Language",
        required: true,
        description: "Must prove English language ability at B1 CEFR level",
        minimumScore: 4,
        supportingDocuments: ["IELTS certificate", "TOEFL score", "Degree taught in English"]
      },
      {
        name: "Salary Threshold",
        required: true,
        description: "Must meet minimum salary of £26,200 or going rate for occupation",
        minimumScore: null
      }
    ],
    kycRequirements: [
      { kycType: "Passport verification", required: true, description: "Valid passport check" },
      { kycType: "Identity verification", required: true, description: "Biometric identity verification" },
      { kycType: "Liveness Check", required: true, description: "Live selfie verification" },
      { kycType: "Criminal Record Check", required: true, description: "Police clearance from countries lived 12+ months" },
      { kycType: "Background Check", required: false, description: "Employment history verification" }
    ],
    documentsRequirements: [
      { name: "Certificate of Sponsorship", required: true, description: "CoS reference number from sponsor", format: "Reference Number" },
      { name: "Proof of English", required: true, description: "IELTS, TOEFL or approved test", format: "PDF/JPEG" },
      { name: "Bank Statements", required: true, description: "£1,270 held for 28 days", format: "PDF" },
      { name: "TB Test Certificate", required: false, description: "Required for certain nationalities", format: "PDF" }
    ],
    processingTier: [
      { type: "standard", timeframe: "2-3 weeks", visaCost: { amount: 719, currency: "GBP" }, additionalCosts: [{ description: "Immigration Health Surcharge (per year)", amount: 1035, currency: "GBP" }] },
      { type: "priority", timeframe: "5-7 days", visaCost: { amount: 719, currency: "GBP" }, additionalCosts: [{ description: "Priority fee", amount: 500, currency: "GBP" }, { description: "IHS (per year)", amount: 1035, currency: "GBP" }] },
      { type: "premium", timeframe: "24-48 hours", visaCost: { amount: 719, currency: "GBP" }, additionalCosts: [{ description: "Super Priority fee", amount: 1000, currency: "GBP" }, { description: "IHS (per year)", amount: 1035, currency: "GBP" }] }
    ],
    processingInfo: { generalTimeframe: "3-8 weeks standard", additionalInfo: "Biometric appointment required" },
    metadata: { validityPeriod: 60, maxExtensions: 2, processingTimeAvg: 21, successRate: 89 },
    isActive: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-12-01T14:30:00Z",
    // VisaKey enabled - fast-track processing with enhanced verification
    visaKey: {
      enabled: true,
      fixedStages: [
        { stageId: 'ELIGIBILITY_CHECK', enabled: true, order: 0 },
        { stageId: 'VISA_SELECTION', enabled: true, order: 1 },
        { stageId: 'SMS_VERIFICATION', enabled: true, order: 2 },
        { stageId: 'PASSPORT_UPLOAD', enabled: true, order: 3 },
        { stageId: 'KYC_LIVENESS', enabled: true, order: 4 },
        { stageId: 'RESIDENCY_INFO', enabled: true, order: 5 },
        { stageId: 'EXISTING_VISAS', enabled: true, order: 6 },
        { stageId: 'PHOTO_UPLOAD', enabled: true, order: 7 },
        { stageId: 'PROFESSIONAL_INFO', enabled: true, order: 8 },
        { stageId: 'FINANCIAL_INFO', enabled: true, order: 9 },
      ],
      conditionalStages: [
        { stageId: 'TRAVEL_DETAILS', enabled: false, order: 0 },
        { stageId: 'TRAVEL_INSURANCE', enabled: false, order: 1 },
        { stageId: 'STUDENT_INFO', enabled: false, order: 2 },
        { stageId: 'RELIGION_WORKER_INFO', enabled: false, order: 3 },
        { stageId: 'MEDICAL_WORKER_INFO', enabled: false, order: 4 },
        { stageId: 'DYNAMIC_DOCUMENTS_UPLOAD', enabled: true, order: 5 },
      ],
      finalStages: [
        { stageId: 'REVIEW_AND_CONFIRM', enabled: true, order: 0 },
        { stageId: 'PAYMENT', enabled: true, order: 1 },
        { stageId: 'SUBMISSION', enabled: true, order: 2 },
      ],
      processingPath: 'standard',
      processingTiers: [
        { id: 'priority', name: 'Priority Processing', timeframe: '24-48 hours', price: 500, currency: 'GBP', description: 'Fastest processing', enabled: true },
        { id: 'premium', name: 'Premium Processing', timeframe: '3-5 business days', price: 250, currency: 'GBP', description: 'Expedited processing', enabled: true },
        { id: 'standard', name: 'Standard Processing', timeframe: '10-15 business days', price: 0, currency: 'GBP', description: 'Standard timeline', enabled: true },
      ],
    }
  },
  {
    name: "Global Talent Visa",
    visaCode: "UK-GTV",
    category: "work",
    description: "For leaders or potential leaders in academia, research, arts, culture, and digital technology.",
    country: "United Kingdom",
    eVisaAvailable: false,
    eligibilityCriteria: [
      { name: "Endorsement", required: true, description: "Must be endorsed by a designated competent body", supportingDocuments: ["Endorsement letter"] },
      { name: "Exceptional Talent/Promise", required: true, description: "Must demonstrate exceptional talent or exceptional promise in your field", minimumScore: null }
    ],
    kycRequirements: [
      { kycType: "Passport verification", required: true, description: "Valid passport" },
      { kycType: "Identity verification", required: true, description: "Biometric verification" },
      { kycType: "Liveness Check", required: true, description: "Live verification" }
    ],
    documentsRequirements: [
      { name: "Endorsement Letter", required: true, description: "From Tech Nation, Arts Council, UKRI, or Royal Society", format: "PDF" },
      { name: "Evidence Portfolio", required: true, description: "CV, publications, awards, media coverage", format: "PDF" }
    ],
    processingTier: [
      { type: "standard", timeframe: "2-3 weeks", visaCost: { amount: 716, currency: "GBP" }, additionalCosts: [] },
      { type: "priority", timeframe: "5-7 days", visaCost: { amount: 716, currency: "GBP" }, additionalCosts: [{ description: "Priority fee", amount: 500, currency: "GBP" }] }
    ],
    processingInfo: { generalTimeframe: "8 weeks for endorsement + 3 weeks for visa", additionalInfo: "Two-stage process: endorsement then visa" },
    metadata: { validityPeriod: 60, maxExtensions: null, processingTimeAvg: 56, successRate: 72 },
    isActive: true,
    createdAt: "2024-02-20T09:00:00Z",
    updatedAt: "2024-11-15T11:00:00Z"
  },
  {
    name: "Health and Care Worker Visa",
    visaCode: "UK-HCW",
    category: "work",
    description: "Fast-track visa for qualified doctors, nurses, and health professionals with NHS or social care job offers.",
    country: "United Kingdom",
    eVisaAvailable: false,
    eligibilityCriteria: [
      { name: "Healthcare Job Offer", required: true, description: "Job in eligible healthcare occupation with licensed sponsor", supportingDocuments: ["Certificate of Sponsorship"] },
      { name: "Professional Registration", required: true, description: "Must have relevant professional registration (NMC, GMC, etc.)", supportingDocuments: ["Registration certificate"] },
      { name: "English Language", required: true, description: "B1 level or higher", minimumScore: 4 }
    ],
    kycRequirements: [
      { kycType: "Passport verification", required: true, description: "Valid passport" },
      { kycType: "Identity verification", required: true, description: "Biometric identity check" },
      { kycType: "Verification of medical qualifications", required: true, description: "Professional qualification verification" },
      { kycType: "Criminal Record Check", required: true, description: "DBS check equivalent" }
    ],
    documentsRequirements: [
      { name: "Certificate of Sponsorship", required: true, description: "From NHS trust or social care provider", format: "Reference Number" },
      { name: "Professional Registration", required: true, description: "NMC PIN, GMC number, or equivalent", format: "PDF" },
      { name: "Qualifications", required: true, description: "Medical/nursing degree certificates", format: "PDF" }
    ],
    processingTier: [
      { type: "standard", timeframe: "2-3 weeks", visaCost: { amount: 284, currency: "GBP" }, additionalCosts: [] },
      { type: "priority", timeframe: "5-7 days", visaCost: { amount: 284, currency: "GBP" }, additionalCosts: [{ description: "Priority fee", amount: 500, currency: "GBP" }] }
    ],
    processingInfo: { generalTimeframe: "3 weeks standard", additionalInfo: "Reduced visa fee, no IHS required" },
    metadata: { validityPeriod: 60, maxExtensions: 2, processingTimeAvg: 14, successRate: 94 },
    isActive: true,
    createdAt: "2024-03-10T08:00:00Z",
    updatedAt: "2024-10-20T16:00:00Z"
  },

  // Tourist Visas
  {
    name: "Standard Visitor Visa",
    visaCode: "UK-SVV",
    category: "tourist",
    description: "For tourism, visiting family/friends, business meetings, or short courses up to 6 months.",
    country: "United Kingdom",
    eVisaAvailable: false,
    eligibilityCriteria: [
      { name: "Genuine Visitor Intent", required: true, description: "Must intend to leave UK at end of visit", minimumScore: null },
      { name: "Financial Means", required: true, description: "Sufficient funds for trip without working", supportingDocuments: ["Bank statements", "Sponsor letter"] },
      { name: "Ties to Home Country", required: true, description: "Must demonstrate strong ties to return home", supportingDocuments: ["Employment letter", "Property documents"] }
    ],
    kycRequirements: [
      { kycType: "Passport verification", required: true, description: "Valid for duration of stay" },
      { kycType: "Identity verification", required: true, description: "Biometric check" }
    ],
    documentsRequirements: [
      { name: "Travel Itinerary", required: true, description: "Flight bookings, accommodation", format: "PDF" },
      { name: "Bank Statements", required: true, description: "3-6 months statements", format: "PDF" },
      { name: "Employment Letter", required: false, description: "Confirming job and approved leave", format: "PDF" },
      { name: "Invitation Letter", required: false, description: "If visiting friends/family", format: "PDF" }
    ],
    processingTier: [
      { type: "standard", timeframe: "2-3 weeks", visaCost: { amount: 115, currency: "GBP" }, additionalCosts: [] },
      { type: "priority", timeframe: "5-7 days", visaCost: { amount: 115, currency: "GBP" }, additionalCosts: [{ description: "Priority fee", amount: 250, currency: "GBP" }] }
    ],
    processingInfo: { generalTimeframe: "15 working days", additionalInfo: "Apply up to 3 months before travel" },
    metadata: { validityPeriod: 6, maxExtensions: 0, processingTimeAvg: 15, successRate: 85 },
    isActive: true,
    createdAt: "2024-01-05T12:00:00Z",
    updatedAt: "2024-09-30T10:00:00Z"
  },
  {
    name: "Electronic Travel Authorisation (ETA)",
    visaCode: "UK-ETA",
    category: "tourist",
    description: "Digital travel permission for visa-exempt nationals visiting the UK for tourism or business.",
    country: "United Kingdom",
    eVisaAvailable: true,
    eligibilityCriteria: [
      { name: "Eligible Nationality", required: true, description: "Must be from ETA-eligible country", minimumScore: null },
      { name: "Valid Passport", required: true, description: "Biometric passport required", supportingDocuments: ["Passport"] },
      { name: "No Immigration Violations", required: true, description: "Clean immigration history", minimumScore: null }
    ],
    kycRequirements: [
      { kycType: "Passport verification", required: true, description: "Biometric passport scan" },
      { kycType: "Identity verification", required: true, description: "Photo verification" }
    ],
    documentsRequirements: [
      { name: "Passport Photo Page", required: true, description: "Clear scan of biodata page", format: "JPEG/PNG" },
      { name: "Selfie Photo", required: true, description: "Recent photo for matching", format: "JPEG/PNG" }
    ],
    processingTier: [
      { type: "standard", timeframe: "24-48 hours", visaCost: { amount: 10, currency: "GBP" }, additionalCosts: [] }
    ],
    processingInfo: { generalTimeframe: "Usually within 3 working days", additionalInfo: "Apply via UK ETA app" },
    metadata: { validityPeriod: 24, maxExtensions: 0, processingTimeAvg: 1, successRate: 98 },
    isActive: true,
    createdAt: "2024-04-01T00:00:00Z",
    updatedAt: "2024-12-10T09:00:00Z"
  },

  // Student Visas
  {
    name: "Student Visa",
    visaCode: "UK-STU",
    category: "student",
    description: "For international students studying at a licensed UK education institution for courses longer than 6 months.",
    country: "United Kingdom",
    eVisaAvailable: false,
    eligibilityCriteria: [
      { name: "Confirmation of Acceptance for Studies", required: true, description: "CAS from licensed student sponsor", supportingDocuments: ["CAS reference number"] },
      { name: "English Language", required: true, description: "CEFR B2 level for degree courses", minimumScore: 5.5 },
      { name: "Financial Requirement", required: true, description: "Tuition fees + living costs for 9 months", supportingDocuments: ["Bank statements", "Sponsor letter"] },
      { name: "Genuine Student Test", required: true, description: "Must demonstrate genuine intent to study", minimumScore: null }
    ],
    kycRequirements: [
      { kycType: "Passport verification", required: true, description: "Valid passport" },
      { kycType: "Identity verification", required: true, description: "Biometric enrollment" },
      { kycType: "Student status check", required: true, description: "Previous study verification" }
    ],
    documentsRequirements: [
      { name: "CAS Reference", required: true, description: "Confirmation of Acceptance for Studies", format: "Reference Number" },
      { name: "IELTS/English Test", required: true, description: "Meeting required score", format: "PDF" },
      { name: "Bank Statements", required: true, description: "28 days evidence of funds", format: "PDF" },
      { name: "Academic Transcripts", required: true, description: "Previous qualifications", format: "PDF" },
      { name: "TB Test Certificate", required: false, description: "If from listed country", format: "PDF" }
    ],
    processingTier: [
      { type: "standard", timeframe: "2-3 weeks", visaCost: { amount: 490, currency: "GBP" }, additionalCosts: [{ description: "Immigration Health Surcharge (per year)", amount: 776, currency: "GBP" }] },
      { type: "priority", timeframe: "5-7 days", visaCost: { amount: 490, currency: "GBP" }, additionalCosts: [{ description: "Priority fee", amount: 500, currency: "GBP" }, { description: "IHS (per year)", amount: 776, currency: "GBP" }] }
    ],
    processingInfo: { generalTimeframe: "3 weeks from outside UK", additionalInfo: "Can apply up to 6 months before course start" },
    metadata: { validityPeriod: 48, maxExtensions: 1, processingTimeAvg: 21, successRate: 91 },
    isActive: true,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-11-25T15:00:00Z"
  },

  // Business Visas
  {
    name: "Innovator Founder Visa",
    visaCode: "UK-IFV",
    category: "business",
    description: "For experienced entrepreneurs wanting to establish an innovative business in the UK.",
    country: "United Kingdom",
    eVisaAvailable: false,
    eligibilityCriteria: [
      { name: "Endorsement", required: true, description: "From approved endorsing body", supportingDocuments: ["Endorsement letter"] },
      { name: "Business Plan", required: true, description: "Innovative, viable, and scalable business idea", supportingDocuments: ["Business plan document"] },
      { name: "Investment Funds", required: true, description: "At least £50,000 available or viable funding strategy", supportingDocuments: ["Bank statements", "Investment agreement"] }
    ],
    kycRequirements: [
      { kycType: "Passport verification", required: true, description: "Valid passport" },
      { kycType: "Identity verification", required: true, description: "Biometric check" },
      { kycType: "Business Check", required: true, description: "Business background verification" }
    ],
    documentsRequirements: [
      { name: "Endorsement Letter", required: true, description: "From Home Office approved body", format: "PDF" },
      { name: "Business Plan", required: true, description: "Detailed 3-year business plan", format: "PDF" },
      { name: "Financial Evidence", required: true, description: "£50,000 investment or funding proof", format: "PDF" }
    ],
    processingTier: [
      { type: "standard", timeframe: "2-3 weeks", visaCost: { amount: 1486, currency: "GBP" }, additionalCosts: [{ description: "IHS (per year)", amount: 1035, currency: "GBP" }] }
    ],
    processingInfo: { generalTimeframe: "8 weeks for endorsement + 3 weeks visa", additionalInfo: "Two-stage application process" },
    metadata: { validityPeriod: 36, maxExtensions: 1, processingTimeAvg: 56, successRate: 65 },
    isActive: true,
    createdAt: "2024-03-15T11:00:00Z",
    updatedAt: "2024-10-05T14:00:00Z"
  },

  // Family Visas
  {
    name: "Spouse/Partner Visa",
    visaCode: "UK-SPV",
    category: "family",
    description: "For partners of British citizens or settled persons to live together in the UK.",
    country: "United Kingdom",
    eVisaAvailable: false,
    eligibilityCriteria: [
      { name: "Genuine Relationship", required: true, description: "Must prove genuine and subsisting relationship", supportingDocuments: ["Photos", "Communication evidence", "Joint finances"] },
      { name: "Financial Requirement", required: true, description: "Sponsor must earn £29,000+ or have savings", supportingDocuments: ["Payslips", "Bank statements", "Tax returns"] },
      { name: "English Language", required: true, description: "A1 level for initial application", minimumScore: null },
      { name: "Adequate Accommodation", required: true, description: "Suitable accommodation without public funds", supportingDocuments: ["Tenancy agreement", "Mortgage statement"] }
    ],
    kycRequirements: [
      { kycType: "Passport verification", required: true, description: "Valid passports for both parties" },
      { kycType: "Identity verification", required: true, description: "Biometric enrollment" },
      { kycType: "Background Check", required: true, description: "Character and immigration history" }
    ],
    documentsRequirements: [
      { name: "Relationship Evidence", required: true, description: "Photos, messages, travel together", format: "PDF/JPEG" },
      { name: "Financial Documents", required: true, description: "6 months payslips, P60, bank statements", format: "PDF" },
      { name: "Accommodation Proof", required: true, description: "Property documents", format: "PDF" },
      { name: "English Test Certificate", required: true, description: "A1 level test result", format: "PDF" },
      { name: "Marriage/Civil Partnership Certificate", required: true, description: "Or evidence of 2-year cohabitation", format: "PDF" }
    ],
    processingTier: [
      { type: "standard", timeframe: "12 weeks", visaCost: { amount: 1846, currency: "GBP" }, additionalCosts: [{ description: "IHS (per year)", amount: 1035, currency: "GBP" }] },
      { type: "priority", timeframe: "6 weeks", visaCost: { amount: 1846, currency: "GBP" }, additionalCosts: [{ description: "Priority fee", amount: 573, currency: "GBP" }, { description: "IHS (per year)", amount: 1035, currency: "GBP" }] }
    ],
    processingInfo: { generalTimeframe: "12 weeks from outside UK", additionalInfo: "Initial 33-month visa, then extend for ILR route" },
    metadata: { validityPeriod: 33, maxExtensions: 1, processingTimeAvg: 60, successRate: 78 },
    isActive: true,
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-11-10T12:00:00Z"
  },

  // US Work Visa (example of non-UK)
  {
    name: "H-1B Specialty Occupation",
    visaCode: "US-H1B",
    category: "work",
    description: "For workers in specialty occupations requiring theoretical or technical expertise in a specialized field.",
    country: "United States",
    eVisaAvailable: false,
    eligibilityCriteria: [
      { name: "Bachelor's Degree", required: true, description: "Minimum bachelor's degree in related field", supportingDocuments: ["Degree certificate", "Transcripts"] },
      { name: "Job Offer", required: true, description: "From US employer for specialty occupation", supportingDocuments: ["Offer letter", "LCA"] },
      { name: "Employer Petition", required: true, description: "USCIS approved Form I-129 petition", supportingDocuments: ["I-129 approval notice"] }
    ],
    kycRequirements: [
      { kycType: "Passport verification", required: true, description: "Valid passport" },
      { kycType: "Identity verification", required: true, description: "Biometric enrollment at embassy" },
      { kycType: "Background Check", required: true, description: "Security and criminal check" }
    ],
    documentsRequirements: [
      { name: "Form DS-160", required: true, description: "Online visa application", format: "Online" },
      { name: "I-129 Approval Notice", required: true, description: "USCIS approval", format: "PDF" },
      { name: "Degree Certificates", required: true, description: "Educational qualifications", format: "PDF" },
      { name: "Resume/CV", required: true, description: "Work experience details", format: "PDF" }
    ],
    processingTier: [
      { type: "standard", timeframe: "1-3 months", visaCost: { amount: 190, currency: "USD" }, additionalCosts: [{ description: "USCIS Filing Fee", amount: 460, currency: "USD" }, { description: "Fraud Prevention Fee", amount: 500, currency: "USD" }] },
      { type: "premium", timeframe: "15 days", visaCost: { amount: 190, currency: "USD" }, additionalCosts: [{ description: "Premium Processing", amount: 2805, currency: "USD" }, { description: "USCIS Filing Fee", amount: 460, currency: "USD" }] }
    ],
    processingInfo: { generalTimeframe: "3-6 months standard", additionalInfo: "Annual cap of 85,000 visas, lottery system applies" },
    metadata: { validityPeriod: 36, maxExtensions: 1, processingTimeAvg: 90, successRate: 70 },
    isActive: true,
    createdAt: "2024-04-10T10:00:00Z",
    updatedAt: "2024-12-01T08:00:00Z"
  },

  // UK Global Business Mobility
  {
    name: "Senior or Specialist Worker Visa",
    visaCode: "UK-SSW",
    category: "work",
    description: "For senior managers and specialist employees transferring to a UK branch of their employer. Part of the Global Business Mobility route, replacing the former Intra-company Transfer visa.",
    country: "United Kingdom",
    eVisaAvailable: false,
    eligibilityCriteria: [
      {
        name: "Existing Employment",
        required: true,
        description: "Must be an existing employee of an organisation approved as a Home Office sponsor",
        supportingDocuments: ["Certificate of Sponsorship", "Employment contract"]
      },
      {
        name: "Eligible Occupation",
        required: true,
        description: "Job must be on the eligible occupations list",
        supportingDocuments: ["Job description", "SOC code documentation"]
      },
      {
        name: "Minimum Salary",
        required: true,
        description: "Must earn at least £52,500 per year or the going rate for the occupation (whichever is higher)",
        minimumScore: null
      },
      {
        name: "Employment Duration (if under £73,900)",
        required: false,
        description: "If earning under £73,900/year, must have worked for employer outside UK for minimum 12 months",
        supportingDocuments: ["Employment history", "Payslips"]
      }
    ],
    kycRequirements: [
      { kycType: "Passport verification", required: true, description: "Valid passport or travel document" },
      { kycType: "Identity verification", required: true, description: "Biometric enrollment" },
      { kycType: "TB Test", required: false, description: "Required if from designated country" },
      { kycType: "Criminal Record Check", required: true, description: "Character requirements check" }
    ],
    documentsRequirements: [
      { name: "Certificate of Sponsorship", required: true, description: "CoS reference number from licensed sponsor", format: "Reference Number" },
      { name: "Proof of Salary", required: true, description: "Job title, occupation code, and annual salary confirmation", format: "PDF" },
      { name: "Bank Statements", required: true, description: "£1,270 held for 28 days (unless employer certifies)", format: "PDF" },
      { name: "TB Test Certificate", required: false, description: "If from designated country", format: "PDF" },
      { name: "Relationship Documents", required: false, description: "If bringing dependants", format: "PDF" }
    ],
    processingTier: [
      { type: "standard", timeframe: "3 weeks", visaCost: { amount: 769, currency: "GBP" }, additionalCosts: [{ description: "Immigration Health Surcharge (per year)", amount: 1035, currency: "GBP" }] },
      { type: "priority", timeframe: "5-7 days", visaCost: { amount: 769, currency: "GBP" }, additionalCosts: [{ description: "Priority fee", amount: 500, currency: "GBP" }, { description: "IHS (per year)", amount: 1035, currency: "GBP" }] }
    ],
    processingInfo: {
      generalTimeframe: "3 weeks from outside UK, 8 weeks from inside UK",
      additionalInfo: "Maximum stay: 5 years in 6-year period (under £73,900) or 9 years in 10-year period (£73,900+). Cannot lead to settlement."
    },
    metadata: { validityPeriod: 60, maxExtensions: 2, processingTimeAvg: 21, successRate: 87 },
    isActive: true,
    createdAt: "2024-05-01T10:00:00Z",
    updatedAt: "2024-12-15T09:00:00Z"
  },

  // German Business Visas
  {
    name: "German Entrepreneur Visa",
    visaCode: "DE-ENT",
    category: "business",
    description: "For entrepreneurs and self-employed individuals who want to start or run a business in Germany. Requires approval of business plan by local authorities.",
    country: "Germany",
    eVisaAvailable: false,
    eligibilityCriteria: [
      {
        name: "Viable Business Plan",
        required: true,
        description: "Business must serve economic interest or regional need in Germany",
        supportingDocuments: ["Business plan", "Financial projections"]
      },
      {
        name: "Sufficient Capital",
        required: true,
        description: "Must demonstrate adequate funding for business and personal living expenses",
        supportingDocuments: ["Bank statements", "Investment agreements", "Loan approvals"]
      },
      {
        name: "Professional Experience",
        required: true,
        description: "Relevant experience and qualifications for the business sector",
        supportingDocuments: ["CV", "Professional certificates", "Previous business records"]
      },
      {
        name: "Health Insurance",
        required: true,
        description: "Must have valid health insurance coverage in Germany",
        supportingDocuments: ["Health insurance certificate"]
      }
    ],
    kycRequirements: [
      { kycType: "Passport verification", required: true, description: "Valid passport with 2 blank pages" },
      { kycType: "Identity verification", required: true, description: "Biometric photo and fingerprints" },
      { kycType: "Business Check", required: true, description: "Business viability assessment by Chamber of Commerce" },
      { kycType: "Background Check", required: true, description: "Criminal record clearance" }
    ],
    documentsRequirements: [
      { name: "Business Plan", required: true, description: "Detailed plan including market analysis, financial projections for 3 years", format: "PDF" },
      { name: "Proof of Capital", required: true, description: "Bank statements, investment commitments, minimum €50,000 recommended", format: "PDF" },
      { name: "CV/Resume", required: true, description: "Professional experience in relevant field", format: "PDF" },
      { name: "Professional Qualifications", required: true, description: "Degrees, certifications, business licenses", format: "PDF" },
      { name: "Health Insurance", required: true, description: "Coverage valid in Germany", format: "PDF" },
      { name: "Proof of Accommodation", required: true, description: "Rental contract or hotel booking", format: "PDF" }
    ],
    processingTier: [
      { type: "standard", timeframe: "4-12 weeks", visaCost: { amount: 75, currency: "EUR" }, additionalCosts: [{ description: "Business registration fees", amount: 200, currency: "EUR" }] }
    ],
    processingInfo: {
      generalTimeframe: "4-12 weeks depending on business complexity",
      additionalInfo: "Requires approval from local Foreigners Authority (Ausländerbehörde) and Chamber of Commerce (IHK). Initial permit usually 1-3 years."
    },
    metadata: { validityPeriod: 36, maxExtensions: 2, processingTimeAvg: 56, successRate: 68 },
    isActive: true,
    createdAt: "2024-06-01T10:00:00Z",
    updatedAt: "2024-12-10T14:00:00Z"
  },
  {
    name: "German Investor Visa",
    visaCode: "DE-INV",
    category: "investor",
    description: "For high-net-worth individuals making significant investments in German businesses or real estate. Offers pathway to permanent residence.",
    country: "Germany",
    eVisaAvailable: false,
    eligibilityCriteria: [
      {
        name: "Substantial Investment",
        required: true,
        description: "Significant capital investment in German economy (typically €250,000+ for business investment)",
        supportingDocuments: ["Investment proof", "Bank statements", "Investment contracts"]
      },
      {
        name: "Economic Benefit",
        required: true,
        description: "Investment must create jobs or benefit the German economy",
        supportingDocuments: ["Business plan", "Job creation projections"]
      },
      {
        name: "Legal Source of Funds",
        required: true,
        description: "Must prove legitimate origin of investment capital",
        supportingDocuments: ["Tax returns", "Asset documentation", "Source of wealth statement"]
      },
      {
        name: "Health Insurance",
        required: true,
        description: "Comprehensive health insurance valid in Germany",
        supportingDocuments: ["Insurance certificate"]
      }
    ],
    kycRequirements: [
      { kycType: "Passport verification", required: true, description: "Valid passport" },
      { kycType: "Identity verification", required: true, description: "Biometric verification" },
      { kycType: "Source of Wealth Check", required: true, description: "AML verification of funds" },
      { kycType: "Background Check", required: true, description: "Criminal record and security check" }
    ],
    documentsRequirements: [
      { name: "Investment Documentation", required: true, description: "Contracts, property deeds, share certificates", format: "PDF" },
      { name: "Source of Funds Proof", required: true, description: "Tax returns, business accounts, asset sales", format: "PDF" },
      { name: "Business Plan", required: false, description: "If investing in active business", format: "PDF" },
      { name: "Bank Reference Letter", required: true, description: "From established financial institution", format: "PDF" },
      { name: "Health Insurance", required: true, description: "Private insurance certificate", format: "PDF" },
      { name: "Clean Criminal Record", required: true, description: "Police clearance from country of residence", format: "PDF" }
    ],
    processingTier: [
      { type: "standard", timeframe: "6-12 weeks", visaCost: { amount: 75, currency: "EUR" }, additionalCosts: [{ description: "Legal/advisory fees (estimated)", amount: 5000, currency: "EUR" }] }
    ],
    processingInfo: {
      generalTimeframe: "6-12 weeks, complex cases may take longer",
      additionalInfo: "Initial residence permit 1-3 years. Pathway to permanent residence (Niederlassungserlaubnis) after 3-5 years. No minimum investment legally required but €250,000+ typically expected."
    },
    metadata: { validityPeriod: 36, maxExtensions: 2, processingTimeAvg: 70, successRate: 75 },
    isActive: true,
    createdAt: "2024-06-15T11:00:00Z",
    updatedAt: "2024-12-12T10:00:00Z",
    // VisaKey enabled with insurance requirements for investor visa
    visaKey: {
      enabled: true,
      fixedStages: [
        { stageId: 'ELIGIBILITY_CHECK', enabled: true, order: 0 },
        { stageId: 'VISA_SELECTION', enabled: true, order: 1 },
        { stageId: 'SMS_VERIFICATION', enabled: true, order: 2 },
        { stageId: 'PASSPORT_UPLOAD', enabled: true, order: 3 },
        { stageId: 'KYC_LIVENESS', enabled: true, order: 4 },
        { stageId: 'RESIDENCY_INFO', enabled: true, order: 5 },
        { stageId: 'EXISTING_VISAS', enabled: true, order: 6 },
        { stageId: 'PHOTO_UPLOAD', enabled: true, order: 7 },
        { stageId: 'PROFESSIONAL_INFO', enabled: true, order: 8 },
        { stageId: 'FINANCIAL_INFO', enabled: true, order: 9 },
      ],
      conditionalStages: [
        { stageId: 'TRAVEL_DETAILS', enabled: true, order: 0 },
        { stageId: 'TRAVEL_INSURANCE', enabled: true, order: 1 },
        { stageId: 'STUDENT_INFO', enabled: false, order: 2 },
        { stageId: 'RELIGION_WORKER_INFO', enabled: false, order: 3 },
        { stageId: 'MEDICAL_WORKER_INFO', enabled: false, order: 4 },
        { stageId: 'DYNAMIC_DOCUMENTS_UPLOAD', enabled: true, order: 5 },
      ],
      finalStages: [
        { stageId: 'REVIEW_AND_CONFIRM', enabled: true, order: 0 },
        { stageId: 'PAYMENT', enabled: true, order: 1 },
        { stageId: 'SUBMISSION', enabled: true, order: 2 },
      ],
      processingPath: 'standard',
      processingTiers: [
        { id: 'priority', name: 'Priority Processing', timeframe: '48-72 hours', price: 800, currency: 'EUR', description: 'Fastest processing for investors', enabled: true },
        { id: 'premium', name: 'Premium Processing', timeframe: '5-7 business days', price: 400, currency: 'EUR', description: 'Expedited processing', enabled: true },
        { id: 'standard', name: 'Standard Processing', timeframe: '2-3 weeks', price: 0, currency: 'EUR', description: 'Standard timeline', enabled: true },
      ],
      insuranceRequirements: {
        required: true,
        minimumCoverage: 30000,
        coverageCurrency: 'EUR',
        requirements: {
          medicalInsurance: true,
          emergencyEvacuation: true,
          repatriation: true,
          personalLiability: true,
          tripCancellation: false,
          luggageLoss: false
        },
        minimumDuration: 'Duration of stay + 30 days'
      }
    }
  },
  {
    name: "EU Blue Card Germany",
    visaCode: "DE-EBC",
    category: "work",
    description: "EU-wide work permit for highly qualified non-EU professionals with a university degree and job offer meeting salary thresholds.",
    country: "Germany",
    eVisaAvailable: false,
    eligibilityCriteria: [
      {
        name: "University Degree",
        required: true,
        description: "Recognized university degree (at least 3 years of study)",
        supportingDocuments: ["Degree certificate", "Transcript", "Recognition certificate if non-EU degree"]
      },
      {
        name: "Job Offer/Contract",
        required: true,
        description: "Employment contract or binding job offer in Germany",
        supportingDocuments: ["Employment contract", "Offer letter"]
      },
      {
        name: "Minimum Salary",
        required: true,
        description: "Gross annual salary of at least €45,300 (2024), or €41,042 for shortage occupations (IT, engineering, doctors)",
        minimumScore: null
      },
      {
        name: "Health Insurance",
        required: true,
        description: "Valid health insurance in Germany",
        supportingDocuments: ["Insurance confirmation"]
      }
    ],
    kycRequirements: [
      { kycType: "Passport verification", required: true, description: "Valid passport" },
      { kycType: "Identity verification", required: true, description: "Biometric enrollment" },
      { kycType: "Qualification Check", required: true, description: "Degree equivalency verification via anabin database" },
      { kycType: "Background Check", required: true, description: "Criminal record check" }
    ],
    documentsRequirements: [
      { name: "Employment Contract", required: true, description: "Signed contract meeting salary threshold", format: "PDF" },
      { name: "University Degree", required: true, description: "Original or certified copy", format: "PDF" },
      { name: "Degree Recognition", required: false, description: "If degree not automatically recognized", format: "PDF" },
      { name: "CV/Resume", required: true, description: "Detailed professional history", format: "PDF" },
      { name: "Health Insurance Proof", required: true, description: "German statutory or private insurance", format: "PDF" },
      { name: "Passport Photos", required: true, description: "Biometric format", format: "JPEG" }
    ],
    processingTier: [
      { type: "standard", timeframe: "2-4 weeks", visaCost: { amount: 75, currency: "EUR" }, additionalCosts: [] }
    ],
    processingInfo: {
      generalTimeframe: "2-4 weeks if documents complete",
      additionalInfo: "Valid up to 4 years. Permanent residence possible after 27 months (B1 German) or 21 months (B2 German). Free movement within EU after 18 months."
    },
    metadata: { validityPeriod: 48, maxExtensions: 1, processingTimeAvg: 21, successRate: 92 },
    isActive: true,
    createdAt: "2024-07-01T09:00:00Z",
    updatedAt: "2024-12-14T11:00:00Z"
  }
]

// Get visa types by category
export function getVisaTypesByCategory(category: string): VisaTypeConfig[] {
  return SAMPLE_VISA_TYPES.filter(v => v.category === category)
}

// Get visa type by code
export function getVisaTypeByCode(code: string): VisaTypeConfig | undefined {
  return SAMPLE_VISA_TYPES.find(v => v.visaCode === code)
}

// Get all active visa types
export function getActiveVisaTypes(): VisaTypeConfig[] {
  return SAMPLE_VISA_TYPES.filter(v => v.isActive)
}

// Get category counts
export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  SAMPLE_VISA_TYPES.forEach(v => {
    const cat = v.category as string
    counts[cat] = (counts[cat] || 0) + 1
  })
  return counts
}
