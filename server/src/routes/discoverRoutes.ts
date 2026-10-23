import { Router } from 'express';
import { getDiscoverOverview } from '../controllers/discoverController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getDiscoverOverview);

export default router;
