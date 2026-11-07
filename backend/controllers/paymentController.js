import { executeQuery } from '../config/db.js';
import { PAID_STATUSES_SQL, PENDING_STATUSES_SQL } from '../domain/finance.js';

export const getFinanceSummary = async (_req, res) => {
  try {
    const [payments, expenses] = await Promise.all([
      executeQuery(`SELECT NVL(SUM(CASE WHEN LOWER(TRIM(PAYMENT_STATUS)) IN (${PAID_STATUSES_SQL}) THEN AMOUNT ELSE 0 END),0) RECEIVED,
                           NVL(SUM(CASE WHEN LOWER(TRIM(PAYMENT_STATUS)) IN (${PENDING_STATUSES_SQL}) THEN AMOUNT ELSE 0 END),0) PENDING,
                           COUNT(CASE WHEN LOWER(TRIM(PAYMENT_STATUS)) IN (${PAID_STATUSES_SQL}) THEN 1 END) PAID_COUNT
                      FROM MEXMONXONALAR_TIZIMI.PAYMENTS`),
      executeQuery('SELECT NVL(SUM(AMOUNT),0) SPENT, COUNT(*) EXPENSE_COUNT FROM MEXMONXONALAR_TIZIMI.HOTEL_EXPENSES')
    ]);
    const received = Number(payments.rows?.[0]?.RECEIVED || 0);
    const spent = Number(expenses.rows?.[0]?.SPENT || 0);
    return res.json({ received, pending: Number(payments.rows?.[0]?.PENDING || 0), paidCount: Number(payments.rows?.[0]?.PAID_COUNT || 0), spent, expenseCount: Number(expenses.rows?.[0]?.EXPENSE_COUNT || 0), balance: received - spent });
  } catch (error) {
    console.error('Finance summary failed:', error);
    return res.status(500).json({ message: 'Moliyaviy jami ma’lumotlarini olishda xatolik.' });
  }
};

export const getExpenses = async (_req, res) => {
  try {
    const result = await executeQuery(`SELECT e.ID, e.CATEGORY, e.DESCRIPTION, e.AMOUNT,
                                              TO_CHAR(e.EXPENSE_DATE, 'YYYY-MM-DD') EXPENSE_DATE,
                                              e.CREATED_AT, u.FIRST_NAME || ' ' || u.LAST_NAME CREATED_BY_NAME
                                         FROM MEXMONXONALAR_TIZIMI.HOTEL_EXPENSES e
                                         LEFT JOIN MEXMONXONALAR_TIZIMI.USERS u ON u.ID=e.CREATED_BY
                                        ORDER BY e.EXPENSE_DATE DESC, e.ID DESC`);
    return res.json(result.rows || []);
  } catch (error) {
    console.error('Expenses list failed:', error);
    return res.status(500).json({ message: 'Xarajatlarni olishda xatolik.' });
  }
};

export const createExpense = async (req, res) => {
  const category = String(req.body.category || '').trim();
  const description = String(req.body.description || '').trim();
  const amount = Number(req.body.amount);
  const date = String(req.body.date || '');
  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
  const validDate = parsedDate && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date;
  if (!category || category.length > 80 || !description || description.length > 500 || !Number.isFinite(amount) || amount <= 0 || !validDate) {
    return res.status(400).json({ message: 'Xarajat turi, izoh, musbat summa va sana to‘g‘ri kiritilsin.' });
  }
  try {
    await executeQuery(`INSERT INTO MEXMONXONALAR_TIZIMI.HOTEL_EXPENSES (CATEGORY, DESCRIPTION, AMOUNT, EXPENSE_DATE, CREATED_BY)
                        VALUES (:category, :description, :amount, TO_DATE(:date_value,'YYYY-MM-DD'), :created_by)`,
    { category, description, amount, date_value: date, created_by: req.user.id });
    return res.status(201).json({ message: 'Xarajat saqlandi.' });
  } catch (error) {
    console.error('Expense create failed:', error);
    return res.status(500).json({ message: 'Xarajatni saqlashda xatolik.' });
  }
};

// 2. Barcha to'lovlar ro'yxatini olish (Admin panel uchun)
export const getAllPayments = async (req, res) => {
  try {
    const query = `
      SELECT 
        p.ID, 
        p.BOOKING_ID, 
        p.AMOUNT, 
        p.PAYMENT_METHOD, 
        p.PAYMENT_STATUS, 
        p.PAID_AT,
        NVL(p.PAID_AT, b.CREATED_AT) AS TRANSACTION_DATE,
        b.STATUS AS BOOKING_STATUS,
        r.ROOM_NUMBER,
        u.FIRST_NAME || ' ' || u.LAST_NAME AS GUEST_NAME
      FROM MEXMONXONALAR_TIZIMI.PAYMENTS p
      LEFT JOIN MEXMONXONALAR_TIZIMI.BOOKINGS b ON p.BOOKING_ID = b.ID
      LEFT JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON b.ROOM_ID = r.ID
      LEFT JOIN MEXMONXONALAR_TIZIMI.USERS u ON b.USER_ID = u.ID
      ORDER BY NVL(p.PAID_AT, b.CREATED_AT) DESC, p.ID DESC
    `;

    const result = await executeQuery(query);
    res.json(result.rows);
  } catch (err) {
    console.error("To'lovlarni olishda xatolik:", err);
    res.status(500).json({ error: "To'lovlar ro'yxatini olishda xatolik yuz berdi" });
  }
};
