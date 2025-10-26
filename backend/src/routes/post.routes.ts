import { Router } from 'express';
import * as postController from '../controllers/post.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/', authenticate, upload.single('image'), postController.createPost);
router.get('/feed', authenticate, postController.getFeed);
router.get('/:postId', authenticate, postController.getPost);
router.get('/user/:username', authenticate, postController.getUserPosts);
router.delete('/:postId', authenticate, postController.deletePost);

export default router;
