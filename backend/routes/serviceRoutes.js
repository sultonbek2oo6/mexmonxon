import express from 'express';
import { getAllServices, getAllServiceOrders, createServiceOrder } from '../controllers/serviceController.js';
import { authorize, authorizePermission, protect } from '../middlewares/authMiddleware.js';
import { saveService, deleteService } from '../controllers/adminController.js';

const router = express.Router();

// GET /api/services - Xizmatlar ro'yxati
router.get('/', getAllServices);
router.get('/orders', protect, authorizePermission('services'), getAllServiceOrders);
router.post('/', protect, authorizePermission('services'), saveService);
router.put('/:id', protect, authorizePermission('services'), saveService);
router.delete('/:id', protect, authorizePermission('services'), deleteService);

// POST /api/services/order - Xizmatga buyurtma berish
router.post('/order', protect, authorize('guest', 'user'), createServiceOrder);

export default router;
