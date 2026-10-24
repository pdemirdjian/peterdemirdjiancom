import { defineConfig, devices } from '@playwright/test'
import { TEST_BASE_URL, TEST_PORT } from './tests/support/config.mts'

/**
 * See https://playwright.dev/docs/test-configuration.
 */

/* Deploy-contract specs are browser-independent: they exercise the Netlify
 * emulator directly or over HTTP, so they run once in the `deploy` project and
 * are ignored by every browser project. */
const deploySpecs = ['**/deploy-config.spec.ts', '**/netlify-site.spec.ts', '**/csp.spec.ts']

/* Build-output specs read the publish directory from disk and need no browser,
 * so they run once in the `build` project and are ignored by every browser
 * project. */
const buildSpecs = ['**/build-output.spec.ts', '**/build-output-links.spec.ts']

/* Visual regression specs compare screenshots against one committed baseline
 * set, so they run once in the Chromium-only `visual` project and are ignored
 * by every other browser project. */
const visualSpecs = ['**/visual.spec.ts']

/* Browserless specs run in their own projects. Live specs run only through
 * playwright.live.config.ts, never as part of the main suite. */
const browserlessSpecs = [...deploySpecs, ...buildSpecs, '**/live/**']

/* Specs every regular browser project skips. */
const browserIgnore = [...browserlessSpecs, ...visualSpecs]

/* Baselines are generated and compared in the Playwright Linux container
 * (mcr.microsoft.com/playwright, tag matching @playwright/test), so the path
 * has no platform or browser suffix: one committed set is the source of truth.
 * The project exists only when PLAYWRIGHT_VISUAL=1 (set by the CI `visual`
 * job, update-visual-baselines.yml and the README docker command), so a plain
 * `pnpm test` on the host never compares or writes baselines. No retries: a
 * retry would compare against a baseline the failed attempt just wrote. */
const visualProjects =
  process.env.PLAYWRIGHT_VISUAL === '1'
    ? [
        {
          name: 'visual',
          testMatch: visualSpecs,
          retries: 0,
          snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
          use: { ...devices['Desktop Chrome'] },
        },
      ]
    : []

export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/live/**'],
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
      name: 'build',
      testMatch: buildSpecs,
    },

    ...visualProjects,

    {
      name: 'chromium',
      testIgnore: browserIgnore,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      testIgnore: browserIgnore,
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      testIgnore: browserIgnore,
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      testIgnore: browserIgnore,
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      testIgnore: browserIgnore,
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI
      ? 'node tests/support/netlify-static-server.mts'
      : 'pnpm build && node tests/support/netlify-static-server.mts',
    port: TEST_PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
})
