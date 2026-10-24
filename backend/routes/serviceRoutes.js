import express from 'express';
import { getAllServices, getAllServiceOrders, createServiceOrder } from '../controllers/serviceController.js';
import { authorize, protect } from '../middlewares/authMiddleware.js';
import { saveService, deleteService } from '../controllers/adminController.js';

const router = express.Router();

// GET /api/services - Xizmatlar ro'yxati
router.get('/', getAllServices);
router.get('/orders', protect, authorize('admin'), getAllServiceOrders);
router.post('/', protect, authorize('admin'), saveService);
router.put('/:id', protect, authorize('admin'), saveService);
router.delete('/:id', protect, authorize('admin'), deleteService);

// POST /api/services/order - Xizmatga buyurtma berish
router.post('/order', protect, createServiceOrder);

export default router;
