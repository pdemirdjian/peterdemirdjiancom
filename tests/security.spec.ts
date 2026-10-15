import { test, expect } from '@playwright/test'
import { origins, policy } from './support/csp.mts'

type ThemeSnapshotWindow = Window & {
  themeAtDomContentLoaded?: { dark: boolean }
  themeAtFirstFrame?: { dark: boolean }
}

test('CSP permits the site and every allowed origin has a consumer', async ({ page }) => {
  const requested = new Set<string>()
  const violations: string[] = []
  const cspError = /content[- ]security[- ]policy|\bcsp\b/i
  page.on('request', (request) => requested.add(new URL(request.url()).origin))
  page.on('requestfailed', (request) => {
    const error = request.failure()?.errorText ?? ''
    if (cspError.test(error)) violations.push(`${request.url()}: ${error}`)
  })
  page.on('console', (message) => {
    if (cspError.test(message.text())) violations.push(`${page.url()}: ${message.text()}`)
  })
  // The browser event also catches violations whose console/error wording varies.
  await page.exposeFunction('recordCspViolation', (message: string) => violations.push(message))
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      const report = (window as unknown as {
        recordCspViolation: (message: string) => Promise<void>
      }).recordCspViolation
      void report(`${location.pathname}: ${event.effectiveDirective} blocked ${event.blockedURI}`)
    })
  })

  for (const path of ['/', '/resume/', '/license/', '/404.html']) {
    await test.step(path, async () => {
      const response = await page.goto(path)
      expect(response?.headers()['content-security-policy']).toBe(policy)
      // Same-origin scripts and inline JSON-LD must work under the strict policy.
      if (path === '/') {
        await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1)
      }
      if (path === '/license/') {
        const badge = page.getByRole('img', { name: 'Creative Commons License' })
        expect(await badge.evaluate((image: HTMLImageElement) => new URL(image.src).origin)).toBe(new URL(page.url()).origin)
        await expect(badge).toHaveJSProperty('naturalWidth', 88)
        await expect(badge).toHaveJSProperty('naturalHeight', 31)
      }
      const bootstrap = page.locator('head script[src="/js/theme-bootstrap.js"]')
      await expect(bootstrap).toHaveCount(1)
      expect(await bootstrap.getAttribute('defer')).toBeNull()
      expect(await bootstrap.getAttribute('async')).toBeNull()
      await expect(page.locator('script[src="/js/theme-toggle.js"]')).toHaveAttribute('defer', '')
      const html = page.locator('html')
      await expect(html).toHaveClass(/\b(light|dark)\b/)
      const wasDark = await html.evaluate((element) => element.classList.contains('dark'))
      await page.getByRole('button', { name: 'Toggle dark mode' }).click()
      await expect(html).toHaveClass(wasDark ? /\blight\b/ : /\bdark\b/)
      await expect(page.getByRole('button', { name: 'Toggle dark mode' })).toHaveText(wasDark ? '☾' : '☀')
      expect.soft(violations, `CSP violations after ${path}`).toEqual([])
    })
  }
  expect(violations, 'CSP violations').toEqual([])
  expect([...origins].filter((origin) => !requested.has(origin)), 'Unused CSP origins').toEqual([])
})

test('stored dark preference is applied before DOMContentLoaded and the first painted frame', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'dark')
    const snapshot = () => ({ dark: document.documentElement.classList.contains('dark'), state: document.readyState })
    document.addEventListener('DOMContentLoaded', () => {
      ;(window as ThemeSnapshotWindow).themeAtDomContentLoaded = snapshot()
    }, { once: true })
    requestAnimationFrame(() => {
      ;(window as ThemeSnapshotWindow).themeAtFirstFrame = snapshot()
    })
  })
  // Delay the deferred handler to observe the bootstrap before DOMContentLoaded.
  let releaseToggle!: () => void
  const toggleGate = new Promise<void>((resolve) => { releaseToggle = resolve })
  await page.route('**/js/theme-toggle.js', async (route) => {
    await toggleGate
    await route.continue()
  })
  try {
    await page.goto('/', { waitUntil: 'commit' })
    await expect.poll(() => page.evaluate(() => ({
      dark: document.documentElement.classList.contains('dark'),
      state: document.readyState,
    }))).toEqual({ dark: true, state: 'interactive' })
    await expect.poll(() => page.evaluate(() => (window as ThemeSnapshotWindow).themeAtFirstFrame?.dark)).toBe(true)
  } finally {
    releaseToggle()
  }
  await page.waitForLoadState('load')
  expect(await page.evaluate(() => (window as ThemeSnapshotWindow).themeAtDomContentLoaded?.dark)).toBe(true)
  await expect(page.getByRole('button', { name: 'Toggle dark mode' })).toHaveText('☀')
})
