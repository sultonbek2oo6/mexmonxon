import express from 'express';
import { getAllPayments, getFinanceSummary, getExpenses, createExpense } from '../controllers/paymentController.js';
import { protect, authorizePermission, authorizeManager } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/summary', protect, authorizePermission('payments'), getFinanceSummary);
router.get('/expenses', protect, authorizePermission('payments'), getExpenses);
router.post('/expenses', protect, authorizeManager, createExpense);
router.get('/', protect, authorizePermission('payments'), getAllPayments);

export default router;
