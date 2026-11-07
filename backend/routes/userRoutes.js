import express from 'express';
import { getUsers, createUser, updateUser, deleteUser, getUserPermissions, setUserPermissions } from '../controllers/userController.js';
import { hireUserAsEmployee } from '../controllers/employeeController.js';
import { protect, authorizePermission, authorizeManager } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/', authorizePermission('users'), getUsers);
router.post('/', authorizePermission('users'), createUser);
router.put('/:id', authorizePermission('users'), updateUser);
router.delete('/:id', authorizePermission('users'), deleteUser);
router.post('/:id/hire', authorizeManager, hireUserAsEmployee);
router.get('/:id/permissions', authorizeManager, getUserPermissions);
router.put('/:id/permissions', authorizeManager, setUserPermissions);

export default router;
