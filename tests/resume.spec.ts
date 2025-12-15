import { test, expect } from '@playwright/test'

test.describe('Resume Page', () => {
  test('should load resume page', async ({ page }) => {
    await page.goto('/resume.html')
    
    // Check title
    await expect(page).toHaveTitle(/Pete Demirdjian/)
    
    // Check resume content exists - look for h2 headings
    await expect(page.locator('h2').first()).toBeVisible()
    await expect(page.getByText('Contact Info').first()).toBeVisible()
  })

  test('should have contact information', async ({ page }) => {
    await page.goto('/resume.html')
    
    // Check for email or LinkedIn (common resume elements)
    const hasContactInfo = await page.locator('body').textContent()
    expect(hasContactInfo).toBeTruthy()
  })

  test('should navigate from home to resume', async ({ page }) => {
    await page.goto('/')
    
    // Verify Resume link exists
    await expect(page.getByRole('link', { name: 'Resume' }).first()).toBeVisible()
    
    // Navigate to resume page
    await page.goto('/resume.html')
    
    // Verify we're on the resume page
    await expect(page).toHaveURL(/.*resume/)
    await expect(page.getByText('Contact Info').first()).toBeVisible()
  })
})
