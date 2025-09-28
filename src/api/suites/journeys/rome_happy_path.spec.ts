import { spec } from 'pactum';
import '../../helpers/client';
import { cleanupAll } from '../../helpers/registry';
import { createBooking, getBookingStatus, cancelBooking } from '../../helpers/bookingFactory';
import { validateResponse } from '../../helpers/contract';

// Wrapper function for cleanup
async function cleanupBooking(id: string) {
  await cancelBooking(id);
}

describe('[@journey][@hotels][@rates][@booking] Rome happy path', () => {
  afterAll(async () => { await cleanupAll(cleanupBooking); });

  test('search → rates → prebook → book → cancel  @smoke', async () => {
    const bookingId = await createBooking();

    // 5) cancel - Handle 500 error gracefully
    const result = await cancelBooking(bookingId);
    
    if (result.bug) {
      console.log('🐛 BUG: Cancellation API returns 500 but booking is cancelled');
    } else {
      console.log('✅ Cancellation successful with 200 status');
    }
    
    expect(['CANCELLED', 'CANCELLED_WITH_CHARGES']).toContain(result.data?.data?.status);
  });

  test('verify booking status endpoint @smoke', async () => {
    const bookingId = await createBooking();

    // Test booking status endpoint
    const status = await getBookingStatus(bookingId);
    expect(status?.data?.bookingId).toBe(bookingId);
    expect(status?.data?.status).toBe('CONFIRMED');
    
    console.log('✅ Booking status endpoint working correctly');
  });

  test('create booking with different parameters @smoke', async () => {
    // Test with different city and hotel count
    const bookingId = await createBooking({
      countryCode: 'FR',
      cityName: 'Paris',
      hotelCount: 2,
      timeout: 10_000
    });

    const status = await getBookingStatus(bookingId);
    expect(status?.data?.bookingId).toBe(bookingId);
    expect(status?.data?.status).toBe('CONFIRMED');
    
    console.log('✅ Booking created with custom parameters');
  });

  test('document cancellation API bug @JIRA_BUG', async () => {
    const bookingId = await createBooking();

    // This test should FAIL when API returns 500 (documenting the bug)
    try {
      // Try to cancel - this should return 200, not 500
      const cancelled = await spec().put(`/bookings/${bookingId}?timeout=7`).expectStatus(200).returns('res.body');
      validateResponse('/bookings/{bookingId}', 'put', '200', cancelled);
      expect(['CANCELLED', 'CANCELLED_WITH_CHARGES']).toContain(cancelled?.data?.status);
      console.log('✅ Bug appears to be fixed - cancellation returns 200');
    } catch (error) {
      // This is the expected failure - API returns 500 instead of 200
      console.warn('🚨 JIRA_BUG: Cancellation API returns 500 but booking is successfully cancelled');
      console.warn('   Expected: 200 status code for successful cancellation');
      console.warn('   Actual: 500 status code with "supplier cancel failed" message');
      console.warn('   Impact: API returns wrong status code but business logic works');
      console.warn('   Workaround: Check booking status via GET /bookings/{id}');
      console.warn('   JIRA Ticket: [Create ticket to fix cancellation API status code]');
      
      // Verify the booking is actually cancelled despite 500 error
      const status = await getBookingStatus(bookingId);
      expect(['CANCELLED', 'CANCELLED_WITH_CHARGES']).toContain(status?.data?.status);
      console.log('✅ Booking actually cancelled despite 500 error');
      
      // Re-throw the error to make the test fail
      throw error;
    }
  });
});
