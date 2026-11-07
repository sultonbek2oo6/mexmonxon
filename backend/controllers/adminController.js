import { executeQuery, executeTransaction } from '../config/db.js';
import oracledb from 'oracledb';
import { PAID_STATUSES_SQL, canTransitionPayment } from '../domain/finance.js';
import { BOOKING_STATUSES, canTransitionBooking, isValidDateRange, normalizeBookingStatus } from '../domain/bookingRules.js';

const fail = (res, error, label) => {
  console.error(`${label}:`, error);
  return res.status(500).json({ message: `${label}.`, ...(process.env.NODE_ENV === 'production' ? {} : { detail: error.message }) });
};
const rows = (result) => result.rows || [];
const positiveId = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

export async function dashboard(req, res) {
  try {
    const days = Number(req.query.days) === 30 ? 30 : 7;
    const [room, booking, revenue, housekeeping, recent, occupancy] = await Promise.all([
      executeQuery(`SELECT COUNT(*) TOTAL,
        SUM(CASE WHEN LOWER(TRIM(STATUS)) IN ('available','free','clean') THEN 1 ELSE 0 END) AVAILABLE,
        SUM(CASE WHEN LOWER(TRIM(STATUS)) IN ('occupied','booked') THEN 1 ELSE 0 END) OCCUPIED,
        SUM(CASE WHEN LOWER(TRIM(STATUS)) IN ('maintenance','under maintenance') THEN 1 ELSE 0 END) MAINTENANCE
        FROM MEXMONXONALAR_TIZIMI.ROOMS`),
      executeQuery(`SELECT COUNT(*) TOTAL FROM MEXMONXONALAR_TIZIMI.BOOKINGS`),
      executeQuery(`SELECT NVL(SUM(AMOUNT),0) TOTAL FROM MEXMONXONALAR_TIZIMI.PAYMENTS WHERE LOWER(TRIM(PAYMENT_STATUS)) IN (${PAID_STATUSES_SQL})`),
      executeQuery(`SELECT COUNT(*) TOTAL, SUM(CASE WHEN LOWER(TRIM(STATUS)) IN ('dirty','pending','in_progress','in progress') THEN 1 ELSE 0 END) DIRTY FROM MEXMONXONALAR_TIZIMI.HOUSEKEEPING`),
      executeQuery(`SELECT * FROM (SELECT b.ID, u.FIRST_NAME || ' ' || u.LAST_NAME GUEST_NAME, r.ROOM_NUMBER, TO_CHAR(b.CHECK_IN_DATE,'YYYY-MM-DD') CHECK_IN_DATE, TO_CHAR(b.CHECK_OUT_DATE,'YYYY-MM-DD') CHECK_OUT_DATE, b.TOTAL_AMOUNT, b.STATUS FROM MEXMONXONALAR_TIZIMI.BOOKINGS b JOIN MEXMONXONALAR_TIZIMI.USERS u ON u.ID=b.USER_ID JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.ID=b.ROOM_ID ORDER BY b.CREATED_AT DESC) WHERE ROWNUM <= 8`),
      executeQuery(`SELECT TO_CHAR(d.DAY_DATE,'YYYY-MM-DD') DAY,
          COUNT(DISTINCT CASE WHEN LOWER(TRIM(b.STATUS)) IN ('confirmed','checked-in','checked in','completed') THEN b.ROOM_ID END) OCCUPIED
        FROM (SELECT TRUNC(SYSDATE)-(:days-1)+LEVEL-1 DAY_DATE FROM dual CONNECT BY LEVEL<=:days) d
        LEFT JOIN MEXMONXONALAR_TIZIMI.BOOKINGS b ON b.CHECK_IN_DATE<d.DAY_DATE+1 AND b.CHECK_OUT_DATE>d.DAY_DATE
        GROUP BY d.DAY_DATE ORDER BY d.DAY_DATE`, { days })
    ]);
    res.json({ rooms: rows(room)[0], bookings: rows(booking)[0]?.TOTAL || 0, revenue: rows(revenue)[0]?.TOTAL || 0, housekeeping: rows(housekeeping)[0], recentBookings: rows(recent), occupancy: rows(occupancy) });
  } catch (error) { fail(res, error, 'Dashboard ma’lumotlarini olishda xatolik'); }
}

