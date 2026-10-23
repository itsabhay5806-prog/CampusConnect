import { Router } from 'express';
import {
  submitReport,
  getModerationQueue,
  takeModerationAction,
  getModerationAuditLogs,
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';
import { reportSchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

// Ordinary students can submit reports
router.post('/', validateBody(reportSchema), submitReport);

// Only moderators and admins can access review queue & take moderation actions
router.get('/queue', requireRole(['moderator', 'admin']), getModerationQueue);
router.post('/:id/action', requireRole(['moderator', 'admin']), takeModerationAction);
router.get('/audit-logs', requireRole(['moderator', 'admin']), getModerationAuditLogs);

export default router;
