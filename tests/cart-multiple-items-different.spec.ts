import { test, expect } from '@playwright/test';

test.describe('BrowserStack DEMO Shopping Cart Multiple Different Items', () => {
  test('should handle multiple different iPhone models in cart TC032', async ({ page }) => {
    console.log(`[[PROPERTY|id=TC032]]`);

    // Navigate to the website
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
    const cartCountIndicator = page.locator('.float-cart__header .bag__quantity');
    await expect(cartCountIndicator).toBeVisible();
    expect(await cartCountIndicator.textContent()).toBe('0');

    // Function to add a product and verify it's in cart
    async function addProductToCart(productName: string) {
      // Close cart if it's open
      const floatCart = page.locator('.float-cart');
      const isCartOpen = await floatCart.evaluate(el => el.classList.contains('float-cart--open'));
      if (isCartOpen) {
        const closeButton = floatCart.locator('.float-cart__close-btn');
        await closeButton.click();
        await page.waitForTimeout(1000);
      }

      const productTitle = page.getByText(productName, { exact: true }).first();
      await expect(productTitle).toBeVisible();
      const productCard = productTitle.locator('xpath=ancestor::div[contains(@class, "shelf-item")]');
      await expect(productCard).toBeVisible();
      const productPrice = await productCard.locator('.shelf-item__price').textContent();
      const addToCartButton = productCard.locator('.shelf-item__buy-btn');
      await expect(addToCartButton).toBeEnabled();
      await addToCartButton.click();
      
      // Wait for cart to update
      await page.waitForTimeout(2000);
      
      // Return the product price for later verification
      return productPrice;
    }

    // Add products to cart one by one with verification
    await test.step('Add iPhone 12', async () => {
      const price1 = await addProductToCart('iPhone 12');
      await page.waitForTimeout(2000);
      const item1 = page.locator('.float-cart__content').getByText('iPhone 12').first();
      await expect(item1).toBeVisible();
    });

    await test.step('Add iPhone 12 Mini', async () => {
      const price2 = await addProductToCart('iPhone 12 Mini');
      await page.waitForTimeout(2000);
      const item2 = page.locator('.float-cart__content').getByText('iPhone 12 Mini').first();
      await expect(item2).toBeVisible();
    });

    await test.step('Add iPhone 12 Pro Max', async () => {
      const price3 = await addProductToCart('iPhone 12 Pro Max');
      await page.waitForTimeout(2000);
      const item3 = page.locator('.float-cart__content').getByText('iPhone 12 Pro Max').first();
      await expect(item3).toBeVisible();
    });

    // Final verifications
    await test.step('Verify final cart state', async () => {
      // Check cart indicator shows 3 items
      const finalCount = await cartCountIndicator.textContent();
      expect(finalCount).toBe('3');

      // Verify cart is open
      const floatCart = page.locator('.float-cart');
      await expect(floatCart).toHaveClass(/float-cart--open/);

      // Verify we have 3 items total
      const cartItems = page.locator('.float-cart__content .shelf-item');
      await expect(cartItems).toHaveCount(3);
    });

    // Verify subtotal is greater than zero
    await test.step('Verify cart subtotal', async () => {
      const subtotal = page.locator('.sub-price__val');
      await expect(subtotal).toBeVisible();
      const subtotalText = await subtotal.textContent();
      const subtotalValue = parseFloat(subtotalText?.replace(/[^0-9.]/g, '') || '0');
      expect(subtotalValue).toBeGreaterThan(0);
    });

    // Verify cart stays open with all items
    const finalCartState = page.locator('.float-cart');
    await expect(finalCartState).toHaveClass(/float-cart--open/);
  });
});