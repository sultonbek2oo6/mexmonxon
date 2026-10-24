import express from 'express';
import { createPayment, getAllPayments } from '../controllers/paymentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', createPayment);
router.get('/', protect, authorize('admin'), getAllPayments);

export default router;
