import { Router } from 'express';
import * as likeController from '../controllers/like.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/:postId', authenticate, likeController.likePost);
router.delete('/:postId', authenticate, likeController.unlikePost);
router.get('/:postId', authenticate, likeController.getPostLikes);

export default router;
