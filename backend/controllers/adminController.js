import { executeQuery } from '../config/db.js';

const fail = (res, error, label) => {
  console.error(`${label}:`, error);
  return res.status(500).json({ message: `${label}.`, ...(process.env.NODE_ENV === 'production' ? {} : { detail: error.message }) });
};
const rows = (result) => result.rows || [];
const positiveId = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

export async function dashboard(req, res) {
  try {
    const [room, booking, revenue, housekeeping, recent] = await Promise.all([
      executeQuery(`SELECT COUNT(*) TOTAL, SUM(CASE WHEN LOWER(TRIM(STATUS)) IN ('available','free','clean') THEN 1 ELSE 0 END) AVAILABLE FROM MEXMONXONALAR_TIZIMI.ROOMS`),
      executeQuery(`SELECT COUNT(*) TOTAL FROM MEXMONXONALAR_TIZIMI.BOOKINGS`),
      executeQuery(`SELECT NVL(SUM(AMOUNT),0) TOTAL FROM MEXMONXONALAR_TIZIMI.PAYMENTS WHERE LOWER(TRIM(PAYMENT_STATUS))='paid'`),
      executeQuery(`SELECT COUNT(*) TOTAL, SUM(CASE WHEN LOWER(TRIM(STATUS))='dirty' THEN 1 ELSE 0 END) DIRTY FROM MEXMONXONALAR_TIZIMI.HOUSEKEEPING`),
      executeQuery(`SELECT * FROM (SELECT b.ID, u.FIRST_NAME || ' ' || u.LAST_NAME GUEST_NAME, r.ROOM_NUMBER, b.CHECK_IN_DATE, b.CHECK_OUT_DATE, b.TOTAL_AMOUNT, b.STATUS FROM MEXMONXONALAR_TIZIMI.BOOKINGS b JOIN MEXMONXONALAR_TIZIMI.USERS u ON u.ID=b.USER_ID JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.ID=b.ROOM_ID ORDER BY b.CREATED_AT DESC) WHERE ROWNUM <= 8`)
    ]);
    res.json({ rooms: rows(room)[0], bookings: rows(booking)[0]?.TOTAL || 0, revenue: rows(revenue)[0]?.TOTAL || 0, housekeeping: rows(housekeeping)[0], recentBookings: rows(recent) });
  } catch (error) { fail(res, error, 'Dashboard ma’lumotlarini olishda xatolik'); }
}

export async function reports(req, res) {
  try {
    const [bookings, roomTypes, payments, rooms] = await Promise.all([
      executeQuery(`SELECT TO_CHAR(CHECK_IN_DATE,'YYYY-MM') MONTH, COUNT(*) BOOKINGS, NVL(SUM(TOTAL_AMOUNT),0) REVENUE FROM MEXMONXONALAR_TIZIMI.BOOKINGS GROUP BY TO_CHAR(CHECK_IN_DATE,'YYYY-MM') ORDER BY MONTH DESC FETCH FIRST 12 ROWS ONLY`),
      executeQuery(`SELECT rt.TYPE_NAME, COUNT(r.ID) ROOM_COUNT FROM MEXMONXONALAR_TIZIMI.ROOM_TYPES rt LEFT JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.TYPE_ID=rt.ID GROUP BY rt.TYPE_NAME ORDER BY ROOM_COUNT DESC`),
      executeQuery(`SELECT COUNT(*) PAYMENTS, NVL(SUM(CASE WHEN LOWER(TRIM(PAYMENT_STATUS))='paid' THEN AMOUNT ELSE 0 END),0) REVENUE FROM MEXMONXONALAR_TIZIMI.PAYMENTS`),
      executeQuery(`SELECT COUNT(*) TOTAL, SUM(CASE WHEN LOWER(TRIM(STATUS)) IN ('occupied','booked') THEN 1 ELSE 0 END) OCCUPIED FROM MEXMONXONALAR_TIZIMI.ROOMS`)
    ]);
    res.json({ bookings: rows(bookings), roomTypes: rows(roomTypes), payments: rows(payments)[0], rooms: rows(rooms)[0] });
  } catch (error) { fail(res, error, 'Hisobotlarni olishda xatolik'); }
}