export async function reports(req, res) {
  try {
    const period = ['week', 'month', 'year'].includes(String(req.query.period || '').toLowerCase()) ? String(req.query.period).toLowerCase() : 'week';
    const periods = {
      week: { start: "TRUNC(SYSDATE,'IW')", end: "TRUNC(SYSDATE,'IW')+7", group: "TO_CHAR(CHECK_IN_DATE,'YYYY-MM-DD')" },
      month: { start: "TRUNC(SYSDATE,'MM')", end: "ADD_MONTHS(TRUNC(SYSDATE,'MM'),1)", group: "TO_CHAR(CHECK_IN_DATE,'YYYY-MM-DD')" },
      year: { start: "TRUNC(SYSDATE,'YYYY')", end: "ADD_MONTHS(TRUNC(SYSDATE,'YYYY'),12)", group: "TO_CHAR(CHECK_IN_DATE,'YYYY-MM')" },
    };
    const range = periods[period];
    const [bookings, roomTypes, payments, expenses, rooms] = await Promise.all([
      executeQuery(`SELECT ${range.group} PERIOD, COUNT(*) BOOKINGS, NVL(SUM(TOTAL_AMOUNT),0) BOOKED_AMOUNT
        FROM MEXMONXONALAR_TIZIMI.BOOKINGS
        WHERE CHECK_IN_DATE>=${range.start} AND CHECK_IN_DATE<${range.end}
        GROUP BY ${range.group} ORDER BY PERIOD`),
      executeQuery(`SELECT rt.TYPE_NAME, COUNT(r.ID) ROOM_COUNT FROM MEXMONXONALAR_TIZIMI.ROOM_TYPES rt LEFT JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.TYPE_ID=rt.ID GROUP BY rt.TYPE_NAME ORDER BY ROOM_COUNT DESC`),
      executeQuery(`SELECT COUNT(CASE WHEN LOWER(TRIM(p.PAYMENT_STATUS)) IN (${PAID_STATUSES_SQL}) THEN 1 END) PAYMENTS,
          NVL(SUM(CASE WHEN LOWER(TRIM(p.PAYMENT_STATUS)) IN (${PAID_STATUSES_SQL}) THEN p.AMOUNT ELSE 0 END),0) REVENUE
        FROM MEXMONXONALAR_TIZIMI.PAYMENTS p
        LEFT JOIN MEXMONXONALAR_TIZIMI.BOOKINGS b ON b.ID=p.BOOKING_ID
        WHERE NVL(p.PAID_AT,b.CREATED_AT)>=${range.start} AND NVL(p.PAID_AT,b.CREATED_AT)<${range.end}`),
      executeQuery(`SELECT NVL(SUM(AMOUNT),0) SPENT FROM MEXMONXONALAR_TIZIMI.HOTEL_EXPENSES
        WHERE EXPENSE_DATE>=${range.start} AND EXPENSE_DATE<${range.end}`),
      executeQuery(`SELECT COUNT(*) TOTAL, SUM(CASE WHEN LOWER(TRIM(STATUS)) IN ('occupied','booked') THEN 1 ELSE 0 END) OCCUPIED FROM MEXMONXONALAR_TIZIMI.ROOMS`)
    ]);
    const revenue = Number(rows(payments)[0]?.REVENUE || 0);
    const spent = Number(rows(expenses)[0]?.SPENT || 0);
    res.json({ period, bookings: rows(bookings), roomTypes: rows(roomTypes), payments: rows(payments)[0], expenses: rows(expenses)[0], finance: { revenue, spent, balance: revenue - spent }, rooms: rows(rooms)[0] });
  } catch (error) { fail(res, error, 'Hisobotlarni olishda xatolik'); }
}

export async function getSettings(req, res) {
  try {
    const result = await executeQuery(`SELECT SETTINGS_JSON FROM MEXMONXONALAR_TIZIMI.HOTEL_SETTINGS WHERE ID=1`);
    const value = rows(result)[0]?.SETTINGS_JSON;
    if (!value) return res.json({ general: {}, payment: {}, notifications: {} });
    const json = typeof value === 'string' ? value : await value.getData();
    const settings = JSON.parse(json);
    if (settings.general) settings.general.currency = 'UZS';
    return res.json(settings);
  } catch (error) { fail(res, error, 'Sozlamalarni olishda xatolik'); }
}
export async function saveSettings(req, res) {
  const { general, payment, notifications } = req.body || {};
  if (![general, payment, notifications].every((section) => section && typeof section === 'object' && !Array.isArray(section))) return res.status(400).json({ message: 'Barcha sozlama bo‘limlarini yuboring.' });
  try {
    const normalizedGeneral = { ...general, currency: 'UZS' };
    const taxRate = Number(String(payment.taxRate ?? '').replace('%', ''));
    if (!String(general.hotelName || '').trim() || String(general.hotelName).length > 120 || !String(general.address || '').trim() || String(general.address).length > 300 || !/^\+?[0-9 ()-]{7,25}$/.test(String(general.phone || '')) || !/^\S+@\S+\.\S+$/.test(String(general.email || '')) || !Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100) {
      return res.status(400).json({ message: 'Mehmonxona aloqa ma’lumotlari yoki soliq foizi noto‘g‘ri.' });
    }
    await executeQuery(`MERGE INTO MEXMONXONALAR_TIZIMI.HOTEL_SETTINGS target USING (SELECT 1 ID, :settings_json SETTINGS_JSON FROM dual) source ON (target.ID=source.ID) WHEN MATCHED THEN UPDATE SET target.SETTINGS_JSON=source.SETTINGS_JSON, target.UPDATED_AT=SYSTIMESTAMP WHEN NOT MATCHED THEN INSERT (ID, SETTINGS_JSON, UPDATED_AT) VALUES (source.ID, source.SETTINGS_JSON, SYSTIMESTAMP)`, { settings_json: JSON.stringify({ general: normalizedGeneral, payment, notifications }) });
    return res.json({ message: 'Sozlamalar saqlandi.' });
  } catch (error) { fail(res, error, 'Sozlamalarni saqlashda xatolik'); }
}

