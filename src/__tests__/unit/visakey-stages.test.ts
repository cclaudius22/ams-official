import { describe, it, expect } from 'vitest'
import {
  VISAKEY_FIXED_STAGES,
  VISAKEY_CONDITIONAL_STAGES,
  VISAKEY_FINAL_STAGES,
  ALL_VISAKEY_STAGES,
  DEFAULT_PROCESSING_TIERS,
  DEFAULT_INSURANCE_REQUIREMENTS,
  getRecommendedConditionalStages,
  createDefaultVisaKeyConfig,
  getStageDefinition,
  countEnabledStages,
  getEnabledStageDefinitions,
  type VisaKeyConfig,
} from '@/lib/visakey-stages'

describe('VisaKey Stage Definitions', () => {
  describe('VISAKEY_FIXED_STAGES', () => {
    it('should have exactly 10 fixed stages', () => {
      expect(VISAKEY_FIXED_STAGES).toHaveLength(10)
    })

    it('should have all required fields for each stage', () => {
      VISAKEY_FIXED_STAGES.forEach(stage => {
        expect(stage).toHaveProperty('stageId')
        expect(stage).toHaveProperty('name')
        expect(stage).toHaveProperty('shortName')
        expect(stage).toHaveProperty('icon')
        expect(stage).toHaveProperty('description')
        expect(stage).toHaveProperty('group')
        expect(stage.group).toBe('fixed')
      })
    })

    it('should have unique stage IDs', () => {
      const ids = VISAKEY_FIXED_STAGES.map(s => s.stageId)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should contain expected stages', () => {
      const stageIds = VISAKEY_FIXED_STAGES.map(s => s.stageId)
      expect(stageIds).toContain('ELIGIBILITY_CHECK')
      expect(stageIds).toContain('VISA_SELECTION')
      expect(stageIds).toContain('SMS_VERIFICATION')
      expect(stageIds).toContain('PASSPORT_UPLOAD')
      expect(stageIds).toContain('KYC_LIVENESS')
      expect(stageIds).toContain('RESIDENCY_INFO')
      expect(stageIds).toContain('EXISTING_VISAS')
      expect(stageIds).toContain('PHOTO_UPLOAD')
      expect(stageIds).toContain('PROFESSIONAL_INFO')
      expect(stageIds).toContain('FINANCIAL_INFO')
    })
  })

  describe('VISAKEY_CONDITIONAL_STAGES', () => {
    it('should have exactly 6 conditional stages', () => {
      expect(VISAKEY_CONDITIONAL_STAGES).toHaveLength(6)
    })

    it('should have all required fields for each stage', () => {
      VISAKEY_CONDITIONAL_STAGES.forEach(stage => {
        expect(stage).toHaveProperty('stageId')
        expect(stage).toHaveProperty('name')
        expect(stage).toHaveProperty('shortName')
        expect(stage).toHaveProperty('icon')
        expect(stage).toHaveProperty('description')
        expect(stage).toHaveProperty('group')
        expect(stage.group).toBe('conditional')
        expect(stage).toHaveProperty('categories')
        expect(Array.isArray(stage.categories)).toBe(true)
      })
    })

    it('should have unique stage IDs', () => {
      const ids = VISAKEY_CONDITIONAL_STAGES.map(s => s.stageId)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should contain expected stages', () => {
      const stageIds = VISAKEY_CONDITIONAL_STAGES.map(s => s.stageId)
      expect(stageIds).toContain('TRAVEL_DETAILS')
      expect(stageIds).toContain('TRAVEL_INSURANCE')
      expect(stageIds).toContain('STUDENT_INFO')
      expect(stageIds).toContain('RELIGION_WORKER_INFO')
      expect(stageIds).toContain('MEDICAL_WORKER_INFO')
      expect(stageIds).toContain('DYNAMIC_DOCUMENTS_UPLOAD')
    })
  })

  describe('VISAKEY_FINAL_STAGES', () => {
    it('should have exactly 3 final stages', () => {
      expect(VISAKEY_FINAL_STAGES).toHaveLength(3)
    })

    it('should have all required fields for each stage', () => {
      VISAKEY_FINAL_STAGES.forEach(stage => {
        expect(stage).toHaveProperty('stageId')
        expect(stage).toHaveProperty('name')
        expect(stage).toHaveProperty('shortName')
        expect(stage).toHaveProperty('icon')
        expect(stage).toHaveProperty('description')
        expect(stage).toHaveProperty('group')
        expect(stage.group).toBe('final')
      })
    })

    it('should contain expected stages in correct order', () => {
      expect(VISAKEY_FINAL_STAGES[0].stageId).toBe('REVIEW_AND_CONFIRM')
      expect(VISAKEY_FINAL_STAGES[1].stageId).toBe('PAYMENT')
      expect(VISAKEY_FINAL_STAGES[2].stageId).toBe('SUBMISSION')
    })
  })

  describe('ALL_VISAKEY_STAGES', () => {
    it('should contain all stages (10 fixed + 6 conditional + 3 final = 19)', () => {
      expect(ALL_VISAKEY_STAGES).toHaveLength(19)
    })

    it('should have unique IDs across all stages', () => {
      const ids = ALL_VISAKEY_STAGES.map(s => s.stageId)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })
  })
})

