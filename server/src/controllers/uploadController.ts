import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { processUploadedFile } from '../config/upload.js';

export async function uploadSingleFile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided in upload request.' });
    }

    const folder = (req.query.folder as string) || 'general';
    const result = await processUploadedFile(req.file, folder);

    return res.status(201).json({
      success: true,
      file: result,
      message: 'File uploaded successfully!',
    });
  } catch (err) {
    next(err);
  }
}
