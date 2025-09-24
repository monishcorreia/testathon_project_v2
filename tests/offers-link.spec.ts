import { test, expect } from '@playwright/test';

test.describe('BrowserStack DEMO Offers Tests', () => {
  test('should verify Offers link and navigation TC002', async ({ page }) => {
    console.log(`[[PROPERTY|id=TC002]]`); // Add log test case ID
    // Navigate to the website and wait for network idle
    await page.goto('https://testathon.live/', { waitUntil: 'networkidle' });
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Log the page content for debugging
    const links = await page.$$eval('a', (elements) => 
      elements.map(el => ({
        text: el.textContent?.trim(),
        href: el.href,
        classes: el.className,
        id: el.id
      }))
    );
    console.log('Available links:', JSON.stringify(links, null, 2));
    
    // Try different selectors for the Offers link
    const selectors = [
      'text=Offers',
      'a:has-text("Offers")',
      '[href*="offers" i]',
      'nav >> text=Offers',
      '.header >> text=Offers',
      '#offers-link',
      '.nav-link:has-text("Offers")'
    ];
    
    let offersLink;
    for (const selector of selectors) {
      console.log(`Trying selector: ${selector}`);
      const link = page.locator(selector);
      if (await link.count() > 0) {
        console.log(`Found link with selector: ${selector}`);
        offersLink = link;
        break;
      }
    }
    
    expect(offersLink, 'Offers link should be found').toBeDefined();
    
    // Verify the link is visible
    await expect(offersLink).toBeVisible();
    
    // Get link styles for verification
    const styles = await offersLink.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        fontSize: computed.fontSize,
        textDecoration: computed.textDecoration,
        display: computed.display
      };
    });
    
    console.log('Offers link styles:', styles);
    
    // Verify link has proper styling
    await expect(offersLink).toBeEnabled();
    
    // Get link attributes for debugging
    const href = await offersLink.getAttribute('href');
    console.log('Offers link href:', href);
    
    // Click the Offers link
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      offersLink.click()
    ]);
    
    // Verify we're on the offers page
    const currentUrl = page.url();
    expect(currentUrl).toContain('offers');
    
    // Take a screenshot of the offers page
    await page.screenshot({ path: 'test-results/offers-page.png' });
  });
});