export async function getRoomTypes(req, res) {
  try { res.json(rows(await executeQuery(`SELECT ID, TYPE_NAME, DBMS_LOB.SUBSTR(DESCRIPTION,4000,1) DESCRIPTION, BASE_PRICE, CAPACITY, IMAGE_URL FROM MEXMONXONALAR_TIZIMI.ROOM_TYPES ORDER BY ID DESC`))); }
  catch (error) { fail(res, error, 'Xona turlarini olishda xatolik'); }
}
export async function saveRoomType(req, res) {
  const { type_name, description, base_price, capacity, image_url } = req.body;
  if (!String(type_name || '').trim() || !Number.isFinite(Number(base_price)) || Number(base_price) < 0 || !Number.isInteger(Number(capacity)) || Number(capacity) < 1) return res.status(400).json({ message: 'Xona turi, narx va sig‘imni to‘g‘ri kiriting.' });
  try {
    if (req.params.id) {
      if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
      const result = await executeQuery(`UPDATE MEXMONXONALAR_TIZIMI.ROOM_TYPES SET TYPE_NAME=:type_name, DESCRIPTION=:description, BASE_PRICE=:base_price, CAPACITY=:capacity, IMAGE_URL=:image_url WHERE ID=:id`, { type_name: type_name.trim(), description: description?.trim() || null, base_price: Number(base_price), capacity: Number(capacity), image_url: image_url || null, id: Number(req.params.id) });
      if (!result.rowsAffected) return res.status(404).json({ message: 'Xona turi topilmadi.' });
      res.json({ message: 'Xona turi yangilandi.' });
    } else {
      await executeQuery(`INSERT INTO MEXMONXONALAR_TIZIMI.ROOM_TYPES (TYPE_NAME, DESCRIPTION, BASE_PRICE, CAPACITY, IMAGE_URL) VALUES (:type_name,:description,:base_price,:capacity,:image_url)`, { type_name: type_name.trim(), description: description?.trim() || null, base_price: Number(base_price), capacity: Number(capacity), image_url: image_url || null });
      res.status(201).json({ message: 'Xona turi qo‘shildi.' });
    }
  } catch (error) { fail(res, error, 'Xona turini saqlashda xatolik'); }
}
export async function deleteRoomType(req, res) {
  if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
  try { const result = await executeQuery(`DELETE FROM MEXMONXONALAR_TIZIMI.ROOM_TYPES WHERE ID=:id`, { id: Number(req.params.id) }); if (!result.rowsAffected) return res.status(404).json({ message: 'Xona turi topilmadi.' }); res.json({ message: 'Xona turi o‘chirildi.' }); }
  catch (error) { fail(res, error, 'Xona turini o‘chirishda xatolik'); }
}

export async function saveRoom(req, res) {
  const { room_number, type_id, floor, status } = req.body;
  const normalizedStatus = String(status || 'available').trim().toLowerCase();
  if (!String(room_number || '').trim() || !positiveId(type_id) || !Number.isInteger(Number(floor)) || !['available', 'free', 'occupied', 'booked', 'cleaning', 'maintenance'].includes(normalizedStatus)) return res.status(400).json({ message: 'Xona raqami, turi, qavat va holatni to‘g‘ri kiriting.' });
  try {
    if (req.params.id) {
      if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
      const result = await executeQuery(`UPDATE MEXMONXONALAR_TIZIMI.ROOMS SET ROOM_NUMBER=:room_number, TYPE_ID=:type_id, FLOOR=:floor, STATUS=:status WHERE ID=:id`, { room_number: String(room_number).trim(), type_id: Number(type_id), floor: Number(floor), status: normalizedStatus, id: Number(req.params.id) });
      if (!result.rowsAffected) return res.status(404).json({ message: 'Xona topilmadi.' });
      res.json({ message: 'Xona yangilandi.' });
    } else {
      await executeQuery(`INSERT INTO MEXMONXONALAR_TIZIMI.ROOMS (ROOM_NUMBER, TYPE_ID, FLOOR, STATUS) VALUES (:room_number,:type_id,:floor,:status)`, { room_number: String(room_number).trim(), type_id: Number(type_id), floor: Number(floor), status: normalizedStatus });
      res.status(201).json({ message: 'Xona qo‘shildi.' });
    }
  } catch (error) { fail(res, error, 'Xonani saqlashda xatolik'); }
}
export async function deleteRoom(req, res) {
  if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
  try { const result = await executeQuery(`DELETE FROM MEXMONXONALAR_TIZIMI.ROOMS WHERE ID=:id`, { id: Number(req.params.id) }); if (!result.rowsAffected) return res.status(404).json({ message: 'Xona topilmadi.' }); res.json({ message: 'Xona o‘chirildi.' }); }
  catch (error) { fail(res, error, 'Xonani o‘chirishda xatolik'); }
}

