/**
 * Visa Type Schema - Compatible with ams-visabase structure
 * Used for JSON import/export of visa type configurations
 */

// Re-export VisaKey types for convenience
export type { VisaKeyConfig, VisaKeyStageConfig, VisaKeyStageId } from '@/lib/visakey-stages'

// Processing tier options
export type ProcessingTierType = 'standard' | 'premium' | 'priority'

export type ProcessingTimeframe =
  | '5-7 days'
  | '2-3 weeks'
  | '1-3 months'
  | '1-3 days'
  | '24-48 hours'
  | '4-24 hours'
  | 'same_day'
  | string // Allow custom timeframes

// KYC Types supported by the system
export type KycType =
  | 'Passport verification'
  | 'Identity verification'
  | 'Liveness Check'
  | 'AML Check'
  | 'PEP Check'
  | 'Sanctions Check'
  | 'Criminal Record Check'
  | 'Background Check'
  | 'Business Check'
  | 'Employee Verification'
  | 'Property or land owner verification'
  | 'Student status check'
  | 'Government worker verification'
  | 'Medical records verification'
  | 'Religious institution check'
  | 'References check'
  | 'Verification of medical qualifications'
  | 'Other (custom)'

// Visa Categories
export type VisaCategory =
  | 'tourist'
  | 'business'
  | 'work'
  | 'student'
  | 'family'
  | 'skilled worker visa'
  | 'medical'
  | 'visit'
  | 'exchange visitor'
  | 'asylum or refugee'
  | 'entrepreneur'
  | 'investor'
  | 'transit visa'
  | 'digital nomad'
  | 'religious worker visa'
  | 'diplomatic visa'
  | 'other'

// Sub-types
export interface VisaCost {
  amount: number
  currency: string
}

export interface AdditionalCost {
  description: string
  amount: number
  currency: string
}

export interface ProcessingTier {
  type: ProcessingTierType
  timeframe: ProcessingTimeframe | string
  visaCost: VisaCost
  additionalCosts?: AdditionalCost[]
}

export interface EligibilityCriterion {
  name: string
  required: boolean
  description: string
  minimumScore?: number | null
  supportingDocuments?: string[]
}

export interface KycRequirement {
  kycType: KycType | string
  required: boolean
  description: string
  customDescription?: string // Only used when kycType === 'Other (custom)'
}

export interface DocumentRequirement {
  name: string
  required: boolean
  description: string
  additionalInfo?: string
  format?: string
  examples?: string[]
}

export interface ProcessingInfo {
  generalTimeframe: string
  additionalInfo?: string
}

export interface VisaMetadata {
  validityPeriod: number      // In months
  maxExtensions?: number | null
  processingTimeAvg?: number  // In days
  successRate?: number        // Percentage (0-100)
}

export interface CountryInfo {
  name: string
  iso2?: string
  continent?: string
  capital?: string
  population?: string
}

/**
 * Main Visa Type Configuration Schema
 * This matches the ams-visabase structure for compatibility
 */
export interface VisaTypeConfig {
  // Basic Info
  name: string
  visaCode: string
  category: VisaCategory | string
  description?: string

  // Country (can be reference ID or full object)
  country: string | CountryInfo
  countryInfo?: CountryInfo

  // E-Visa availability
  eVisaAvailable?: boolean

  // Requirements
  eligibilityCriteria?: EligibilityCriterion[]
  kycRequirements?: KycRequirement[]
  documentsRequirements?: DocumentRequirement[]

  // Processing
  processingTier?: ProcessingTier[]
  processingInfo?: ProcessingInfo

  // Metadata
  metadata?: VisaMetadata

  // Status
  isActive?: boolean

  // VisaKey Integration
  visaKey?: import('@/lib/visakey-stages').VisaKeyConfig

  // Timestamps (auto-generated)
  createdAt?: string
  updatedAt?: string
  lastUpdated?: string
}

/**
 * Sample/Template for JSON import
 */
