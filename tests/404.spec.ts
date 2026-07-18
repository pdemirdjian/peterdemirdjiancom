import { test, expect } from '@playwright/test'

test.describe('404 Page', () => {
  test('should show 404 content for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-at-all/')
    await expect(page.locator('h1')).toContainText('404')
    await expect(page.locator('body')).toContainText("Page Not Found")
  })

  test('should provide a link back to the home page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-at-all/')
    const homeLink = page.getByRole('link', { name: /Return home/i })
    await expect(homeLink).toBeVisible()
    await homeLink.click()
    await expect(page).toHaveURL('/')
  })
})
