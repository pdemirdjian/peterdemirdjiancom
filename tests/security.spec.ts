import { test, expect } from '@playwright/test'
import { origins, policy } from './support/csp.mts'

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
      // Both inline scripts need script-src 'unsafe-inline': bootstrap and click handler.
      const html = page.locator('html')
      await expect(html).toHaveClass(/\b(light|dark)\b/)
      const wasDark = await html.evaluate((element) => element.classList.contains('dark'))
      await page.getByRole('button', { name: 'Toggle dark mode' }).click()
      await expect(html).toHaveClass(wasDark ? /\blight\b/ : /\bdark\b/)
      expect.soft(violations, `CSP violations after ${path}`).toEqual([])
    })
  }
  expect([...origins].filter((origin) => !requested.has(origin)), 'Unused CSP origins').toEqual([])
})
