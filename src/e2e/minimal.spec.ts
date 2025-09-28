import { test, expect } from '@playwright/test';

test.describe('@minimal Nuitee Tests', () => {
  test('website loads', async ({ page }) => {
    await page.goto('https://v3.nuitee.link');
    await expect(page).toHaveTitle(/Nuitee/);
  });

  test('has interactive elements', async ({ page }) => {
    await page.goto('https://v3.nuitee.link');
    
    // Check for common elements
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    
    expect(buttons).toBeGreaterThan(0);
    expect(inputs).toBeGreaterThan(0);
  });
});
