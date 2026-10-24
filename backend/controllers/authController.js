import { executeQuery } from '../config/db.js';
import { generateToken } from '../config/jwt.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import oracledb from 'oracledb';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const publicMessage = "Serverda xatolik yuz berdi. Ma'lumotlarni va Oracle ulanishini tekshiring.";

export const register = async (req, res) => {
  const firstName = String(req.body.first_name || '').trim();
  const lastName = String(req.body.last_name || '').trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  const phone = String(req.body.phone || '').trim() || null;
  const passportNumber = String(req.body.passport_number || '').trim() || null;

  if (!firstName || !lastName || !email || password.length < 8) {
    return res.status(400).json({ message: "Ism, familiya, email va kamida 8 belgili parol kiriting." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const inserted = await executeQuery(
      `INSERT INTO USERS (FIRST_NAME, LAST_NAME, EMAIL, PASSWORD_HASH, PHONE, PASSPORT_NUMBER, ROLE)
       VALUES (:first_name, :last_name, :email, :password_hash, :phone, :passport_number, 'guest')
       RETURNING ID INTO :id`,
      {
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: passwordHash,
        phone,
        passport_number: passportNumber,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    const userId = inserted.outBinds.id[0];
    const role = 'guest';
    const token = generateToken({ id: userId, email, role });
    return res.status(201).json({
      message: "Muvaffaqiyatli ro'yxatdan o'tildi",
      token,
      user: { id: userId, first_name: firstName, last_name: lastName, email, role }
    });
  } catch (error) {
    if (error.errorNum === 1) return res.status(409).json({ message: "Bu email yoki hujjat raqami bilan foydalanuvchi mavjud." });
    console.error('Register xatolik:', error);
    return res.status(500).json({ message: publicMessage });
  }
};

export const login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({ message: 'Email va parolni kiriting.' });

  try {
    const result = await executeQuery(
      `SELECT ID, FIRST_NAME, LAST_NAME, EMAIL, PASSWORD_HASH, ROLE FROM USERS WHERE LOWER(EMAIL) = :email`,
      { email }
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: "Email yoki parol noto'g'ri." });

    const storedPassword = user.PASSWORD_HASH ?? user.password_hash;
    let isMatch = false;
    if (storedPassword) {
      isMatch = /^\$2[aby]\$/.test(storedPassword)
        ? await bcrypt.compare(password, storedPassword)
        : password === storedPassword; // Eski, oddiy matnli yozuvlar uchun vaqtinchalik moslik.
    }
    if (!isMatch) return res.status(401).json({ message: "Email yoki parol noto'g'ri." });

    // Eski oddiy matnli parolni birinchi muvaffaqiyatli kirishda hashga almashtirish.
    if (storedPassword && !/^\$2[aby]\$/.test(storedPassword)) {
      await executeQuery('UPDATE USERS SET PASSWORD_HASH = :password_hash WHERE ID = :id', {
        password_hash: await bcrypt.hash(password, 10), id: user.ID ?? user.id
      });
    }
    const role = user.ROLE ?? user.role ?? 'guest';
    const userEmail = user.EMAIL ?? user.email;
    const token = generateToken({ id: user.ID ?? user.id, email: userEmail, role });
    return res.json({
      message: 'Muvaffaqiyatli tizimga kirildi', token,
      user: {
        id: user.ID ?? user.id,
        first_name: user.FIRST_NAME ?? user.first_name,
        last_name: user.LAST_NAME ?? user.last_name,
        email: userEmail, role
      }
    });
  } catch (error) {
    console.error('Login xatolik:', error);
    return res.status(500).json({ message: publicMessage });
  }
};

export const requestPasswordReset = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!email) return res.status(400).json({ message: 'Email manzilini kiriting.' });
  try {
    const result = await executeQuery('SELECT ID, EMAIL FROM USERS WHERE LOWER(EMAIL) = :email', { email });
    // Hisob mavjudligini oshkor qilmaymiz.
    if (!result.rows.length) return res.json({ message: 'Agar bu email ro‘yxatdan o‘tgan bo‘lsa, tiklash havolasi yuborildi.' });
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.error('Parol tiklash emaili yuborilmadi: SMTP_HOST, SMTP_USER va SMTP_PASSWORD sozlanmagan.');
      return res.status(503).json({ message: 'Parolni tiklash email xizmati sozlanmagan. Backend .env fayliga SMTP sozlamalarini kiriting.' });
    }
    const user = result.rows[0];
    const resetToken = jwt.sign(
      { sub: String(user.ID ?? user.id), purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/login?resetToken=${encodeURIComponent(resetToken)}`;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: user.EMAIL ?? user.email,
      subject: 'Grand Hotel — parolni tiklash',
      text: `Parolingizni yangilash uchun ushbu havolani 15 daqiqa ichida oching: ${resetUrl}`,
      html: `<p>Parolni yangilash uchun quyidagi havolani 15 daqiqa ichida oching:</p><p><a href="${resetUrl}">Parolni tiklash</a></p>`
    });
    return res.json({ message: 'Agar bu email ro‘yxatdan o‘tgan bo‘lsa, tiklash havolasi yuborildi.' });
  } catch (error) {
    console.error('Password reset email xatolik:', error);
    return res.status(500).json({ message: 'Tiklash xatini yuborib bo‘lmadi. SMTP sozlamalarini tekshiring.' });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Tiklash havolasi va kamida 8 belgili yangi parolni kiriting.' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== 'password-reset' || !/^\d+$/.test(payload.sub)) throw new Error('Invalid reset token');
    const result = await executeQuery(
      'UPDATE USERS SET PASSWORD_HASH = :password_hash WHERE ID = :id',
      { password_hash: await bcrypt.hash(password, 10), id: Number(payload.sub) }
    );
    if (!result.rowsAffected) return res.status(400).json({ message: 'Foydalanuvchi topilmadi.' });
    return res.json({ message: 'Parol muvaffaqiyatli yangilandi. Endi tizimga kirishingiz mumkin.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError' || error.message === 'Invalid reset token') {
      return res.status(400).json({ message: 'Tiklash havolasi yaroqsiz yoki muddati tugagan. Yangisini so‘rang.' });
    }
    console.error('Reset password xatolik:', error);
    return res.status(500).json({ message: publicMessage });
  }
};
