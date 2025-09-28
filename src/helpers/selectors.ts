export function pickFirstOffer(ratesPayload: any) {
  const hotel = ratesPayload?.data?.find(h => h?.roomTypes?.length);
  const roomType = hotel?.roomTypes?.[0];

  if (!hotel?.hotelId || !roomType?.offerId) {
    throw new Error("No offer found");
  }

  return { hotelId: hotel.hotelId, offerId: roomType.offerId };
}