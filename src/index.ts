import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import appRouter from './routes/app.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import redisRouter from './routes/redis.js';
import { setupSwagger } from './config/swagger.js';
import redisService from './lib/redis.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Setup Swagger documentation
setupSwagger(app);

// App routes (root, health, status, 404)
app.use('/', appRouter);

// API routes
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/redis', redisRouter);

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  res.status(500).json({
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong',
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 API Gateway server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API status: http://localhost:${PORT}/status`);
  console.log(`🔥 Hot reload is working!`);

  // Initialize Redis connection
  try {
    await redisService.connect();
    console.log(`🔴 Redis connection established`);
  } catch (error) {
    console.error(`❌ Failed to connect to Redis:`, error);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await redisService.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await redisService.disconnect();
  process.exit(0);
});
