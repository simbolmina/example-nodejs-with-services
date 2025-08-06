import { Request, Response, NextFunction } from 'express';
import redisService from '../lib/redis.js';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string; // Custom cache key
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 300, key } = options; // Default 5 minutes TTL

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if Redis is not connected
    if (!redisService.isRedisConnected()) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = key || `cache:${req.originalUrl}`;

      // Try to get cached response
      const cachedResponse = await redisService.get(cacheKey);
      
      if (cachedResponse) {
        console.log(`📦 Cache hit for: ${cacheKey}`);
        const parsed = JSON.parse(cachedResponse);
        return res.status(parsed.status).json(parsed.data);
      }

      // Store original send method
      const originalSend = res.json;

      // Override res.json to cache the response
      res.json = function(data: any) {
        const responseData = {
          status: res.statusCode,
          data: data,
          timestamp: new Date().toISOString()
        };

        // Cache the response
        redisService.set(cacheKey, JSON.stringify(responseData), ttl)
          .then(() => {
            console.log(`💾 Cached response for: ${cacheKey} (TTL: ${ttl}s)`);
          })
          .catch((error) => {
            console.error('Failed to cache response:', error);
          });

        // Call original send method
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
export const invalidateCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (redisService.isRedisConnected()) {
        // This is a simplified version - in production you'd want to use SCAN
        // to find and delete keys matching the pattern
        console.log(`🗑️ Cache invalidation requested for pattern: ${pattern}`);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
    
    next();
  };
};

// Rate limiting using Redis
export const rateLimitRedis = (options: {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
}) => {
  const { windowMs, max, keyGenerator } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redisService.isRedisConnected()) {
      return next();
    }

    try {
      const key = keyGenerator ? keyGenerator(req) : `ratelimit:${req.ip}`;
      const current = await redisService.get(key);
      
      if (current) {
        const requests = parseInt(current);
        
        if (requests >= max) {
          return res.status(429).json({
            error: 'Too many requests',
            retryAfter: Math.ceil(windowMs / 1000)
          });
        }
        
        await redisService.set(key, (requests + 1).toString(), Math.ceil(windowMs / 1000));
      } else {
        await redisService.set(key, '1', Math.ceil(windowMs / 1000));
      }
      
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next();
    }
  };
}; 