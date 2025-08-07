import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { setupSwagger } from './config/swagger.js';
import appRouter from './routes/app.js';
import productRouter from './routes/products.js';
import categoryRouter from './routes/categories.js';
import elasticsearchAdminRouter from './routes/search.js';
import redisRouter from './routes/redis.js';
import kafkaRouter from './routes/kafka.js';
import kafkaService from './lib/kafka.js';
import redisService from './lib/redis.js';
import elasticsearchService from './lib/elasticsearch.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Routes
app.use('/', appRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/elasticsearch', elasticsearchAdminRouter);
app.use('/api/v1/redis', redisRouter);
app.use('/api/v1/kafka', kafkaRouter);

// Setup Swagger documentation
setupSwagger(app);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
);

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🔄 Shutting down gracefully...');

  try {
    await kafkaService.disconnect();
    console.log('✅ Kafka disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting Kafka:', error);
  }

  try {
    await redisService.disconnect();
    console.log('✅ Redis disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting Redis:', error);
  }

  try {
    await elasticsearchService.disconnect();
    console.log('✅ Elasticsearch disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting Elasticsearch:', error);
  }

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Connect to Kafka
    await kafkaService.connect();

    // Connect to Redis
    await redisService.connect();

    // Connect to Elasticsearch
    await elasticsearchService.connect();

    app.listen(PORT, () => {
      console.log(`🚀 API Gateway server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API status: http://localhost:${PORT}/status`);
      console.log('🔥 Hot reload is working!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
