import { test, expect } from '@playwright/test';

test('Product count display and filter updates TC008', async ({ page }) => {
  console.log('[[PROPERTY|id=TC008]]'); // Test case tagging

  // Navigate to the product listing page
  await page.goto('https://testathon.live/', { waitUntil: 'networkidle' });

  // Wait for products to be visible and get initial count
  await page.waitForSelector('div:has-text("Product(s) found")');
  const getProductCount = async () => {
    const text = await page.locator('div:has-text("Product(s) found")').first().textContent();
    const match = text?.match(/(\d+)\s+Product\(s\) found/);
    return match ? parseInt(match[1]) : 0;
  };
  
  const initialCount = await getProductCount();
  console.log('Initial count:', initialCount);
  expect(initialCount).toBeGreaterThan(0);

  // Apply vendor filter for Apple
  const appleFilter = page.locator('a, span, label').filter({ hasText: 'Apple' }).first();
  await appleFilter.click();
  await page.waitForTimeout(2000);

  const appleCount = await getProductCount();
  console.log('Apple filter count:', appleCount);
  expect(appleCount).toBeLessThan(initialCount);

  // Apply additional Samsung filter
  const samsungFilter = page.locator('a, span, label').filter({ hasText: 'Samsung' }).first();
  await samsungFilter.click();
  await page.waitForTimeout(2000);

  const finalCount = await getProductCount();
  console.log('Final count:', finalCount);
  // Verify that combined filter still shows fewer products than initial
  expect(finalCount).toBeLessThan(initialCount);
});
