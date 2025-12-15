import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check title
    await expect(page).toHaveTitle(/Pete Demirdjian/)
    
    // Check main content exists - use specific h1
    await expect(page.locator('h1#about-me')).toContainText('About Me')
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check navbar links exist - use first() to handle duplicates
    await expect(page.getByRole('link', { name: 'Resume' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'License' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'LinkedIn' }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'GitHub' }).first()).toBeVisible()
  })

  test('should display profile image', async ({ page }) => {
    await page.goto('/')
    
    // Check image loads
    const img = page.locator('img[alt="picture-of-me"]')
    await expect(img).toBeVisible()
  })

  test('should have footer with license info', async ({ page }) => {
    await page.goto('/')
    
    // Check footer exists and contains copyright
    await expect(page.locator('text=/© \\d{4} Peter Demirdjian/')).toBeVisible()
    await expect(page.getByRole('link', { name: /CC BY-NC-ND 4\.0/ })).toBeVisible()
  })
})
