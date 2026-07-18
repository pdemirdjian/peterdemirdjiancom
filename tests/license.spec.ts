import { test, expect } from '@playwright/test'

test.describe('License Page', () => {
  test('should load license page with correct title', async ({ page }) => {
    await page.goto('/license/')
    await expect(page).toHaveTitle(/License/)
  })

  test('should display CC BY-NC-ND 4.0 license content', async ({ page }) => {
    await page.goto('/license/')
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toContain('Creative Commons')
    expect(bodyText).toContain('Attribution-NonCommercial-NoDerivatives')
    expect(bodyText).toContain('4.0')
  })

  test('should have a link to the CC license', async ({ page }) => {
    await page.goto('/license/')
    await expect(
      page.getByRole('link', { name: /CC BY-NC-ND 4\.0/i }).first()
    ).toBeVisible()
  })

  test('should have a return path from navbar', async ({ page }) => {
    await page.goto('/license/')
    await expect(page.getByRole('link', { name: 'License' }).first()).toBeVisible()
  })
})
