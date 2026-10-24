import express from 'express';
import { getAllServices, getAllServiceOrders, createServiceOrder } from '../controllers/serviceController.js';
import { authorize, protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/services - Xizmatlar ro'yxati
router.get('/', getAllServices);
router.get('/orders', protect, authorize('admin'), getAllServiceOrders);

// POST /api/services/order - Xizmatga buyurtma berish
router.post('/order', protect, createServiceOrder);

export default router;
