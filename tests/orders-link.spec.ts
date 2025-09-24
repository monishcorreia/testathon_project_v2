import { test, expect } from '@playwright/test';

test.describe('BrowserStack DEMO Orders Tests', () => {
  test('should verify Orders link and authentication behavior TC003', async ({ page }) => {
    console.log(`[[PROPERTY|id=TC003]]`); // Add log test case ID
    // Navigate to the website and wait for network idle
    await page.goto('https://testathon.live/', { waitUntil: 'networkidle' });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    
    // Locate the Orders link
    const ordersLink = page.locator('#orders');
    
    // Verify the Orders link is visible and styled correctly
    await expect(ordersLink).toBeVisible();
    
    // Get the link styles to verify it's properly styled
    const styles = await ordersLink.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        fontSize: computed.fontSize,
        display: computed.display
      };
    });
    console.log('Orders link styles:', styles);
    
    // Click the Orders link
    await ordersLink.click();
    
    // Wait for navigation and content to load
    await page.waitForLoadState('networkidle');
    
    // Look for login form elements
    const loginFormElements = [
      // Username dropdown
      page.locator('#username'),
      // Password dropdown
      page.locator('#password'),
      // Login button
      page.locator('#login-btn'),
      // Username placeholder text
      page.locator('text="Select Username"'),
      // Password placeholder text
      page.locator('text="Select Password"')
    ];
    
    // Verify login form is displayed
    for (const element of loginFormElements) {
      await expect(element).toBeVisible();
    }
    
    // Take a screenshot of the login form
    await page.screenshot({ path: 'test-results/orders-login-form.png' });
    
    // Verify the page title indicates we're on the login page
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    expect(pageTitle).toBe('StackDemo');
    
    // Extra verification that we're on a secure page
    const protocol = new URL(page.url()).protocol;
    expect(protocol).toBe('https:');
  });
});