import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/:postId', authenticate, commentController.createComment);
router.get('/:postId', authenticate, commentController.getPostComments);
router.delete('/:commentId', authenticate, commentController.deleteComment);

export default router;
