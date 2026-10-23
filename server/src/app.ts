import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import mongoose from 'mongoose';
import { ENV } from './config/env.js';
import { generalApiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import lostFoundRoutes from './routes/lostFoundRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import discoverRoutes from './routes/discoverRoutes.js';

export const app = express();

// Security & Parsing Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (
        !origin ||
        origin === ENV.CLIENT_URL ||
        origin.toLowerCase() === ENV.CLIENT_URL.toLowerCase() ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/testing
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve local uploads statically
const uploadsDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint (Section 19: does not leak secrets)
app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CampusConnect API',
    version: '1.0.0',
    database: dbStatusMap[dbState] || 'unknown',
    uptimeSeconds: Math.floor(process.uptime()),
    environment: ENV.NODE_ENV,
  });
});

// Apply rate limiting to all /api/v1 routes
app.use('/api/v1', generalApiLimiter);

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/lost-found', lostFoundRoutes);
app.use('/api/v1/communities', communityRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/discover', discoverRoutes);

// Centralized error handler
app.use(errorHandler);
