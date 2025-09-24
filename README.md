
# BrowserStack Testathon — Playwright + Automate (Offers Page Tests)

This repository contains Playwright end-to-end tests for the Testathon demo site: https://testathon.live/

## Tests Included
- Verify Offers Page content (iPhone, OnePlus, Free Shipping)
- Verify Username display
- Verify Logout functionality
- BrowserStack Test Case ID tagging included via console markers.

## Setup

```bash
cp .env.example .env   # Fill in your BrowserStack credentials
npm install
npm run test:local
```

To run on BrowserStack Automate, update `scripts/run-on-browserstack.js` and follow the BrowserStack Playwright docs:
https://www.browserstack.com/docs/automate/playwright/getting-started/nodejs

## Notes
- Do not hardcode credentials. Use environment variables.
- Test Case IDs are tagged using:
  - In title: e.g. `Verify Offers Page and Elements TC-101`
  - In console: `[[PROPERTY|id=TC-101]]`
