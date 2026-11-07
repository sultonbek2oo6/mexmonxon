import { executeQuery, executeTransaction } from '../config/db.js';
import bcrypt from 'bcryptjs';
import { ADMIN_PERMISSIONS } from '../middlewares/authMiddleware.js';

// Barcha foydalanuvchilarni olish
export const getUsers = async (req, res) => {
  try {
    const result = await executeQuery(req.user.role === 'manager'
      ? `SELECT ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, PASSPORT_NUMBER, ROLE, CREATED_AT FROM USERS WHERE LOWER(TRIM(ROLE)) IN ('guest','user','admin','manager') ORDER BY ID DESC`
      : `SELECT ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, PASSPORT_NUMBER, ROLE, CREATED_AT FROM USERS WHERE LOWER(TRIM(ROLE)) IN ('guest','user') ORDER BY ID DESC`);
    res.json(result.rows);
  } catch (error) {
    console.error("Users olishda xatolik:", error);
    res.status(500).json({ message: "Server xatoligi" });
  }
};

// Yangi foydalanuvchi qo'shish
export const createUser = async (req, res) => {
  const { first_name, last_name, email, password, phone, passport_number, role } = req.body;
  const newRole = String(role || 'user').toLowerCase();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!String(first_name || '').trim() || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || typeof password !== 'string' || password.length < 8) return res.status(400).json({ message: 'Ism, to‘g‘ri email va kamida 8 belgili parol kiriting.' });
  if (!['guest', 'user', 'admin'].includes(newRole) || (newRole === 'admin' && req.user.role !== 'manager')) return res.status(403).json({ message: 'Admin hisobini faqat menejer yaratishi mumkin.' });
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await executeQuery(
      `INSERT INTO USERS (FIRST_NAME, LAST_NAME, EMAIL, PASSWORD_HASH, PHONE, PASSPORT_NUMBER, ROLE)
       VALUES (:first_name, :last_name, :email, :passwordHash, :phone, :passport_number, :role)`,
      {
        first_name,
        last_name: last_name || '',
        email: normalizedEmail,
        passwordHash,
        phone: phone || '',
        passport_number: passport_number || '',
        role: newRole
      }
    );
    res.status(201).json({ message: "Foydalanuvchi muvaffaqiyatli qo'shildi" });
  } catch (error) {
    if (error.errorNum === 1) return res.status(409).json({ message: 'Bu email yoki pasport raqami avval ro‘yxatdan o‘tgan.' });
    console.error("User qo'shish xatolik:", error);
    res.status(500).json({ message: "Foydalanuvchini yaratishda server xatoligi." });
  }
};

// Foydalanuvchini tahrirlash (UPDATE)
export const updateUser = async (req, res) => {
  const id = Number(req.params.id);
  const { first_name, last_name, email, phone, passport_number, role, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!Number.isInteger(id) || id <= 0 || !String(first_name || '').trim() || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || (password && String(password).length < 8)) return res.status(400).json({ message: 'Foydalanuvchi ID, ism, email yoki parol noto‘g‘ri.' });
  const target = await executeQuery('SELECT ROLE FROM USERS WHERE ID = :id', { id });
  const targetRole = String(target.rows?.[0]?.ROLE || '').toLowerCase();
  if (!targetRole) return res.status(404).json({ message: 'Foydalanuvchi topilmadi.' });
  if (targetRole === 'manager') return res.status(403).json({ message: 'Menejer hisobini bu paneldan o‘zgartirib bo‘lmaydi.' });
  if (targetRole === 'employee') return res.status(403).json({ message: 'Xodim hisobini xodimlar bo‘limidan boshqaring.' });
  const nextRole = String(role || targetRole).trim().toLowerCase();
  if (!['guest', 'user', 'admin'].includes(nextRole)) return res.status(400).json({ message: 'Tanlangan rol yaroqsiz.' });
  if (req.user.role !== 'manager' && !['guest', 'user'].includes(targetRole)) return res.status(403).json({ message: 'Admin hisobini faqat menejer tahrirlashi mumkin.' });
  if (req.user.role !== 'manager' && nextRole !== targetRole) return res.status(403).json({ message: 'Rolni faqat menejer o‘zgartira oladi.' });
  
  try {
    // Agar admin parolni ham o'zgartirmoqchi bo'lsa yangilaymiz, aks holda eskisicha qoladi
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      await executeQuery(
        `UPDATE USERS 
         SET FIRST_NAME = :first_name, 
             LAST_NAME = :last_name, 
             EMAIL = :email, 
             PASSWORD_HASH = :passwordHash,
             PHONE = :phone, 
             PASSPORT_NUMBER = :passport_number, 
             ROLE = :role 
         WHERE ID = :id`,
        { 
          first_name, 
          last_name: last_name || '', 
          email: normalizedEmail,
          passwordHash,
          phone: phone || '', 
          passport_number: passport_number || '', 
          role: nextRole,
          id 
        }
      );
    } else {
      // Parol kiritilmagan bo'lsa, parolga tegmasdan qolgan ma'lumotlarni yangilash
      await executeQuery(
        `UPDATE USERS 
         SET FIRST_NAME = :first_name, 
             LAST_NAME = :last_name, 
             EMAIL = :email, 
             PHONE = :phone, 
             PASSPORT_NUMBER = :passport_number, 
             ROLE = :role 
         WHERE ID = :id`,
        { 
          first_name, 
          last_name: last_name || '', 
          email: normalizedEmail,
          phone: phone || '', 
          passport_number: passport_number || '', 
          role: nextRole,
          id 
        }
      );
    }

    if (targetRole === 'admin' && nextRole !== 'admin') {
      await executeQuery('DELETE FROM MEXMONXONALAR_TIZIMI.USER_PERMISSIONS WHERE USER_ID = :id', { id });
    }

    res.json({ message: "Foydalanuvchi muvaffaqiyatli yangilandi" });
  } catch (error) {
    if (error.errorNum === 1) return res.status(409).json({ message: 'Bu email yoki pasport raqami boshqa foydalanuvchida mavjud.' });
    console.error("User yangilash xatolik:", error);
    res.status(500).json({ message: "Foydalanuvchini yangilashda server xatoligi." });
  }
};

