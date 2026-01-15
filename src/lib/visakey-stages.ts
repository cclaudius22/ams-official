/**
 * VisaKey Stage Definitions
 * Core verification stages for the VisaKey fast-track visa processing system
 */

// Stage ID types
export type VisaKeyFixedStageId =
  | 'ELIGIBILITY_CHECK'
  | 'VISA_SELECTION'
  | 'SMS_VERIFICATION'
  | 'PASSPORT_UPLOAD'
  | 'KYC_LIVENESS'
  | 'RESIDENCY_INFO'
  | 'EXISTING_VISAS'
  | 'PHOTO_UPLOAD'
  | 'PROFESSIONAL_INFO'
  | 'FINANCIAL_INFO'

export type VisaKeyConditionalStageId =
  | 'TRAVEL_DETAILS'
  | 'TRAVEL_INSURANCE'
  | 'STUDENT_INFO'
  | 'RELIGION_WORKER_INFO'
  | 'MEDICAL_WORKER_INFO'
  | 'DYNAMIC_DOCUMENTS_UPLOAD'

export type VisaKeyFinalStageId =
  | 'REVIEW_AND_CONFIRM'
  | 'PAYMENT'
  | 'SUBMISSION'

export type VisaKeyStageId = VisaKeyFixedStageId | VisaKeyConditionalStageId | VisaKeyFinalStageId

// Stage definition interface
export interface VisaKeyStageDefinition {
  stageId: VisaKeyStageId
  name: string
  shortName: string  // For flow diagram
  icon: string       // Lucide icon name
  description: string
  group: 'fixed' | 'conditional' | 'final'
  categories?: string[]  // Which visa categories this stage is recommended for
}

// Fixed Stages - Always required (10 stages)
export const VISAKEY_FIXED_STAGES: VisaKeyStageDefinition[] = [
  {
    stageId: 'ELIGIBILITY_CHECK',
    name: 'Eligibility Check',
    shortName: 'Eligibility',
    icon: 'ClipboardCheck',
    description: 'Assess applicant eligibility score based on profile and compliance',
    group: 'fixed'
  },
  {
    stageId: 'VISA_SELECTION',
    name: 'Visa Selection',
    shortName: 'Visa',
    icon: 'FileText',
    description: 'Confirm visa type selection from eligible options',
    group: 'fixed'
  },
  {
    stageId: 'SMS_VERIFICATION',
    name: 'SMS Verification',
    shortName: 'SMS',
    icon: 'Smartphone',
    description: 'Verify applicant phone number via SMS code',
    group: 'fixed'
  },
  {
    stageId: 'PASSPORT_UPLOAD',
    name: 'Passport Upload',
    shortName: 'Passport',
    icon: 'CreditCard',
    description: 'OCR scan and verification of passport document',
    group: 'fixed'
  },
  {
    stageId: 'KYC_LIVENESS',
    name: 'KYC Liveness',
    shortName: 'KYC',
    icon: 'ScanFace',
    description: 'Biometric identity verification with liveness detection',
    group: 'fixed'
  },
  {
    stageId: 'RESIDENCY_INFO',
    name: 'Residency Info',
    shortName: 'Residency',
    icon: 'Home',
    description: 'Proof of current residence and address verification',
    group: 'fixed'
  },
  {
    stageId: 'EXISTING_VISAS',
    name: 'Existing Visas',
    shortName: 'Visas',
    icon: 'Files',
    description: 'Declaration of current and past visa history',
    group: 'fixed'
  },
  {
    stageId: 'PHOTO_UPLOAD',
    name: 'Photo Upload',
    shortName: 'Photo',
    icon: 'Camera',
    description: 'Capture visa-compliant biometric photo',
    group: 'fixed'
  },
  {
    stageId: 'PROFESSIONAL_INFO',
    name: 'Professional Info',
    shortName: 'Professional',
    icon: 'Briefcase',
    description: 'Employment and professional background verification',
    group: 'fixed'
  },
  {
    stageId: 'FINANCIAL_INFO',
    name: 'Financial Info',
    shortName: 'Financial',
    icon: 'Wallet',
    description: 'Income verification and bank account details',
    group: 'fixed'
  }
]