export async function getSettings(req, res) {
  try {
    const result = await executeQuery(`SELECT SETTINGS_JSON FROM MEXMONXONALAR_TIZIMI.HOTEL_SETTINGS WHERE ID=1`);
    const value = rows(result)[0]?.SETTINGS_JSON;
    if (!value) return res.json({ general: {}, payment: {}, notifications: {} });
    const json = typeof value === 'string' ? value : await value.getData();
    return res.json(JSON.parse(json));
  } catch (error) { fail(res, error, 'Sozlamalarni olishda xatolik'); }
}
export async function saveSettings(req, res) {
  const { general, payment, notifications } = req.body || {};
  if (!general || !payment || !notifications) return res.status(400).json({ message: 'Barcha sozlama bo‘limlarini yuboring.' });
  try {
    await executeQuery(`MERGE INTO MEXMONXONALAR_TIZIMI.HOTEL_SETTINGS target USING (SELECT 1 ID, :settings_json SETTINGS_JSON FROM dual) source ON (target.ID=source.ID) WHEN MATCHED THEN UPDATE SET target.SETTINGS_JSON=source.SETTINGS_JSON, target.UPDATED_AT=SYSTIMESTAMP WHEN NOT MATCHED THEN INSERT (ID, SETTINGS_JSON, UPDATED_AT) VALUES (source.ID, source.SETTINGS_JSON, SYSTIMESTAMP)`, { settings_json: JSON.stringify({ general, payment, notifications }) });
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
      await executeQuery(`UPDATE MEXMONXONALAR_TIZIMI.ROOM_TYPES SET TYPE_NAME=:type_name, DESCRIPTION=:description, BASE_PRICE=:base_price, CAPACITY=:capacity, IMAGE_URL=:image_url WHERE ID=:id`, { type_name, description: description || null, base_price: Number(base_price), capacity: Number(capacity), image_url: image_url || null, id: Number(req.params.id) });
      res.json({ message: 'Xona turi yangilandi.' });
    } else {
      await executeQuery(`INSERT INTO MEXMONXONALAR_TIZIMI.ROOM_TYPES (TYPE_NAME, DESCRIPTION, BASE_PRICE, CAPACITY, IMAGE_URL) VALUES (:type_name,:description,:base_price,:capacity,:image_url)`, { type_name, description: description || null, base_price: Number(base_price), capacity: Number(capacity), image_url: image_url || null });
      res.status(201).json({ message: 'Xona turi qo‘shildi.' });
    }
  } catch (error) { fail(res, error, 'Xona turini saqlashda xatolik'); }
}
export async function deleteRoomType(req, res) {
  if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
  try { await executeQuery(`DELETE FROM MEXMONXONALAR_TIZIMI.ROOM_TYPES WHERE ID=:id`, { id: Number(req.params.id) }); res.json({ message: 'Xona turi o‘chirildi.' }); }
  catch (error) { fail(res, error, 'Xona turini o‘chirishda xatolik'); }
}

export async function saveRoom(req, res) {
  const { room_number, type_id, floor, status } = req.body;
  if (!String(room_number || '').trim() || !positiveId(type_id) || !Number.isInteger(Number(floor))) return res.status(400).json({ message: 'Xona raqami, turi va qavatni kiriting.' });
  try {
    if (req.params.id) {
      if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
      await executeQuery(`UPDATE MEXMONXONALAR_TIZIMI.ROOMS SET ROOM_NUMBER=:room_number, TYPE_ID=:type_id, FLOOR=:floor, STATUS=:status WHERE ID=:id`, { room_number, type_id: Number(type_id), floor: Number(floor), status: status || 'available', id: Number(req.params.id) });
      res.json({ message: 'Xona yangilandi.' });
    } else {
      await executeQuery(`INSERT INTO MEXMONXONALAR_TIZIMI.ROOMS (ROOM_NUMBER, TYPE_ID, FLOOR, STATUS) VALUES (:room_number,:type_id,:floor,:status)`, { room_number, type_id: Number(type_id), floor: Number(floor), status: status || 'available' });
      res.status(201).json({ message: 'Xona qo‘shildi.' });
    }
  } catch (error) { fail(res, error, 'Xonani saqlashda xatolik'); }
}
export async function deleteRoom(req, res) {
  if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
  try { await executeQuery(`DELETE FROM MEXMONXONALAR_TIZIMI.ROOMS WHERE ID=:id`, { id: Number(req.params.id) }); res.json({ message: 'Xona o‘chirildi.' }); }
  catch (error) { fail(res, error, 'Xonani o‘chirishda xatolik'); }
}

