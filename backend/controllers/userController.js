import { executeQuery } from '../config/db.js';
import bcrypt from 'bcryptjs';

// Barcha foydalanuvchilarni olish
export const getUsers = async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE, PASSPORT_NUMBER, ROLE, CREATED_AT FROM USERS ORDER BY ID DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Users olishda xatolik:", error);
    res.status(500).json({ message: "Server xatoligi" });
  }
};

// Yangi foydalanuvchi qo'shish
export const createUser = async (req, res) => {
  const { first_name, last_name, email, password, phone, passport_number, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || '12345678', salt);

    await executeQuery(
      `INSERT INTO USERS (FIRST_NAME, LAST_NAME, EMAIL, PASSWORD_HASH, PHONE, PASSPORT_NUMBER, ROLE)
       VALUES (:first_name, :last_name, :email, :passwordHash, :phone, :passport_number, :role)`,
      {
        first_name,
        last_name: last_name || '',
        email,
        passwordHash,
        phone: phone || '',
        passport_number: passport_number || '',
        role: role || 'user'
      }
    );
    res.status(201).json({ message: "Foydalanuvchi muvaffaqiyatli qo'shildi" });
  } catch (error) {
    console.error("User qo'shish xatolik:", error);
    res.status(500).json({ message: "Server xatoligi", error: error.message });
  }
};

// Foydalanuvchini tahrirlash (UPDATE)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone, passport_number, role, password } = req.body;
  
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
          email, 
          passwordHash,
          phone: phone || '', 
          passport_number: passport_number || '', 
          role: role || 'user', 
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
          email, 
          phone: phone || '', 
          passport_number: passport_number || '', 
          role: role || 'user', 
          id 
        }
      );
    }

    res.json({ message: "Foydalanuvchi muvaffaqiyatli yangilandi" });
  } catch (error) {
    console.error("User yangilash xatolik:", error);
    res.status(500).json({ message: "Server xatoligi", error: error.message });
  }
};

// Foydalanuvchini o'chirish
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery(`DELETE FROM USERS WHERE ID = :id`, { id });
    res.json({ message: "Foydalanuvchi o'chirildi" });
  } catch (error) {
    console.error("User o'chirish xatolik:", error);
    res.status(500).json({ message: "Server xatoligi" });
  }
};