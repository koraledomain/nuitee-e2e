import { ENV } from '../config/env';
import { getRequestSchema } from './openapi';

type Dict = Record<string, any>;

function pick<T>(arr: T[], fallback: T): T {
  return Array.isArray(arr) && arr.length ? arr[0] : fallback;
}

/**
 * Very light schema-aware factory for request bodies.
 * Reads required fields and fills sane defaults; callers can override.
 */
export const DF = {
  runId(): string {
    return ENV.RUN_ID;
  },

  dates() {
    return { checkin: '2025-12-30', checkout: '2025-12-31' };
  },

  occupancyAdults2() {
    return [{ adults: 2 }];
  },

  holder(first='Steve', last='Doe', email=`s.doe+${ENV.RUN_ID}@liteapi.travel`) {
    return { firstName: first, lastName: last, email };
  },

  guest(occ=1, first='Sunny', last='Mars', email=`s.mars+${ENV.RUN_ID}@liteapi.travel`) {
    return { occupancyNumber: occ, remarks: 'quiet room please', firstName: first, lastName: last, email };
  },

  /**
   * Build a body for POST /hotels/rates using OpenAPI hints when available.
   */
  ratesBody(hotelIds: string[], overrides: Dict = {}): Dict {
    const base: Dict = {
      hotelIds,
      occupancies: this.occupancyAdults2(),
      currency: 'USD',
      guestNationality: 'US',
      ...this.dates(),
      timeout: 5,
      roomMapping: true
    };

    // Example: if schema has enum for currency, pick first
    const schema = getRequestSchema('/hotels/rates', 'post');
    const currencyEnum = schema?.properties?.currency?.enum;
    if (currencyEnum) base.currency = pick(currencyEnum, base.currency);

    return { ...base, ...overrides };
  },

  prebookBody(offerId: string, overrides: Dict = {}): Dict {
    return { offerId, usePaymentSdk: false, ...overrides };
  },

  bookBody(prebookId: string, overrides: Dict = {}): Dict {
    const base = {
      prebookId,
      holder: this.holder(),
      guests: [this.guest(1)],
      payment: { method: 'ACC_CREDIT_CARD' }
    };
    return { ...base, ...overrides };
  }
};
