import { test, expect } from '@playwright/test';

test.describe('BrowserStack DEMO Shopping Cart Persistence', () => {
  test('should maintain cart state after page refresh TC033', async ({ page }) => {
    console.log(`[[PROPERTY|id=TC033]]`);

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

    // Function to add a product to cart
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
      const addToCartButton = productCard.locator('.shelf-item__buy-btn');
      await expect(addToCartButton).toBeEnabled();
      await addToCartButton.click();
      await page.waitForTimeout(2000); // Wait for cart update
    }

    // Add products to cart
    await test.step('Add products to cart', async () => {
      await addProductToCart('iPhone 12');
      await addProductToCart('Galaxy S20');
      await addProductToCart('Pixel 4');
    });

    // Verify initial cart state
    await test.step('Verify initial cart state', async () => {
      const cartCount = page.locator('.float-cart__header .bag__quantity');
      await expect(cartCount).toBeVisible();
      const initialCount = await cartCount.textContent();
      expect(initialCount).toBe('3');

      // Ensure cart is open and wait for items to be visible
      const cartContainer = page.locator('.float-cart');
      await expect(cartContainer).toHaveClass(/float-cart--open/);
      await page.waitForTimeout(1000);

      // Store product details before refresh
      const cartItems = page.locator('.float-cart__content .shelf-item');
      await expect(cartItems).toHaveCount(3);
      
      // Click each product title to ensure they're properly loaded
      const iPhone = page.locator('.float-cart__content').getByText('iPhone 12');
      const galaxy = page.locator('.float-cart__content').getByText('Galaxy S20');
      const pixel = page.locator('.float-cart__content').getByText('Pixel 4');
      
      await expect(iPhone).toBeVisible();
      await expect(galaxy).toBeVisible();
      await expect(pixel).toBeVisible();

      // Store subtotal for comparison
      const subtotal = page.locator('.sub-price__val');
      await expect(subtotal).toBeVisible();
      const initialSubtotal = await subtotal.textContent();

      // Refresh the page
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(2000); // Wait for page to stabilize

      // Verify cart count persists
      const newCount = await cartCount.textContent();
      expect(newCount).toBe(initialCount);

      // Wait for cart content to be visible after refresh
      const cartContentAfterRefresh = page.locator('.float-cart__content');
      await expect(cartContentAfterRefresh).toBeVisible();
      await page.waitForTimeout(1000);

      // Verify all products still present
      const cartItemsAfterRefresh = page.locator('.float-cart__content .shelf-item');
      await expect(cartItemsAfterRefresh).toHaveCount(3);
      
      // Verify each product is still visible
      const iPhoneAfterRefresh = page.locator('.float-cart__content').getByText('iPhone 12');
      const galaxyAfterRefresh = page.locator('.float-cart__content').getByText('Galaxy S20');
      const pixelAfterRefresh = page.locator('.float-cart__content').getByText('Pixel 4');
      
      await expect(iPhoneAfterRefresh).toBeVisible();
      await expect(galaxyAfterRefresh).toBeVisible();
      await expect(pixelAfterRefresh).toBeVisible();

      // After refresh, open cart if it's closed
      const cartIcon = page.locator('.bag--float-cart-closed').first();
      if (await cartIcon.isVisible()) {
        await cartIcon.click();
        await page.waitForTimeout(1000);
      }

      // Verify cart is open and functional
      const cartAfterRefresh = page.locator('.float-cart');
      await expect(cartAfterRefresh).toHaveClass(/float-cart--open/);

      // Verify subtotal remains the same
      const subtotalAfterRefresh = page.locator('.sub-price__val');
      await expect(subtotalAfterRefresh).toBeVisible();
      const newSubtotal = await subtotalAfterRefresh.textContent();
      expect(newSubtotal).toBe(initialSubtotal);
    });
  });
});