import express, { Request, Response } from 'express';
import redisService from '../lib/redis.js';
import elasticsearchService from '../lib/elasticsearch.js';
import kafkaService from '../lib/kafka.js';

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
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    message: 'API Gateway is running',
    services: {
      database: 'connected',
      redis: redisService.isRedisConnected() ? 'connected' : 'disconnected',
      elasticsearch: elasticsearchService.isConnected()
        ? 'connected'
        : 'disconnected',
      kafka: kafkaService.isConnected() ? 'connected' : 'disconnected',
    },
    database: {
      status: 'connected',
      type: 'PostgreSQL',
    },
    redis: {
      status: redisService.isRedisConnected() ? 'connected' : 'disconnected',
      type: 'Redis',
    },
    elasticsearch: {
      status: elasticsearchService.isConnected() ? 'connected' : 'disconnected',
      type: 'Elasticsearch',
      version: '9.1.0',
    },
    kafka: {
      status: kafkaService.isConnected() ? 'connected' : 'disconnected',
      type: 'Kafka',
      version: '3.6.0',
    },
  });
});

// 404 handler - commented out due to path-to-regexp conflicts
// router.use('*', (req: Request, res: Response) => {
//   res.status(404).json({
//     error: 'Route not found',
//     path: req.originalUrl,
//     method: req.method,
//     availableEndpoints: [
//       'GET /',
//       'GET /health',
//       'GET /status',
//       'GET /docs',
//       'GET /api/v1/products',
//       'GET /api/v1/products/search',
//       'GET /api/v1/categories',
//       'GET /api/v1/elasticsearch/health',
//       'GET /api/v1/redis/health',
//     ],
//   });
// });

export default router;
