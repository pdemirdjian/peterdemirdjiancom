import { test, expect } from '@playwright/test'

test.describe('Dark Mode', () => {
  test('clicking toggle flips dark/light class on html element', async ({ page }) => {
    await page.goto('/')

    const initialIsDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    )

    await page.click('#theme-toggle')

    const afterIsDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    )
    const afterIsLight = await page.evaluate(() =>
      document.documentElement.classList.contains('light')
    )

    expect(afterIsDark).toBe(!initialIsDark)
    expect(afterIsLight).toBe(initialIsDark)
  })

  test('theme persists as dark across page reload via localStorage', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('theme', 'dark'))
    await page.reload()

    await expect(page.locator('html')).toHaveClass(/\bdark\b/)
    await expect(page.locator('html')).not.toHaveClass(/\blight\b/)
  })

  test('theme persists as light across page reload via localStorage', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('theme', 'light'))
    await page.reload()

    await expect(page.locator('html')).toHaveClass(/\blight\b/)
    await expect(page.locator('html')).not.toHaveClass(/\bdark\b/)
  })

  test('toggle button is visible and accessible', async ({ page }) => {
    await page.goto('/')
    const toggle = page.locator('#theme-toggle')
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-label', /toggle dark mode/i)
  })

  test('clicking toggle twice returns to original theme', async ({ page }) => {
    await page.goto('/')

    const before = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    )

    await page.click('#theme-toggle')
    await page.click('#theme-toggle')

    const after = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    )

    expect(after).toBe(before)
  })
})