export async function adminBookings(req, res) {
  try { res.json(rows(await executeQuery(`SELECT b.ID, b.USER_ID, b.ROOM_ID, TO_CHAR(b.CHECK_IN_DATE,'YYYY-MM-DD') CHECK_IN_DATE, TO_CHAR(b.CHECK_OUT_DATE,'YYYY-MM-DD') CHECK_OUT_DATE, b.TOTAL_AMOUNT, b.STATUS, u.FIRST_NAME || ' ' || u.LAST_NAME GUEST_NAME, r.ROOM_NUMBER FROM MEXMONXONALAR_TIZIMI.BOOKINGS b JOIN MEXMONXONALAR_TIZIMI.USERS u ON u.ID=b.USER_ID JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.ID=b.ROOM_ID ORDER BY b.CREATED_AT DESC`))); }
  catch (error) { fail(res, error, 'Bronlarni olishda xatolik'); }
}
export async function bookingGuests(req, res) {
  try {
    const result = await executeQuery(`SELECT ID, FIRST_NAME, LAST_NAME, EMAIL FROM MEXMONXONALAR_TIZIMI.USERS
      WHERE LOWER(TRIM(ROLE)) IN ('guest','user') ORDER BY FIRST_NAME, LAST_NAME, ID`);
    return res.json(rows(result));
  } catch (error) { return fail(res, error, 'Mehmonlarni olishda xatolik'); }
}
export async function bookingNotifications(req, res) {
  try {
    const result = await executeQuery(`SELECT * FROM (SELECT b.ID, u.FIRST_NAME || ' ' || u.LAST_NAME GUEST_NAME, r.ROOM_NUMBER, TO_CHAR(b.CHECK_IN_DATE,'YYYY-MM-DD') CHECK_IN_DATE, TO_CHAR(b.CHECK_OUT_DATE,'YYYY-MM-DD') CHECK_OUT_DATE, b.TOTAL_AMOUNT, b.STATUS, b.CREATED_AT FROM MEXMONXONALAR_TIZIMI.BOOKINGS b JOIN MEXMONXONALAR_TIZIMI.USERS u ON u.ID=b.USER_ID JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.ID=b.ROOM_ID WHERE LOWER(TRIM(b.STATUS)) IN ('pending','kutilmoqda') ORDER BY b.CREATED_AT DESC) WHERE ROWNUM <= 30`);
    return res.json(rows(result));
  } catch (error) { fail(res, error, 'Bron bildirishnomalarini olishda xatolik'); }
}
export async function createAdminBooking(req, res) {
  const { guest_id, room_number, check_in, check_out, total_amount, status } = req.body;
  const bookingStatus = normalizeBookingStatus(status || 'confirmed');
  if (!positiveId(guest_id) || !String(room_number || '').trim() || !isValidDateRange(check_in, check_out) || !Number.isFinite(Number(total_amount)) || Number(total_amount) <= 0 || !['pending', 'confirmed'].includes(bookingStatus)) return res.status(400).json({ message: 'Mehmon, xona, kelajakdagi sanalar, musbat summa va bron holatini to‘g‘ri kiriting.' });
  try {
    const booking = await executeTransaction(async (query) => {
      const validDate = await query(`SELECT 1 VALID FROM DUAL WHERE TO_DATE(:check_in,'YYYY-MM-DD') >= TRUNC(SYSDATE)`, { check_in });
      if (!validDate.rows?.length) { const error = new Error('Kirish sanasi bugun yoki undan keyin bo‘lishi kerak.'); error.status = 400; throw error; }
      const guest = await query(`SELECT ID FROM MEXMONXONALAR_TIZIMI.USERS
        WHERE ID=:guest_id AND LOWER(TRIM(ROLE)) IN ('guest','user')`, { guest_id: Number(guest_id) });
      if (!guest.rows?.length) { const error = new Error('Bunday ismli faol mehmon topilmadi.'); error.status = 404; throw error; }

      const room = await query(`SELECT ID FROM MEXMONXONALAR_TIZIMI.ROOMS
        WHERE ROOM_NUMBER=:room_number AND LOWER(TRIM(STATUS)) NOT IN ('cleaning','maintenance','under maintenance')
        FOR UPDATE`, { room_number: room_number.trim() });
      if (!room.rows?.length) { const error = new Error('Xona topilmadi yoki ta’mir/tozalash holatida.'); error.status = 404; throw error; }

      const overlap = await query(`SELECT ID FROM MEXMONXONALAR_TIZIMI.BOOKINGS
        WHERE ROOM_ID=:room_id AND LOWER(TRIM(STATUS)) NOT IN ('cancelled','canceled','bekor qilingan','completed','completed early')
          AND CHECK_IN_DATE<TO_DATE(:check_out,'YYYY-MM-DD')
          AND CHECK_OUT_DATE>TO_DATE(:check_in,'YYYY-MM-DD')`, { room_id: room.rows[0].ID, check_in, check_out });
      if (overlap.rows?.length) { const error = new Error('Bu sana oralig‘ida xona allaqachon band.'); error.status = 409; throw error; }

      const inserted = await query(`INSERT INTO MEXMONXONALAR_TIZIMI.BOOKINGS
        (USER_ID, ROOM_ID, CHECK_IN_DATE, CHECK_OUT_DATE, TOTAL_AMOUNT, STATUS)
        VALUES (:user_id, :room_id, TO_DATE(:check_in,'YYYY-MM-DD'), TO_DATE(:check_out,'YYYY-MM-DD'), :total_amount, :status)
        RETURNING ID INTO :booking_id`, {
        user_id: guest.rows[0].ID,
        room_id: room.rows[0].ID,
        check_in,
        check_out,
        total_amount: Number(total_amount),
        status: bookingStatus,
        booking_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      });
      const bookingId = inserted.outBinds.booking_id[0];
      await query(`INSERT INTO MEXMONXONALAR_TIZIMI.PAYMENTS
        (BOOKING_ID, AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS)
        VALUES (:booking_id, :amount, 'cash', 'pending')`, { booking_id: bookingId, amount: Number(total_amount) });
      return { id: bookingId };
    });
    return res.status(201).json({ id: booking.id, message: 'Bron va kutilayotgan to‘lov yaratildi.' });
  } catch (error) { if (error.status) return res.status(error.status).json({ message: error.message }); fail(res, error, 'Bron yaratishda xatolik'); }
}
export async function updateBooking(req, res) {
  const status = normalizeBookingStatus(req.body.status);
  if (!positiveId(req.params.id) || !BOOKING_STATUSES.includes(status)) return res.status(400).json({ message: 'Bron ID yoki yangi status noto‘g‘ri.' });
  try {
    await executeTransaction(async (query) => {
      const currentResult = await query(`SELECT ID, ROOM_ID, STATUS, CHECK_IN_DATE, CHECK_OUT_DATE
        FROM MEXMONXONALAR_TIZIMI.BOOKINGS WHERE ID=:id FOR UPDATE`, { id: Number(req.params.id) });
      const current = currentResult.rows?.[0];
      if (!current) { const error = new Error('Bron topilmadi.'); error.status = 404; throw error; }
      const currentStatus = normalizeBookingStatus(current.STATUS);
      if (!canTransitionBooking(currentStatus, status)) {
        const error = new Error(`Bron holatini ${currentStatus} dan ${status} ga o‘zgartirib bo‘lmaydi.`); error.status = 409; throw error;
      }
      if (status === 'checked-in') {
        const inRange = await query(`SELECT ID FROM MEXMONXONALAR_TIZIMI.BOOKINGS
          WHERE ID=:id AND TRUNC(SYSDATE)>=TRUNC(CHECK_IN_DATE) AND TRUNC(SYSDATE)<TRUNC(CHECK_OUT_DATE)`, { id: Number(req.params.id) });
        if (!inRange.rows?.length) { const error = new Error('Mehmonni faqat bronning kirish va chiqish sanalari orasida joylashtirish mumkin.'); error.status = 409; throw error; }
      }
      const result = await query(`UPDATE MEXMONXONALAR_TIZIMI.BOOKINGS
        SET STATUS=:status,
            CHECK_OUT_DATE=CASE WHEN :status='completed' THEN LEAST(CHECK_OUT_DATE, TRUNC(SYSDATE)) ELSE CHECK_OUT_DATE END
        WHERE ID=:id`, { status, id: Number(req.params.id) });
      if (!result.rowsAffected) { const error = new Error('Bron topilmadi.'); error.status = 404; throw error; }
      if (status === 'cancelled') {
        await query("UPDATE MEXMONXONALAR_TIZIMI.PAYMENTS SET PAYMENT_STATUS='cancelled', PAID_AT=NULL WHERE BOOKING_ID=:id AND LOWER(TRIM(PAYMENT_STATUS))='pending'", { id: Number(req.params.id) });
      } else if (status === 'confirmed') {
        await query("UPDATE MEXMONXONALAR_TIZIMI.PAYMENTS SET PAYMENT_STATUS='pending' WHERE BOOKING_ID=:id AND LOWER(TRIM(PAYMENT_STATUS))='cancelled'", { id: Number(req.params.id) });
      }
      if (status === 'checked-in') {
        await query(`UPDATE MEXMONXONALAR_TIZIMI.ROOMS SET STATUS='occupied' WHERE ID=:room_id`, { room_id: current.ROOM_ID });
      } else if (status === 'completed' || status === 'cancelled') {
        const activeBooking = await query(`SELECT ID FROM MEXMONXONALAR_TIZIMI.BOOKINGS
          WHERE ROOM_ID=:room_id AND LOWER(TRIM(STATUS)) IN ('confirmed','checked-in','checked in')
            AND CHECK_IN_DATE<TRUNC(SYSDATE)+1 AND CHECK_OUT_DATE>TRUNC(SYSDATE)
          FETCH FIRST 1 ROW ONLY`, { room_id: current.ROOM_ID });
        if (!activeBooking.rows?.length) await query(`UPDATE MEXMONXONALAR_TIZIMI.ROOMS
          SET STATUS='available' WHERE ID=:room_id AND LOWER(TRIM(STATUS)) NOT IN ('maintenance','under maintenance','cleaning')`, { room_id: current.ROOM_ID });
      }
    });
    res.json({ message: status === 'completed' ? 'Bron yakunlandi, xona bo‘shatildi.' : 'Bron holati yangilandi.' });
  }
  catch (error) { if (error.status) return res.status(error.status).json({ message: error.message }); fail(res, error, 'Bronni yangilashda xatolik'); }
}
export async function deleteBooking(req, res) {
  if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
  try {
    await executeTransaction(async (query) => {
      const booking = await query('SELECT ID, STATUS FROM MEXMONXONALAR_TIZIMI.BOOKINGS WHERE ID=:id FOR UPDATE', { id: Number(req.params.id) });
      const currentStatus = normalizeBookingStatus(booking.rows?.[0]?.STATUS);
      if (!currentStatus) { const error = new Error('Bron topilmadi.'); error.status = 404; throw error; }
      if (!['pending', 'confirmed', 'cancelled'].includes(currentStatus)) { const error = new Error('Mehmon joylashgan yoki yakunlangan bronni o‘chira olmaysiz.'); error.status = 409; throw error; }
      await query("UPDATE MEXMONXONALAR_TIZIMI.BOOKINGS SET STATUS='cancelled' WHERE ID=:id", { id: Number(req.params.id) });
      await query("UPDATE MEXMONXONALAR_TIZIMI.PAYMENTS SET PAYMENT_STATUS='cancelled', PAID_AT=NULL WHERE BOOKING_ID=:id AND LOWER(TRIM(PAYMENT_STATUS))='pending'", { id: Number(req.params.id) });
    });
    res.json({ message: 'Bron bekor qilindi.' });
  } catch (error) { if (error.status) return res.status(error.status).json({ message: error.message }); fail(res, error, 'Bronni o‘chirishda xatolik'); }
}

