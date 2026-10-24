import oracledb from 'oracledb';
import { executeQuery } from '../config/db.js';

const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const createBooking = async (req, res) => {
  const userId = req.user.id;
  const roomId = Number(req.body.roomId);
  const { checkInDate, checkOutDate, fullName, phone, paymentMethod = 'Cash' } = req.body;
  const allowedPaymentMethods = new Set(['card', 'click', 'payme', 'cash']);
  const normalizedPaymentMethod = String(paymentMethod).trim().toLowerCase();

  if (!Number.isInteger(roomId) || roomId <= 0 || !isValidDate(checkInDate) || !isValidDate(checkOutDate) ||
      new Date(`${checkOutDate}T00:00:00Z`) <= new Date(`${checkInDate}T00:00:00Z`)) {
    return res.status(400).json({ message: 'Xona va kirish/chiqish sanalarini to‘g‘ri kiriting.' });
  }
  if (!String(fullName || '').trim() || !String(phone || '').trim()) {
    return res.status(400).json({ message: 'Ism va telefon raqamini kiriting.' });
  }
  if (!allowedPaymentMethods.has(normalizedPaymentMethod)) {
    return res.status(400).json({ message: 'To‘lov usuli noto‘g‘ri.' });
  }

  let connection;
  let failedStep = 'Oracle bazasiga ulanish';
  try {
    connection = await oracledb.getConnection();
    failedStep = 'Xona mavjudligini tekshirish';
    const room = await connection.execute(
      `SELECT rt.BASE_PRICE FROM MEXMONXONALAR_TIZIMI.ROOMS r
       JOIN MEXMONXONALAR_TIZIMI.ROOM_TYPES rt ON rt.ID = r.TYPE_ID
       WHERE r.ID = :roomId AND LOWER(TRIM(r.STATUS)) NOT IN ('cleaning', 'maintenance', 'ta’mirda')
       FOR UPDATE OF r.ID`,
      { roomId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!room.rows.length) {
      await connection.rollback();
      return res.status(409).json({ message: 'Tanlangan xona mavjud emas yoki band.' });
    }

    failedStep = 'Bron sanalari to‘qnashuvini tekshirish';
    const overlap = await connection.execute(
      `SELECT ID FROM MEXMONXONALAR_TIZIMI.BOOKINGS
       WHERE ROOM_ID = :roomId AND LOWER(STATUS) NOT IN ('cancelled', 'bekor qilingan')
         AND CHECK_IN_DATE < TO_DATE(:checkOutDate, 'YYYY-MM-DD')
         AND CHECK_OUT_DATE > TO_DATE(:checkInDate, 'YYYY-MM-DD')`,
      { roomId, checkInDate, checkOutDate }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (overlap.rows.length) {
      await connection.rollback();
      return res.status(409).json({ message: 'Bu sanalarda xona allaqachon bron qilingan.' });
    }

    const price = Number(room.rows[0].BASE_PRICE);
    const nights = (new Date(`${checkOutDate}T00:00:00Z`) - new Date(`${checkInDate}T00:00:00Z`)) / 86400000;
    const totalAmount = price * nights;
    failedStep = 'BOOKINGS jadvaliga bron yozish';
    const inserted = await connection.execute(
      `INSERT INTO MEXMONXONALAR_TIZIMI.BOOKINGS
         (USER_ID, ROOM_ID, CHECK_IN_DATE, CHECK_OUT_DATE, TOTAL_AMOUNT, STATUS)
       VALUES (:userId, :roomId, TO_DATE(:checkInDate, 'YYYY-MM-DD'), TO_DATE(:checkOutDate, 'YYYY-MM-DD'), :totalAmount, 'pending')
       RETURNING ID INTO :bookingId`,
      {
        userId, roomId, checkInDate, checkOutDate, totalAmount,
        bookingId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }, { autoCommit: false }
    );
    const bookingId = inserted.outBinds.bookingId[0];
    failedStep = 'PAYMENTS jadvaliga to‘lov yozish';
    await connection.execute(
      `INSERT INTO MEXMONXONALAR_TIZIMI.PAYMENTS (BOOKING_ID, AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS)
       VALUES (:bookingId, :totalAmount, :paymentMethod, 'pending')`,
      { bookingId, totalAmount, paymentMethod: normalizedPaymentMethod }, { autoCommit: false }
    );
    failedStep = 'Bron tranzaksiyasini tasdiqlash';
    await connection.commit();
    return res.status(201).json({ bookingId, totalAmount, status: 'pending', message: 'Bron so‘rovi yuborildi. Administrator tasdiqlashini kuting.' });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    console.error(`Bron yaratishda xatolik (${failedStep}):`, error);
    const details = process.env.NODE_ENV === 'production'
      ? undefined
      : `${failedStep}: ${error.code || 'DB_ERROR'} — ${error.message}`;
    return res.status(500).json({
      message: details || 'Bronni saqlashda server xatoligi yuz berdi.',
      ...(details ? { code: error.code || 'DB_ERROR', step: failedStep } : {})
    });
  } finally {
    if (connection) await connection.close().catch((error) => console.error('Ulanishni yopishda xatolik:', error));
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT b.ID, b.ROOM_ID, b.CHECK_IN_DATE, b.CHECK_OUT_DATE, b.TOTAL_AMOUNT, b.STATUS,
              r.ROOM_NUMBER, rt.TYPE_NAME, rt.IMAGE_URL, rt.CAPACITY,
              (SELECT p.PAYMENT_STATUS
                 FROM MEXMONXONALAR_TIZIMI.PAYMENTS p
                WHERE p.BOOKING_ID = b.ID
                ORDER BY p.ID DESC FETCH FIRST 1 ROW ONLY) AS PAYMENT_STATUS
       FROM MEXMONXONALAR_TIZIMI.BOOKINGS b
       JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON b.ROOM_ID = r.ID
       JOIN MEXMONXONALAR_TIZIMI.ROOM_TYPES rt ON r.TYPE_ID = rt.ID
       WHERE b.USER_ID = :userId
       ORDER BY b.CREATED_AT DESC`,
      { userId: req.user.id }
    );
    return res.json(result.rows || []);
  } catch (error) {
    console.error('Bronlarni olishda xatolik:', error);
    return res.status(500).json({ message: 'Bronlarni bazadan olishda xatolik yuz berdi.' });
  }
};

export const getBookingServiceOrders = async (req, res) => {
  const bookingId = Number(req.params.bookingId);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return res.status(400).json({ message: 'Bron raqami noto‘g‘ri.' });
  }

  try {
    const result = await executeQuery(
      `SELECT so.ID, so.ORDERED_AT, so.QUANTITY, so.TOTAL_PRICE,
              s.SERVICE_NAME,
              room_staff.ROOM_STAFF
         FROM MEXMONXONALAR_TIZIMI.BOOKINGS b
         JOIN MEXMONXONALAR_TIZIMI.SERVICE_ORDERS so ON so.BOOKING_ID = b.ID
         JOIN MEXMONXONALAR_TIZIMI.SERVICES s ON s.ID = so.SERVICE_ID
         LEFT JOIN (
           SELECT staff_by_room.ROOM_ID,
                  LISTAGG(staff_by_room.STAFF_NAME, ', ') WITHIN GROUP (ORDER BY staff_by_room.STAFF_NAME) AS ROOM_STAFF
             FROM (
               SELECT DISTINCT h.ROOM_ID, e.FIRST_NAME || ' ' || e.LAST_NAME AS STAFF_NAME
                 FROM MEXMONXONALAR_TIZIMI.HOUSEKEEPING h
                 JOIN MEXMONXONALAR_TIZIMI.EMPLOYEES e ON e.ID = h.EMPLOYEE_ID
             ) staff_by_room
            GROUP BY staff_by_room.ROOM_ID
         ) room_staff ON room_staff.ROOM_ID = b.ROOM_ID
        WHERE b.ID = :bookingId AND b.USER_ID = :userId
        ORDER BY so.ORDERED_AT DESC, so.ID DESC`,
      { bookingId, userId: req.user.id }
    );
    return res.json(result.rows || []);
  } catch (error) {
    console.error('Bron xizmatlari tarixini olishda xatolik:', error);
    return res.status(500).json({ message: 'Xizmatlar tarixini bazadan olishda xatolik yuz berdi.' });
  }
};
