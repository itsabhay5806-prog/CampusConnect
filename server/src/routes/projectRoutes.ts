import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  applyToProject,
  withdrawApplication,
  manageApplication,
  toggleSaveProject,
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { projectSchema, projectApplicationSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', validateBody(projectSchema), createProject);
router.get('/:id', getProjectById);
router.post('/:id/apply', validateBody(projectApplicationSchema), applyToProject);
router.post('/:id/save', toggleSaveProject);
router.delete('/applications/:id', withdrawApplication);
router.patch('/applications/:id', manageApplication);

export default router;
