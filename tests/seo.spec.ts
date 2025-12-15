import { test, expect } from '@playwright/test'

test.describe('SEO and Meta Tags', () => {
  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')
    
    // Check Open Graph tags - use first() to handle multiple tags
    const ogTitle = await page.locator('meta[property="og:title"]').first()
    await expect(ogTitle).toHaveAttribute('content', /.+/) // Just check it has content
    
    const ogType = await page.locator('meta[property="og:type"]').first()
    await expect(ogType).toHaveAttribute('content', 'website')
    
    const ogUrl = await page.locator('meta[property="og:url"]').first()
    await expect(ogUrl).toHaveAttribute('content', /https:\/\/peterdemirdjian\.com/)
    
    // Check canonical link
    const canonical = await page.locator('link[rel="canonical"]').first()
    await expect(canonical).toHaveAttribute('href', /https:\/\/peterdemirdjian\.com/)
  })

  test('should have favicon', async ({ page }) => {
    await page.goto('/')
    
    // Check favicon exists
    const favicon = await page.locator('link[rel="icon"]')
    await expect(favicon).toHaveAttribute('href', '/images/favicon.ico')
  })
})