export const VISA_TYPE_TEMPLATE: VisaTypeConfig = {
  name: "Sample Work Visa",
  visaCode: "WRK-001",
  category: "work",
  description: "Standard work visa for skilled professionals",
  country: "United Kingdom",
  eVisaAvailable: false,

  eligibilityCriteria: [
    {
      name: "Job Offer",
      required: true,
      description: "Must have a valid job offer from a licensed sponsor",
      supportingDocuments: ["Certificate of Sponsorship", "Job offer letter"]
    },
    {
      name: "English Proficiency",
      required: true,
      description: "Must demonstrate English language proficiency at B1 level or above",
      minimumScore: 4
    },
    {
      name: "Minimum Salary",
      required: true,
      description: "Job must meet the minimum salary threshold",
      minimumScore: null
    }
  ],

  kycRequirements: [
    {
      kycType: "Passport verification",
      required: true,
      description: "Valid passport with at least 6 months validity"
    },
    {
      kycType: "Identity verification",
      required: true,
      description: "Government-issued photo ID verification"
    },
    {
      kycType: "Liveness Check",
      required: true,
      description: "Biometric liveness verification"
    },
    {
      kycType: "Criminal Record Check",
      required: true,
      description: "Police clearance certificate from country of residence"
    },
    {
      kycType: "Background Check",
      required: false,
      description: "Employment history verification"
    }
  ],

  documentsRequirements: [
    {
      name: "Certificate of Sponsorship",
      required: true,
      description: "CoS reference number from licensed sponsor",
      additionalInfo: "Must be valid and unused",
      format: "Reference Number"
    },
    {
      name: "Proof of English",
      required: true,
      description: "IELTS, TOEFL, or other approved English test certificate",
      format: "PDF/JPEG",
      examples: ["IELTS certificate", "TOEFL score report"]
    },
    {
      name: "Bank Statements",
      required: true,
      description: "Evidence of personal savings or sponsor support",
      additionalInfo: "Must show funds for at least 28 consecutive days",
      format: "PDF",
      examples: ["3 months bank statements", "Sponsor declaration letter"]
    },
    {
      name: "Tuberculosis Test",
      required: false,
      description: "TB test results from approved clinic",
      additionalInfo: "Required for applicants from certain countries"
    }
  ],

  processingTier: [
    {
      type: "standard",
      timeframe: "2-3 weeks",
      visaCost: {
        amount: 719,
        currency: "GBP"
      },
      additionalCosts: [
        {
          description: "Immigration Health Surcharge (per year)",
          amount: 1035,
          currency: "GBP"
        }
      ]
    },
    {
      type: "priority",
      timeframe: "5-7 days",
      visaCost: {
        amount: 719,
        currency: "GBP"
      },
      additionalCosts: [
        {
          description: "Priority Processing Fee",
          amount: 500,
          currency: "GBP"
        },
        {
          description: "Immigration Health Surcharge (per year)",
          amount: 1035,
          currency: "GBP"
        }
      ]
    },
    {
      type: "premium",
      timeframe: "24-48 hours",
      visaCost: {
        amount: 719,
        currency: "GBP"
      },
      additionalCosts: [
        {
          description: "Super Priority Processing Fee",
          amount: 1000,
          currency: "GBP"
        },
        {
          description: "Immigration Health Surcharge (per year)",
          amount: 1035,
          currency: "GBP"
        }
      ]
    }
  ],

  processingInfo: {
    generalTimeframe: "3-8 weeks depending on processing tier",
    additionalInfo: "Biometric appointment required within 10 days of application"
  },

  metadata: {
    validityPeriod: 60,  // 5 years
    maxExtensions: 2,
    processingTimeAvg: 21,
    successRate: 85
  },

  isActive: true
}

/**
 * Validate a visa type configuration
 */
export function validateVisaTypeConfig(config: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['Configuration must be a valid JSON object'] }
  }

  const c = config as Record<string, unknown>

  // Required fields
  if (!c.name || typeof c.name !== 'string') {
    errors.push('Missing or invalid "name" field (required string)')
  }

  if (!c.visaCode || typeof c.visaCode !== 'string') {
    errors.push('Missing or invalid "visaCode" field (required string)')
  }

  if (!c.category || typeof c.category !== 'string') {
    errors.push('Missing or invalid "category" field (required string)')
  }

  if (!c.country) {
    errors.push('Missing "country" field (required)')
  }

  // Optional array validations
  if (c.eligibilityCriteria && !Array.isArray(c.eligibilityCriteria)) {
    errors.push('"eligibilityCriteria" must be an array')
  }

  if (c.kycRequirements && !Array.isArray(c.kycRequirements)) {
    errors.push('"kycRequirements" must be an array')
  }

  if (c.documentsRequirements && !Array.isArray(c.documentsRequirements)) {
    errors.push('"documentsRequirements" must be an array')
  }

  if (c.processingTier && !Array.isArray(c.processingTier)) {
    errors.push('"processingTier" must be an array')
  }

  // Validate processing tiers
  if (Array.isArray(c.processingTier)) {
    c.processingTier.forEach((tier, index) => {
      if (typeof tier !== 'object' || !tier) {
        errors.push(`processingTier[${index}] must be an object`)
      } else {
        const t = tier as Record<string, unknown>
        if (!t.type) errors.push(`processingTier[${index}].type is required`)
        if (!t.visaCost) errors.push(`processingTier[${index}].visaCost is required`)
      }
    })
  }

  return { valid: errors.length === 0, errors }
}
