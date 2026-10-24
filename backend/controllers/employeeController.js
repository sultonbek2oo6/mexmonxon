import { executeQuery } from '../config/db.js';

// Barcha xodimlarni olish
export const getEmployees = async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT ID, FIRST_NAME, LAST_NAME, ROLE, PHONE FROM EMPLOYEES ORDER BY ID DESC`
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

// Xodimni o'chirish
export const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await executeQuery(`DELETE FROM EMPLOYEES WHERE ID = :id`, { id });
    res.json({ message: "Xodim o'chirildi" });
  } catch (error) {
    console.error("Xodim o'chirish xatolik:", error);
    res.status(500).json({ message: "Server xatoligi" });
  }
};