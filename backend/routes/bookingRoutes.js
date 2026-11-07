import express from 'express';
import { createBooking, getBookingServiceOrders, getUserBookings } from '../controllers/bookingController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET: Foydalanuvchi bronlarini olish
router.use(protect, authorize('guest', 'user'));
router.get('/', getUserBookings);
router.get('/:bookingId/services', getBookingServiceOrders);
router.post('/', createBooking);

export default router;
