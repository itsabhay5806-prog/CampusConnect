import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export function initSocket(io: SocketIOServer) {
  // Authentication middleware for Socket.IO
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required for socket connection.'));
    }

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid socket authentication token.'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId;
    if (!userId) {
      socket.disconnect();
      return;
    }

    // Join personal room for notifications
    socket.join(`user_${userId}`);

    // Join conversation room with strict membership check
    socket.on('join_conversation', async (conversationId: string) => {
      try {
        const conv = await Conversation.findOne({
          _id: conversationId,
          participants: userId,
        });

        if (!conv) {
          socket.emit('error_message', 'You are not a participant in this conversation.');
          return;
        }

        socket.join(`conversation_${conversationId}`);
      } catch (err) {
        socket.emit('error_message', 'Failed to join conversation room.');
      }
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
    });

    socket.on('typing', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
      });
    });

    socket.on('stop_typing', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
        conversationId,
        userId,
      });
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
}