export async function housekeeping(req, res) {
  try { res.json(rows(await executeQuery(`SELECT h.ID, h.ROOM_ID, h.EMPLOYEE_ID, h.STATUS, h.UPDATED_AT, r.ROOM_NUMBER, e.FIRST_NAME || ' ' || e.LAST_NAME EMPLOYEE_NAME FROM MEXMONXONALAR_TIZIMI.HOUSEKEEPING h JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.ID=h.ROOM_ID JOIN MEXMONXONALAR_TIZIMI.EMPLOYEES e ON e.ID=h.EMPLOYEE_ID ORDER BY h.UPDATED_AT DESC`))); }
  catch (error) { fail(res, error, 'Tozalash vazifalarini olishda xatolik'); }
}
export async function saveHousekeeping(req, res) {
  const { room_id, employee_id, status } = req.body;
  const normalizedStatus = String(status || '').trim().toLowerCase();
  if (!positiveId(room_id) || !positiveId(employee_id) || !['pending', 'in_progress', 'clean'].includes(normalizedStatus) || (req.params.id && !positiveId(req.params.id))) return res.status(400).json({ message: 'Xona, tayinlangan xodim va yaroqli vazifa holatini kiriting.' });
  try {
    await executeTransaction(async (query) => {
      const assignment = await query(`SELECT a.ID FROM MEXMONXONALAR_TIZIMI.EMPLOYEE_ROOM_ASSIGNMENTS a
        JOIN MEXMONXONALAR_TIZIMI.EMPLOYEES e ON e.ID=a.EMPLOYEE_ID AND e.IS_ACTIVE=1
        WHERE a.ROOM_ID=:room_id AND a.EMPLOYEE_ID=:employee_id`, { room_id: Number(room_id), employee_id: Number(employee_id) });
      if (!assignment.rows?.length) { const error = new Error('Bu xodim tanlangan xonaga biriktirilmagan.'); error.status = 400; throw error; }
      const occupiedBooking = await query(`SELECT ID FROM MEXMONXONALAR_TIZIMI.BOOKINGS
        WHERE ROOM_ID=:room_id AND LOWER(TRIM(STATUS)) IN ('confirmed','checked-in','checked in')
          AND CHECK_IN_DATE<TRUNC(SYSDATE)+1 AND CHECK_OUT_DATE>TRUNC(SYSDATE)
        FETCH FIRST 1 ROW ONLY`, { room_id: Number(room_id) });
      if (occupiedBooking.rows?.length) { const error = new Error('Hozir mehmon joylashgan xonaga tozalash vazifasi berib bo‘lmaydi.'); error.status = 409; throw error; }
      if (req.params.id) {
        const result = await query(`UPDATE MEXMONXONALAR_TIZIMI.HOUSEKEEPING SET ROOM_ID=:room_id, EMPLOYEE_ID=:employee_id, STATUS=:status, UPDATED_AT=SYSTIMESTAMP WHERE ID=:id`, { room_id: Number(room_id), employee_id: Number(employee_id), status: normalizedStatus, id: Number(req.params.id) });
        if (!result.rowsAffected) { const error = new Error('Tozalash vazifasi topilmadi.'); error.status = 404; throw error; }
      } else await query(`INSERT INTO MEXMONXONALAR_TIZIMI.HOUSEKEEPING (ROOM_ID, EMPLOYEE_ID, STATUS, UPDATED_AT) VALUES (:room_id,:employee_id,:status,SYSTIMESTAMP)`, { room_id: Number(room_id), employee_id: Number(employee_id), status: normalizedStatus });
      const roomStatus = normalizedStatus === 'clean' ? 'available' : 'cleaning';
      await query('UPDATE MEXMONXONALAR_TIZIMI.ROOMS SET STATUS=:status WHERE ID=:room_id', { status: roomStatus, room_id: Number(room_id) });
    });
    res.json({ message: 'Tozalash vazifasi saqlandi.' });
  } catch (error) { if (error.status) return res.status(error.status).json({ message: error.message }); fail(res, error, 'Tozalash vazifasini saqlashda xatolik'); }
}
export async function deleteHousekeeping(req, res) {
  if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
  try {
    await executeTransaction(async (query) => {
      const task = await query('SELECT ROOM_ID FROM MEXMONXONALAR_TIZIMI.HOUSEKEEPING WHERE ID=:id FOR UPDATE', { id: Number(req.params.id) });
      const roomId = task.rows?.[0]?.ROOM_ID;
      if (!roomId) { const error = new Error('Vazifa topilmadi.'); error.status = 404; throw error; }
      await query('DELETE FROM MEXMONXONALAR_TIZIMI.HOUSEKEEPING WHERE ID=:id', { id: Number(req.params.id) });
      const pendingTasks = await query(`SELECT ID FROM MEXMONXONALAR_TIZIMI.HOUSEKEEPING
        WHERE ROOM_ID=:room_id AND LOWER(TRIM(STATUS)) IN ('dirty','pending','in_progress','in progress') FETCH FIRST 1 ROW ONLY`, { room_id: roomId });
      const occupiedBooking = await query(`SELECT ID FROM MEXMONXONALAR_TIZIMI.BOOKINGS
        WHERE ROOM_ID=:room_id AND LOWER(TRIM(STATUS)) IN ('confirmed','checked-in','checked in')
          AND CHECK_IN_DATE<TRUNC(SYSDATE)+1 AND CHECK_OUT_DATE>TRUNC(SYSDATE) FETCH FIRST 1 ROW ONLY`, { room_id: roomId });
      if (!pendingTasks.rows?.length && !occupiedBooking.rows?.length) await query(`UPDATE MEXMONXONALAR_TIZIMI.ROOMS
        SET STATUS='available' WHERE ID=:room_id AND LOWER(TRIM(STATUS))='cleaning'`, { room_id: roomId });
    });
    return res.json({ message: 'Vazifa o‘chirildi.' });
  } catch (error) { if (error.status) return res.status(error.status).json({ message: error.message }); fail(res, error, 'Vazifani o‘chirishda xatolik'); }
}