describe('DEFAULT_PROCESSING_TIERS', () => {
  it('should have exactly 3 tiers', () => {
    expect(DEFAULT_PROCESSING_TIERS).toHaveLength(3)
  })

  it('should have priority, premium, and standard tiers', () => {
    const tierIds = DEFAULT_PROCESSING_TIERS.map(t => t.id)
    expect(tierIds).toContain('priority')
    expect(tierIds).toContain('premium')
    expect(tierIds).toContain('standard')
  })

  it('should have correct tier properties', () => {
    DEFAULT_PROCESSING_TIERS.forEach(tier => {
      expect(tier).toHaveProperty('id')
      expect(tier).toHaveProperty('name')
      expect(tier).toHaveProperty('timeframe')
      expect(tier).toHaveProperty('price')
      expect(tier).toHaveProperty('currency')
      expect(tier).toHaveProperty('description')
      expect(tier).toHaveProperty('enabled')
      expect(typeof tier.price).toBe('number')
      expect(tier.enabled).toBe(true)
    })
  })

  it('should have priority tier with highest price', () => {
    const priority = DEFAULT_PROCESSING_TIERS.find(t => t.id === 'priority')
    const premium = DEFAULT_PROCESSING_TIERS.find(t => t.id === 'premium')
    const standard = DEFAULT_PROCESSING_TIERS.find(t => t.id === 'standard')

    expect(priority!.price).toBeGreaterThan(premium!.price)
    expect(premium!.price).toBeGreaterThan(standard!.price)
    expect(standard!.price).toBe(0)
  })
})

describe('DEFAULT_INSURANCE_REQUIREMENTS', () => {
  it('should have required set to false by default', () => {
    expect(DEFAULT_INSURANCE_REQUIREMENTS.required).toBe(false)
  })

  it('should have all requirement properties', () => {
    expect(DEFAULT_INSURANCE_REQUIREMENTS).toHaveProperty('minimumCoverage')
    expect(DEFAULT_INSURANCE_REQUIREMENTS).toHaveProperty('coverageCurrency')
    expect(DEFAULT_INSURANCE_REQUIREMENTS).toHaveProperty('requirements')
    expect(DEFAULT_INSURANCE_REQUIREMENTS).toHaveProperty('minimumDuration')
  })

  it('should have correct requirements structure', () => {
    const reqs = DEFAULT_INSURANCE_REQUIREMENTS.requirements
    expect(reqs).toHaveProperty('medicalInsurance')
    expect(reqs).toHaveProperty('emergencyEvacuation')
    expect(reqs).toHaveProperty('repatriation')
    expect(reqs).toHaveProperty('personalLiability')
    expect(reqs).toHaveProperty('tripCancellation')
    expect(reqs).toHaveProperty('luggageLoss')
  })
})

