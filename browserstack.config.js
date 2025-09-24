
// browserstack.config.js
// Playwright + BrowserStack configuration using environment variables.
// Follow docs: https://www.browserstack.com/docs/automate/playwright/getting-started/nodejs

const { defineConfig, devices } = require('@playwright/test');

const BROWSERSTACK_USERNAME = process.env.BROWSERSTACK_USERNAME || 'YOUR_USERNAME';
const BROWSERSTACK_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY || 'YOUR_ACCESS_KEY';

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        viewport: { width: 1280, height: 720 },
        connectOptions: {
          wsEndpoint: `wss://cdp.browserstack.com/playwright?caps=` +
            encodeURIComponent(JSON.stringify({
              'browser': 'chrome',
              'browser_version': 'latest',
              'os': 'osx',
              'os_version': 'ventura',
              'name': 'Playwright Test',
              'build': process.env.BSTACK_BUILD || 'Automate-Build-1',
              'project': process.env.BSTACK_PROJECT || 'Testathon',
              'browserstack.username': BROWSERSTACK_USERNAME,
              'browserstack.accessKey': BROWSERSTACK_ACCESS_KEY
            }))
        }
      }
    }
  ]
});
