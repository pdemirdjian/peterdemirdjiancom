import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/live',
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL: process.env.LIVE_BASE_URL ?? 'https://peterdemirdjian.com',
  },
  projects: [{ name: 'live' }],
})
