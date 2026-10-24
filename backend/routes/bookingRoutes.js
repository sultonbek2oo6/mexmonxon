import express from 'express';
import { createBooking, getBookingServiceOrders, getUserBookings } from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET: Foydalanuvchi bronlarini olish
router.use(protect);
router.get('/', getUserBookings);
router.get('/:bookingId/services', getBookingServiceOrders);
router.post('/', createBooking);

export default router;
