import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 90000, // Extended global timeout
  expect: {
    timeout: 30000, // Extended expect timeout
  },
  use: {
    browserName: 'chromium',
    headless: true,
    baseURL: 'https://testathon.live/',
    actionTimeout: 30000,
    navigationTimeout: 30000,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: {
      slowMo: 100 // Add a small delay between actions
    }
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  retries: process.env.CI ? 2 : 1, // More retries in CI
  workers: process.env.CI ? 1 : undefined // Single worker in CI for stability
});