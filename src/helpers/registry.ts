type Resource = { type: 'booking'; id: string };
const registry: Resource[] = [];

export function trackBooking(id: string) {
  registry.push({ type: 'booking', id });
}

export async function cleanupAll(cancelFn: (bookingId: string) => Promise<void>) {
  for (const r of registry.reverse()) {
    try { await cancelFn(r.id); } catch { /* ignore cleanup errors */ }
  }
}
