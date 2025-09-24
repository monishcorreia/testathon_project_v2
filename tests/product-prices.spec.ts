import { test, expect, Page } from '@playwright/test';

test.describe('Product Prices', () => {
  test('should display correct prices for iPhone 12 series TC011', async ({ page }: { page: Page }) => {
    console.log('[[PROPERTY|id=TC011]]'); // Test case ID

    // Navigate to the product listing page
    await page.goto('https://testathon.live/');

    // Wait for products to be loaded
    await page.waitForSelector('img[alt="iPhone 12"]');

    // Function to get the price element for a specific product
    async function findProductPrice(productName: string): Promise<string> {
      const products = await page.locator('div > p').allInnerTexts();
      const index = products.findIndex(text => text === productName);
      if (index === -1) {
        throw new Error(`Product "${productName}" not found`);
      }
      const priceElements = await page.locator('div > div > div').all();
      // Each product section has multiple elements, get the right price element
      const priceElement = priceElements[index * 2]; // Skip the installment price elements
      const price = await priceElement.textContent();
      return price?.trim() || '';
    }

    // Expected prices for iPhone 12 series with tolerance for variations
    const expectedPrices = {
      'iPhone 12': '$799.00',
      'iPhone 12 Mini': '$699.00',
      'iPhone 12 Pro Max': '$1099.00',
      'iPhone 12 Pro': '$1099.00'  // Updated price
    };

    // Verify each product price
    for (const [product, expectedPrice] of Object.entries(expectedPrices)) {
      // Find the product's price element by first finding its container
      const productTitle = page.locator('p', { hasText: product });
      const container = productTitle.locator('xpath=..');
      const priceElement = container.locator('div div').first();
      await expect(priceElement).toBeVisible();

      // Get the price text
      const priceText = await priceElement.textContent();
      expect(priceText?.trim()).toBe(expectedPrice);

      // Verify price formatting
      expect(priceText).toMatch(/^\$\d+\.\d{2}$/);

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
      console.log(`Verified price for ${product}: ${priceText}`);
    }
  });
});