export async function adminBookings(req, res) {
  try { res.json(rows(await executeQuery(`SELECT b.ID, b.USER_ID, b.ROOM_ID, TO_CHAR(b.CHECK_IN_DATE,'YYYY-MM-DD') CHECK_IN_DATE, TO_CHAR(b.CHECK_OUT_DATE,'YYYY-MM-DD') CHECK_OUT_DATE, b.TOTAL_AMOUNT, b.STATUS, u.FIRST_NAME || ' ' || u.LAST_NAME GUEST_NAME, r.ROOM_NUMBER FROM MEXMONXONALAR_TIZIMI.BOOKINGS b JOIN MEXMONXONALAR_TIZIMI.USERS u ON u.ID=b.USER_ID JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.ID=b.ROOM_ID ORDER BY b.CREATED_AT DESC`))); }
  catch (error) { fail(res, error, 'Bronlarni olishda xatolik'); }
}
export async function bookingNotifications(req, res) {
  try {
    const result = await executeQuery(`SELECT * FROM (SELECT b.ID, u.FIRST_NAME || ' ' || u.LAST_NAME GUEST_NAME, r.ROOM_NUMBER, TO_CHAR(b.CHECK_IN_DATE,'YYYY-MM-DD') CHECK_IN_DATE, TO_CHAR(b.CHECK_OUT_DATE,'YYYY-MM-DD') CHECK_OUT_DATE, b.TOTAL_AMOUNT, b.STATUS, b.CREATED_AT FROM MEXMONXONALAR_TIZIMI.BOOKINGS b JOIN MEXMONXONALAR_TIZIMI.USERS u ON u.ID=b.USER_ID JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.ID=b.ROOM_ID WHERE LOWER(TRIM(b.STATUS)) IN ('pending','kutilmoqda') ORDER BY b.CREATED_AT DESC) WHERE ROWNUM <= 30`);
    return res.json(rows(result));
  } catch (error) { fail(res, error, 'Bron bildirishnomalarini olishda xatolik'); }
}
export async function createAdminBooking(req, res) {
  const { guest_name, room_number, check_in, check_out, total_amount, status } = req.body;
  if (!String(guest_name || '').trim() || !String(room_number || '').trim() || !/^\d{4}-\d{2}-\d{2}$/.test(check_in || '') || !/^\d{4}-\d{2}-\d{2}$/.test(check_out || '') || new Date(check_out) <= new Date(check_in) || !Number.isFinite(Number(total_amount)) || Number(total_amount) < 0) return res.status(400).json({ message: 'Mehmon, xona, sanalar va summani to‘g‘ri kiriting.' });
  try {
    const result = await executeQuery(`INSERT INTO MEXMONXONALAR_TIZIMI.BOOKINGS (USER_ID, ROOM_ID, CHECK_IN_DATE, CHECK_OUT_DATE, TOTAL_AMOUNT, STATUS) SELECT u.ID, r.ID, TO_DATE(:check_in,'YYYY-MM-DD'), TO_DATE(:check_out,'YYYY-MM-DD'), :total_amount, :status FROM MEXMONXONALAR_TIZIMI.USERS u CROSS JOIN MEXMONXONALAR_TIZIMI.ROOMS r WHERE u.ID=(SELECT MIN(u2.ID) FROM MEXMONXONALAR_TIZIMI.USERS u2 WHERE LOWER(TRIM(u2.FIRST_NAME || ' ' || u2.LAST_NAME))=LOWER(TRIM(:guest_name))) AND r.ROOM_NUMBER=:room_number AND NOT EXISTS (SELECT 1 FROM MEXMONXONALAR_TIZIMI.BOOKINGS b WHERE b.ROOM_ID=r.ID AND LOWER(TRIM(b.STATUS)) NOT IN ('cancelled','canceled','bekor qilingan') AND b.CHECK_IN_DATE<TO_DATE(:check_out,'YYYY-MM-DD') AND b.CHECK_OUT_DATE>TO_DATE(:check_in,'YYYY-MM-DD'))`, { guest_name: guest_name.trim(), room_number: room_number.trim(), check_in, check_out, total_amount: Number(total_amount), status: status || 'Confirmed' });
    if (!result.rowsAffected) return res.status(404).json({ message: 'Мehmon topilmadi yoki xona shu sanalarda bo‘sh emas.' });
    res.status(201).json({ message: 'Bron yaratildi.' });
  } catch (error) { fail(res, error, 'Bron yaratishda xatolik'); }
}
export async function updateBooking(req, res) {
  const status = String(req.body.status || '').trim();
  const allowedStatuses = new Set(['pending', 'confirmed', 'cancelled', 'checked-in', 'completed']);
  if (!positiveId(req.params.id) || !allowedStatuses.has(status.toLowerCase())) return res.status(400).json({ message: 'Bron ID yoki yangi status noto‘g‘ri.' });
  try {
    const result = await executeQuery(`UPDATE MEXMONXONALAR_TIZIMI.BOOKINGS
      SET STATUS=:status,
          CHECK_OUT_DATE=CASE WHEN LOWER(:status) IN ('completed','checked-out','checked out') THEN LEAST(CHECK_OUT_DATE, TRUNC(SYSDATE)) ELSE CHECK_OUT_DATE END
      WHERE ID=:id`, { status, id: Number(req.params.id) });
    if (!result.rowsAffected) return res.status(404).json({ message: 'Bron topilmadi.' });
    res.json({ message: 'Bron yangilandi. Xona bo‘sh deb belgilandi.' });
  }
  catch (error) { fail(res, error, 'Bronni yangilashda xatolik'); }
}
export async function deleteBooking(req, res) {
  if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
  try { await executeQuery(`UPDATE MEXMONXONALAR_TIZIMI.BOOKINGS SET STATUS='Cancelled' WHERE ID=:id`, { id: Number(req.params.id) }); res.json({ message: 'Bron bekor qilindi.' }); }
  catch (error) { fail(res, error, 'Bronni o‘chirishda xatolik'); }
}

