import express, { Request, Response } from 'express';
import redisService from '../lib/redis.js';

const router = express.Router();

// Root endpoint
router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to E-commerce Analytics Hub API Gateway',
    version: '1.0.0',
    documentation: '/docs',
    health: '/health',
  });
});

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'API Gateway',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API status endpoint
router.get('/api/v1/status', (_req: Request, res: Response) => {
  res.json({
    message: 'API Gateway is running',
    services: {
      database: 'connected',
      redis: redisService.isRedisConnected() ? 'connected' : 'disconnected',
      'product-service': 'active',
      'search-service': 'pending',
      'event-processor': 'pending',
      'notification-service': 'pending',
    },
    database: {
      status: 'connected',
      type: 'PostgreSQL',
    },
    redis: {
      status: redisService.isRedisConnected() ? 'connected' : 'disconnected',
      type: 'Redis',
    },
  });
});

// 404 handler
// router.use('*', (req: Request, res: Response) => {
//   res.status(404).json({
//     error: 'Route not found',
//     path: req.originalUrl,
//     method: req.method,
//   });
// });

export default router;
