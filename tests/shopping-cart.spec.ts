import { test, expect } from '@playwright/test';

test.describe('BrowserStack DEMO Shopping Cart Tests', () => {
  test('should verify shopping cart icon and count updates TC007', async ({ page }) => {
    console.log(`[[PROPERTY|id=TC007]]`); // Add log test case ID
    // Navigate to the website with longer timeout
    await page.goto('https://testathon.live/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Click sign in button
    const signInButton = page.locator('#Sign\\ In');
    await expect(signInButton).toBeVisible();
    await signInButton.click();
    
    // Wait for login form and verify visibility
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    
    // Fill in credentials using the custom dropdown components with retry
    await page.click('#username');
    await expect(page.locator('#react-select-2-option-0-0')).toBeVisible();
    await page.locator('#react-select-2-option-0-0').click();
    
    await page.click('#password');
    await expect(page.locator('#react-select-3-option-0-0')).toBeVisible();
    await page.locator('#react-select-3-option-0-0').click();
    
    // Click login and ensure navigation completes
    const loginButton = page.locator('#login-btn');
    await expect(loginButton).toBeEnabled();
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      loginButton.click()
    ]);
    
    // Wait for page to stabilize after login
    await page.waitForTimeout(2000);
    
    // Look for shopping cart section
    const cartButton = page.locator('div.float-cart__content');
    await expect(cartButton).toBeVisible();

    // Initial cart state should be empty (0)
    const cartCount = page.locator('div.float-cart__shelf-container');
    await expect(cartCount).toBeVisible();
    expect(await cartCount.textContent()).toContain('Add some products in the bag :)');
    
    // Find and verify first product's add to cart button
    const product = page.locator('.shelf-item__buy-btn').first();
    await expect(product).toBeVisible();
    await expect(product).toBeEnabled();
    
        // Click add to cart and verify count update
    await product.click();
    
    // Wait for the cart to update and verify item was added
    await page.waitForTimeout(1000);
    const cartItem = page.locator('.float-cart__shelf-container');
    await expect(cartItem).toBeVisible();
    expect(await cartItem.textContent()).not.toContain('Add some products in the bag :)');
  });
});