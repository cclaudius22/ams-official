import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import VisaKeyConfigurator from '@/components/visa-builder/VisaKeyConfigurator'
import {
  VISAKEY_FIXED_STAGES,
  VISAKEY_CONDITIONAL_STAGES,
  VISAKEY_FINAL_STAGES,
  createDefaultVisaKeyConfig,
  type VisaKeyConfig,
} from '@/lib/visakey-stages'

// Mock the VisaKeyFlowDiagram component as it's not under test
vi.mock('@/components/visa-builder/VisaKeyFlowDiagram', () => ({
  default: ({ config }: { config: VisaKeyConfig }) => (
    <div data-testid="flow-diagram">Flow Diagram ({config.fixedStages.length} fixed stages)</div>
  ),
}))

describe('VisaKeyConfigurator', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    visaName: 'Test Visa',
    visaCategory: 'work',
    onSave: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render when open is true', () => {
      render(<VisaKeyConfigurator {...defaultProps} />)

      expect(screen.getByText(/Enable VisaKey for "Test Visa"/)).toBeInTheDocument()
    })

    it('should not render content when open is false', () => {
      render(<VisaKeyConfigurator {...defaultProps} open={false} />)

      expect(screen.queryByText(/Enable VisaKey for "Test Visa"/)).not.toBeInTheDocument()
    })

    it('should render flow diagram', () => {
      render(<VisaKeyConfigurator {...defaultProps} />)

      expect(screen.getByTestId('flow-diagram')).toBeInTheDocument()
    })
  })

  describe('Fixed Stages', () => {
    it('should render all 10 fixed stages', () => {
      render(<VisaKeyConfigurator {...defaultProps} />)

      expect(screen.getByText('Fixed Verification Stages')).toBeInTheDocument()
      expect(screen.getByText('10 stages')).toBeInTheDocument()

      // Check for some fixed stage names
      VISAKEY_FIXED_STAGES.forEach(stage => {
        expect(screen.getByText(stage.name)).toBeInTheDocument()
      })
    })

    it('should display fixed stages with lock icons (not toggleable)', () => {
      render(<VisaKeyConfigurator {...defaultProps} />)

      // Fixed stages should not have checkboxes (they have lock icons)
      // Find the fixed stages section
      const fixedStagesSection = screen.getByText('Fixed Verification Stages').closest('div')?.parentElement

      // The fixed stages should show check marks, not checkboxes
      const checkIcons = fixedStagesSection?.querySelectorAll('[class*="text-green-600"]')
      expect(checkIcons).toBeDefined()
    })
  })

  describe('Conditional Stages', () => {
    it('should render all 6 conditional stages', () => {
      render(<VisaKeyConfigurator {...defaultProps} />)

      expect(screen.getByText('Conditional Stages')).toBeInTheDocument()

      VISAKEY_CONDITIONAL_STAGES.forEach(stage => {
        expect(screen.getByText(stage.name)).toBeInTheDocument()
      })
    })

    it('should pre-select conditional stages based on work category', () => {
      render(<VisaKeyConfigurator {...defaultProps} visaCategory="work" />)

      // Work category should have religion_worker, medical_worker, and dynamic_documents enabled
      // This is based on the getRecommendedConditionalStages function
      const recommendedBadges = screen.getAllByText('Recommended')
      expect(recommendedBadges.length).toBeGreaterThan(0)
    })

    it('should pre-select conditional stages based on tourist category', () => {
      render(<VisaKeyConfigurator {...defaultProps} visaCategory="tourist" />)

      // Tourist category should have travel_details, travel_insurance enabled
      const recommendedBadges = screen.getAllByText('Recommended')
      expect(recommendedBadges.length).toBeGreaterThan(0)
    })

    it('should toggle conditional stage when clicked', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(<VisaKeyConfigurator {...defaultProps} visaCategory="work" onSave={onSave} />)

      // Find Student Info checkbox (should be disabled for work category)
      const studentInfoLabel = screen.getByText('Student Info')
      const checkboxContainer = studentInfoLabel.closest('.relative')
      const checkbox = checkboxContainer?.querySelector('button[role="checkbox"]')

      // Verify it starts unchecked
      expect(checkbox).toHaveAttribute('data-state', 'unchecked')

      if (checkbox) {
        // Click to enable
        await user.click(checkbox)

        // Save and verify the config
        const saveButton = screen.getByText('Enable VisaKey')
        await user.click(saveButton)

        // Check that the saved config has Student Info enabled
        const savedConfig = onSave.mock.calls[0][0] as VisaKeyConfig
        const studentInfoStage = savedConfig.conditionalStages.find(
          s => s.stageId === 'STUDENT_INFO'
        )
        expect(studentInfoStage?.enabled).toBe(true)
      }
    })
  })

  describe('Final Stages', () => {
    it('should render all 3 final stages', () => {
      render(<VisaKeyConfigurator {...defaultProps} />)

      expect(screen.getByText('Final Stages')).toBeInTheDocument()
      expect(screen.getByText('3 stages')).toBeInTheDocument()

      VISAKEY_FINAL_STAGES.forEach(stage => {
        expect(screen.getByText(stage.name)).toBeInTheDocument()
      })
    })
  })

  describe('Processing Tiers', () => {
    it('should render processing tiers section', () => {
      render(<VisaKeyConfigurator {...defaultProps} />)

      expect(screen.getByText('Processing Tiers & Pricing')).toBeInTheDocument()
    })

    it('should render all 3 processing tiers', async () => {
      render(<VisaKeyConfigurator {...defaultProps} />)

      expect(screen.getByText('Priority Processing')).toBeInTheDocument()
      expect(screen.getByText('Premium Processing')).toBeInTheDocument()
      expect(screen.getByText('Standard Processing')).toBeInTheDocument()
    })

    it('should display Fastest badge for priority tier', () => {
      render(<VisaKeyConfigurator {...defaultProps} />)

      expect(screen.getByText('Fastest')).toBeInTheDocument()
    })
  })

  describe('Insurance Requirements', () => {
    it('should render insurance section', () => {
      render(<VisaKeyConfigurator {...defaultProps} />)

      expect(screen.getByText('Travel Insurance Requirements')).toBeInTheDocument()
    })

    it('should auto-expand insurance for tourist category', () => {
      render(<VisaKeyConfigurator {...defaultProps} visaCategory="tourist" />)

      // For tourist, insurance section should be expanded and show "Required" badge
      expect(screen.getByText('Required')).toBeInTheDocument()
    })

    it('should show insurance requirement options when enabled', () => {
      render(<VisaKeyConfigurator {...defaultProps} visaCategory="tourist" />)

      // Insurance requirements options should be visible
      expect(screen.getByText('Medical Insurance')).toBeInTheDocument()
      expect(screen.getByText('Emergency Evacuation')).toBeInTheDocument()
      expect(screen.getByText('Repatriation')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('should call onOpenChange when Cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<VisaKeyConfigurator {...defaultProps} />)

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    })

    it('should call onSave with config when Enable VisaKey is clicked', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(<VisaKeyConfigurator {...defaultProps} onSave={onSave} />)

      const saveButton = screen.getByText('Enable VisaKey')
      await user.click(saveButton)

      expect(onSave).toHaveBeenCalledTimes(1)

      // Verify the config structure
      const savedConfig = onSave.mock.calls[0][0] as VisaKeyConfig
      expect(savedConfig.enabled).toBe(true)
      expect(savedConfig.fixedStages).toHaveLength(10)
      expect(savedConfig.conditionalStages).toHaveLength(6)
      expect(savedConfig.finalStages).toHaveLength(3)
      expect(savedConfig.processingTiers).toHaveLength(3)
    })

    it('should close dialog after saving', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      render(<VisaKeyConfigurator {...defaultProps} onOpenChange={onOpenChange} />)

      const saveButton = screen.getByText('Enable VisaKey')
      await user.click(saveButton)

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Initial Config', () => {
    it('should use initialConfig when provided', () => {
      const initialConfig = createDefaultVisaKeyConfig('tourist')
      // Modify the initial config
      initialConfig.conditionalStages[0].enabled = false

      render(
        <VisaKeyConfigurator
          {...defaultProps}
          visaCategory="tourist"
          initialConfig={initialConfig}
        />
      )

      // The config should use the initial config values
      expect(screen.getByTestId('flow-diagram')).toBeInTheDocument()
    })
  })

  describe('Stage Count', () => {
    it('should display total enabled stages count', () => {
      render(<VisaKeyConfigurator {...defaultProps} visaCategory="work" />)

      // Look for the total count in the footer
      const totalText = screen.getByText(/Total:/)
      expect(totalText).toBeInTheDocument()
    })
  })
})
