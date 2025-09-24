import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 60000, // Global timeout of 60 seconds
  expect: {
    timeout: 15000, // Default timeout for expect operations
  },
  use: {
    browserName: 'chromium',
    headless: true,
    baseURL: 'https://testathon.live/',
    actionTimeout: 30000, // Timeout for actions like click, type, etc.
    navigationTimeout: 30000, // Timeout for navigation
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true, // For handling SSL issues
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  retries: 1, // Retry failed tests once
});