export async function saveService(req, res) {
  const { service_name, price, image_url } = req.body;
  if (!String(service_name || '').trim() || !Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ message: 'Xizmat nomi va narxni to‘g‘ri kiriting.' });
  try {
    if (req.params.id) {
      if (!positiveId(req.params.id)) return res.status(400).json({ message: 'Xizmat ID noto‘g‘ri.' });
      const result = await executeQuery(`UPDATE MEXMONXONALAR_TIZIMI.SERVICES SET SERVICE_NAME=:service_name, PRICE=:price, IMAGE_URL=:image_url WHERE ID=:id`, { service_name: service_name.trim(), price: Number(price), image_url: image_url || null, id: Number(req.params.id) });
      if (!result.rowsAffected) return res.status(404).json({ message: 'Xizmat topilmadi.' });
    } else await executeQuery(`INSERT INTO MEXMONXONALAR_TIZIMI.SERVICES (SERVICE_NAME, PRICE, IMAGE_URL) VALUES (:service_name,:price,:image_url)`, { service_name: service_name.trim(), price: Number(price), image_url: image_url || null });
    res.json({ message: 'Xizmat saqlandi.' });
  } catch (error) { fail(res, error, 'Xizmatni saqlashda xatolik'); }
}
export async function deleteService(req, res) {
  if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
  try { const result = await executeQuery(`DELETE FROM MEXMONXONALAR_TIZIMI.SERVICES WHERE ID=:id`, { id: Number(req.params.id) }); if (!result.rowsAffected) return res.status(404).json({ message: 'Xizmat topilmadi.' }); res.json({ message: 'Xizmat o‘chirildi.' }); }
  catch (error) { fail(res, error, 'Xizmatni o‘chirishda xatolik'); }
}
export async function createAdminServiceOrder(req, res) {
  const { room_number, service_id } = req.body;
  if (!String(room_number || '').trim() || !positiveId(service_id)) return res.status(400).json({ message: 'Xona raqami va xizmatni tanlang.' });
  try {
    const order = await executeTransaction(async (query) => {
      const booking = await query(`SELECT b.ID BOOKING_ID, s.ID SERVICE_ID, s.PRICE
        FROM MEXMONXONALAR_TIZIMI.BOOKINGS b
        JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.ID=b.ROOM_ID
        JOIN MEXMONXONALAR_TIZIMI.SERVICES s ON s.ID=:service_id
        WHERE r.ROOM_NUMBER=:room_number
          AND LOWER(TRIM(b.STATUS)) IN ('confirmed','checked-in','checked in')
          AND b.CHECK_IN_DATE<TRUNC(SYSDATE)+1 AND b.CHECK_OUT_DATE>TRUNC(SYSDATE)
        ORDER BY b.ID DESC FETCH FIRST 1 ROW ONLY`, { service_id: Number(service_id), room_number: String(room_number).trim() });
      if (!booking.rows?.length) { const error = new Error('Xona topilmadi yoki bugun joylashgan mehmon yo‘q.'); error.status = 404; throw error; }
      const { BOOKING_ID: bookingId, SERVICE_ID: serviceId, PRICE } = booking.rows[0];
      const total = Number(PRICE);
      const inserted = await query(`INSERT INTO MEXMONXONALAR_TIZIMI.SERVICE_ORDERS
        (BOOKING_ID, SERVICE_ID, QUANTITY, TOTAL_PRICE, ORDERED_AT)
        VALUES (:booking_id, :service_id, 1, :total, SYSTIMESTAMP)
        RETURNING ID INTO :order_id`, {
        booking_id: bookingId,
        service_id: serviceId,
        total,
        order_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      });
      await query(`INSERT INTO MEXMONXONALAR_TIZIMI.PAYMENTS
        (BOOKING_ID, AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS)
        VALUES (:booking_id, :total, 'cash', 'pending')`, { booking_id: bookingId, total });
      return { id: inserted.outBinds.order_id[0], total };
    });
    return res.status(201).json({ id: order.id, total: order.total, message: 'Xizmat buyurtmasi va kutilayotgan to‘lov yaratildi.' });
  } catch (error) { if (error.status) return res.status(error.status).json({ message: error.message }); fail(res, error, 'Xizmat buyurtmasini yaratishda xatolik'); }
}

