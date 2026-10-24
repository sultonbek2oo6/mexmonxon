import { verifyToken } from '../config/jwt.js';

export const protect = (req, res, next) => {
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

    req.user = {
      ...decoded,
      id: userId,
      email: decoded.email,
      role: decoded.role || 'guest'
    };
    next();
  } catch (error) {
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