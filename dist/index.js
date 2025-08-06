import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
// Import routes
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
// Basic routes
app.get('/', (_req, res) => {
    res.json({
        message: 'Welcome to E-commerce Analytics Hub API Gateway',
        version: '1.0.0',
        documentation: '/docs',
        health: '/health',
    });
});
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'API Gateway',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
    });
});
// API routes
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/redis', redisRouter);
// API status endpoint
app.get('/api/v1/status', (_req, res) => {
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
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
    });
});
// Error handler
app.use((err, _req, res, _next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development'
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
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map