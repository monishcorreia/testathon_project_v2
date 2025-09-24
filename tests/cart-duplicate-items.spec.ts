import { test, expect } from '@playwright/test';

test.describe('BrowserStack DEMO Shopping Cart Duplicate Items', () => {
  test('should handle duplicate product additions correctly TC031', async ({ page }) => {
    console.log(`[[PROPERTY|id=TC031]]`);

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

    // Check initial cart state
    const cartContent = page.locator('.float-cart__shelf-container');
    await expect(cartContent).toBeVisible();
    const cartCountIndicator = page.locator('.float-cart__header .bag__quantity');
    await expect(cartCountIndicator).toBeVisible();
    expect(await cartCountIndicator.textContent()).toBe('0');

    // Function to add iPhone 12 to cart
    async function addIPhone12ToCart() {
      const productTitle = page.getByText('iPhone 12').first();
      await expect(productTitle).toBeVisible();
      const productCard = productTitle.locator('xpath=ancestor::div[contains(@class, "shelf-item")]');
      await expect(productCard).toBeVisible();
      const addToCartButton = productCard.locator('.shelf-item__buy-btn');
      await expect(addToCartButton).toBeEnabled();
      await addToCartButton.click();
      await page.waitForTimeout(1000); // Wait for cart update
    }

    // Add iPhone 12 first time
    await addIPhone12ToCart();

    // Verify first addition
    const cartContainer = page.locator('.float-cart__content');
    await expect(cartContainer).toBeVisible();
    const firstItemCount = await cartContainer.locator('.shelf-item').count();
    expect(firstItemCount).toBe(1);
    
    // Check cart count after first addition
    const firstCartCount = await cartCountIndicator.textContent();
    expect(firstCartCount).toBe('1');

    // Add iPhone 12 second time
    await addIPhone12ToCart();

    // Wait for cart to fully update and be visible
    await page.waitForTimeout(2000);
    const floatCart = page.locator('.float-cart');
    await expect(floatCart).toHaveClass(/float-cart--open/);
    
    // Get the cart count which should show total quantity
    const finalCartCount = await cartCountIndicator.textContent();
    expect(finalCartCount).toBe('2');

    // Verify we have the iPhone 12 in cart
    const cartItems = floatCart.locator('.shelf-item');
    await expect(cartItems).toBeVisible();
    await expect(cartItems).toHaveCount(1); // System combines duplicates into one item
    
    // Verify the item is iPhone 12
    const itemDetails = await cartItems.first().textContent();
    expect(itemDetails).toContain('iPhone 12');

    // Check the subtotal reflects two items
    const subtotal = page.locator('.sub-price__val');
    await expect(subtotal).toBeVisible();
    const subtotalText = await subtotal.textContent();
    const subtotalValue = parseFloat(subtotalText?.replace(/[^0-9.]/g, '') || '0');
    
    const singleItemPrice = await page.getByText('iPhone 12').first().locator('xpath=ancestor::div[contains(@class, "shelf-item")]').locator('.shelf-item__price').textContent();
    const itemPrice = parseFloat(singleItemPrice?.replace(/[^0-9.]/g, '') || '0');
    
    // Verify subtotal is double the single item price
    expect(subtotalValue).toBeCloseTo(itemPrice * 2, 1);

    // Final verification that cart remains open
    const finalCartState = page.locator('.float-cart');
    await expect(finalCartState).toHaveClass(/float-cart--open/);
  });
});