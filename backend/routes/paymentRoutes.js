import express from 'express';
import { createPayment, getAllPayments } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/', createPayment);
router.get('/', getAllPayments);

export default router;