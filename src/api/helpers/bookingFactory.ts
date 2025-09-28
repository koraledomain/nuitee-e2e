import { spec } from 'pactum';
import { DF } from './dataFactory';
import { pickFirstOffer } from './selectors';
import { validateResponse } from './contract';
import { trackBooking } from './registry';

export interface BookingOptions {
  countryCode?: string;
  cityName?: string;
  hotelCount?: number;
  timeout?: number;
}

export async function createBooking(options: BookingOptions = {}): Promise<string> {
  const {
    countryCode = 'IT',
    cityName = 'Rome',
    hotelCount = 1,
    timeout = 15_000
  } = options;

  // 1) search hotels
  const hotels = await spec()
    .get('/data/hotels')
    .withRequestTimeout(timeout)  
    .withQueryParams({ countryCode, cityName })
    .expectStatus(200)
    .returns('res.body');
  validateResponse('/data/hotels', 'get', '200', hotels);
  expect(Array.isArray(hotels.data)).toBe(true);
  
  const hotelIds = hotels.data.slice(0, hotelCount).map((h: any) => h.id);
  expect(hotelIds.length).toBeGreaterThan(0);

  // 2) rates
  const rates = await spec()
    .post('/hotels/rates')
    .withJson(DF.ratesBody(hotelIds))
    .expectStatus(200)
    .returns('res.body');
  validateResponse('/hotels/rates', 'post', '200', rates);

  const sel = pickFirstOffer(rates);

  // 3) prebook
  const pre = await spec()
    .post('/rates/prebook?timeout=30')
    .withJson(DF.prebookBody(sel.offerId))
    .expectStatus(200)
    .returns('res.body');
  validateResponse('/rates/prebook', 'post', '200', pre);
  const prebookId = pre?.data?.prebookId;
  expect(prebookId).toBeTruthy();

  // 4) book
  const booked = await spec()
    .post('/rates/book')
    .withRequestTimeout(timeout)
    .withJson(DF.bookBody(prebookId))
    .expectStatus(200)
    .returns('res.body');
  validateResponse('/rates/book', 'post', '200', booked);

  const bookingId = booked?.data?.bookingId;
  expect(booked?.data?.status).toBe('CONFIRMED');
  expect(booked?.data?.currency).toBe('USD');
  expect(bookingId).toBeTruthy();

  trackBooking(bookingId!);
  return bookingId;
}

export async function getBookingStatus(bookingId: string, timeout = 1.5) {
  const status = await spec()
    .get(`/bookings/${bookingId}?timeout=${timeout}`)
    .expectStatus(200)
    .returns('res.body');
  
  validateResponse('/bookings/{bookingId}', 'get', '200', status);
  return status;
}

export async function cancelBooking(bookingId: string, timeout = 7) {
  try {
    const cancelled = await spec()
      .put(`/bookings/${bookingId}?timeout=${timeout}`)
      .expectStatus(200)
      .returns('res.body');
    validateResponse('/bookings/{bookingId}', 'put', '200', cancelled);
    return { success: true, data: cancelled };
  } catch (error) {
    // Handle 500 error - check if booking is actually cancelled
    console.log('🐛 BUG: Cancellation returned 500, checking booking status...');
    const status = await getBookingStatus(bookingId);
    
    if (['CANCELLED', 'CANCELLED_WITH_CHARGES'].includes(status?.data?.status)) {
      console.log('✅ Booking actually cancelled despite 500 error');
      return { success: true, data: status, bug: true };
    } else {
      throw new Error(`Booking not cancelled. Status: ${status?.data?.status}`);
    }
  }
}
