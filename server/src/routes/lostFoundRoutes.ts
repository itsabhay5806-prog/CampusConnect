import { Router } from 'express';
import {
  getLostFoundListings,
  createLostFoundListing,
  updateListingStatus,
  contactListingOwner,
} from '../controllers/lostFoundController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { lostFoundSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', getLostFoundListings);
router.post('/', validateBody(lostFoundSchema), createLostFoundListing);
router.patch('/:id/status', updateListingStatus);
router.post('/:id/contact', contactListingOwner);

export default router;
