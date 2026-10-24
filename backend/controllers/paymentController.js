import { executeQuery } from '../config/db.js';

// 1. Yangi to'lov yaratish (Mijoz to'lov qilganda)
export const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    const query = `
      INSERT INTO MEXMONXONALAR_TIZIMI.PAYMENTS (BOOKING_ID, AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS)
      VALUES (:bookingId, :amount, :paymentMethod, 'paid')
    `;

    await executeQuery(query, {
      bookingId: bookingId || null,
      amount,
      paymentMethod: paymentMethod || 'Card'
    });

    res.status(201).json({ message: "To'lov muvaffaqiyatli amalga oshirildi!" });
  } catch (err) {
    console.error("To'lovni saqlashda xatolik:", err);
    res.status(500).json({ error: "To'lovni amalga oshirishda xatolik yuz berdi" });
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
        u.FIRST_NAME || ' ' || u.LAST_NAME AS GUEST_NAME
      FROM MEXMONXONALAR_TIZIMI.PAYMENTS p
      LEFT JOIN MEXMONXONALAR_TIZIMI.BOOKINGS b ON p.BOOKING_ID = b.ID
      LEFT JOIN MEXMONXONALAR_TIZIMI.USERS u ON b.USER_ID = u.ID
      ORDER BY p.PAID_AT DESC
    `;

    const result = await executeQuery(query);
    res.json(result.rows);
  } catch (err) {
    console.error("To'lovlarni olishda xatolik:", err);
    res.status(500).json({ error: "To'lovlar ro'yxatini olishda xatolik yuz berdi" });
  }
};