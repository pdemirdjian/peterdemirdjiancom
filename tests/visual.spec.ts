import { test, expect } from '@playwright/test'

// Visual regression baselines: each page in each theme, compared against one
// committed baseline set generated in the Playwright Linux container (see
// README "Visual regression tests"). Runs only in the `visual` project.

const pages = [
  { name: 'home', path: '/' },
  { name: 'resume', path: '/resume/' },
  { name: '404', path: '/does-not-exist' },
]

const themes = ['light', 'dark'] as const

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    // A returning visitor's stored preference, read by theme-bootstrap.js
    // before first paint.
    test.beforeEach(async ({ page }) => {
      await page.addInitScript((stored) => localStorage.setItem('theme', stored), theme)
    })

    for (const { name, path } of pages) {
      test(`${name} page`, async ({ page }) => {
        await page.goto(path)
        await expect(page.locator('html')).toHaveClass(new RegExp(`\\b${theme}\\b`))
        await expect(page).toHaveScreenshot(`${name}-${theme}.png`, {
          fullPage: true,
          animations: 'disabled',
          maxDiffPixelRatio: 0.01,
          // "Last updated <Month Year>" comes from Git or file mtime, which in
          // a shallow CI checkout is the checkout time, so it changes monthly.
          mask: [page.locator('p.dates', { has: page.locator('time[itemprop="dateModified"]') })],
        })
      })
    }
  })
}
