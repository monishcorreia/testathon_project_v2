import { test, expect } from '@playwright/test';

test.describe('BrowserStack DEMO Shopping Cart Multiple Items', () => {
  test('should verify cart count increments correctly for multiple products TC030', async ({ page }) => {
    console.log(`[[PROPERTY|id=TC030]]`);

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
    const cartCountIndicator = page.locator('.float-cart__header .bag__quantity');
    await expect(cartCountIndicator).toBeVisible();
    expect(await cartCountIndicator.textContent()).toBe('0');

    // Function to add a product and verify cart updates
    async function addProductAndVerifyCart(productName: string, expectedCount: number) {
      const productTitle = page.getByText(productName).first();
      await expect(productTitle).toBeVisible();
      const productCard = productTitle.locator('xpath=ancestor::div[contains(@class, "shelf-item")]');
      await expect(productCard).toBeVisible();
      const addToCartButton = productCard.locator('.shelf-item__buy-btn');
      await expect(addToCartButton).toBeEnabled();
      await addToCartButton.click();
      
      // Wait for cart to update
      await page.waitForTimeout(1000);
      
      // Verify cart count
      const cartContainer = page.locator('.float-cart__content');
      await expect(cartContainer).toBeVisible();
      const items = await cartContainer.locator('.shelf-item').count();
      expect(items).toBe(expectedCount);
      
      // Verify cart count indicator
      const cartCountIndicator = page.locator('.float-cart__header .bag__quantity');
      await expect(cartCountIndicator).toBeVisible();
      expect(await cartCountIndicator.textContent()).toBe(expectedCount.toString());
      
      // Verify product is in cart
      const cartItem = cartContainer.getByText(productName);
      await expect(cartItem).toBeVisible();
    }

    // Add first product - iPhone 12
    await addProductAndVerifyCart('iPhone 12', 1);

    // Add second product - Galaxy S20
    await addProductAndVerifyCart('Galaxy S20', 2);

    // Add third product - Pixel 4
    await addProductAndVerifyCart('Pixel 4', 3);

    // Final verification of all products
    const cartItems = page.locator('.float-cart__content .shelf-item');
    await expect(cartItems).toHaveCount(3);

    // Verify subtotal reflects all items
    const subtotal = page.locator('.sub-price__val');
    await expect(subtotal).toBeVisible();
    const subtotalText = await subtotal.textContent();
    const amount = subtotalText?.replace(/[^0-9.]/g, '');
    const numericAmount = parseFloat(amount || '0');
    expect(numericAmount).toBeGreaterThan(0);

    // Verify cart remains open with all items
    const cartContainer = page.locator('.float-cart');
    await expect(cartContainer).toHaveClass(/float-cart--open/);
  });
});