export async function housekeeping(req, res) {
  try { res.json(rows(await executeQuery(`SELECT h.ID, h.ROOM_ID, h.EMPLOYEE_ID, h.STATUS, h.UPDATED_AT, r.ROOM_NUMBER, e.FIRST_NAME || ' ' || e.LAST_NAME EMPLOYEE_NAME FROM MEXMONXONALAR_TIZIMI.HOUSEKEEPING h JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.ID=h.ROOM_ID JOIN MEXMONXONALAR_TIZIMI.EMPLOYEES e ON e.ID=h.EMPLOYEE_ID ORDER BY h.UPDATED_AT DESC`))); }
  catch (error) { fail(res, error, 'Tozalash vazifalarini olishda xatolik'); }
}
export async function saveHousekeeping(req, res) {
  const { room_id, employee_id, status } = req.body;
  if (!positiveId(room_id) || !positiveId(employee_id) || !String(status || '').trim()) return res.status(400).json({ message: 'Xona, xodim va statusni kiriting.' });
  try {
    if (req.params.id) await executeQuery(`UPDATE MEXMONXONALAR_TIZIMI.HOUSEKEEPING SET ROOM_ID=:room_id, EMPLOYEE_ID=:employee_id, STATUS=:status, UPDATED_AT=SYSTIMESTAMP WHERE ID=:id`, { room_id: Number(room_id), employee_id: Number(employee_id), status, id: Number(req.params.id) });
    else await executeQuery(`INSERT INTO MEXMONXONALAR_TIZIMI.HOUSEKEEPING (ROOM_ID, EMPLOYEE_ID, STATUS, UPDATED_AT) VALUES (:room_id,:employee_id,:status,SYSTIMESTAMP)`, { room_id: Number(room_id), employee_id: Number(employee_id), status });
    res.json({ message: 'Tozalash vazifasi saqlandi.' });
  } catch (error) { fail(res, error, 'Tozalash vazifasini saqlashda xatolik'); }
}
export async function deleteHousekeeping(req, res) {
  if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
  try { await executeQuery(`DELETE FROM MEXMONXONALAR_TIZIMI.HOUSEKEEPING WHERE ID=:id`, { id: Number(req.params.id) }); res.json({ message: 'Vazifa o‘chirildi.' }); }
  catch (error) { fail(res, error, 'Vazifani o‘chirishda xatolik'); }
}

