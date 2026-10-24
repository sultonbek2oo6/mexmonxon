import { executeQuery } from '../config/db.js';
import { generateToken } from '../config/jwt.js';
import bcrypt from 'bcryptjs';

const publicMessage = "Serverda xatolik yuz berdi. Ma'lumotlarni va Oracle ulanishini tekshiring.";
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const mapUser = (row) => {
  const firstName = row.FIRST_NAME ?? row.first_name ?? '';
  const lastName = row.LAST_NAME ?? row.last_name ?? '';
  return {
    id: row.ID ?? row.id,
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`.trim(),
    email: row.EMAIL ?? row.email ?? '',
    phone: row.PHONE ?? row.phone ?? '',
    passport: row.PASSPORT_NUMBER ?? row.passport_number ?? '',
    birth_date: row.BIRTH_DATE ?? row.birth_date ?? '',
    role: row.ROLE ?? row.role ?? 'guest'
  };
};

const SELECT_PROFILE = `
  SELECT ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, PASSPORT_NUMBER,
         TO_CHAR(BIRTH_DATE, 'YYYY-MM-DD') AS BIRTH_DATE, ROLE
  FROM USERS
  WHERE ID = :id`;

export const getProfile = async (req, res) => {
  try {
    const result = await executeQuery(SELECT_PROFILE, { id: req.user.id });
    const row = result.rows[0];
    if (!row) return res.status(404).json({ message: 'Foydalanuvchi topilmadi.' });
    return res.json({ user: mapUser(row) });
  } catch (error) {
    console.error('Get profile xatolik:', error);
    return res.status(500).json({ message: publicMessage });
  }
};

export const updateProfile = async (req, res) => {
  const fullName = String(req.body.fullName || '').trim().replace(/\s+/g, ' ');
  const email = normalizeEmail(req.body.email);
  const phone = String(req.body.phone || '').trim() || null;
  const passport = String(req.body.passport || '').trim() || null;
  const birthDate = String(req.body.birthDate || '').trim() || null;
  const password = String(req.body.password || '');
  const confirmPassword = String(req.body.confirmPassword || '');

  // Ism-familiyani ajratish: birinchi so'z — ism, qolgani — familiya
  const nameParts = fullName.split(' ');
  const firstName = nameParts.shift() || '';
  const lastName = nameParts.join(' ');

  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'Ism va familiyani to‘liq kiriting (masalan: Sultonbek Juraboyev).' });
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'To‘g‘ri email manzil kiriting.' });
  }
  if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return res.status(400).json({ message: 'Tug‘ilgan sana noto‘g‘ri formatda.' });
  }
  if (password) {
    if (password.length < 8) {
      return res.status(400).json({ message: 'Yangi parol kamida 8 belgidan iborat bo‘lishi kerak.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Parollar mos kelmadi!' });
    }
  }

  try {
    await executeQuery(
      `UPDATE USERS
          SET FIRST_NAME = :first_name,
              LAST_NAME = :last_name,
              EMAIL = :email,
              PHONE = :phone,
              PASSPORT_NUMBER = :passport_number,
              BIRTH_DATE = TO_DATE(:birth_date, 'YYYY-MM-DD')
        WHERE ID = :id`,
      {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        passport_number: passport,
        birth_date: birthDate,
        id: req.user.id
      }
    );

    if (password) {
      await executeQuery('UPDATE USERS SET PASSWORD_HASH = :password_hash WHERE ID = :id', {
        password_hash: await bcrypt.hash(password, 10),
        id: req.user.id
      });
    }

    const result = await executeQuery(SELECT_PROFILE, { id: req.user.id });
    const row = result.rows[0];
    if (!row) return res.status(404).json({ message: 'Foydalanuvchi topilmadi.' });

    const user = mapUser(row);
    // Email o'zgargan bo'lishi mumkin, shuning uchun yangi token beramiz
    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      message: "Profil ma'lumotlari muvaffaqiyatli saqlandi!",
      token,
      user
    });
  } catch (error) {
    if (error.errorNum === 1) {
      return res.status(409).json({ message: 'Bu email yoki pasport raqami boshqa foydalanuvchida mavjud.' });
    }
    console.error('Update profile xatolik:', error);
    return res.status(500).json({ message: publicMessage });
  }
};