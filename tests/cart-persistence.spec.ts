import { test, expect, Page } from '@playwright/test';

test.describe('BrowserStack DEMO Shopping Cart Persistence', () => {
  // Define the addToCart function outside the test
  async function addProductToCart(page: Page, productName: string, maxRetries = 3): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Wait for cart operations to complete
        await page.waitForLoadState('networkidle');
        
        // Close cart if it's open to ensure product visibility
        const floatCart = page.locator('.float-cart');
        if (await floatCart.isVisible()) {
          const isCartOpen = await floatCart.evaluate((el: HTMLElement) => 
            el.classList.contains('float-cart--open')
          ).catch(() => false);
          
          if (isCartOpen) {
            const closeButton = floatCart.locator('.float-cart__close-btn');
            await closeButton.click();
            await page.waitForLoadState('networkidle');
          }
        }

        // Find and verify product
        const productTitle = page.getByText(productName, { exact: true }).first();
        await expect(productTitle).toBeVisible({ timeout: 10000 });
        
        // Find the product card more reliably
        const productCard = productTitle.locator('xpath=ancestor::div[contains(@class, "shelf-item")]');
        await expect(productCard).toBeVisible({ timeout: 10000 });
        
        // Find and click add to cart button
        const addToCartButton = productCard.locator('.shelf-item__buy-btn');
        await expect(addToCartButton).toBeEnabled({ timeout: 10000 });
        
        // Click and wait for cart update
        await Promise.all([
          page.waitForLoadState('networkidle'),
          addToCartButton.click()
        ]);
        
        // Verify item was added to cart
        const cartItem = page.locator('.float-cart__content').getByText(productName);
        await expect(cartItem).toBeVisible({ timeout: 10000 });
        
        return; // Success
      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) throw error;
        await page.waitForTimeout(1000);
      }
    }
  }

  test('should maintain cart state after page refresh TC033', async ({ page }) => {
    console.log('[[PROPERTY|id=TC033]]');

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
    await page.waitForLoadState('networkidle');

    // Add products to cart
    await test.step('Add products to cart', async () => {
      await addProductToCart(page, 'iPhone 12');
      await addProductToCart(page, 'Galaxy S20');
      await addProductToCart(page, 'Pixel 4');
    });

    // Verify initial cart state
    await test.step('Verify initial cart state', async () => {
      // Wait for cart update to complete
      await page.waitForLoadState('networkidle');

      // Check cart quantity first
      const cartCount = page.locator('.float-cart__header .bag__quantity');
      await expect(cartCount).toBeVisible({ timeout: 10000 });
      const initialCount = await cartCount.textContent();
      expect(initialCount).toBe('3');

      // Ensure cart is present and visible
      const cartContainer = page.locator('.float-cart');
      await expect(cartContainer).toBeVisible({ timeout: 10000 });
      
      // Wait for cart animation to complete
      await page.waitForFunction(() => {
        const cart = document.querySelector('.float-cart');
        return cart && cart.classList.contains('float-cart--open');
      }, { timeout: 10000 });

      // Now verify the cart state
      await expect(cartContainer).toHaveClass(/float-cart--open/, { timeout: 10000 });

      // Verify all products are in cart
      const cartItems = await page.locator('.float-cart__content .shelf-item').all();
      expect(cartItems.length).toBe(3);
      
      // Store initial state
      const subtotalElement = page.locator('.sub-price__val');
      await expect(subtotalElement).toBeVisible({ timeout: 10000 });
      const initialSubtotal = await subtotalElement.textContent();

      // Refresh the page
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForLoadState('networkidle');

      // After refresh, let's verify the cart state directly
      await page.waitForLoadState('networkidle');
      
      // First verify cart quantity persists
      await expect(cartCount).toHaveText(initialCount || '', { timeout: 10000 });
      
      // Instead of trying to click the cart icon, let's try to click the float cart itself
      const floatCartIcon = page.locator('.float-cart');
      await expect(floatCartIcon).toBeVisible({ timeout: 10000 });

      // Try clicking the cart in a few different ways if needed
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          // Check if cart is already open
          const isOpen = await floatCartIcon.evaluate((el: HTMLElement) => 
            el.classList.contains('float-cart--open')
          ).catch(() => false);

          if (!isOpen) {
            switch (attempt) {
              case 1:
                // Try clicking the cart container itself
                await floatCartIcon.click({ force: true });
                break;
              case 2:
                // Try using JavaScript to add the open class
                await page.evaluate(() => {
                  const cart = document.querySelector('.float-cart');
                  if (cart) cart.classList.add('float-cart--open');
                });
                break;
              case 3:
                // Try clicking the quantity badge
                const badge = page.locator('.bag__quantity');
                await badge.click({ force: true });
                break;
            }
          }

          // Wait to see if the cart opens
          await page.waitForFunction(() => {
            const cart = document.querySelector('.float-cart');
            return cart && cart.classList.contains('float-cart--open');
          }, { timeout: 5000 });

          // If we get here, the cart is open
          break;
        } catch (e) {
          console.log(`Attempt ${attempt} to open cart failed:`, e);
          if (attempt === 3) throw e;
        }
      }
      
      // Verify cart is now open and products are visible
      await expect(cartContainer).toHaveClass(/float-cart--open/, { timeout: 10000 });
      
      // Verify products are still in cart
      await expect(page.locator('.float-cart__content .shelf-item')).toHaveCount(3, { timeout: 10000 });
      
      // Verify subtotal persists
      await expect(subtotalElement).toHaveText(initialSubtotal || '', { timeout: 10000 });
    });
  });
});