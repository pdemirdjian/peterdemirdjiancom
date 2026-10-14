import { defineConfig } from '@playwright/test'

// Check the Netlify origin with LIVE_BASE_URL=https://willowy-peony-b2b133.netlify.app pnpm exec playwright test -c playwright.live.config.ts --project=live
export default defineConfig({
  testDir: './tests/live',
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: process.env.LIVE_BASE_URL ?? 'https://peterdemirdjian.com',
  },
  projects: [{ name: 'live' }],
})
