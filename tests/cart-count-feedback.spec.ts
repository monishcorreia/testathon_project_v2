import { test, expect } from '@playwright/test';

test.describe('BrowserStack DEMO Shopping Cart Feedback', () => {
  test('should verify cart count and feedback when adding product TC029', async ({ page }) => {
    console.log(`[[PROPERTY|id=TC029]]`);

    // Navigate to the website with longer timeout
    await page.goto('https://testathon.live/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Sign in first
    const signInButton = page.locator('#Sign\\ In');
    await expect(signInButton).toBeVisible();
    await signInButton.click();
    
    // Wait for login form and verify visibility
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    
    // Fill in credentials using the custom dropdown components
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

    // Check initial cart state - should be empty
    const cartContent = page.locator('.float-cart__shelf-container');
    await expect(cartContent).toBeVisible();
    expect(await cartContent.textContent()).toContain('Add some products in the bag :)');

    // Find and click "Add to cart" button for iPhone 12
    const iphone12Title = page.getByText('iPhone 12').first();
    await expect(iphone12Title).toBeVisible();
    const parentProduct = iphone12Title.locator('xpath=ancestor::div[contains(@class, "shelf-item")]');
    await expect(parentProduct).toBeVisible();
    const addToCartButton = parentProduct.locator('.shelf-item__buy-btn');
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeEnabled();

    // Click add to cart
    await addToCartButton.click();

    // Verify cart content updated
    await expect(cartContent).toBeVisible();
    expect(await cartContent.textContent()).not.toContain('Add some products in the bag :)');
    expect(await cartContent.textContent()).toContain('iPhone 12');

    // Verify product price shows in cart
    const cartPrice = page.locator('.float-cart__content .shelf-item__price');
    await expect(cartPrice).toBeVisible();
    const priceText = await cartPrice.textContent();
    expect(priceText?.replace(/\s+/g, '')).toContain('$799.00');

    // Verify subtotal updates
    const subtotal = page.locator('.sub-price__val');
    await expect(subtotal).toBeVisible();
    expect((await subtotal.textContent())?.replace(/\s+/g, '')).toContain('$799.00');

    // Verify animation/feedback occurred
    const cartContainer = page.locator('.float-cart');
    await expect(cartContainer).toHaveClass(/float-cart--open/);
  });
});