// Foydalanuvchini o'chirish
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const target = await executeQuery('SELECT ROLE FROM USERS WHERE ID = :id', { id });
    const role = String(target.rows?.[0]?.ROLE || '').toLowerCase();
    if (!role) return res.status(404).json({ message: 'Foydalanuvchi topilmadi.' });
    if (role === 'manager') return res.status(403).json({ message: 'Menejer hisobini o‘chirib bo‘lmaydi.' });
    if (role === 'employee') return res.status(403).json({ message: 'Xodim hisobini xodimlar bo‘limidan boshqaring.' });
    if (req.user.role !== 'manager' && !['guest', 'user'].includes(role)) return res.status(403).json({ message: 'Admin hisobini faqat menejer o‘chira oladi.' });
    if (Number(id) === req.user.id) return res.status(400).json({ message: 'O‘zingizning hisobingizni o‘chira olmaysiz.' });
    await executeQuery(`DELETE FROM USERS WHERE ID = :id`, { id });
    res.json({ message: "Foydalanuvchi o'chirildi" });
  } catch (error) {
    console.error("User o'chirish xatolik:", error);
    res.status(500).json({ message: "Server xatoligi" });
  }
};

export const getUserPermissions = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const target = await executeQuery("SELECT ROLE FROM USERS WHERE ID = :id", { id });
    if (String(target.rows?.[0]?.ROLE || '').toLowerCase() !== 'admin') return res.status(400).json({ message: 'Ruxsatlar faqat admin hisobiga beriladi.' });
    const result = await executeQuery('SELECT PERMISSION_KEY FROM MEXMONXONALAR_TIZIMI.USER_PERMISSIONS WHERE USER_ID = :id', { id });
    return res.json({ permissions: (result.rows || []).map((row) => row.PERMISSION_KEY ?? row.permission_key), available: ADMIN_PERMISSIONS });
  } catch (error) { return res.status(500).json({ message: 'Ruxsatlarni olishda xatolik.' }); }
};

export const setUserPermissions = async (req, res) => {
  const id = Number(req.params.id);
  const permissions = req.body?.permissions;
  if (!Array.isArray(permissions) || permissions.some((permission) => !ADMIN_PERMISSIONS.includes(permission))) return res.status(400).json({ message: 'Ruxsatlar ro‘yxati yaroqsiz.' });
  try {
    await executeTransaction(async (query) => {
      const target = await query('SELECT ROLE FROM MEXMONXONALAR_TIZIMI.USERS WHERE ID=:id FOR UPDATE', { id });
      if (String(target.rows?.[0]?.ROLE || '').toLowerCase() !== 'admin') {
        const error = new Error('Ruxsatlar faqat admin hisobiga beriladi.'); error.status = 400; throw error;
      }
      await query('DELETE FROM MEXMONXONALAR_TIZIMI.USER_PERMISSIONS WHERE USER_ID=:id', { id });
      for (const permission of [...new Set(permissions)]) {
        await query('INSERT INTO MEXMONXONALAR_TIZIMI.USER_PERMISSIONS (USER_ID, PERMISSION_KEY) VALUES (:id, :permission)', { id, permission });
      }
    });
    return res.json({ message: 'Admin ruxsatlari saqlandi.' });
  } catch (error) { if (error.status) return res.status(error.status).json({ message: error.message }); console.error('Admin permissions update failed:', error); return res.status(500).json({ message: 'Ruxsatlarni saqlashda xatolik.' }); }
};
