import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import prisma from '../config/database.js';
import { ChatMessageType } from '@prisma/client';

export function setupChatSockets(io: Server) {
  // Socket Authentication Middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`Socket client connected: ${socket.id} (User: ${userId})`);

    // Join order-specific chat room
    socket.on('join:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`User ${userId} joined room order:${orderId}`);
    });

    // Leave order room
    socket.on('leave:order', (orderId: string) => {
      socket.leave(`order:${orderId}`);
    });

    // Send chat message
    socket.on('message:send', async (data: {
      orderId: string;
      type: ChatMessageType;
      body?: string;
      mediaUrl?: string;
      durationSec?: number;
    }) => {
      try {
        const message = await prisma.chatMessage.create({
          data: {
            orderId: data.orderId,
            senderId: userId,
            type: data.type || ChatMessageType.TEXT,
            body: data.body || null,
            mediaUrl: data.mediaUrl || null,
            durationSec: data.durationSec || null,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        });

        // Broadcast to order room
        io.to(`order:${data.orderId}`).emit('message:new', message);
      } catch (err) {
        console.error('Socket message:send error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });
}
