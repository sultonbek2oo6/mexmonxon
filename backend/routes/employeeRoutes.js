import express from 'express';
import { getEmployees, createEmployee, deleteEmployee, setEmployeeRooms } from '../controllers/employeeController.js';
import { protect, authorizePermission, authorizeManager } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.get('/', protect, authorizePermission('employees'), getEmployees);
router.get('/assignees', protect, authorizePermission('housekeeping'), getEmployees);
router.post('/', protect, authorizeManager, createEmployee);
router.put('/:id/rooms', protect, authorizeManager, setEmployeeRooms);
router.delete('/:id', protect, authorizeManager, deleteEmployee);

export default router;
