import { test, expect, Page } from '@playwright/test';

test.describe('Product Titles', () => {
  test('should display iPhone model titles correctly TC009', async ({ page }: { page: Page }) => {
    console.log('[[PROPERTY|id=TC009]]'); // Test case ID

    // Navigate to the product listing page
    await page.goto('https://testathon.live/', { waitUntil: 'networkidle' });

    // Wait for the page to load
    await page.waitForSelector('.card-title, .shelf-item__title', { state: 'visible' });

    // Get all product titles
    const titles = await page.locator('.card-title, .shelf-item__title').allInnerTexts();
    
    // Filter for iPhone models and standardize text
    const iPhoneModels = titles
      .filter((title: string) => title.includes('iPhone'))
      .map((title: string) => title.trim());

    console.log('Found iPhone models:', iPhoneModels);

    // Verify we have found iPhone models
    expect(iPhoneModels.length).toBeGreaterThan(0);
    console.log(`Found ${iPhoneModels.length} iPhone models`);

    // Expected iPhone model patterns
    const expectedModelPatterns = [
      { pattern: /iPhone 12( Pro( Max)?)?|Mini/, count: 4 },  // iPhone 12 series
      { pattern: /iPhone 11( Pro)?/, count: 2 },              // iPhone 11 series
      { pattern: /iPhone XS( Max)?|XR/, count: 3 }           // iPhone X series
    ];

    // Verify each model series is present
    for (const { pattern, count } of expectedModelPatterns) {
      const matchingModels = iPhoneModels.filter((model: string) => pattern.test(model));
      expect(matchingModels.length).toBe(count);
      console.log(`Found ${matchingModels.length} models matching ${pattern}`);
    }

    // Get all visible title elements at once
    const titleElements = await page.locator('.card-title, .shelf-item__title').filter({ hasText: 'iPhone' }).all();
    
    // Create a map of found models
    const foundModels = new Map<string, boolean>();
    for (const model of iPhoneModels) {
      foundModels.set(model, false);
    }
    
    // Verify each title element
    for (const titleElement of titleElements) {
      const text = (await titleElement.textContent())?.trim() || '';
      
      // Check if this is one of our expected models
      if (foundModels.has(text)) {
        // Mark this model as found
        foundModels.set(text, true);
        
        // Verify title is visible
        await expect(titleElement).toBeVisible();
        
        // Get computed styles
        const styles = await titleElement.evaluate((el: HTMLElement) => {
          const computed = window.getComputedStyle(el);
          return {
            fontSize: computed.fontSize,
            fontFamily: computed.fontFamily,
            textAlign: computed.textAlign,
            visibility: computed.visibility,
            display: computed.display
          };
        });

        // Verify text is properly styled
        expect(styles.visibility).toBe('visible');
        expect(styles.display).not.toBe('none');
        
        // Get position relative to product image
        const box = await titleElement.boundingBox();
        expect(box).not.toBeNull();

        if (box) {
          expect(box.x).toBeGreaterThan(0);
          expect(box.y).toBeGreaterThan(0);
          expect(box.width).toBeGreaterThan(0);
          expect(box.height).toBeGreaterThan(0);
        }
      }
    }
    
    // Verify all models were found
    for (const [model, found] of foundModels.entries()) {
      expect(found, `Model "${model}" was not found on the page`).toBe(true);
    }
  });
});