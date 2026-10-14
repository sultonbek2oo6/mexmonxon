import { executeQuery } from '../config/db.js';
import { generateToken } from '../config/jwt.js';
import bcrypt from 'bcryptjs';

// Ro'yxatdan o'tish (Register)
export const register = async (req, res) => {
  const { first_name, last_name, email, password, phone, passport_number } = req.body;

  try {
    const checkUser = await executeQuery(
      `SELECT ID FROM USERS WHERE EMAIL = :email`,
      { email }
    );

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ message: "Bu email bilan foydalanuvchi mavjud" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await executeQuery(
      `INSERT INTO USERS (FIRST_NAME, LAST_NAME, EMAIL, PASSWORD_HASH, PHONE, PASSPORT_NUMBER, ROLE)
       VALUES (:first_name, :last_name, :email, :passwordHash, :phone, :passport_number, 'user')
       RETURNING ID, ROLE INTO :id, :role`,
      {
        first_name,
        last_name,
        email,
        passwordHash,
        phone,
        passport_number,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        role: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
      }
    );

    const userId = result.outBinds.id[0];
    const userRole = result.outBinds.role[0];

    const token = generateToken({ id: userId, email, role: userRole });

    res.status(201).json({
      message: "Muvaffaqiyatli ro'yxatdan o'tildi",
      token,
      user: { id: userId, first_name, last_name, email, role: userRole }
    });
  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik yuz berdi", error: error.message });
  }
};

// Kirish (Login)
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await executeQuery(
      `SELECT ID, FIRST_NAME, LAST_NAME, EMAIL, PASSWORD_HASH, ROLE FROM USERS WHERE EMAIL = :email`,
      { email }
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Email yoki parol noto'g'ri" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.PASSWORD_HASH);

    if (!isMatch) {
      return res.status(400).json({ message: "Email yoki parol noto'g'ri" });
    }

    const token = generateToken({ id: user.ID, email: user.EMAIL, role: user.ROLE });

    res.json({
      message: "Muvaffaqiyatli tizimga kirildi",
      token,
      user: {
        id: user.ID,
        first_name: user.FIRST_NAME,
        last_name: user.LAST_NAME,
        email: user.EMAIL,
        role: user.ROLE
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Serverda xatolik yuz berdi", error: error.message });
  }
};