import express from 'express';
import { getEmployees, createEmployee, deleteEmployee } from '../controllers/employeeController.js';

const router = express.Router();
router.get('/', getEmployees);
router.post('/', createEmployee);
router.delete('/:id', deleteEmployee);

export default router;