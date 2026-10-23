import { Router } from 'express';
import {
  getPosts,
  createPost,
  toggleLikePost,
  getComments,
  addComment,
  deletePost,
  toggleSavePost,
} from '../controllers/postController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { postSchema, commentSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', getPosts);
router.post('/', validateBody(postSchema), createPost);
router.post('/:id/like', toggleLikePost);
router.get('/:id/comments', getComments);
router.post('/:id/comments', validateBody(commentSchema), addComment);
router.post('/:id/save', toggleSavePost);
router.delete('/:id', deletePost);

export default router;
