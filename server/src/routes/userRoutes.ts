import { Router } from 'express';
import {
  getUserProfile,
  updateProfile,
  changePassword,
  toggleBlockUser,
  getBlockedUsers,
  getSavedItems,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/profile/:id', getUserProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/block/:id', toggleBlockUser);
router.get('/blocked-list', getBlockedUsers);
router.get('/saved', getSavedItems);

export default router;
