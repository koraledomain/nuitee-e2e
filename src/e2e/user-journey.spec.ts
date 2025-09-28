import { test, expect } from '@playwright/test';

// Simple selectors object - no server needed!
const selectors = {
  // More flexible selectors that work with common patterns
  location: 'input[type="text"], input[placeholder*="search"], input[placeholder*="location"], input[placeholder*="where"]',
  dates: 'input[type="date"], input[placeholder*="date"], input[placeholder*="check"], input[placeholder*="arrival"]',
  guests: 'input[placeholder*="guest"], select[name*="guest"], input[placeholder*="people"], select[name*="people"]',
  searchButton: 'button[type="submit"], button:has-text("Search"), button:has-text("Find"), button:has-text("Go")',
  hotelCards: '[data-testid*="hotel"], .hotel, [class*="hotel"], [class*="property"], [class*="accommodation"]',
  roomCards: '[data-testid*="room"], .room, [class*="room"], [class*="rate"], [class*="option"]',
  bookButton: 'button:has-text("Book"), button:has-text("Select"), button:has-text("Choose"), button:has-text("Reserve")',
  bookingForm: 'form[class*="booking"], form[class*="reservation"], form, [class*="booking"], [class*="reservation"]'
};

test.describe('@journey User Journey - Search to Booking', () => {
  test('Complete user journey: Accept cookies → Search → Select hotel', async ({ page }) => {
    // Step 1: Navigate to the website
    await page.goto('https://v3.nuitee.link');
    await page.waitForLoadState('networkidle');
    console.log('✅ Website loaded');

    // Step 2: Accept cookies if present
    try {
      const cookieButton = page.locator('button:has-text("Accept"), button:has-text("OK"), button:has-text("I agree"), [data-testid*="cookie"]');
      if (await cookieButton.count() > 0) {
        await cookieButton.first().click();
        console.log('✅ Accepted cookies');
      }
    } catch (error) {
      console.log('ℹ️ No cookie banner found');
    }

    // Step 3: Search for a destination
    const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="where"]').first();
    await searchInput.fill('Rome, Italy');
    console.log('✅ Filled search input with "Rome, Italy"');

    // Step 4: Click search button
    const searchButton = page.locator('button[type="submit"], button:has-text("Search"), button:has-text("Find")').first();
    await searchButton.click();
    console.log('✅ Clicked search button');

    // Step 5: Wait for results and select first hotel
    await page.waitForTimeout(3000);
    
    const hotels = page.locator('[data-testid*="hotel"], .hotel, [class*="hotel"], [class*="property"]');
    const hotelCount = await hotels.count();
    console.log(`Found ${hotelCount} hotels`);

    if (hotelCount > 0) {
      await hotels.first().click();
      console.log('✅ Selected first hotel');
    } else {
      console.log('⚠️ No hotels found');
    }

    // Step 6: Take final screenshot
    await page.screenshot({ path: 'reports/user-journey-completed.png' });
    console.log('✅ User journey completed successfully');
    
    // Assertions
    expect(hotelCount).toBeGreaterThan(0);
  });
});
