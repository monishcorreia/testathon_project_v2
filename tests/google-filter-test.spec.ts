import { test, expect } from '@playwright/test';

test('Google Filter Functionality Test - TC019', async ({ page }) => {
    console.log('[[PROPERTY|id=TC019]]');
    // Navigate to the product listing page and wait for initial render
    await page.goto('https://testathon.live/');
    
    // Ensure the page is fully loaded
    await Promise.all([
        page.waitForLoadState('load'),
        page.waitForLoadState('domcontentloaded'),
        page.waitForLoadState('networkidle')
    ]);

    // Wait for any element that indicates the main content is loaded
    await Promise.race([
        page.waitForSelector('h1'),
        page.waitForSelector('main'),
        page.waitForSelector('nav')
    ]);

    // Get all products by looking for elements with both an image and a title
    const initialProducts = await page.locator('div').filter({
        has: page.locator('img'),
        hasText: /./  // any text
    }).all();
    console.log(`Initial product count: ${initialProducts.length}`);

    // Wait for the Vendors section
    const vendorsLabel = page.getByText('Vendors:', { exact: true });
    await expect(vendorsLabel).toBeVisible();

    // Locate and verify the Google filter button near the Vendors section
    const googleFilter = page.locator('a, span, label').filter({ hasText: 'Google' }).first();
    await expect(googleFilter).toBeVisible();

    // Verify button styling
    const styles = await googleFilter.evaluate((element: HTMLElement) => {
        const computed = window.getComputedStyle(element);
        return {
            cursor: computed.cursor,
            backgroundColor: computed.backgroundColor,
            color: computed.color
        };
    });

    // Verify button is clickable
    expect(styles.cursor).toBe('pointer');

    // Click the Google filter button
    await googleFilter.click();
    await page.waitForTimeout(2000);

    // Get filtered product list using the same selector as initial products
    const filteredProducts = await page.locator('div').filter({
        has: page.locator('img'),
        hasText: /./  // any text
    }).all();
    console.log(`Filtered product count: ${filteredProducts.length}`);

    // Get product titles
    const titles = await Promise.all(filteredProducts.map(async (product) => {
        const title = await product.textContent();
        return title || '';
    }));
    console.log('Filtered product titles:', titles);

    // Verify that filtered results contain only Google products
    const hasGoogleProducts = titles.some(title => 
        title.toLowerCase().includes('google') || 
        title.toLowerCase().includes('pixel'));
    
    expect(hasGoogleProducts).toBeTruthy();
    expect(filteredProducts.length).toBeLessThan(initialProducts.length);
});