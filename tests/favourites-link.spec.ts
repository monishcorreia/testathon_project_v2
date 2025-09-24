import { test, expect } from '@playwright/test';

test.describe('BrowserStack DEMO Favourites Tests', () => {
  test.setTimeout(120000);

  test('should verify heart icon functionality and favorites list TC014', async ({ page }) => {
    console.log('[[PROPERTY|id=TC014]]');

    // Step 1: Sign in first
    console.log('Step 1: Signing in');
    await page.goto('https://testathon.live/', { waitUntil: 'networkidle' });
    await page.click('#favourites');
    await page.waitForLoadState('networkidle');

    // Handle sign in
    await page.waitForSelector('#username', { state: 'visible' });
    await page.waitForSelector('#password', { state: 'visible' });
    
    // Select username
    await page.click('#username');
    await page.locator('#react-select-2-option-0-0').click();
    
    // Select password
    await page.click('#password');
    await page.locator('#react-select-3-option-0-0').click();
    
    // Click login
    await page.click('#login-btn');
    await page.waitForTimeout(2000);

    // Step 2: Go to main page and select a product to favorite
    console.log('Step 2: Going to main page');
    await page.click('a[href="/"]');
    await page.waitForLoadState('networkidle');

    // Get the first product
    const product = await page.locator('.shelf-item').first();
    const productTitle = await product.locator('.shelf-item__title').textContent();
    console.log(`Selected product: ${productTitle}`);

    // Click the favorite button
    console.log('Clicking favorite button');
    const favoriteButton = product.locator('button[type="button"]').first();
    await expect(favoriteButton).toBeVisible();
    await favoriteButton.click();
    await page.waitForTimeout(2000);

    // Step 3: Go to favorites header
    console.log('Step 3: Going to favorites page');
    await page.click('#favourites');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify product is in favorites
    const productInFavorites = page.locator('.shelf-item__title', { 
      hasText: productTitle || '' 
    }).first();
    await expect(productInFavorites).toBeVisible();
    console.log('Product found in favorites page');

    // Step 4: Unfavorite from favorites page
    console.log('Step 4: Unfavoriting the product');
    const unfavoriteButton = page.locator('.shelf-item').filter({ 
      has: page.locator('.shelf-item__title', { hasText: productTitle || '' })
    }).locator('button[type="button"]').first();
    await unfavoriteButton.click();
    await page.waitForTimeout(2000);

    // Verify product is removed from favorites
    await expect(productInFavorites).not.toBeVisible();
    console.log('Product successfully removed from favorites');
  });
});