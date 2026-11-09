import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import routes from './routes.js';
import { generalLimiter } from './middlewares/rateLimit.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

export function createApp(): Application {
  const app = express();

  // Security & Utility Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: '*', // For development & mobile client connection
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (config.nodeEnv !== 'test') {
    app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
  }

  // Rate Limiting
  app.use(generalLimiter);

  // Mount API router
  app.use(config.apiPrefix, routes);

  // Fallback 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: 'অনুরোধকৃত এন্ডপয়েন্টটি খুঁজে পাওয়া যায়নি!',
        code: 'NOT_FOUND',
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp;
