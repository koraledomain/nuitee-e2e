export function pickFirstOffer(ratesPayload: any) {
  const h = ratesPayload?.data?.find((x: any) => x?.roomTypes?.length);
  const rt = h?.roomTypes?.[0];
  if (!h?.hotelId || !rt?.offerId) throw new Error('No offer found');
  return { hotelId: h.hotelId, offerId: rt.offerId };
}

export function pickOfferByRefundableTag(ratesPayload: any, tag: string) {
  for (const h of ratesPayload?.data ?? []) {
    for (const rt of h?.roomTypes ?? []) {
      for (const r of rt?.rates ?? []) {
        if (r?.cancellationPolicies?.refundableTag === tag) {
          return { hotelId: h.hotelId, offerId: rt.offerId };
        }
      }
    }
  }
  throw new Error(`No offer with refundableTag=${tag}`);
}

export function pickOfferByPaymentType(ratesPayload: any, type: string) {
  for (const h of ratesPayload?.data ?? []) {
    for (const rt of h?.roomTypes ?? []) {
      const pt = new Set(rt?.paymentTypes ?? []);
      if (pt.has(type)) return { hotelId: h.hotelId, offerId: rt.offerId };
    }
  }
  throw new Error(`No offer with payment type ${type}`);
}
