import { test, expect, Page } from '@playwright/test';

test.describe('BrowserStack DEMO Responsive Design Tests', () => {
  test('should verify product grid responsive layout TC015', async ({ page }: { page: Page }) => {
    console.log('[[PROPERTY|id=TC015]]');

    // Helper function to get products per row
    async function getProductsPerRow() {
      const firstProduct = page.locator('.shelf-item').first();
      const allProducts = page.locator('.shelf-item');
      
      // Get the first product's position and width
      const firstBounds = await firstProduct.boundingBox();
      if (!firstBounds) throw new Error('Could not get product bounds');
      
      let productsInRow = 1;
      const totalProducts = await allProducts.count();
      
      // Check each product to see if it's in the same row
      for (let i = 1; i < totalProducts; i++) {
        const nextBounds = await allProducts.nth(i).boundingBox();
        if (!nextBounds) continue;
        
        // If the next product's top position is close to the first product's top,
        // it's in the same row (allowing for small differences in floating point values)
        if (Math.abs(nextBounds.y - firstBounds.y) < 5) {
          productsInRow++;
        } else {
          break; // We've found all products in the first row
        }
      }
      
      return productsInRow;
    }

    // Helper function to verify grid properties
    async function verifyGridProperties() {
      // Check that container has proper max-width and centering
      const container = page.locator('.shelf-container');
      const containerStyles = await container.evaluate((el: HTMLElement) => {
        const style = window.getComputedStyle(el);
        return {
          maxWidth: style.maxWidth,
          margin: style.margin,
          overflow: style.overflow,
          display: style.display,
          gap: style.gap,
          rowGap: style.rowGap,
          columnGap: style.columnGap,
          gridGap: style.gridGap
        };
      });
      
      // Verify no horizontal scrolling
      const body = page.locator('body');
      const hasHorizontalScroll = await body.evaluate((el: HTMLElement) => {
        return el.scrollWidth > el.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBe(false);
      console.log('Verified: No horizontal scroll');
      
      // Verify products have proper spacing (either through margins, grid-gap, or flexbox gap)
      const firstProduct = page.locator('.shelf-item').first();
      const firstProductRect = await firstProduct.boundingBox();
      if (!firstProductRect) throw new Error('Could not get product bounds');
      
      const nextProduct = page.locator('.shelf-item').nth(1);
      const nextProductRect = await nextProduct.boundingBox();
      if (!nextProductRect) throw new Error('Could not get next product bounds');
      
      // Get the computed styles and positions for all products in the first row
      const productsInRow = await page.evaluate(() => {
        const products = Array.from(document.querySelectorAll('.shelf-item'));
        const firstProduct = products[0];
        if (!firstProduct) return null;

        const firstRect = firstProduct.getBoundingClientRect();
        const productsData = products.map(product => {
          const rect = product.getBoundingClientRect();
          const style = window.getComputedStyle(product);
          return {
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            },
            style: {
              margin: style.margin,
              padding: style.padding,
              width: style.width,
              float: style.float,
              display: style.display,
              position: style.position
            }
          };
        });

        // Get products in the first row
        return productsData.filter(p => Math.abs(p.rect.y - firstRect.y) < 5);
      });
      
      if (!productsInRow) throw new Error('Could not analyze product layout');
      
      // Log layout information
      console.log('Product layout analysis:', {
        containerStyles,
        firstRowProducts: productsInRow.length,
        sampleProductStyles: productsInRow[0].style
      });
      
      // Verify layout properties
      const productStyles = productsInRow[0].style;
      expect(productStyles.margin).toBe('0px 0px 30px');  // Vertical spacing via margin
      expect(productStyles.padding).toBe('10px');         // Internal spacing via padding
      expect(productStyles.float).toBe('left');           // Floating layout
      
      // Verify products don't overlap
      for (let i = 1; i < productsInRow.length; i++) {
        const prevProduct = productsInRow[i - 1];
        const currProduct = productsInRow[i];
        const gap = currProduct.rect.x - (prevProduct.rect.x + prevProduct.rect.width);
        
        // Allow for small rounding differences
        expect(gap).toBeGreaterThan(-1);  // -1 to account for potential subpixel rounding
      }

      console.log('Verified: Products have proper layout and spacing');
    }

    // Desktop view test (4 products per row)
    console.log('Testing desktop layout');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('https://testathon.live/', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    let productsPerRow = await getProductsPerRow();
    expect(productsPerRow).toBe(4);
    console.log('Verified: Desktop shows 4 products per row');
    await verifyGridProperties();
    
    // Tablet view test (2-3 products per row)
    console.log('\nTesting tablet layout');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000); // Wait for layout to adjust
    
    productsPerRow = await getProductsPerRow();
    expect(productsPerRow).toBeGreaterThanOrEqual(2);
    expect(productsPerRow).toBeLessThanOrEqual(3);
    console.log(`Verified: Tablet shows ${productsPerRow} products per row`);
    await verifyGridProperties();
    
    // Mobile view test (1-2 products per row)
    console.log('\nTesting mobile layout');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000); // Wait for layout to adjust
    
    productsPerRow = await getProductsPerRow();
    expect(productsPerRow).toBeGreaterThanOrEqual(1);
    expect(productsPerRow).toBeLessThanOrEqual(2);
    console.log(`Verified: Mobile shows ${productsPerRow} products per row`);
    await verifyGridProperties();
  });
});
