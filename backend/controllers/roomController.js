import { executeQuery } from '../config/db.js';

// Barcha xonalar va turlarini bazadan olish
export const getAllRooms = async (req, res) => {
  try {
    const query = `
      SELECT r.ID, r.ROOM_NUMBER, r.FLOOR, r.STATUS, 
             rt.TYPE_NAME, 
             DBMS_LOB.SUBSTR(rt.DESCRIPTION, 4000, 1) AS DESCRIPTION, 
             rt.BASE_PRICE, rt.CAPACITY, rt.IMAGE_URL 
      FROM MEXMONXONALAR_TIZIMI.ROOMS r 
      JOIN MEXMONXONALAR_TIZIMI.ROOM_TYPES rt ON r.TYPE_ID = rt.ID
    `;
    const result = await executeQuery(query);
    
    // Natija rows yoki to'g'ridan-to'g'ri array ekanligini tekshirib yuboramiz
    const rooms = result.rows || result || [];
    res.json(rooms);
  } catch (err) {
    console.error("Xonalarni olishda xatolik tafsiloti:", err);
    res.status(500).json({ error: err.message });
  }
};