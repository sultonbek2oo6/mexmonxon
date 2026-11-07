export const PAID_STATUSES = Object.freeze([
  'paid',
  'complete',
  'completed',
  'success',
  'successful',
  'confirmed',
]);

export const PENDING_STATUSES = Object.freeze([
  'pending',
  'awaiting',
  'awaiting payment',
]);

export const PAID_STATUSES_SQL = PAID_STATUSES.map((status) => `'${status}'`).join(', ');
export const PENDING_STATUSES_SQL = PENDING_STATUSES.map((status) => `'${status}'`).join(', ');

export const normalizePaymentStatus = (value) => String(value || '').trim().toLowerCase();
export const isPaidStatus = (value) => PAID_STATUSES.includes(normalizePaymentStatus(value));
export const isPendingStatus = (value) => PENDING_STATUSES.includes(normalizePaymentStatus(value));
export const canTransitionPayment = (from, to) => isPendingStatus(from) && ['paid', 'failed', 'cancelled'].includes(normalizePaymentStatus(to));

export function summarizePayments(payments = [], expenses = []) {
  const received = payments.reduce((sum, payment) => (
    isPaidStatus(payment.PAYMENT_STATUS) ? sum + Number(payment.AMOUNT || 0) : sum
  ), 0);
  const pending = payments.reduce((sum, payment) => (
    isPendingStatus(payment.PAYMENT_STATUS) ? sum + Number(payment.AMOUNT || 0) : sum
  ), 0);
  const spent = expenses.reduce((sum, expense) => sum + Number(expense.AMOUNT || 0), 0);

  return {
    received,
    pending,
    spent,
    balance: received - spent,
    paidCount: payments.filter((payment) => isPaidStatus(payment.PAYMENT_STATUS)).length,
  };
}
