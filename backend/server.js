import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import userRoutes from './routes/userRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import roomRoutes from './routes/roomRoutes.js'; // <-- 1. Shu yerga roomRoutes import qilinadi
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS ni to'liq ruxsat berish
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

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
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend va Oracle bazasi mukammal ishlamoqda!' });
});

initializeDatabase()
  .then(() => app.listen(PORT, () => {
    console.log(`🚀 Server http://localhost:${PORT} manzilida ishga tushdi`);
  }))
  .catch((error) => {
    console.error('❌ Oracle DB ulanishi muvaffaqiyatsiz. Server ishga tushirilmadi:', error.message);
    process.exit(1);
  });