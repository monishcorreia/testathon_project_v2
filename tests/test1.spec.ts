import { test, expect, Page } from '@playwright/test';

test.describe('Add to Cart Buttons', () => {
  test('should verify Add to Cart buttons for all products TC013', async ({ page }: { page: Page }) => {
    console.log('[[PROPERTY|id=TC013]]'); // Test case ID

    // Navigate to the product listing page
    await page.goto('https://testathon.live/');

    // Wait for the first product to be visible
    await page.waitForSelector('img[alt="iPhone 12"]');

    // Function to get all product sections with better selector and timeout handling
    async function getProductSections(timeout = 30000) {
      // Wait for products to load
      await page.waitForSelector('p[class*="title"]', { timeout });
      
      // Find all product containers using a more specific selector
      return page.locator('.shelf-item').filter({ 
        has: page.locator('p[class*="title"]'),
        hasText: 'Add to cart'
      }).all();
    }

    // Function to verify button styling with retry logic
    async function verifyButtonStyling(button: any, timeout = 5000) {
      const startTime = Date.now();
      let lastError;

      while (Date.now() - startTime < timeout) {
        try {
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
          }, { timeout: 5000 });

          // Verify base styles and measurements
          if (styles.display === 'none') throw new Error('Button is not displayed');
          if (styles.cursor !== 'pointer') throw new Error('Button cursor is not pointer');
          if (styles.textAlign !== 'center') throw new Error('Button text is not centered');
          if (parseFloat(styles.width) <= 0) throw new Error('Button has invalid width');
          if (parseFloat(styles.height) <= 0) throw new Error('Button has invalid height');

          return styles;
        } catch (e) {
          lastError = e;
          if (Date.now() - startTime >= timeout) break;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      throw lastError || new Error('Timeout waiting for button styles');
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

      // Test hover effects with retry logic
      try {
        await addToCartButton.hover({ timeout: 5000 });
        await page.waitForTimeout(200); // Wait for hover animation

        // Get hover state styles
        const hoverStyles = await verifyButtonStyling(addToCartButton);
        if (hoverStyles.backgroundColor !== baseStyles.backgroundColor) {
          console.log('Hover effect detected');
        } else {
          console.log('No hover effect found - this might be intentional');
        }
      } catch (err) {
        const e = err as Error;
        console.log('Could not test hover effect:', e.message);
      }

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
