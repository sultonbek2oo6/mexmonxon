import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Baza bilan ulanish
initializeDatabase();

// Route'larni ulash
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend muvaffaqiyatli ishlayapti' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} manzilida ishga tushdi`);
});