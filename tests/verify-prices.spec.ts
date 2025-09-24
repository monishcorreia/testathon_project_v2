import { test, expect, Page } from '@playwright/test';

test.describe('Product Prices', () => {
  test('should display correct prices for iPhone 12 series TC010', async ({ page }: { page: Page }) => {
    console.log('[[PROPERTY|id=TC010]]'); // Test case ID

    // Navigate to the product listing page
    await page.goto('https://testathon.live/');

    // Wait for products to be loaded
    await page.waitForSelector('img[alt="iPhone 12"]');

    // Helper function to find the price element using XPath to ensure we get the correct price
    async function getIPhonePriceElement(model: string) {
      // Use XPath to find the exact price element that belongs to the specific model
      return page.locator(`//p[text()="${model}"]/following-sibling::div[1]/div[1]`);
    }

    // Expected prices for iPhone 12 series
    const expectedPrices = {
      'iPhone 12': '$799.00',
      'iPhone 12 Mini': '$699.00',
      'iPhone 12 Pro Max': '$1099.00',
      'iPhone 12 Pro': '$999.00'
    };

    // Verify each product price
    for (const [model, expectedPrice] of Object.entries(expectedPrices)) {
      // Find and check the price element for this model
      const priceElement = await getIPhonePriceElement(model);
      
      // Wait for the price element to be visible
      await expect(priceElement).toBeVisible();

      // Get and verify the price text
      const priceText = await priceElement.textContent();
      const actualPrice = priceText?.trim();
      
      // Verify exact price match
      expect(actualPrice).toBe(expectedPrice);

      // Verify price formatting
      expect(actualPrice).toMatch(/^\$\d+\.\d{2}$/);

      // Get the computed styles of the price element
      const styles = await priceElement.evaluate((el: HTMLElement) => {
        const computed = window.getComputedStyle(el);
        return {
          visibility: computed.visibility,
          display: computed.display,
          fontSize: parseFloat(computed.fontSize),
          opacity: parseFloat(computed.opacity),
          color: computed.color
        };
      });

      // Verify the price is prominently displayed
      expect(styles.visibility).toBe('visible');
      expect(styles.display).not.toBe('none');
      expect(styles.fontSize).toBeGreaterThan(0);
      expect(styles.opacity).toBeGreaterThan(0);

      // Log the verification
      console.log(`Verified price for ${model}: ${actualPrice}`);
    }
  });
});