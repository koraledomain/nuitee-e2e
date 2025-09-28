import { spec } from 'pactum';
import '../../helpers/client';

describe('[@bookings][@negative] cancel invalid booking', () => {
  test('cancel with unknown id → 400/404', async () => {
    await spec().put('/bookings/UNKNOWN_ID?timeout=5').expectStatus(404);
  });
});
