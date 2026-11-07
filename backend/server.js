import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/db.js';
import { executeQuery } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import userRoutes from './routes/userRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import roomRoutes from './routes/roomRoutes.js'; // <-- 1. Shu yerga roomRoutes import qilinadi
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [process.env.FRONTEND_URL, ...(process.env.CORS_ORIGINS || '').split(',')]
  .map((origin) => String(origin || '').trim().replace(/\/$/, ''))
  .filter(Boolean);
if (process.env.NODE_ENV !== 'production') allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) return callback(null, true);
    return callback(new Error('Origin CORS orqali ruxsat etilmagan.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));

// Auth marshrutlarini ulash
app.use('/api/auth', authRoutes);

// Profil marshrutlarini ulash
app.use('/api/profile', profileRoutes);

app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);

// Xonalar marshrutini ulash (MANA SHU YETISHMAYOTGANDI)
app.use('/api/rooms', roomRoutes); // <-- 2. Shu yerda ulanadi

// Xizmatlar marshrutini ulash
app.use('/api/services', serviceRoutes);

app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', async (_req, res) => {
  try {
    await executeQuery('SELECT 1 AS HEALTH FROM DUAL');
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check: Oracle bazasiga ulanish yo‘q:', error.message);
    return res.status(503).json({ status: 'unavailable', database: 'disconnected' });
  }
});

app.use((req, res) => res.status(404).json({ message: 'API manzili topilmadi.' }));
app.use((error, _req, res, _next) => {
  console.error('HTTP middleware xatoligi:', error.message);
  if (res.headersSent) return;
  if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'JSON so‘rov formati noto‘g‘ri.' });
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'So‘rov hajmi ruxsat etilgan chegaradan katta.' });
  return res.status(error.message?.includes('CORS') ? 403 : 500).json({ message: 'Server so‘rovni bajara olmadi.' });
});

if (!process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32)) {
  console.error('JWT_SECRET sozlanmagan yoki production uchun juda qisqa (kamida 32 belgi kerak).');
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  console.error('Production uchun FRONTEND_URL yoki CORS_ORIGINS sozlanishi shart.');
  process.exit(1);
}

initializeDatabase()
  .then(() => app.listen(PORT, () => {
    console.log(`🚀 Server http://localhost:${PORT} manzilida ishga tushdi`);
  }))
  .catch((error) => {
    console.error('❌ Oracle DB ulanishi muvaffaqiyatsiz. Server ishga tushirilmadi:', error.message);
    process.exit(1);
  });
