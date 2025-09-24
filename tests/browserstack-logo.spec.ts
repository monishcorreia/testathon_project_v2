import { test, expect } from '@playwright/test';

test.describe('BrowserStack DEMO Logo Tests', () => {
  test('should verify logo visibility and functionality TC001', async ({ page }) => {
    console.log(`[[PROPERTY|id=TC001]]`); // Add log test case ID
    // Navigate to the website and wait for network idle
    await page.goto('https://testathon.live/', { waitUntil: 'networkidle' });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    
    // Define logo selector based on what we found in previous test
    const logoLocator = page.locator('a[href="/"] svg').first();
    
    // Verify the logo is visible
    await expect(logoLocator).toBeVisible();
    
    // Get logo position
    const boundingBox = await logoLocator.boundingBox();
    expect(boundingBox).not.toBeNull();
    
    if (boundingBox) {
      // Verify logo position (using more lenient values based on actual position)
      expect(boundingBox.x).toBeGreaterThan(0);
      expect(boundingBox.x).toBeLessThan(100);
      expect(boundingBox.y).toBeGreaterThan(0);
      expect(boundingBox.y).toBeLessThan(100);
      expect(boundingBox.width).toBeGreaterThan(100);
      expect(boundingBox.height).toBeGreaterThan(20);
    }
    
    // Find the clickable parent link
    const logoLink = page.locator('a[href="/"]').first();
    
    // Click the logo link
    await logoLink.click();
    
    // Verify we're still on the main site
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/^https:\/\/testathon\.live\/?$/);
  });
});