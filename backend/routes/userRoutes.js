import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser); // Foydalanuvchini tahrirlash uchun yangi qo'shilgan qator
router.delete('/:id', deleteUser);

export default router;
