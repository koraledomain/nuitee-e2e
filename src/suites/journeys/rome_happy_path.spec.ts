import { spec } from 'pactum';
import '../../helpers/client';
import { DF } from '../../helpers/dataFactory';
import { trackBooking, cleanupAll } from '../../helpers/registry';
import { pickFirstOffer } from '../../helpers/selectors';
import { validateResponse } from '../../helpers/contract';

async function cancelBooking(id: string) {
  const res = await spec().put(`/bookings/${id}?timeout=7`).expectStatus(200).returns('res.body');
  validateResponse('/bookings/{bookingId}', 'put', '200', res);
}

describe.only('[@journey][@hotels][@rates][@booking] Rome happy path', () => {
  afterAll(async () => { await cleanupAll(cancelBooking); });

  test('search → rates → prebook → book → cancel  @smoke', async () => {
    // 1) search hotels Rome/IT
    const hotels = await spec()
      .get('/data/hotels')
      .withQueryParams({ countryCode: 'IT', cityName: 'Rome' })
      .expectStatus(200)
      .returns('res.body');
    validateResponse('/data/hotels', 'get', '200', hotels);
    expect(Array.isArray(hotels.data)).toBe(true);
    const hotelIds = hotels.data.slice(0, 2).map((h: any) => h.id);
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
      .withRequestTimeout(15_000)
      .withJson(DF.bookBody(prebookId))
      .expectStatus(200)
      .returns('res.body');
    validateResponse('/rates/book', 'post', '200', booked);

    const bookingId = booked?.data?.bookingId;
    expect(booked?.data?.status).toBe('CONFIRMED');
    expect(booked?.data?.currency).toBe('USD');
    expect(bookingId).toBeTruthy();

    trackBooking(bookingId!);

    // 5) cancel
    const cancelled = await spec().put(`/bookings/${bookingId}?timeout=7`).expectStatus(200).returns('res.body');
    validateResponse('/bookings/{bookingId}', 'put', '200', cancelled);
    expect(['CANCELLED', 'CANCELLED_WITH_CHARGES']).toContain(cancelled?.data?.status);
  });
});
