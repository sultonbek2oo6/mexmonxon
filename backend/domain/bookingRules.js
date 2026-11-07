export const BOOKING_STATUSES = Object.freeze([
  'pending',
  'confirmed',
  'checked-in',
  'cancelled',
  'completed',
]);

export const BOOKING_TRANSITIONS = Object.freeze({
  pending: ['confirmed', 'cancelled'],
  confirmed: ['checked-in', 'cancelled'],
  'checked-in': ['completed'],
  cancelled: ['confirmed'],
  completed: [],
});

export const normalizeBookingStatus = (value) => String(value || '').trim().toLowerCase();
export const canTransitionBooking = (from, to) => (
  Boolean(BOOKING_TRANSITIONS[normalizeBookingStatus(from)]?.includes(normalizeBookingStatus(to)))
);

export function isValidISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isValidDateRange(checkIn, checkOut) {
  return isValidISODate(checkIn) && isValidISODate(checkOut) && checkOut > checkIn;
}

export function hasDateOverlap(start, end, otherStart, otherEnd) {
  return start < otherEnd && end > otherStart;
}
