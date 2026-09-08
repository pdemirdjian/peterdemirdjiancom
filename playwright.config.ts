import { defineConfig, devices } from '@playwright/test'
import { TEST_BASE_URL, TEST_PORT } from './tests/support/config.mts'

/**
 * See https://playwright.dev/docs/test-configuration.
 */

/* Deploy-contract specs are browser-independent: they exercise the Netlify
 * emulator directly or over HTTP, so they run once in the `deploy` project and
 * are ignored by every browser project. */
const deploySpecs = ['**/deploy-config.spec.ts', '**/netlify-site.spec.ts']

export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: TEST_BASE_URL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'deploy',
      testMatch: deploySpecs,
    },

    {
      name: 'chromium',
      testIgnore: deploySpecs,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      testIgnore: deploySpecs,
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      testIgnore: deploySpecs,
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      testIgnore: deploySpecs,
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      testIgnore: deploySpecs,
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI
      ? 'node tests/support/netlify-static-server.mts'
      : 'hugo && node tests/support/netlify-static-server.mts',
    port: TEST_PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
