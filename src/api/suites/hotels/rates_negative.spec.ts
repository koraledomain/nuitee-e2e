import { spec } from 'pactum';
import '../../helpers/client';
import { DF } from '../../helpers/dataFactory';

describe('[@rates][@negative] rates validation & auth', () => {
  test('invalid request without check in check out', async () => {
    const bad = await spec().post('/hotels/rates').withJson({
      hotelIds: ['lp19ce8'],
      occupancies: [{ adults: 2 }],
      currency: 'USD',
      guestNationality: 'US',
      timeout: 3,
      roomMapping: true
    }).expectStatus(400).returns('res.body');
    expect(bad).toBeTruthy();
  });

  test('missing API key → 401/403', async () => {
    await spec()
      .post('/hotels/rates')
      .withHeaders('X-Api-Key', '')
      .withJson(DF.ratesBody(['lp19ce8']))
      .expectStatus(401);
  });
});
