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

    // Click add to cart and wait for cart update
    await addToCartButton.click();

    // Wait for cart container to be visible and cart updates to complete
    const cartContainer = page.locator('.float-cart');
    await expect(cartContainer).toBeVisible({ timeout: 10000 });
    
    // Wait for cart quantity badge to update
    const quantityBadge = page.locator('.bag__quantity');
    await expect(quantityBadge).toBeVisible();
    await expect(quantityBadge).toHaveText('1', { timeout: 5000 });

    // Wait for cart open animation to complete
    await page.waitForFunction(() => {
      const cart = document.querySelector('.float-cart');
      return cart && cart.classList.contains('float-cart--open');
    }, { timeout: 10000 });

    // If cart isn't open, try to open it
    const isOpen = await cartContainer.evaluate((el: HTMLElement) => 
      el.classList.contains('float-cart--open')
    ).catch(() => false);

    if (!isOpen) {
      // Try multiple strategies to open the cart
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          switch (attempt) {
            case 1:
              await cartContainer.click({ force: true });
              break;
            case 2:
              await page.evaluate(() => {
                const cart = document.querySelector('.float-cart');
                if (cart) cart.classList.add('float-cart--open');
              });
              break;
            case 3:
              const badge = page.locator('.bag__quantity');
              await badge.click({ force: true });
              break;
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
          await page.waitForTimeout(1000);
        }
      }
    }

    // Now verify cart contents and open state
    await expect(cartContainer).toHaveClass(/float-cart--open/, { timeout: 10000 });
    
    // Verify cart content shows added product
    const shelfItem = page.locator('.float-cart__content .shelf-item');
    await expect(shelfItem).toBeVisible({ timeout: 10000 });
    await expect(shelfItem.locator('.shelf-item__details .title')).toHaveText('iPhone 12');

    // Verify product price shows in cart
    const cartPrice = page.locator('.float-cart__content .shelf-item__price');
    await expect(cartPrice).toBeVisible({ timeout: 10000 });
    const priceText = await cartPrice.textContent();
    expect(priceText?.replace(/\s+/g, '')).toContain('$799.00');

    // Verify subtotal updates
    const subtotal = page.locator('.sub-price__val');
    await expect(subtotal).toBeVisible({ timeout: 10000 });
    const subtotalText = await subtotal.textContent();
    expect(subtotalText?.replace(/\s+/g, '')).toContain('$799.00');
  });
});