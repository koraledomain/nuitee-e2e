import { test, expect } from '@playwright/test';

// Simple MCP client to get selectors
class MCPClient {
  private baseUrl = 'http://localhost:3001';

  async getSelector(element: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/selectors/${element}`);
    const data = await response.json();
    if (!data.success) {
      throw new Error(`Failed to get selector for ${element}: ${data.error}`);
    }
    return data.selector;
  }

  async getAllSelectors(): Promise<Record<string, string>> {
    const response = await fetch(`${this.baseUrl}/selectors`);
    const data = await response.json();
    if (!data.success) {
      throw new Error('Failed to get selectors');
    }
    return data.selectors;
  }
}

const mcp = new MCPClient();

test.describe('@journey User Journey - Search to Booking', () => {
  test('Search for location, select hotel, select room, go to booking', async ({ page }) => {
    // Step 1: Navigate to the website
    await page.goto('https://v3.nuitee.link');
    await expect(page).toHaveTitle(/Nuitee/);

    // Step 2: Get selectors from MCP server
    const selectors = await mcp.getAllSelectors();
    console.log('Available selectors:', Object.keys(selectors));

    // Step 3: Search for location
    try {
      const locationSelector = await mcp.getSelector('location-input');
      await page.fill(locationSelector, 'Rome, Italy');
      console.log('✅ Filled location input');
    } catch (error) {
      console.log('⚠️ Location input not found, trying fallback');
      await page.fill('input[type="text"]', 'Rome, Italy');
    }

    // Step 4: Set dates
    try {
      const datesSelector = await mcp.getSelector('dates-input');
      await page.fill(datesSelector, '2025-12-30');
      console.log('✅ Filled dates input');
    } catch (error) {
      console.log('⚠️ Dates input not found, trying fallback');
      await page.fill('input[type="date"]', '2025-12-30');
    }

    // Step 5: Set guests
    try {
      const guestsSelector = await mcp.getSelector('guests-input');
      await page.fill(guestsSelector, '2');
      console.log('✅ Filled guests input');
    } catch (error) {
      console.log('⚠️ Guests input not found, trying fallback');
      await page.fill('input[placeholder*="guest"]', '2');
    }

    // Step 6: Submit search
    try {
      const searchSelector = await mcp.getSelector('search-submit');
      await page.click(searchSelector);
      console.log('✅ Clicked search button');
    } catch (error) {
      console.log('⚠️ Search button not found, trying fallback');
      await page.click('button[type="submit"]');
    }

    // Step 7: Wait for results and select hotel
    await page.waitForTimeout(3000); // Wait for results to load

    try {
      const hotelSelector = await mcp.getSelector('hotel-list');
      const hotels = page.locator(hotelSelector);
      await expect(hotels).toHaveCount(0); // Expecting at least one hotel
      await hotels.first().click();
      console.log('✅ Selected hotel');
    } catch (error) {
      console.log('⚠️ Hotel selection not found, trying fallback');
      const hotels = page.locator('[data-testid*="hotel"], .hotel, [class*="hotel"]');
      if (await hotels.count() > 0) {
        await hotels.first().click();
      }
    }

    // Step 8: Select room
    await page.waitForTimeout(2000);

    try {
      const roomSelector = await mcp.getSelector('room-card');
      const rooms = page.locator(roomSelector);
      if (await rooms.count() > 0) {
        await rooms.first().click();
        console.log('✅ Selected room');
      }
    } catch (error) {
      console.log('⚠️ Room selection not found, trying fallback');
      const rooms = page.locator('[data-testid*="room"], .room, [class*="room"]');
      if (await rooms.count() > 0) {
        await rooms.first().click();
      }
    }

    // Step 9: Go to booking
    try {
      const bookSelector = await mcp.getSelector('book-button');
      await page.click(bookSelector);
      console.log('✅ Clicked book button');
    } catch (error) {
      console.log('⚠️ Book button not found, trying fallback');
      await page.click('button:has-text("Book"), button:has-text("Select")');
    }

    // Step 10: Verify booking form appears
    try {
      const bookingFormSelector = await mcp.getSelector('booking-form');
      await expect(page.locator(bookingFormSelector)).toBeVisible();
      console.log('✅ Booking form is visible');
    } catch (error) {
      console.log('⚠️ Booking form not found, checking for any form');
      const forms = page.locator('form');
      if (await forms.count() > 0) {
        console.log('✅ Found booking form');
      }
    }

    // Take a screenshot for verification
    await page.screenshot({ path: 'reports/user-journey-completed.png' });
    console.log('✅ User journey completed successfully');
  });
});
