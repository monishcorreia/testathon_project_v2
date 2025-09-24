import { test, expect } from '@playwright/test';

test('Vendors Filter Section Layout Test - TC016', async ({ page }) => {
    console.log('[[PROPERTY|id=TC016]]');
    // Navigate to the product listing page
    await page.goto('https://testathon.live/');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Give the page a moment to fully render
    await page.waitForTimeout(2000);

    // Find and verify the Vendors filter label
    const vendorsLabel = page.getByText('Vendors:', { exact: true });
    await expect(vendorsLabel).toBeVisible();

    // Get the bounding box and computed styles of the label
    const labelBox = await vendorsLabel.boundingBox();
    expect(labelBox).not.toBeNull();

    // Verify the label's text style properties
    const labelStyles = await vendorsLabel.evaluate((el: Element) => {
        const styles = window.getComputedStyle(el);
        return {
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            color: styles.color,
            textAlign: styles.textAlign,
            display: styles.display,
            visibility: styles.visibility
        };
    });

    // Verify label styling
    expect(labelStyles.visibility).toBe('visible');
    expect(labelStyles.display).not.toBe('none');
    expect(parseFloat(labelStyles.fontSize)).toBeGreaterThan(0);
    
    // Verify label is positioned at the left
    const parentElement = page.locator('xpath=//body');
    const parentBox = await parentElement.boundingBox();
    
    expect(labelBox).toBeDefined();
    expect(parentBox).toBeDefined();
    
    if (labelBox && parentBox) {
        // Check if label is positioned reasonably from the left edge
        const leftMargin = labelBox.x - parentBox.x;
        expect(leftMargin).toBeGreaterThanOrEqual(0);
        expect(leftMargin).toBeLessThan(parentBox.width / 2); // Should be in left half of page
        
        // Verify reasonable font size for readability
        expect(parseFloat(labelStyles.fontSize)).toBeGreaterThanOrEqual(12);
    }
});