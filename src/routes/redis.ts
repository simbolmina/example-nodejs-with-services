import express from 'express';
import RedisController from '../controllers/RedisController.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Health check (cached for 30 seconds)
router.get('/health', cacheMiddleware({ ttl: 30 }), RedisController.getHealth);

// Get connection status (cached for 30 seconds)
router.get('/status', cacheMiddleware({ ttl: 30 }), RedisController.getConnectionStatus);

// Set a key-value pair
router.post('/keys/:key', RedisController.setKey);

// Get a value by key
router.get('/keys/:key', RedisController.getKey);

// Delete a key
router.delete('/keys/:key', RedisController.deleteKey);

// Check if key exists
router.get('/keys/:key/exists', RedisController.keyExists);

// Get key TTL
router.get('/keys/:key/ttl', RedisController.getKeyTTL);

// Set key expiration
router.post('/keys/:key/expiry', RedisController.setKeyExpiry);

// Get all keys matching pattern
router.get('/keys', RedisController.getKeys);

// Get Redis info (cached for 1 minute)
router.get('/info', cacheMiddleware({ ttl: 60 }), RedisController.getInfo);

// Get memory usage (cached for 1 minute)
router.get('/memory', cacheMiddleware({ ttl: 60 }), RedisController.getMemoryUsage);

// Set hash field
router.post('/hash/:key/:field', RedisController.setHashField);

// Get hash field
router.get('/hash/:key/:field', RedisController.getHashField);

// Get all hash fields
router.get('/hash/:key', RedisController.getHashFields);

// Delete hash field
router.delete('/hash/:key/:field', RedisController.deleteHashField);

// Set multiple hash fields
router.post('/hash/:key', RedisController.setHashFields);

// Push to list
router.post('/list/:key', RedisController.pushToList);

// Pop from list
router.get('/list/:key/pop', RedisController.popFromList);

// Get list range
router.get('/list/:key/range', RedisController.getListRange);

// Get list length
router.get('/list/:key/length', RedisController.getListLength);

export default router;
