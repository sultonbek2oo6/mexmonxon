import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateToken = (payload) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET muhit o‘zgaruvchisi sozlanmagan.');
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};

export const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET muhit o‘zgaruvchisi sozlanmagan.');
  return jwt.verify(token, process.env.JWT_SECRET);
};
