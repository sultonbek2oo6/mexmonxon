import { executeQuery, executeTransaction } from '../config/db.js';
import oracledb from 'oracledb';

const EMPLOYEE_POSITIONS = ['Receptionist', 'Housekeeper', 'Security', 'Accountant', 'Maintenance'];

// Barcha xodimlarni olish
export const getEmployees = async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT e.ID, e.USER_ID, e.FIRST_NAME, e.LAST_NAME, e.ROLE, e.PHONE, u.EMAIL,
              LISTAGG(TO_CHAR(r.ROOM_NUMBER), ', ') WITHIN GROUP (ORDER BY r.ROOM_NUMBER) AS ASSIGNED_ROOMS,
              LISTAGG(TO_CHAR(r.ID), ',') WITHIN GROUP (ORDER BY r.ID) AS ASSIGNED_ROOM_IDS
         FROM MEXMONXONALAR_TIZIMI.EMPLOYEES e
         LEFT JOIN MEXMONXONALAR_TIZIMI.EMPLOYEE_ROOM_ASSIGNMENTS a ON a.EMPLOYEE_ID = e.ID
         LEFT JOIN MEXMONXONALAR_TIZIMI.ROOMS r ON r.ID = a.ROOM_ID
         LEFT JOIN MEXMONXONALAR_TIZIMI.USERS u ON u.ID = e.USER_ID
        WHERE e.IS_ACTIVE = 1
        GROUP BY e.ID, e.USER_ID, e.FIRST_NAME, e.LAST_NAME, e.ROLE, e.PHONE, u.EMAIL
        ORDER BY e.ID DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Xodimlarni olishda xatolik:", error);
    res.status(500).json({ message: "Server xatoligi" });
  }
};

// Yangi xodim qo'shish
export const createEmployee = async (req, res) => {
  const { first_name, last_name, role, phone } = req.body;
  try {
    await executeQuery(
      `INSERT INTO EMPLOYEES (FIRST_NAME, LAST_NAME, ROLE, PHONE)
       VALUES (:first_name, :last_name, :role, :phone)`,
      { first_name, last_name: last_name || '', role, phone }
    );
    res.status(201).json({ message: "Xodim muvaffaqiyatli qo'shildi" });
  } catch (error) {
    console.error("Xodim qo'shish xatolik:", error);
    res.status(500).json({ message: "Server xatoligi", error: error.message });
  }
};

export const hireUserAsEmployee = async (req, res) => {
  const userId = Number(req.params.id);
  const position = String(req.body.position || '').trim();
  const roomIds = [...new Set((Array.isArray(req.body.roomIds) ? req.body.roomIds : []).map(Number))];
  if (!Number.isInteger(userId) || userId <= 0 || !EMPLOYEE_POSITIONS.includes(position) || roomIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    return res.status(400).json({ message: 'Foydalanuvchi, lavozim yoki xona tanlovi noto‘g‘ri.' });
  }

  try {
    const employee = await executeTransaction(async (query) => {
      const userResult = await query(
        'SELECT ID, FIRST_NAME, LAST_NAME, PHONE, ROLE FROM MEXMONXONALAR_TIZIMI.USERS WHERE ID=:id FOR UPDATE',
        { id: userId }
      );
      const user = userResult.rows?.[0];
      const userRole = String(user?.ROLE || '').trim().toLowerCase();
      if (!user || !['guest', 'user'].includes(userRole)) {
        const error = new Error('Faqat mehmon/fоydalanuvchini xodim sifatida ishga olish mumkin.'); error.status = 400; throw error;
      }

      const existing = await query('SELECT ID, IS_ACTIVE FROM MEXMONXONALAR_TIZIMI.EMPLOYEES WHERE USER_ID=:id', { id: userId });
      if (Number(existing.rows?.[0]?.IS_ACTIVE) === 1) { const error = new Error('Bu foydalanuvchi allaqachon xodim.'); error.status = 409; throw error; }

      for (const roomId of roomIds) {
        const room = await query('SELECT ID FROM MEXMONXONALAR_TIZIMI.ROOMS WHERE ID=:id', { id: roomId });
        if (!room.rows?.length) { const error = new Error(`Xona topilmadi: ${roomId}`); error.status = 400; throw error; }
      }

      let employeeId = existing.rows?.[0]?.ID;
      if (employeeId) {
        await query(
          `UPDATE MEXMONXONALAR_TIZIMI.EMPLOYEES
              SET FIRST_NAME=:first_name, LAST_NAME=:last_name, ROLE=:position, PHONE=:phone,
                  PREVIOUS_USER_ROLE=:previous_role, IS_ACTIVE=1
            WHERE ID=:employee_id`,
          { first_name: user.FIRST_NAME, last_name: user.LAST_NAME || '', position, phone: user.PHONE || '', previous_role: userRole, employee_id: employeeId }
        );
      } else {
        const inserted = await query(
          `INSERT INTO MEXMONXONALAR_TIZIMI.EMPLOYEES
            (FIRST_NAME, LAST_NAME, ROLE, PHONE, USER_ID, PREVIOUS_USER_ROLE, IS_ACTIVE)
           VALUES (:first_name, :last_name, :position, :phone, :user_id, :previous_role, 1)
           RETURNING ID INTO :employee_id`,
          {
            first_name: user.FIRST_NAME, last_name: user.LAST_NAME || '', position, phone: user.PHONE || '',
            user_id: userId, previous_role: userRole,
            employee_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          }
        );
        employeeId = inserted.outBinds.employee_id[0];
      }
      await query("UPDATE MEXMONXONALAR_TIZIMI.USERS SET ROLE='employee' WHERE ID=:id", { id: userId });
      for (const roomId of roomIds) {
        await query(
          'INSERT INTO MEXMONXONALAR_TIZIMI.EMPLOYEE_ROOM_ASSIGNMENTS (EMPLOYEE_ID, ROOM_ID) VALUES (:employee_id, :room_id)',
          { employee_id: employeeId, room_id: roomId }
        );
      }
      return { id: employeeId, first_name: user.FIRST_NAME, last_name: user.LAST_NAME, position, roomIds };
    });
    return res.status(201).json({ message: 'Foydalanuvchi xodimlar ro‘yxatiga o‘tkazildi.', employee });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error('User hire failed:', error);
    return res.status(500).json({ message: 'Xodimni ishga olishda xatolik.' });
  }
};

