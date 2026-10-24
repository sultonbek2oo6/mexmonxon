import oracledb from 'oracledb';
import { executeQuery } from '../config/db.js';

export const getAllServices = async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT ID, SERVICE_NAME, PRICE, IMAGE_URL
       FROM MEXMONXONALAR_TIZIMI.SERVICES ORDER BY SERVICE_NAME`
    );
    return res.json(result.rows || []);
  } catch (error) {
    console.error('Xizmatlarni olishda xatolik:', error);
    return res.status(500).json({ message: 'Xizmatlarni bazadan olishda xatolik yuz berdi.' });
  }
};

export const getAllServiceOrders = async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT so.ID AS ID, r.ROOM_NUMBER AS ROOM_NUMBER,
              s.SERVICE_NAME AS SERVICE_NAME, so.QUANTITY AS QUANTITY,
              so.TOTAL_PRICE AS TOTAL_PRICE, so.ORDERED_AT AS SCHEDULED_AT,
              u.FIRST_NAME || ' ' || u.LAST_NAME AS GUEST_NAME,
              room_staff.STAFF_NAMES AS STAFF_NAMES
         FROM MEXMONXONALAR_TIZIMI.SERVICE_ORDERS so
         JOIN MEXMONXONALAR_TIZIMI.BOOKINGS b ON b.ID = so.BOOKING_ID
         JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.ID = b.ROOM_ID
         JOIN MEXMONXONALAR_TIZIMI.SERVICES s ON s.ID = so.SERVICE_ID
         JOIN MEXMONXONALAR_TIZIMI.USERS u ON u.ID = b.USER_ID
         LEFT JOIN (
           SELECT staff_by_room.ROOM_ID,
                  LISTAGG(staff_by_room.STAFF_NAME, ', ') WITHIN GROUP (ORDER BY staff_by_room.STAFF_NAME) AS STAFF_NAMES
             FROM (
               SELECT DISTINCT h.ROOM_ID, e.FIRST_NAME || ' ' || e.LAST_NAME AS STAFF_NAME
                 FROM MEXMONXONALAR_TIZIMI.HOUSEKEEPING h
                 JOIN MEXMONXONALAR_TIZIMI.EMPLOYEES e ON e.ID = h.EMPLOYEE_ID
             ) staff_by_room
            GROUP BY staff_by_room.ROOM_ID
         ) room_staff ON room_staff.ROOM_ID = b.ROOM_ID
        ORDER BY so.ORDERED_AT ASC, so.ID ASC`
    );
    return res.json(result.rows || []);
  } catch (error) {
    console.error('Rejalashtirilgan xizmat buyurtmalarini olishda xatolik:', error);
    return res.status(500).json({ message: 'Xizmat buyurtmalarini yuklashda xatolik yuz berdi.' });
  }
};