export async function saveService(req, res) {
  const { service_name, price, image_url } = req.body;
  if (!String(service_name || '').trim() || !Number.isFinite(Number(price)) || Number(price) < 0) return res.status(400).json({ message: 'Xizmat nomi va narxni to‘g‘ri kiriting.' });
  try {
    if (req.params.id) await executeQuery(`UPDATE MEXMONXONALAR_TIZIMI.SERVICES SET SERVICE_NAME=:service_name, PRICE=:price, IMAGE_URL=:image_url WHERE ID=:id`, { service_name, price: Number(price), image_url: image_url || null, id: Number(req.params.id) });
    else await executeQuery(`INSERT INTO MEXMONXONALAR_TIZIMI.SERVICES (SERVICE_NAME, PRICE, IMAGE_URL) VALUES (:service_name,:price,:image_url)`, { service_name, price: Number(price), image_url: image_url || null });
    res.json({ message: 'Xizmat saqlandi.' });
  } catch (error) { fail(res, error, 'Xizmatni saqlashda xatolik'); }
}
export async function deleteService(req, res) {
  if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
  try { await executeQuery(`DELETE FROM MEXMONXONALAR_TIZIMI.SERVICES WHERE ID=:id`, { id: Number(req.params.id) }); res.json({ message: 'Xizmat o‘chirildi.' }); }
  catch (error) { fail(res, error, 'Xizmatni o‘chirishda xatolik'); }
}
export async function createAdminServiceOrder(req, res) {
  const { room_number, service_id } = req.body;
  if (!String(room_number || '').trim() || !positiveId(service_id)) return res.status(400).json({ message: 'Xona raqami va xizmatni tanlang.' });
  try {
    const result = await executeQuery(`INSERT INTO MEXMONXONALAR_TIZIMI.SERVICE_ORDERS (BOOKING_ID, SERVICE_ID, QUANTITY, TOTAL_PRICE, ORDERED_AT) SELECT b.ID, s.ID, 1, s.PRICE, SYSTIMESTAMP FROM MEXMONXONALAR_TIZIMI.BOOKINGS b JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.ID=b.ROOM_ID JOIN MEXMONXONALAR_TIZIMI.SERVICES s ON s.ID=:service_id WHERE r.ROOM_NUMBER=:room_number AND LOWER(TRIM(b.STATUS)) NOT IN ('cancelled','canceled','bekor qilingan') AND TRUNC(SYSDATE) BETWEEN TRUNC(b.CHECK_IN_DATE) AND TRUNC(b.CHECK_OUT_DATE) AND b.ID=(SELECT MAX(b2.ID) FROM MEXMONXONALAR_TIZIMI.BOOKINGS b2 WHERE b2.ROOM_ID=r.ID AND LOWER(TRIM(b2.STATUS)) NOT IN ('cancelled','canceled','bekor qilingan'))`, { service_id: Number(service_id), room_number: String(room_number).trim() });
    if (!result.rowsAffected) return res.status(404).json({ message: 'Bugun joylashgan mehmonning bronini topib bo‘lmadi.' });
    res.status(201).json({ message: 'Xizmat buyurtmasi saqlandi.' });
  } catch (error) { fail(res, error, 'Xizmat buyurtmasini yaratishda xatolik'); }
}

export async function updatePayment(req, res) {
  const status = String(req.body.status || '').trim();
  if (!positiveId(req.params.id) || !status) return res.status(400).json({ message: 'To‘lov ID va statusni kiriting.' });
  try { await executeQuery(`UPDATE MEXMONXONALAR_TIZIMI.PAYMENTS SET PAYMENT_STATUS=:status, PAID_AT=CASE WHEN LOWER(:status)='paid' THEN SYSTIMESTAMP ELSE PAID_AT END WHERE ID=:id`, { status, id: Number(req.params.id) }); res.json({ message: 'To‘lov yangilandi.' }); }
  catch (error) { fail(res, error, 'To‘lovni yangilashda xatolik'); }
}
export async function createAdminPayment(req, res) {
  const { guest_name, amount, method, status } = req.body;
  if (!String(guest_name || '').trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !String(method || '').trim()) return res.status(400).json({ message: 'Mehmon, musbat summa va to‘lov usulini kiriting.' });
  try {
    const result = await executeQuery(`INSERT INTO MEXMONXONALAR_TIZIMI.PAYMENTS (BOOKING_ID, AMOUNT, PAYMENT_METHOD, PAYMENT_STATUS, PAID_AT) SELECT b.ID, :amount, :method, :status, CASE WHEN LOWER(:status)='paid' THEN SYSTIMESTAMP ELSE NULL END FROM MEXMONXONALAR_TIZIMI.BOOKINGS b JOIN MEXMONXONALAR_TIZIMI.USERS u ON u.ID=b.USER_ID WHERE LOWER(TRIM(u.FIRST_NAME || ' ' || u.LAST_NAME))=LOWER(TRIM(:guest_name)) AND b.ID=(SELECT MAX(b2.ID) FROM MEXMONXONALAR_TIZIMI.BOOKINGS b2 WHERE b2.USER_ID=u.ID)`, { amount: Number(amount), method, status: status || 'pending', guest_name: guest_name.trim() });
    if (!result.rowsAffected) return res.status(404).json({ message: 'Mehmonning bronini topib bo‘lmadi.' });
    res.status(201).json({ message: 'To‘lov saqlandi.' });
  } catch (error) { fail(res, error, 'To‘lov yaratishda xatolik'); }
}
export async function deletePayment(req, res) {
  if (!positiveId(req.params.id)) return res.status(400).json({ message: 'ID noto‘g‘ri.' });
  try { await executeQuery(`DELETE FROM MEXMONXONALAR_TIZIMI.PAYMENTS WHERE ID=:id`, { id: Number(req.params.id) }); res.json({ message: 'To‘lov o‘chirildi.' }); }
  catch (error) { fail(res, error, 'To‘lovni o‘chirishda xatolik'); }
}
