import { executeQuery } from '../config/db.js';

// Barcha xonalar va turlarini bazadan olish
export const getAllRooms = async (req, res) => {
  try {
    const query = `
      SELECT r.ID, r.TYPE_ID, r.ROOM_NUMBER, r.FLOOR, r.STATUS,
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

export const getRoomAvailability = async (req, res) => {
  const roomId = Number(req.params.id);
  if (!Number.isInteger(roomId) || roomId <= 0) return res.status(400).json({ message: 'Xona ID noto‘g‘ri.' });
  try {
    const result = await executeQuery(`SELECT TO_CHAR(b.CHECK_IN_DATE,'YYYY-MM-DD') CHECK_IN_DATE,
      TO_CHAR(b.CHECK_OUT_DATE,'YYYY-MM-DD') CHECK_OUT_DATE
      FROM MEXMONXONALAR_TIZIMI.BOOKINGS b
      WHERE b.ROOM_ID=:roomId AND LOWER(TRIM(b.STATUS)) NOT IN ('cancelled','canceled','bekor qilingan','completed','completed early')
        AND TRUNC(b.CHECK_OUT_DATE) >= TRUNC(SYSDATE)
      ORDER BY b.CHECK_IN_DATE`, { roomId });
    return res.json(result.rows || []);
  } catch (error) {
    console.error('Xona band sanalarini olishda xatolik:', error);
    return res.status(500).json({ message: 'Xona band sanalarini olishda xatolik.' });
  }
};