// Conditional Stages - Category-specific (6 stages)
export const VISAKEY_CONDITIONAL_STAGES: VisaKeyStageDefinition[] = [
  {
    stageId: 'TRAVEL_DETAILS',
    name: 'Travel Details',
    shortName: 'Travel',
    icon: 'Plane',
    description: 'Travel itinerary, dates, and accommodation plans',
    group: 'conditional',
    categories: ['tourist', 'business']
  },
  {
    stageId: 'TRAVEL_INSURANCE',
    name: 'Travel Insurance',
    shortName: 'Insurance',
    icon: 'Shield',
    description: 'Travel insurance documentation and coverage details',
    group: 'conditional',
    categories: ['tourist']
  },
  {
    stageId: 'STUDENT_INFO',
    name: 'Student Info',
    shortName: 'Student',
    icon: 'GraduationCap',
    description: 'Student-specific information including enrollment and course details',
    group: 'conditional',
    categories: ['student']
  },
  {
    stageId: 'RELIGION_WORKER_INFO',
    name: 'Religious Worker Info',
    shortName: 'Religious',
    icon: 'Church',
    description: 'Religious organization affiliation and role details',
    group: 'conditional',
    categories: ['work']
  },
  {
    stageId: 'MEDICAL_WORKER_INFO',
    name: 'Medical Worker Info',
    shortName: 'Medical',
    icon: 'Stethoscope',
    description: 'Healthcare professional credentials and registration',
    group: 'conditional',
    categories: ['work']
  },
  {
    stageId: 'DYNAMIC_DOCUMENTS_UPLOAD',
    name: 'Custom Documents',
    shortName: 'Documents',
    icon: 'FolderUp',
    description: 'Government-specific additional document requirements',
    group: 'conditional',
    categories: ['all']  // Available for all categories
  }
]

// Final Stages - Always required (3 stages)
export const VISAKEY_FINAL_STAGES: VisaKeyStageDefinition[] = [
  {
    stageId: 'REVIEW_AND_CONFIRM',
    name: 'Review & Confirm',
    shortName: 'Review',
    icon: 'CheckSquare',
    description: 'Review all submitted information before final submission',
    group: 'final'
  },
  {
    stageId: 'PAYMENT',
    name: 'Payment',
    shortName: 'Payment',
    icon: 'CreditCard',
    description: 'Process application fee payment',
    group: 'final'
  },
  {
    stageId: 'SUBMISSION',
    name: 'Submission',
    shortName: 'Submit',
    icon: 'Send',
    description: 'Final submission to immigration authorities',
    group: 'final'
  }
]

// All stages combined
export const ALL_VISAKEY_STAGES: VisaKeyStageDefinition[] = [
  ...VISAKEY_FIXED_STAGES,
  ...VISAKEY_CONDITIONAL_STAGES,
  ...VISAKEY_FINAL_STAGES
]

// Stage config interface (for visa type configuration)
export interface VisaKeyStageConfig {
  stageId: VisaKeyStageId
  enabled: boolean
  order: number
}

// Processing tier configuration
export interface VisaKeyProcessingTier {
  id: 'priority' | 'premium' | 'standard'
  name: string
  timeframe: string  // e.g., "24-48 hours", "3-5 days"
  price: number      // Additional fee in currency units
  currency: string   // e.g., "GBP", "USD", "EUR"
  description: string
  enabled: boolean
}

// Travel insurance requirements
export interface VisaKeyInsuranceRequirements {
  required: boolean
  minimumCoverage?: number        // Minimum coverage amount
  coverageCurrency?: string       // Currency for coverage
  requirements: {
    medicalInsurance: boolean
    emergencyEvacuation: boolean
    repatriation: boolean
    personalLiability: boolean
    tripCancellation: boolean
    luggageLoss: boolean
  }
  minimumDuration?: string        // e.g., "Duration of stay + 15 days"
  acceptedProviders?: string[]    // List of accepted insurance providers
}

// Full VisaKey configuration
export interface VisaKeyConfig {
  enabled: boolean
  fixedStages: VisaKeyStageConfig[]
  conditionalStages: VisaKeyStageConfig[]
  finalStages: VisaKeyStageConfig[]
  processingPath: 'standard' | 'premium' | 'priority'
  processingTiers: VisaKeyProcessingTier[]
  insuranceRequirements?: VisaKeyInsuranceRequirements
  eligibilityThreshold?: number
}

