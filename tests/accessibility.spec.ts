import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    // Check h1 exists - VuePress may have multiple h1s (main title + content heading)
    const h1 = await page.locator('h1')
    await expect(h1).toHaveCount(2) // One for site title, one for page heading
  })

  test('should have accessible links', async ({ page }) => {
    await page.goto('/')
    
    // All links should have accessible text
    const links = await page.locator('a').all()
    for (const link of links) {
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      const hasImage = await link.locator('img').count() > 0
      
      // Link should have text, aria-label, or image with alt text
      expect(text?.trim() || ariaLabel || hasImage).toBeTruthy()
    }
  })

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/')
    
    // Check all images have alt text
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).not.toBeNull()
    }
  })
})
