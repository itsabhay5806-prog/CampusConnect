import { Router } from 'express';
import { uploadSingleFile } from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('file'), uploadSingleFile);

export default router;
