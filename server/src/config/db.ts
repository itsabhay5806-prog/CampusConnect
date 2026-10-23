import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongodInstance: any = null;

export async function connectDB(): Promise<string> {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection.host || 'connected';
  }

  let uri = ENV.MONGODB_URI;

  if (!uri) {
    if (mongodInstance) {
      uri = mongodInstance.getUri();
    } else {
      console.log('ℹ️  MONGODB_URI not provided. Initializing in-memory MongoDB engine for zero-config development...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbName: 'campusconnect_dev',
          },
        });
        uri = mongodInstance.getUri();
        console.log(`✅ In-memory MongoDB running at: ${uri}`);
      } catch (err) {
        console.error('❌ Failed to launch MongoMemoryServer:', err);
        throw err;
      }
    }
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB successfully.');
    return uri;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (error) {
    console.error('Error during DB disconnect:', error);
  }
}