describe('getRecommendedConditionalStages', () => {
  it('should return correct stages for tourist category', () => {
    const stages = getRecommendedConditionalStages('tourist')
    const stageIds = stages.map(s => s.stageId)

    expect(stageIds).toContain('TRAVEL_DETAILS')
    expect(stageIds).toContain('TRAVEL_INSURANCE')
    expect(stageIds).toContain('DYNAMIC_DOCUMENTS_UPLOAD') // 'all' category
    expect(stageIds).not.toContain('STUDENT_INFO')
    expect(stageIds).not.toContain('RELIGION_WORKER_INFO')
  })

  it('should return correct stages for student category', () => {
    const stages = getRecommendedConditionalStages('student')
    const stageIds = stages.map(s => s.stageId)

    expect(stageIds).toContain('STUDENT_INFO')
    expect(stageIds).toContain('DYNAMIC_DOCUMENTS_UPLOAD')
    expect(stageIds).not.toContain('TRAVEL_INSURANCE')
  })

  it('should return correct stages for work category', () => {
    const stages = getRecommendedConditionalStages('work')
    const stageIds = stages.map(s => s.stageId)

    expect(stageIds).toContain('RELIGION_WORKER_INFO')
    expect(stageIds).toContain('MEDICAL_WORKER_INFO')
    expect(stageIds).toContain('DYNAMIC_DOCUMENTS_UPLOAD')
    expect(stageIds).not.toContain('STUDENT_INFO')
  })

  it('should return correct stages for business category', () => {
    const stages = getRecommendedConditionalStages('business')
    const stageIds = stages.map(s => s.stageId)

    expect(stageIds).toContain('TRAVEL_DETAILS')
    expect(stageIds).toContain('DYNAMIC_DOCUMENTS_UPLOAD')
    expect(stageIds).not.toContain('TRAVEL_INSURANCE')
    expect(stageIds).not.toContain('STUDENT_INFO')
  })

  it('should always include DYNAMIC_DOCUMENTS_UPLOAD (all category)', () => {
    const categories = ['tourist', 'student', 'work', 'business', 'unknown']
    categories.forEach(category => {
      const stages = getRecommendedConditionalStages(category)
      const stageIds = stages.map(s => s.stageId)
      expect(stageIds).toContain('DYNAMIC_DOCUMENTS_UPLOAD')
    })
  })
})

describe('createDefaultVisaKeyConfig', () => {
  it('should return enabled config', () => {
    const config = createDefaultVisaKeyConfig('work')
    expect(config.enabled).toBe(true)
  })

  it('should have all fixed stages enabled', () => {
    const config = createDefaultVisaKeyConfig('work')
    expect(config.fixedStages).toHaveLength(10)
    config.fixedStages.forEach(stage => {
      expect(stage.enabled).toBe(true)
    })
  })

  it('should have all final stages enabled', () => {
    const config = createDefaultVisaKeyConfig('work')
    expect(config.finalStages).toHaveLength(3)
    config.finalStages.forEach(stage => {
      expect(stage.enabled).toBe(true)
    })
  })

  it('should pre-select conditional stages based on category', () => {
    const config = createDefaultVisaKeyConfig('tourist')
    const travelDetails = config.conditionalStages.find(s => s.stageId === 'TRAVEL_DETAILS')
    const travelInsurance = config.conditionalStages.find(s => s.stageId === 'TRAVEL_INSURANCE')
    const studentInfo = config.conditionalStages.find(s => s.stageId === 'STUDENT_INFO')

    expect(travelDetails?.enabled).toBe(true)
    expect(travelInsurance?.enabled).toBe(true)
    expect(studentInfo?.enabled).toBe(false)
  })

  it('should auto-enable insurance for tourist category', () => {
    const touristConfig = createDefaultVisaKeyConfig('tourist')
    expect(touristConfig.insuranceRequirements).toBeDefined()
    expect(touristConfig.insuranceRequirements?.required).toBe(true)
  })

  it('should not auto-enable insurance for non-tourist categories', () => {
    const workConfig = createDefaultVisaKeyConfig('work')
    expect(workConfig.insuranceRequirements).toBeUndefined()

    const studentConfig = createDefaultVisaKeyConfig('student')
    expect(studentConfig.insuranceRequirements).toBeUndefined()
  })

  it('should have default processing path as standard', () => {
    const config = createDefaultVisaKeyConfig('work')
    expect(config.processingPath).toBe('standard')
  })

  it('should include 3 processing tiers', () => {
    const config = createDefaultVisaKeyConfig('work')
    expect(config.processingTiers).toHaveLength(3)
  })

  it('should have correct order property on stages', () => {
    const config = createDefaultVisaKeyConfig('work')
    config.fixedStages.forEach((stage, index) => {
      expect(stage.order).toBe(index)
    })
    config.conditionalStages.forEach((stage, index) => {
      expect(stage.order).toBe(index)
    })
    config.finalStages.forEach((stage, index) => {
      expect(stage.order).toBe(index)
    })
  })
})