export async function updatePayment(req, res) {
  const status = String(req.body.status || '').trim().toLowerCase();
  if (!positiveId(req.params.id) || !['paid', 'failed', 'cancelled'].includes(status)) return res.status(400).json({ message: 'To‘lov ID yoki status noto‘g‘ri.' });
  try {
    await executeTransaction(async (query) => {
      const current = await query(`SELECT ID, PAYMENT_STATUS FROM MEXMONXONALAR_TIZIMI.PAYMENTS WHERE ID=:id FOR UPDATE`, { id: Number(req.params.id) });
      const payment = current.rows?.[0];
      if (!payment) { const error = new Error('To‘lov topilmadi.'); error.status = 404; throw error; }
      const currentStatus = String(payment.PAYMENT_STATUS || '').trim().toLowerCase();
      if (!canTransitionPayment(currentStatus, status)) {
        const error = new Error('Faqat kutilayotgan to‘lovni bir marta yakunlash mumkin; oldingi holatni qaytarib bo‘lmaydi.'); error.status = 409; throw error;
      }
      await query(`UPDATE MEXMONXONALAR_TIZIMI.PAYMENTS
        SET PAYMENT_STATUS=:status,
            PAID_AT=CASE WHEN :status='paid' THEN SYSTIMESTAMP ELSE NULL END
        WHERE ID=:id`, { status, id: Number(req.params.id) });
    });
    return res.json({ message: 'To‘lov holati yangilandi.' });
  }
  catch (error) { if (error.status) return res.status(error.status).json({ message: error.message }); fail(res, error, 'To‘lovni yangilashda xatolik'); }
}
