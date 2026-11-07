import express from 'express';
import { getAllRooms, getRoomAvailability } from '../controllers/roomController.js';
import { protect, authorizePermission } from '../middlewares/authMiddleware.js';
import { saveRoom, deleteRoom } from '../controllers/adminController.js';

const router = express.Router();

router.get('/', getAllRooms);
router.get('/:id/availability', getRoomAvailability);
router.post('/', protect, authorizePermission('rooms'), saveRoom);
router.put('/:id', protect, authorizePermission('rooms'), saveRoom);
router.delete('/:id', protect, authorizePermission('rooms'), deleteRoom);

export default router;
