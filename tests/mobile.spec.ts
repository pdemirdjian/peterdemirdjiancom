import { test, expect } from '@playwright/test'

test.describe('Mobile Responsiveness', () => {
  test('should be mobile-friendly', async ({ page }) => {
    await page.goto('/')

    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]')
    await expect(viewport).toHaveAttribute('content', /width=device-width/)
  })

  test('should have readable text on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip()
    }

    await page.goto('/')

    // Check main content is visible on mobile
    await expect(page.locator('h1').first()).toBeVisible()
    // Check navigation links are accessible
    await expect(page.getByRole('link', { name: 'Resume' })).toBeVisible()
  })
})
