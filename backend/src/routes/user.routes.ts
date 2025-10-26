import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/search', authenticate, userController.searchUsers);
router.get('/:username', authenticate, userController.getUserProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/password', authenticate, userController.changePassword);

export default router;