describe('getStageDefinition', () => {
  it('should return correct definition for fixed stage', () => {
    const stage = getStageDefinition('ELIGIBILITY_CHECK')
    expect(stage).toBeDefined()
    expect(stage?.name).toBe('Eligibility Check')
    expect(stage?.group).toBe('fixed')
  })

  it('should return correct definition for conditional stage', () => {
    const stage = getStageDefinition('TRAVEL_DETAILS')
    expect(stage).toBeDefined()
    expect(stage?.name).toBe('Travel Details')
    expect(stage?.group).toBe('conditional')
  })

  it('should return correct definition for final stage', () => {
    const stage = getStageDefinition('PAYMENT')
    expect(stage).toBeDefined()
    expect(stage?.name).toBe('Payment')
    expect(stage?.group).toBe('final')
  })

  it('should return undefined for invalid stage ID', () => {
    const stage = getStageDefinition('INVALID_STAGE' as any)
    expect(stage).toBeUndefined()
  })
})

describe('countEnabledStages', () => {
  it('should count all enabled stages correctly', () => {
    const config = createDefaultVisaKeyConfig('work')
    const count = countEnabledStages(config)

    // 10 fixed + 3 conditional (work category: religion, medical, dynamic) + 3 final = 16
    const expectedConditionalEnabled = config.conditionalStages.filter(s => s.enabled).length
    expect(count).toBe(10 + expectedConditionalEnabled + 3)
  })

  it('should count correctly when some stages are disabled', () => {
    const config = createDefaultVisaKeyConfig('work')
    // Disable some fixed stages
    config.fixedStages[0].enabled = false
    config.fixedStages[1].enabled = false

    const count = countEnabledStages(config)
    const expectedConditionalEnabled = config.conditionalStages.filter(s => s.enabled).length
    expect(count).toBe(8 + expectedConditionalEnabled + 3)
  })

  it('should return 0 when all stages disabled', () => {
    const config = createDefaultVisaKeyConfig('work')
    config.fixedStages.forEach(s => s.enabled = false)
    config.conditionalStages.forEach(s => s.enabled = false)
    config.finalStages.forEach(s => s.enabled = false)

    const count = countEnabledStages(config)
    expect(count).toBe(0)
  })
})

describe('getEnabledStageDefinitions', () => {
  it('should return all enabled stage definitions', () => {
    const config = createDefaultVisaKeyConfig('tourist')
    const enabledDefs = getEnabledStageDefinitions(config)

    // Should include all fixed and final stages plus tourist conditional stages
    expect(enabledDefs.length).toBeGreaterThan(13) // 10 fixed + 3 final minimum
  })

  it('should return definitions with correct properties', () => {
    const config = createDefaultVisaKeyConfig('work')
    const enabledDefs = getEnabledStageDefinitions(config)

    enabledDefs.forEach(def => {
      expect(def).toHaveProperty('stageId')
      expect(def).toHaveProperty('name')
      expect(def).toHaveProperty('description')
      expect(def).toHaveProperty('group')
    })
  })

  it('should not include disabled stages', () => {
    const config = createDefaultVisaKeyConfig('work')
    // Student info should be disabled for work category
    const enabledDefs = getEnabledStageDefinitions(config)
    const studentInfo = enabledDefs.find(d => d.stageId === 'STUDENT_INFO')

    expect(studentInfo).toBeUndefined()
  })

  it('should return empty array when no stages enabled', () => {
    const config = createDefaultVisaKeyConfig('work')
    config.fixedStages.forEach(s => s.enabled = false)
    config.conditionalStages.forEach(s => s.enabled = false)
    config.finalStages.forEach(s => s.enabled = false)

    const enabledDefs = getEnabledStageDefinitions(config)
    expect(enabledDefs).toHaveLength(0)
  })
})
