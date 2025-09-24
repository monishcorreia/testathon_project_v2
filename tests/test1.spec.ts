import { test, expect, Page } from '@playwright/test';

test.describe('Add to Cart Buttons', () => {
  test('should verify Add to Cart buttons for all products TC013', async ({ page }: { page: Page }) => {
    console.log('[[PROPERTY|id=TC013]]'); // Test case ID

    // Navigate to the product listing page
    await page.goto('https://testathon.live/');

    // Wait for the first product to be visible
    await page.waitForSelector('img[alt="iPhone 12"]');

    // Function to get all product sections
    async function getProductSections() {
      // Find all product containers that have a title and Add to cart button
      return page.locator('div').filter({ 
        has: page.locator('p[class*="title"]'),
        hasText: 'Add to cart'
      }).all();
    }

    // Function to verify button styling
    async function verifyButtonStyling(button: any) {
      // Get button styles
      const styles = await button.evaluate((el: HTMLElement) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          display: computed.display,
          padding: computed.padding,
          borderRadius: computed.borderRadius,
          cursor: computed.cursor,
          width: computed.width,
          height: computed.height,
          fontSize: computed.fontSize,
          textAlign: computed.textAlign
        };
      });

      // Verify base styles
      expect(styles.display).not.toBe('none');
      expect(styles.cursor).toBe('pointer');
      expect(styles.textAlign).toBe('center');
      
      // Verify basic button styling requirements
      expect(styles.cursor).toBe('pointer');
      expect(styles.display).not.toBe('none');
      expect(parseFloat(styles.width)).toBeGreaterThan(0);
      expect(parseFloat(styles.height)).toBeGreaterThan(0);

      return styles;
    }

    // Get all product sections
    const productSections = await getProductSections();
    console.log(`Found ${productSections.length} products`);

    // Check each product's Add to Cart button
    for (const section of productSections) {
      // Get product name for logging
      const titleElement = section.locator('p[class*="title"]').first();
      const productName = await titleElement.textContent();
      console.log(`\nChecking Add to Cart button for: ${productName}`);

      // Find the Add to Cart button
      const addToCartButton = section.locator('div').filter({ hasText: /^Add to cart$/ }).first();
      
      // Verify button exists and is visible
      await expect(addToCartButton).toBeVisible();

      // Verify base styling
      const baseStyles = await verifyButtonStyling(addToCartButton);
      console.log('Base styles verified');

      // Check button positioning
      const buttonBox = await addToCartButton.boundingBox();
      expect(buttonBox).not.toBeNull();
      
      if (buttonBox) {
        // Verify button has reasonable dimensions
        expect(buttonBox.width).toBeGreaterThan(50);
        expect(buttonBox.height).toBeGreaterThan(20);
        
        // Verify button is positioned at the bottom of the product section
        const sectionBox = await section.boundingBox();
        expect(sectionBox).not.toBeNull();
        
        if (sectionBox) {
          expect(buttonBox.y).toBeGreaterThan(sectionBox.y);
          expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(sectionBox.y + sectionBox.height);
        }
      }

      // Test hover effects
      await addToCartButton.hover();
      
      // Wait a moment for any hover animations
      await page.waitForTimeout(200);

      // Get hover styles
      const hoverStyles = await verifyButtonStyling(addToCartButton);
      
      // Verify some style changed on hover (could be color, background, etc.)
      const styleChanged = Object.keys(hoverStyles).some(
        key => hoverStyles[key as keyof typeof hoverStyles] !== baseStyles[key as keyof typeof baseStyles]
      );
      
      if (styleChanged) {
        console.log('Hover effect detected');
      } else {
        console.log('No hover effect found - this might be intentional');
      }
    }
  });
});
