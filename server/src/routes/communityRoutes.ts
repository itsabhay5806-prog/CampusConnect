import { Router } from 'express';
import {
  getCommunities,
  getCommunityBySlug,
  createCommunity,
  toggleJoinCommunity,
} from '../controllers/communityController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { communitySchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', getCommunities);
router.post('/', validateBody(communitySchema), createCommunity);
router.get('/:slug', getCommunityBySlug);
router.post('/:id/join', toggleJoinCommunity);

export default router;
