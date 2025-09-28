import { spec } from 'pactum';
import '../../helpers/client';
import { DF } from '../../helpers/dataFactory';
import { pickOfferByRefundableTag } from '../../helpers/selectors';
import { trackBooking, cleanupAll } from '../../helpers/registry';
import { validateResponse } from '../../helpers/contract';

async function cancelBooking(id: string) {
  await spec().put(`/bookings/${id}?timeout=7`).expectStatus(200);
}

describe.skip('[@journey][@rates][@booking] NRFN → cancel charges flow', () => {
  afterAll(async () => { await cleanupAll(cancelBooking); });

  test('NRFN prebook → book → cancel', async () => {
    const hotels = await spec().get('/data/hotels').withQueryParams({ countryCode: 'IT', cityName: 'Rome' })
      .expectStatus(200).returns('res.body');
    const ids = hotels.data.slice(0, 2).map((h: any) => h.id);

    const rates = await spec().post('/hotels/rates').withJson(DF.ratesBody(ids)).expectStatus(200).returns('res.body');

    const sel = pickOfferByRefundableTag(rates, 'NRFN');
    const pre = await spec().post('/rates/prebook?timeout=30')
      .withJson(DF.prebookBody(sel.offerId))
      .expectStatus(200).returns('res.body');

    const booked = await spec().post('/rates/book')
      .withJson(DF.bookBody(pre.data.prebookId))
      .expectStatus(200).returns('res.body');
    validateResponse('/rates/book', 'post', '200', booked);

    const bookingId = booked.data.bookingId;
    expect(booked.data.status).toBe('CONFIRMED');
    trackBooking(bookingId);

    const cancel = await spec().put(`/bookings/${bookingId}?timeout=7`)
      .expectStatus(200).returns('res.body');
    validateResponse('/bookings/{bookingId}', 'put', '200', cancel);
    expect(['CANCELLED', 'CANCELLED_WITH_CHARGES']).toContain(cancel.data.status);
  });
});
