import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { setupChatSockets } from './sockets/chat.socket.js';
import prisma from './config/database.js';

async function bootstrap() {
  const app = createApp();
  const server = http.createServer(app);

  // Initialize Socket.io
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Attach Chat & Live Sockets
  setupChatSockets(io);

  // Start HTTP & WebSocket Server
  server.listen(config.port, () => {
    console.log(`\n======================================================`);
    console.log(`🧵 SelaiSathi (সেলাই সাথী) Backend Server Started!`);
    console.log(`📡 URL:       http://localhost:${config.port}${config.apiPrefix}`);
    console.log(`🩺 Health:    http://localhost:${config.port}${config.apiPrefix}/health`);
    console.log(`🌍 Env:       ${config.nodeEnv}`);
    console.log(`📱 SMS Mode:  ${config.sms.provider}`);
    console.log(`======================================================\n`);
  });

  // Graceful Shutdown
  const shutdown = async () => {
    console.log('\nShutting down gracefully...');
    server.close(async () => {
      await prisma.$disconnect();
      console.log('Database disconnected. Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  console.error('Failed to start SelaiSathi server:', err);
  process.exit(1);
});
