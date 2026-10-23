import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { initSocket } from './socket/socketHandler.js';
import { College } from './models/College.js';
import { User } from './models/User.js';
import { runSeed, seedInstitutions } from './seed.js';

export const server = http.createServer(app);

export const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

initSocket(io);

async function startServer() {
  try {
    await connectDB();

    // Ensure verified institutions list is populated / updated without dropping user data
    await seedInstitutions();

    // Auto-seed demo campus records if user base is empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 No student records found. Seeding initial demo campus accounts...');
      await runSeed();
    }

    server.listen(ENV.PORT, () => {
      console.log(`\n🚀 CampusConnect API Server listening on port ${ENV.PORT}`);
      console.log(`📡 Health Check: http://localhost:${ENV.PORT}/api/health`);
      console.log(`🎓 Client App URL: ${ENV.CLIENT_URL}`);
      console.log(`🛡️  Security & RBAC active.`);
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

// Only start when invoked directly (not during unit testing)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
