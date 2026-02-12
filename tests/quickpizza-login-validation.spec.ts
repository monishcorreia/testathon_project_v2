import { test, expect } from '@playwright/test';

test.describe('Quick Pizza Login Validation', () => {
  test('should show validation message when trying to submit feedback without login', async ({ page }) => {
    console.log('[[PROPERTY|id=QUICKPIZZA001]]');
    
    // Step 1: Navigate to Quick Pizza website
    await page.goto('https://quickpizza.grafana.com/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('load');
    
    // Step 2: Click on "Pizza, Please!" button
    const pizzaPleaseButton = page.getByRole('button', { name: /pizza.*please/i });
    await expect(pizzaPleaseButton).toBeVisible({ timeout: 10000 });
    await pizzaPleaseButton.click();
    
    // Wait for any modal or content to load
    await page.waitForTimeout(1000);
    
    // Step 3: Click on "Love it!" button
    const loveItButton = page.getByRole('button', { name: /love.*it/i });
    await expect(loveItButton).toBeVisible({ timeout: 10000 });
    await loveItButton.click();
    
    // Wait for validation message
    await page.waitForTimeout(1000);
    
    // Step 4: Verify that validation message appears
    const validationMessage = page.getByText(/please.*log.*in.*first/i);
    await expect(validationMessage).toBeVisible({ timeout: 10000 });
    
    // Additional verification - check the exact text
    const messageText = await validationMessage.textContent();
    expect(messageText?.toLowerCase()).toContain('please');
    expect(messageText?.toLowerCase()).toContain('log in');
    expect(messageText?.toLowerCase()).toContain('first');
  });
});
