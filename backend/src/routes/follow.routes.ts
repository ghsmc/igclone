import { Router } from 'express';
import * as followController from '../controllers/follow.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/:userId', authenticate, followController.followUser);
router.delete('/:userId', authenticate, followController.unfollowUser);
router.get('/followers/:username', authenticate, followController.getFollowers);
router.get('/following/:username', authenticate, followController.getFollowing);

export default router;