/**
 * Get conditional stages recommended for a visa category
 */
export function getRecommendedConditionalStages(category: string): VisaKeyStageDefinition[] {
  return VISAKEY_CONDITIONAL_STAGES.filter(
    stage => stage.categories?.includes('all') || stage.categories?.includes(category)
  )
}

/**
 * Default processing tiers for VisaKey
 */
export const DEFAULT_PROCESSING_TIERS: VisaKeyProcessingTier[] = [
  {
    id: 'priority',
    name: 'Priority Processing',
    timeframe: '24-48 hours',
    price: 500,
    currency: 'GBP',
    description: 'Fastest processing with priority queue placement',
    enabled: true
  },
  {
    id: 'premium',
    name: 'Premium Processing',
    timeframe: '3-5 business days',
    price: 250,
    currency: 'GBP',
    description: 'Expedited processing with dedicated review team',
    enabled: true
  },
  {
    id: 'standard',
    name: 'Standard Processing',
    timeframe: '10-15 business days',
    price: 0,
    currency: 'GBP',
    description: 'Standard processing timeline',
    enabled: true
  }
]

/**
 * Default insurance requirements
 */
export const DEFAULT_INSURANCE_REQUIREMENTS: VisaKeyInsuranceRequirements = {
  required: false,
  minimumCoverage: 30000,
  coverageCurrency: 'EUR',
  requirements: {
    medicalInsurance: true,
    emergencyEvacuation: true,
    repatriation: false,
    personalLiability: false,
    tripCancellation: false,
    luggageLoss: false
  },
  minimumDuration: 'Duration of stay + 15 days'
}

/**
 * Create a default VisaKey configuration for a visa category
 * Pre-selects conditional stages based on category
 */
export function createDefaultVisaKeyConfig(category: string): VisaKeyConfig {
  const recommendedStages = getRecommendedConditionalStages(category)
  const recommendedIds = new Set(recommendedStages.map(s => s.stageId))

  // Auto-enable insurance requirements for tourist visas
  const insuranceRequired = category === 'tourist'

  return {
    enabled: true,
    fixedStages: VISAKEY_FIXED_STAGES.map((stage, index) => ({
      stageId: stage.stageId as VisaKeyStageId,
      enabled: true,
      order: index
    })),
    conditionalStages: VISAKEY_CONDITIONAL_STAGES.map((stage, index) => ({
      stageId: stage.stageId as VisaKeyStageId,
      enabled: recommendedIds.has(stage.stageId),
      order: index
    })),
    finalStages: VISAKEY_FINAL_STAGES.map((stage, index) => ({
      stageId: stage.stageId as VisaKeyStageId,
      enabled: true,
      order: index
    })),
    processingPath: 'standard',
    processingTiers: DEFAULT_PROCESSING_TIERS.map(tier => ({ ...tier })),
    insuranceRequirements: insuranceRequired ? { ...DEFAULT_INSURANCE_REQUIREMENTS, required: true } : undefined
  }
}

/**
 * Get stage definition by ID
 */
export function getStageDefinition(stageId: VisaKeyStageId): VisaKeyStageDefinition | undefined {
  return ALL_VISAKEY_STAGES.find(s => s.stageId === stageId)
}

/**
 * Count total enabled stages in a config
 */
export function countEnabledStages(config: VisaKeyConfig): number {
  const fixedCount = config.fixedStages.filter(s => s.enabled).length
  const conditionalCount = config.conditionalStages.filter(s => s.enabled).length
  const finalCount = config.finalStages.filter(s => s.enabled).length
  return fixedCount + conditionalCount + finalCount
}

/**
 * Get all enabled stage definitions from a config
 */
export function getEnabledStageDefinitions(config: VisaKeyConfig): VisaKeyStageDefinition[] {
  const enabledIds = new Set([
    ...config.fixedStages.filter(s => s.enabled).map(s => s.stageId),
    ...config.conditionalStages.filter(s => s.enabled).map(s => s.stageId),
    ...config.finalStages.filter(s => s.enabled).map(s => s.stageId)
  ])

  return ALL_VISAKEY_STAGES.filter(s => enabledIds.has(s.stageId))
}
