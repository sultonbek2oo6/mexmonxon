import express from 'express';
import { getEmployees, createEmployee, deleteEmployee } from '../controllers/employeeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/', getEmployees);
router.post('/', createEmployee);
router.delete('/:id', deleteEmployee);

export default router;
