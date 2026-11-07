import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransitionPayment,
  isPaidStatus,
  isPendingStatus,
  summarizePayments,
} from '../domain/finance.js';
import {
  canTransitionBooking,
  hasDateOverlap,
  isValidDateRange,
  isValidISODate,
  normalizeBookingStatus,
} from '../domain/bookingRules.js';

test('legacy and current successful payment statuses count as received', () => {
  for (const status of ['paid', 'completed', ' COMPLETE ', 'success', 'successful', 'confirmed']) {
    assert.equal(isPaidStatus(status), true, status);
  }
  for (const status of ['pending', 'awaiting', 'awaiting payment', 'cancelled', 'failed']) {
    assert.equal(isPaidStatus(status), false, status);
  }
});

test('pending payments stay separate and do not inflate received revenue', () => {
  const summary = summarizePayments([
    { PAYMENT_STATUS: 'completed', AMOUNT: 3901450 },
    { PAYMENT_STATUS: 'pending', AMOUNT: 14850000 },
    { PAYMENT_STATUS: 'cancelled', AMOUNT: 800000 },
  ], [{ AMOUNT: 250000 }]);

  assert.deepEqual(summary, {
    received: 3901450,
    pending: 14850000,
    spent: 250000,
    balance: 3651450,
    paidCount: 1,
  });
  assert.equal(isPendingStatus(' AWAITING PAYMENT '), true);
});

test('payments can only be finalized from a pending state', () => {
  assert.equal(canTransitionPayment('pending', 'paid'), true);
  assert.equal(canTransitionPayment('awaiting payment', 'cancelled'), true);
  assert.equal(canTransitionPayment('paid', 'pending'), false);
  assert.equal(canTransitionPayment('cancelled', 'paid'), false);
});

test('booking dates reject impossible dates and checkout on or before check-in', () => {
  assert.equal(isValidISODate('2026-06-11'), true);
  assert.equal(isValidISODate('2026-02-30'), false);
  assert.equal(isValidISODate('11/06/2026'), false);
  assert.equal(isValidDateRange('2026-06-11', '2026-06-12'), true);
  assert.equal(isValidDateRange('2026-06-11', '2026-06-11'), false);
  assert.equal(isValidDateRange('2026-06-12', '2026-06-11'), false);
});

test('booking overlap uses half-open dates so same-day turnover is allowed', () => {
  assert.equal(hasDateOverlap('2026-06-11', '2026-06-14', '2026-06-13', '2026-06-15'), true);
  assert.equal(hasDateOverlap('2026-06-11', '2026-06-14', '2026-06-14', '2026-06-15'), false);
  assert.equal(normalizeBookingStatus(' Confirmed '), 'confirmed');
});

test('booking lifecycle only allows valid status transitions', () => {
  assert.equal(canTransitionBooking('pending', 'confirmed'), true);
  assert.equal(canTransitionBooking('pending', 'cancelled'), true);
  assert.equal(canTransitionBooking('confirmed', 'checked-in'), true);
  assert.equal(canTransitionBooking('checked-in', 'completed'), true);
  assert.equal(canTransitionBooking('completed', 'confirmed'), false);
  assert.equal(canTransitionBooking('pending', 'completed'), false);
  assert.equal(canTransitionBooking('cancelled', 'checked-in'), false);
});
