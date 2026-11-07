import { verifyToken } from '../config/jwt.js';
import { executeQuery } from '../config/db.js';

export const ADMIN_PERMISSIONS = ['dashboard', 'bookings', 'rooms', 'roomTypes', 'housekeeping', 'services', 'employees', 'users', 'payments', 'reports', 'settings'];

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && /^Bearer\s/i.test(req.headers.authorization)) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Avtorizatsiyadan o'tilmagan, token mavjud emas" });
  }

  try {
    const decoded = verifyToken(token);

    // Token ichidagi id raqam bo'lishi shart (profil so'rovlarida ishlatiladi)
    const userId = Number(decoded.id);
    if (!userId) {
      return res.status(401).json({ message: "Token yaroqsiz yoki muddati o'tgan" });
    }

    const role = String(decoded.role || 'guest').trim().toLowerCase();
    const reqUser = {
      ...decoded,
      id: userId,
      email: decoded.email,
      role
    };
    // Role va ruxsatlar token chiqarilgandan keyin ham o'zgargan bo'lishi mumkin;
    // himoyalangan so'rovda doim bazadagi joriy holatni ishlatamiz.
    const current = await executeQuery('SELECT ROLE FROM USERS WHERE ID = :id', { id: userId });
    if (!current.rows?.length) return res.status(401).json({ message: 'Foydalanuvchi topilmadi.' });
    reqUser.role = String(current.rows[0].ROLE ?? current.rows[0].role ?? 'guest').trim().toLowerCase();
    if (reqUser.role === 'admin') {
      const permissions = await executeQuery('SELECT PERMISSION_KEY FROM MEXMONXONALAR_TIZIMI.USER_PERMISSIONS WHERE USER_ID = :id', { id: userId });
      reqUser.permissions = (permissions.rows || []).map((row) => row.PERMISSION_KEY ?? row.permission_key);
    } else reqUser.permissions = [];
    req.user = reqUser;
    next();
  } catch (error) {
    if (error.errorNum === 942) return res.status(503).json({ message: 'RBAC jadvali mavjud emas. backend/migrations/002_rbac.sql migratsiyasini bajaring.' });
    return res.status(401).json({ message: "Token yaroqsiz yoki muddati o'tgan" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Ushbu resursga kirish uchun ruxsat yo'q" });
    }
    next();
  };
};

export const authorizePermission = (permission) => (req, res, next) => {
  if (req.user?.role === 'manager' || (req.user?.role === 'admin' && req.user.permissions?.includes(permission))) return next();
  return res.status(403).json({ message: 'Ushbu amal uchun ruxsat berilmagan.' });
};

export const authorizeManager = (req, res, next) => {
  if (req.user?.role === 'manager') return next();
  return res.status(403).json({ message: 'Bu amal faqat menejer uchun.' });
};
