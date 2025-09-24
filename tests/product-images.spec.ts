import { test, expect } from '@playwright/test';

test.describe('Product Images', () => {
  test('should load all product images properly TC009', async ({ page }) => {
    console.log(`[[PROPERTY|id=TC009]]`); // Add log test case ID
    // Navigate to home page
    await page.goto('/');
    
    // Get all product images
    const productImages = await page.locator('img[class*="product"]').all();
    
    // Scroll through all products and verify each image
    for (const image of productImages) {
      // Scroll image into view
      await image.scrollIntoViewIfNeeded();
      
      // Wait for image to load
      await expect(image).toBeVisible();
      
      // Verify image has loaded properly
      const naturalWidth = await image.evaluate((img) => (img as HTMLImageElement).naturalWidth);
      const naturalHeight = await image.evaluate((img) => (img as HTMLImageElement).naturalHeight);
      
      // Check image has actual dimensions
      expect(naturalWidth).toBeGreaterThan(0);
      expect(naturalHeight).toBeGreaterThan(0);
      
      // Verify aspect ratio is maintained
      const clientWidth = await image.evaluate((img) => img.clientWidth);
      const clientHeight = await image.evaluate((img) => img.clientHeight);
      const displayRatio = clientWidth / clientHeight;
      const naturalRatio = naturalWidth / naturalHeight;
      
      // Allow for small rounding differences
      expect(Math.abs(displayRatio - naturalRatio)).toBeLessThan(0.1);
    }
  });

  test('should load images properly on slow connection', async ({ page }) => {
    // Emulate slow 3G connection
    await page.route('**/*', async route => {
      await route.continue({
        throttle: {
          downloadThroughput: 200 * 1024 / 8, // 200kb/s
          uploadThroughput: 100 * 1024 / 8, // 100kb/s
          latency: 100
        }
      });
    });

    // Navigate to home page
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Get all product images
    const productImages = await page.locator('img[class*="product"]').all();
    
    // Verify each image loads completely
    for (const image of productImages) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toBeVisible();
      
      // Verify image loaded successfully
      const isLoaded = await image.evaluate((img) => {
        return (img as HTMLImageElement).complete && 
               (img as HTMLImageElement).naturalWidth !== 0;
      });
      expect(isLoaded).toBeTruthy();
    }
  });
});