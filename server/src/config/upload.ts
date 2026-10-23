import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { Request } from 'express';
import { ENV } from './env.js';

// Setup Cloudinary if credentials provided
const isCloudinaryConfigured = Boolean(
  ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_API_KEY && ENV.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('✅ Cloudinary file storage integration active.');
} else {
  console.log('ℹ️  Cloudinary credentials not detected. Falling back to local disk storage (/uploads).');
}

// Ensure local uploads directory exists (use /tmp on Vercel serverless)
const uploadsDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.resolve(process.cwd(), 'uploads');

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch {
  // Graceful fallback if read-only
}

// Multer disk storage for receiving incoming files
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const allowedMimeTypes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'text/plain',
];

export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

export interface UploadResult {
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  publicId?: string;
  storageType: 'cloudinary' | 'local';
}

export async function processUploadedFile(file: Express.Multer.File, folder = 'campusconnect'): Promise<UploadResult> {
  if (isCloudinaryConfigured) {
    try {
      const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'raw';
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `campusconnect/${folder}`,
        resource_type: resourceType,
      });

      // Remove local temp file after successful cloud upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: result.secure_url,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        publicId: result.public_id,
        storageType: 'cloudinary',
      };
    } catch (err) {
      console.error('Cloudinary upload error, keeping local file fallback:', err);
    }
  }

  // Local URL fallback
  const localUrl = `/uploads/${file.filename}`;
  return {
    url: localUrl,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    storageType: 'local',
  };
}
