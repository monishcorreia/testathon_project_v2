import { test, expect } from '@playwright/test';

test.describe('BrowserStack DEMO Sign In Tests', () => {
  test('should verify Sign In button and login page TC005', async ({ page }) => {
    console.log(`[[PROPERTY|id=TC005]]`); // Add log test case ID
    // Navigate to the website and wait for network idle
    await page.goto('https://testathon.live/', { waitUntil: 'networkidle' });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    
    // Locate the Sign In button using its ID
    const signInButton = page.locator('#Sign\\ In');
    
    // Verify the Sign In button is visible
    await expect(signInButton).toBeVisible();
    
    // Get button styles to verify proper styling
    const styles = await signInButton.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        fontSize: computed.fontSize,
        padding: computed.padding,
        borderRadius: computed.borderRadius,
        position: computed.position,
        display: computed.display
      };
    });
    console.log('Sign In button styles:', styles);
    
    // Verify button position (should be in top-right)
    const buttonBox = await signInButton.boundingBox();
    expect(buttonBox).not.toBeNull();
    
    if (buttonBox) {
      // Log position for debugging
      console.log('Button position:', buttonBox);
      
      // Verify button is in the top portion of the page
      expect(buttonBox.y).toBeLessThan(100);
      
      // Get page viewport size
      const viewportSize = await page.viewportSize();
      if (viewportSize) {
        // Verify button is in the right portion of the page
        expect(buttonBox.x).toBeGreaterThan(viewportSize.width / 2);
      }
    }
    
    // Click the Sign In button
    await signInButton.click();
    
    // Wait for navigation and content to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the login form
    await page.screenshot({ path: 'test-results/login-form.png' });
    
    // Verify login form elements are present
    const loginFormElements = [
      // Username field
      page.locator('#username'),
      // Password field
      page.locator('#password'),
      // Login button
      page.locator('#login-btn'),
      // Username placeholder
      page.locator('text="Select Username"'),
      // Password placeholder
      page.locator('text="Select Password"')
    ];
    
    // Verify all login form elements are visible
    for (const element of loginFormElements) {
      await expect(element).toBeVisible();
    }
    
    // Verify form styling
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    const formStyles = await form.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        flexDirection: computed.flexDirection,
        padding: computed.padding
      };
    });
    console.log('Login form styles:', formStyles);
    
    // Verify we're on a secure connection
    const protocol = new URL(page.url()).protocol;
    expect(protocol).toBe('https:');
  });
});