export const setEmployeeRooms = async (req, res) => {
  const employeeId = Number(req.params.id);
  const roomIds = req.body?.roomIds;
  if (!Number.isInteger(employeeId) || employeeId <= 0 || !Array.isArray(roomIds)) return res.status(400).json({ message: 'Xodim yoki xonalar ro‘yxati noto‘g‘ri.' });
  const ids = [...new Set(roomIds.map(Number))];
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) return res.status(400).json({ message: 'Xona ID noto‘g‘ri.' });
  try {
    await executeTransaction(async (query) => {
      const employee = await query('SELECT ID FROM MEXMONXONALAR_TIZIMI.EMPLOYEES WHERE ID=:id AND IS_ACTIVE=1 FOR UPDATE', { id: employeeId });
      if (!employee.rows?.length) { const error = new Error('Faol xodim topilmadi.'); error.status = 404; throw error; }
      for (const roomId of ids) {
        const room = await query('SELECT ID FROM MEXMONXONALAR_TIZIMI.ROOMS WHERE ID=:id', { id: roomId });
        if (!room.rows?.length) { const error = new Error(`Xona topilmadi: ${roomId}`); error.status = 400; throw error; }
      }
      await query('DELETE FROM MEXMONXONALAR_TIZIMI.EMPLOYEE_ROOM_ASSIGNMENTS WHERE EMPLOYEE_ID=:id', { id: employeeId });
      for (const roomId of ids) await query(
        'INSERT INTO MEXMONXONALAR_TIZIMI.EMPLOYEE_ROOM_ASSIGNMENTS (EMPLOYEE_ID, ROOM_ID) VALUES (:employee_id, :room_id)',
        { employee_id: employeeId, room_id: roomId }
      );
    });
    return res.json({ message: 'Xonalarga biriktirish saqlandi.' });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error('Employee room assignment failed:', error);
    return res.status(500).json({ message: 'Xonalarni biriktirishda xatolik.' });
  }
};

// Xodimni o'chirish
export const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) return res.status(400).json({ message: 'Xodim ID noto‘g‘ri.' });
  try {
    await executeTransaction(async (query) => {
      const result = await query('SELECT USER_ID, PREVIOUS_USER_ROLE FROM MEXMONXONALAR_TIZIMI.EMPLOYEES WHERE ID=:id AND IS_ACTIVE=1 FOR UPDATE', { id });
      const employee = result.rows?.[0];
      if (!employee) { const error = new Error('Faol xodim topilmadi.'); error.status = 404; throw error; }
      await query('DELETE FROM MEXMONXONALAR_TIZIMI.EMPLOYEE_ROOM_ASSIGNMENTS WHERE EMPLOYEE_ID=:id', { id });
      await query('UPDATE MEXMONXONALAR_TIZIMI.EMPLOYEES SET IS_ACTIVE=0 WHERE ID=:id', { id });
      if (employee.USER_ID) await query(
        "UPDATE MEXMONXONALAR_TIZIMI.USERS SET ROLE=:role WHERE ID=:user_id AND ROLE='employee'",
        { role: employee.PREVIOUS_USER_ROLE || 'guest', user_id: employee.USER_ID }
      );
    });
    res.json({ message: 'Xodim faol ro‘yxatdan chiqarildi.' });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error("Xodim o'chirish xatolik:", error);
    res.status(500).json({ message: "Server xatoligi" });
  }
};
