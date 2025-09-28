import { spec } from 'pactum';
import '../../helpers/client';
import { DF } from '../../helpers/dataFactory';
import { pickOfferByPaymentType } from '../../helpers/selectors';
import { trackBooking, cleanupAll } from '../../helpers/registry';

async function cancelBooking(id: string) { await spec().put(`/bookings/${id}?timeout=7`).expectStatus(200); }

describe.skip('[@journey][@rates][@booking] Multi-occupancy + alt payment', () => {
  afterAll(async () => { await cleanupAll(cancelBooking); });

  test('two occupancies, WALLET or NUITEE_PAY', async () => {
    const hotels = await spec().get('/data/hotels').withQueryParams({ countryCode: 'IT', cityName: 'Rome' })
      .expectStatus(200).returns('res.body');
    const ids = hotels.data.slice(0,2).map((h:any)=>h.id);

    const occ = [{ adults: 2 }, { adults: 2 }];
    const rates = await spec().post('/hotels/rates').withJson(DF.ratesBody(ids, { occupancies: occ }))
      .expectStatus(200).returns('res.body');

    let sel;
    try { sel = pickOfferByPaymentType(rates, 'WALLET'); }
    catch { sel = pickOfferByPaymentType(rates, 'NUITEE_PAY'); }

    const pre = await spec().post('/rates/prebook?timeout=30')
      .withJson(DF.prebookBody(sel.offerId))
      .expectStatus(200).returns('res.body');

    const method = 'WALLET';
    const booked = await spec().post('/rates/book').withJson(DF.bookBody(pre.data.prebookId, {
      payment: { method },
      guests: [DF.guest(1)] // add more guests if API demands per occupancy
    })).expectStatus(200).returns('res.body');

    expect(booked.data.status).toBe('CONFIRMED');
    trackBooking(booked.data.bookingId);

    await spec().put(`/bookings/${booked.data.bookingId}?timeout=7`).expectStatus(200);
  });
});
