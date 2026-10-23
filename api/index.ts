import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../server/dist/app.js';
import { connectDB } from '../server/dist/config/db.js';
import { seedInstitutions } from '../server/dist/seed.js';

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
  } catch (err: any) {
    console.error('Vercel DB connection error:', err);
  }

  return app(req as any, res as any);
}
