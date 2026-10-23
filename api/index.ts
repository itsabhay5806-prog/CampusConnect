import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';
import { seedInstitutions } from '../server/src/seed.js';

let isConnected = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!isConnected) {
      await connectDB();
      seedInstitutions().catch((err) => {
        console.error('Institution seeding error:', err);
      });
      isConnected = true;
    }

    return app(req as any, res as any);
  } catch (err: any) {
    console.error('Vercel API handler error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'production' ? undefined : err?.message,
    });
  }
}
