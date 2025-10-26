import { Router } from 'express';
import * as savedController from '../controllers/saved.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/:postId', authenticate, savedController.savePost);
router.delete('/:postId', authenticate, savedController.unsavePost);
router.get('/', authenticate, savedController.getSavedPosts);

export default router;
