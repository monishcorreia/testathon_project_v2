import { test, expect, Page } from '@playwright/test';

test.describe('Product Installment Options', () => {
  test('should display correct installment options TC012', async ({ page }: { page: Page }) => {
    console.log('[[PROPERTY|id=TC012]]'); // Test case ID

    // Navigate to the product listing page
    await page.goto('https://testathon.live/');

    // Wait for products to be loaded
    await page.waitForSelector('img[alt="iPhone 12"]');

    // Helper function to get price and installment info for a product
    async function getProductPriceInfo(productTitle: string) {
      // Find the product container using the title
      const container = page.locator(`//p[text()="${productTitle}"]/..`);
      
      // Get the main price element and installment element
      const mainPriceEl = container.locator('div > div').first();
      const installmentEl = container.locator('div > div:nth-child(2)');

      // Get text contents
      const mainPrice = (await mainPriceEl.textContent())?.trim() || '';
      const installmentText = (await installmentEl.textContent())?.trim() || '';

      // Get styles for both price and installment text
      const mainPriceStyles = await mainPriceEl.evaluate((el: HTMLElement) => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          color: computed.color,
          fontWeight: computed.fontWeight
        };
      });

      const installmentStyles = await installmentEl.evaluate((el: HTMLElement) => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          color: computed.color,
          fontWeight: computed.fontWeight
        };
      });

      return { 
        mainPrice, 
        installmentText, 
        mainPriceStyles,
        installmentStyles 
      };
    }

    // Function to parse price string to number
    function parsePriceToNumber(price: string): number {
      return parseFloat(price.replace(/[^0-9.]/g, ''));
    }

    // Function to validate installment format and calculation
    function validateInstallment(mainPrice: string, installmentText: string): { isValid: boolean; message: string } {
      // Check format: "or X x $ YY.YY"
      const match = installmentText.match(/^or (\d+) x \$ (\d+\.\d{2})$/);
      if (!match) {
        return { isValid: false, message: `Invalid format: ${installmentText}` };
      }

      // Parse values
      const numberOfPayments = parseInt(match[1], 10);
      const installmentAmount = parseFloat(match[2]);
      const totalPrice = parsePriceToNumber(mainPrice);

      // Calculate expected installment amount
      const expectedAmount = Number((totalPrice / numberOfPayments).toFixed(2));
      const isCorrect = Math.abs(expectedAmount - installmentAmount) < 0.01; // Allow for small rounding differences

      return {
        isValid: isCorrect,
        message: isCorrect ? 'Calculation correct' : 
          `Invalid calculation: ${totalPrice} ÷ ${numberOfPayments} = ${expectedAmount}, but got ${installmentAmount}`
      };
    }

    // Get all product titles
    const productTitles = await page.locator('p').filter({ hasText: /iPhone|Galaxy|Pixel|One Plus/ }).allTextContents();

    // Test each product's installment options
    for (const title of productTitles) {
      const { mainPrice, installmentText, mainPriceStyles, installmentStyles } = await getProductPriceInfo(title);
      
      // Verify main price exists
      expect(mainPrice, `Main price not found for ${title}`).toBeTruthy();
      console.log(`\nChecking ${title} - Price: ${mainPrice}`);

      // Verify installment text exists
      expect(installmentText, `Installment text not found for ${title}`).toBeTruthy();
      console.log(`Installment option: ${installmentText}`);

      // Verify installment calculation
      const validation = validateInstallment(mainPrice, installmentText);
      expect(validation.isValid, `${title}: ${validation.message}`).toBe(true);

      // Verify installment text styling
      const mainPriceFontSize = parseFloat(mainPriceStyles.fontSize);
      const installmentFontSize = parseFloat(installmentStyles.fontSize);
      expect(installmentFontSize).toBeLessThanOrEqual(mainPriceFontSize);
      
      // Verify colors are different (installment should be secondary)
      expect(installmentStyles.color).not.toBe(mainPriceStyles.color);
      
      console.log(`Validation: ${validation.message}`);
    }
  });
});