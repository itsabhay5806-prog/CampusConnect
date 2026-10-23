import { Router } from 'express';
import {
  getResources,
  uploadResource,
  incrementDownload,
  toggleSaveResource,
  deleteResource,
} from '../controllers/resourceController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { resourceSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', getResources);
router.post('/', validateBody(resourceSchema), uploadResource);
router.post('/:id/download', incrementDownload);
router.post('/:id/save', toggleSaveResource);
router.delete('/:id', deleteResource);

export default router;
