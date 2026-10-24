import express from 'express';
import { getAllRooms, getRoomAvailability } from '../controllers/roomController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { saveRoom, deleteRoom } from '../controllers/adminController.js';

const router = express.Router();

router.get('/', getAllRooms);
router.get('/:id/availability', getRoomAvailability);
router.post('/', protect, authorize('admin'), saveRoom);
router.put('/:id', protect, authorize('admin'), saveRoom);
router.delete('/:id', protect, authorize('admin'), deleteRoom);

export default router;