export const createServiceOrder = async (req, res) => {
  const userId = req.user.id;
  const bookingId = Number(req.body.bookingId);
  const serviceId = Number(req.body.serviceId);
  const quantity = Number(req.body.quantity || 1);
  const paymentMethod = String(req.body.paymentMethod || '').trim().toLowerCase();
  const scheduledAt = String(req.body.scheduledAt || '').trim();
  const allowedPaymentMethods = new Set(['card', 'click', 'payme', 'cash']);
  const scheduledMatch = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(scheduledAt);
  const scheduledDate = scheduledMatch && new Date(
    Number(scheduledMatch[1]), Number(scheduledMatch[2]) - 1, Number(scheduledMatch[3]),
    Number(scheduledMatch[4]), Number(scheduledMatch[5])
  );
  const validSchedule = scheduledMatch && scheduledDate &&
    scheduledDate.getFullYear() === Number(scheduledMatch[1]) &&
    scheduledDate.getMonth() === Number(scheduledMatch[2]) - 1 &&
    scheduledDate.getDate() === Number(scheduledMatch[3]) &&
    scheduledDate.getHours() === Number(scheduledMatch[4]) &&
    scheduledDate.getMinutes() === Number(scheduledMatch[5]) && scheduledDate > new Date();

  if (!Number.isInteger(bookingId) || bookingId <= 0 || !Number.isInteger(serviceId) || serviceId <= 0 ||
      !Number.isInteger(quantity) || quantity < 1 || quantity > 20 || !allowedPaymentMethods.has(paymentMethod) || !validSchedule) {
    return res.status(400).json({ message: 'Bron, xizmat, miqdor, kelajakdagi sana/vaqt yoki to‘lov usulini to‘g‘ri kiriting.' });
  }

  let connection;
  let failedStep = 'Oracle bazasiga ulanish';
  try {
    connection = await oracledb.getConnection();
    failedStep = 'Foydalanuvchi bronini tekshirish';
    const bookingResult = await connection.execute(
      `SELECT ID, ROOM_ID FROM MEXMONXONALAR_TIZIMI.BOOKINGS
       WHERE ID = :bookingId AND USER_ID = :userId
         AND LOWER(TRIM(STATUS)) NOT IN ('cancelled', 'canceled', 'bekor qilingan')
         AND TO_TIMESTAMP(:scheduledAt, 'YYYY-MM-DD"T"HH24:MI') >= CAST(CHECK_IN_DATE AS TIMESTAMP)
         AND TO_TIMESTAMP(:scheduledAt, 'YYYY-MM-DD"T"HH24:MI') < CAST(TRUNC(CHECK_OUT_DATE) + 1 AS TIMESTAMP)`,
      { bookingId, userId, scheduledAt }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!bookingResult.rows.length) {
      return res.status(404).json({ message: 'Tanlangan bron topilmadi, bekor qilingan yoki xizmat vaqti bron sanalariga to‘g‘ri kelmaydi.' });
    }

    failedStep = 'Xizmat narxini tekshirish';
    const serviceResult = await connection.execute(
      `SELECT ID, PRICE FROM MEXMONXONALAR_TIZIMI.SERVICES WHERE ID = :serviceId`,
      { serviceId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (!serviceResult.rows.length) {
      return res.status(404).json({ message: 'Tanlangan xizmat topilmadi.' });
    }

    const totalPrice = Number(serviceResult.rows[0].PRICE) * quantity;
    failedStep = 'SERVICE_ORDERS jadvaliga buyurtma yozish';
    const orderResult = await connection.execute(
      `INSERT INTO MEXMONXONALAR_TIZIMI.SERVICE_ORDERS
         (BOOKING_ID, SERVICE_ID, QUANTITY, TOTAL_PRICE, ORDERED_AT)
       VALUES (:bookingId, :serviceId, :quantity, :totalPrice,
               TO_TIMESTAMP(:scheduledAt, 'YYYY-MM-DD"T"HH24:MI'))
       RETURNING ID INTO :orderId`,
      {
        bookingId, serviceId, quantity, totalPrice, scheduledAt,
        orderId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }, { autoCommit: false }
    );
    const orderId = orderResult.outBinds.orderId[0];

    failedStep = 'PAYMENTS jadvaliga xizmat to‘lovini yozish';
    await connection.execute(
      `INSERT INTO MEXMONXONALAR_TIZIMI.PAYMENTS
         (BOOKING_ID, AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS)
       VALUES (:bookingId, :totalPrice, :paymentMethod, 'pending')`,
      { bookingId, totalPrice, paymentMethod }, { autoCommit: false }
    );

    failedStep = 'Xizmat buyurtmasi tranzaksiyasini tasdiqlash';
    await connection.commit();
    return res.status(201).json({
      orderId,
      bookingId,
      totalPrice,
      paymentStatus: 'pending',
      message: 'Xizmat buyurtmasi va to‘lov so‘rovi saqlandi.'
    });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    console.error(`Xizmat buyurtmasida xatolik (${failedStep}):`, error);
    const details = process.env.NODE_ENV === 'production'
      ? undefined
      : `${failedStep}: ${error.code || 'DB_ERROR'} — ${error.message}`;
    return res.status(500).json({
      message: details || 'Xizmat buyurtmasini saqlashda server xatoligi yuz berdi.',
      ...(details ? { code: error.code || 'DB_ERROR', step: failedStep } : {})
    });
  } finally {
    if (connection) await connection.close().catch((error) => console.error('Ulanishni yopishda xatolik:', error));
  }
};
