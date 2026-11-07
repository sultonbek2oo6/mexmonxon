import express from 'express';
import { protect, authorizePermission, authorizeManager } from '../middlewares/authMiddleware.js';
import {
  dashboard, reports, getRoomTypes, saveRoomType, deleteRoomType, saveRoom, deleteRoom,
  adminBookings, bookingGuests, bookingNotifications, createAdminBooking, updateBooking, deleteBooking, housekeeping, saveHousekeeping,
  deleteHousekeeping, saveService, deleteService, createAdminServiceOrder, updatePayment,
  getSettings, saveSettings
} from '../controllers/adminController.js';

const router = express.Router();
router.use(protect);
router.get('/dashboard', authorizePermission('dashboard'), dashboard);
router.get('/reports', authorizePermission('reports'), reports);
router.get('/settings', authorizePermission('settings'), getSettings);
router.put('/settings', authorizePermission('settings'), saveSettings);
router.get('/room-types', authorizePermission('roomTypes'), getRoomTypes);
router.post('/room-types', authorizePermission('roomTypes'), saveRoomType);
router.put('/room-types/:id', authorizePermission('roomTypes'), saveRoomType);
router.delete('/room-types/:id', authorizePermission('roomTypes'), deleteRoomType);
router.post('/rooms', authorizePermission('rooms'), saveRoom);
router.put('/rooms/:id', authorizePermission('rooms'), saveRoom);
router.delete('/rooms/:id', authorizePermission('rooms'), deleteRoom);
router.get('/bookings', authorizePermission('bookings'), adminBookings);
router.get('/booking-guests', authorizePermission('bookings'), bookingGuests);
router.get('/notifications/bookings', authorizePermission('bookings'), bookingNotifications);
router.post('/bookings', authorizePermission('bookings'), createAdminBooking);
router.put('/bookings/:id', authorizePermission('bookings'), updateBooking);
router.delete('/bookings/:id', authorizePermission('bookings'), deleteBooking);
router.get('/housekeeping', authorizePermission('housekeeping'), housekeeping);
router.post('/housekeeping', authorizePermission('housekeeping'), saveHousekeeping);
router.put('/housekeeping/:id', authorizePermission('housekeeping'), saveHousekeeping);
router.delete('/housekeeping/:id', authorizePermission('housekeeping'), deleteHousekeeping);
router.post('/services', authorizePermission('services'), saveService);
router.put('/services/:id', authorizePermission('services'), saveService);
router.delete('/services/:id', authorizePermission('services'), deleteService);
router.post('/service-orders', authorizePermission('services'), createAdminServiceOrder);
router.put('/payments/:id', authorizeManager, updatePayment);
export default router;
