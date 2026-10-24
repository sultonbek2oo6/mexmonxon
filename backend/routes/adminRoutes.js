import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import {
  dashboard, reports, getRoomTypes, saveRoomType, deleteRoomType, saveRoom, deleteRoom,
  adminBookings, bookingNotifications, createAdminBooking, updateBooking, deleteBooking, housekeeping, saveHousekeeping,
  deleteHousekeeping, saveService, deleteService, createAdminServiceOrder, createAdminPayment, updatePayment, deletePayment,
  getSettings, saveSettings
} from '../controllers/adminController.js';

const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/dashboard', dashboard);
router.get('/reports', reports);
router.get('/settings', getSettings);
router.put('/settings', saveSettings);
router.get('/room-types', getRoomTypes);
router.post('/room-types', saveRoomType);
router.put('/room-types/:id', saveRoomType);
router.delete('/room-types/:id', deleteRoomType);
router.post('/rooms', saveRoom);
router.put('/rooms/:id', saveRoom);
router.delete('/rooms/:id', deleteRoom);
router.get('/bookings', adminBookings);
router.get('/notifications/bookings', bookingNotifications);
router.post('/bookings', createAdminBooking);
router.put('/bookings/:id', updateBooking);
router.delete('/bookings/:id', deleteBooking);
router.get('/housekeeping', housekeeping);
router.post('/housekeeping', saveHousekeeping);
router.put('/housekeeping/:id', saveHousekeeping);
router.delete('/housekeeping/:id', deleteHousekeeping);
router.post('/services', saveService);
router.put('/services/:id', saveService);
router.delete('/services/:id', deleteService);
router.post('/service-orders', createAdminServiceOrder);
router.put('/payments/:id', updatePayment);
router.post('/payments', createAdminPayment);
router.delete('/payments/:id', deletePayment);
export default router;
