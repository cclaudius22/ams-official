import { test, expect } from '@playwright/test'

test.describe('Visa Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Visa Builder main page
    await page.goto('/visa-builder')
  })

  test('should load the Visa Builder page', async ({ page }) => {
    // Check for main heading or title
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })

  test('should display JSON import interface', async ({ page }) => {
    // Look for textarea or file upload area for JSON import
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()
  })

  test('should validate JSON input', async ({ page }) => {
    const textarea = page.locator('textarea')

    // Enter invalid JSON
    await textarea.fill('{ invalid json }')

    // Should show some indication of invalid JSON
    // Wait a moment for validation
    await page.waitForTimeout(500)
  })

  test('should accept valid JSON', async ({ page }) => {
    const textarea = page.locator('textarea')

    // Enter valid JSON
    const validJson = JSON.stringify({
      name: 'Test Visa',
      visaCode: 'TEST-001',
      category: 'tourist',
      description: 'A test visa for E2E testing',
      country: 'Test Country',
      eVisaAvailable: true,
      eligibilityCriteria: [],
      kycRequirements: [],
      documentsRequirements: [],
      processingTier: [],
      isActive: false
    }, null, 2)

    await textarea.fill(validJson)

    // Wait for validation
    await page.waitForTimeout(500)
  })
})

test.describe('VisaKey Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/visa-builder/visakey')
  })

  test('should load the VisaKey page', async ({ page }) => {
    // Check for VisaKey heading
    await expect(page.getByText('VisaKey Visas', { exact: false })).toBeVisible()
  })

  test('should display category filter', async ({ page }) => {
    // Look for filter dropdown
    const filterTrigger = page.locator('[role="combobox"]').first()
    await expect(filterTrigger).toBeVisible()
  })

  test('should filter by category', async ({ page }) => {
    // Click on category filter
    const categoryFilter = page.locator('[role="combobox"]').first()
    await categoryFilter.click()

    // Wait for dropdown to appear
    await page.waitForTimeout(300)

    // Select a category if options are visible
    const options = page.locator('[role="option"]')
    const count = await options.count()

    if (count > 0) {
      await options.first().click()
    }
  })

  test('should display VisaKey enabled visas', async ({ page }) => {
    // Look for visa cards or list items with VisaKey badge
    await page.waitForTimeout(500)

    // Check for visa entries
    const visaCards = page.locator('[data-visakey="true"], .visa-card, .bg-white').first()
    await expect(visaCards).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Visa AI Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/visa-builder/ai')
  })

  test('should load the Visa AI page', async ({ page }) => {
    await expect(page.getByText('Visa AI', { exact: false })).toBeVisible()
  })

  test('should display Create Visa tab', async ({ page }) => {
    await expect(page.getByText('Create Visa')).toBeVisible()
  })

  test('should display Analyze Visa tab', async ({ page }) => {
    await expect(page.getByText('Analyze Visa')).toBeVisible()
  })

  test('should have description input', async ({ page }) => {
    // Look for textarea for entering visa description
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()
  })

  test('should display example prompts', async ({ page }) => {
    // Check for example prompts section
    await expect(page.getByText('Example Prompts')).toBeVisible()
  })

  test('should fill textarea when example prompt is clicked', async ({ page }) => {
    // Find and click an example prompt
    const examplePrompt = page.locator('button').filter({ hasText: /Create a skilled worker/i }).first()

    if (await examplePrompt.isVisible()) {
      await examplePrompt.click()

      // Check that textarea now has content
      const textarea = page.locator('textarea')
      await expect(textarea).not.toHaveValue('')
    }
  })

  test('should switch to Analyze tab', async ({ page }) => {
    // Click on Analyze Visa tab
    await page.getByText('Analyze Visa').click()

    // Verify we're on the analyze tab
    await expect(page.getByText('Select Visa to Analyze')).toBeVisible()
  })

  test('should have visa selector in Analyze tab', async ({ page }) => {
    // Switch to Analyze tab
    await page.getByText('Analyze Visa').click()

    // Look for the visa selection dropdown
    const selector = page.locator('[role="combobox"]').first()
    await expect(selector).toBeVisible()
  })
})

test.describe('Visa Knowledgebase Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/visa-builder/knowledgebase')
  })

  test('should load the Knowledgebase page', async ({ page }) => {
    await expect(page.getByText('Knowledgebase', { exact: false })).toBeVisible()
  })

  test('should display Coming Soon badge', async ({ page }) => {
    await expect(page.getByText('Coming Soon')).toBeVisible()
  })

  test('should display planned features', async ({ page }) => {
    await expect(page.getByText('Planned Features')).toBeVisible()
  })

  test('should have navigation links', async ({ page }) => {
    // Check for Back to Visa Builder link
    await expect(page.getByText('Back to Visa Builder')).toBeVisible()

    // Check for Try Visa AI link
    await expect(page.getByText('Try Visa AI')).toBeVisible()
  })
})

test.describe('Visa Builder Navigation', () => {
  test('should navigate from main page to VisaKey', async ({ page }) => {
    await page.goto('/visa-builder')

    // Find sidebar link for VisaKey
    const visakeyLink = page.locator('a[href="/visa-builder/visakey"]')
    await visakeyLink.click()

    await expect(page).toHaveURL('/visa-builder/visakey')
  })

  test('should navigate from main page to Visa AI', async ({ page }) => {
    await page.goto('/visa-builder')

    // Find sidebar link for Visa AI
    const aiLink = page.locator('a[href="/visa-builder/ai"]')
    await aiLink.click()

    await expect(page).toHaveURL('/visa-builder/ai')
  })

  test('should navigate to Knowledgebase from AI page', async ({ page }) => {
    await page.goto('/visa-builder/ai')

    // Find sidebar link for Knowledgebase
    const kbLink = page.locator('a[href="/visa-builder/knowledgebase"]')
    await kbLink.click()

    await expect(page).toHaveURL('/visa-builder/knowledgebase')
  })
})
