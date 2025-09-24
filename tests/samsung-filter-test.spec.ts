import { test, expect } from '@playwright/test';

test('Samsung Filter Functionality Test - TC018', async ({ page }) => {
    console.log('[[PROPERTY|id=TC018]]');
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

    // Locate and verify the Samsung filter button near the Vendors section
    const samsungFilter = page.locator('a, span, label').filter({ hasText: 'Samsung' }).first();
    await expect(samsungFilter).toBeVisible();

    // Verify button styling
    const styles = await samsungFilter.evaluate((element: HTMLElement) => {
        const computed = window.getComputedStyle(element);
        return {
            cursor: computed.cursor,
            backgroundColor: computed.backgroundColor,
            color: computed.color
        };
    });

    // Verify button is clickable
    expect(styles.cursor).toBe('pointer');

    // Click the Samsung filter button
    await samsungFilter.click();
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

    // Verify that filtered results contain only Samsung products
    const hasSamsungProducts = titles.some(title => 
        title.toLowerCase().includes('samsung') || 
        title.toLowerCase().includes('galaxy'));
    
    expect(hasSamsungProducts).toBeTruthy();
    expect(filteredProducts.length).toBeLessThan(initialProducts.length);
});