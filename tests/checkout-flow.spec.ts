import { test, expect, Locator } from '@playwright/test';

test.describe('BrowserStack DEMO Checkout Flow', () => {
  // Configure timeout for entire test file
  test.setTimeout(120000); // 2 minutes
  
  test('should complete checkout process successfully TC-225', async ({ page }) => {
    console.log(`[[PROPERTY|id=TC-225]]`);

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

    // Add iPhone 12 to cart with retry logic
    let addToCartButton: Locator;
    await test.step('Add product to cart', async () => {
      const productTitle = page.getByText('iPhone 12', { exact: true }).first();
      await expect(productTitle).toBeVisible({ timeout: 10000 });
      
      const productCard = productTitle.locator('xpath=ancestor::div[contains(@class, "shelf-item")]');
      await expect(productCard).toBeVisible();
      
      addToCartButton = productCard.locator('.shelf-item__buy-btn');
      await expect(addToCartButton).toBeEnabled();
      
      // Ensure the button is visible and scrolled into view
      await addToCartButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000); // Small pause for stability
      
      // Click with retry logic
      let clicked = false;
      let retries = 0;
      const maxRetries = 3;
      
      while (!clicked && retries < maxRetries) {
        try {
          await addToCartButton.click();
          clicked = true;
        } catch (error) {
          retries++;
          if (retries === maxRetries) throw error;
          console.log(`Retry ${retries}/${maxRetries} clicking add to cart button...`);
          await page.waitForTimeout(1000);
        }
      }
      
      // Wait for any animations or state changes with increased timeout
      await page.waitForTimeout(5000);
    });

    // Wait for cart to be ready and verify items with improved stability checks
    const floatCart = page.locator('.float-cart');

    // Retry logic for cart open state
    await test.step('Verify cart is open', async () => {
      let retries = 0;
      const maxRetries = 3;
      while (retries < maxRetries) {
        try {
          // First ensure the float cart element exists and is visible
          await expect(floatCart).toBeVisible({ timeout: 15000 });
          
          // Wait for the cart to be in open state
          await expect(floatCart).toHaveClass(/float-cart--open/, { timeout: 15000 });
          
          // Additional check - verify cart content is present
          const cartContent = floatCart.locator('.float-cart__content');
          await expect(cartContent).toBeVisible({ timeout: 10000 });
          
          break;
        } catch (error) {
          retries++;
          if (retries === maxRetries) {
            // Take a screenshot for debugging before failing
            await page.screenshot({ path: `test-results/cart-open-failure-${retries}.png` });
            throw error;
          }
          console.log(`Retry ${retries}/${maxRetries} waiting for cart to open...`);
          // If cart is not open, try clicking the button again and wait longer
          await addToCartButton.click();
          await page.waitForTimeout(5000);
        }
      }
    });    // Verify cart items after cart is open
    const cartItems = floatCart.locator('.shelf-item');
    await expect(cartItems).toHaveCount(1, { timeout: 10000 });

    // Find and click the buy button
    const buyButton = floatCart.locator('.buy-btn');
    await expect(buyButton).toBeVisible();
    await expect(buyButton).toBeEnabled();
    await buyButton.click();

    // Wait for navigation after clicking buy button
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('Current URL:', page.url());

    // Check for error dialog or loading state
    const errorDialog = page.locator('.error-dialog');
    if (await errorDialog.isVisible()) {
      console.log('Error dialog found:', await errorDialog.textContent());
    }

    // Fill in shipping details
    await test.step('Fill checkout form', async () => {
      // Wait for form fields to be loaded
      await page.waitForSelector('form', { timeout: 10000 });

      // Fill First Name
      const firstNameField = page.getByLabel('First Name');
      await expect(firstNameField).toBeVisible();
      await firstNameField.fill('Monish');

      // Fill Last Name
      const lastNameField = page.getByLabel('Last Name');
      await expect(lastNameField).toBeVisible();
      await lastNameField.fill('Correia');

      // Fill Address
      const addressField = page.getByLabel('Address');
      await expect(addressField).toBeVisible();
      await addressField.fill('SUN VILLA');

      // Fill State/Province
      const stateField = page.getByLabel('State/Province');
      await expect(stateField).toBeVisible();
      await stateField.fill('Maharashtra');

      // Fill Postal Code
      const postalField = page.getByLabel('Postal Code');
      await expect(postalField).toBeVisible();
      await postalField.fill('401301');

      // Find and click submit button - try different possible selectors
      const submitButton = page.getByRole('button', { name: /submit|place order|confirm/i });
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toBeEnabled();
      await submitButton.click();
    });

    // Wait for confirmation page with retry logic
    await test.step('Verify order confirmation', async () => {
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          // Wait for URL change with increased timeout
          await page.waitForURL('**/confirmation', { timeout: 45000 });
          
          // Wait for network and page to stabilize
          await Promise.all([
            page.waitForLoadState('networkidle', { timeout: 45000 }),
            page.waitForLoadState('domcontentloaded', { timeout: 45000 })
          ]);
          
          // Check for success message
          const successMessage = page.locator('[data-test="shipping-address-heading"]');
          await expect(successMessage).toBeVisible({ timeout: 45000 });
          const messageText = await successMessage.textContent();
          expect(messageText).toBe('Your Order has been successfully placed.');
          
          // If we get here, everything worked
          break;
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw error; // Re-throw if we've exhausted retries
          }
          console.log(`Retry ${retryCount}/${maxRetries} for order confirmation...`);
          await page.waitForTimeout(5000); // Wait before retry
        }
      }
    });
      
      // Verify order summary is visible
      const orderSummary = page.getByRole('heading', { name: 'Order Summary' });
      await expect(orderSummary).toBeVisible();
      
      // Verify ordered product is listed
      const orderedProduct = page.getByRole('heading', { name: 'iPhone 12' });
      await expect(orderedProduct).toBeVisible();
  });
});