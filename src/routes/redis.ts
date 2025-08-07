import express from 'express';
import {
  getHealth,
  getConnectionStatus,
  setKey,
  getKey,
  deleteKey,
  keyExists,
  getKeyTTL,
  setKeyExpiry,
  getKeys,
  getInfo,
  getMemoryUsage,
  setHashField,
  getHashField,
  getHashFields,
  deleteHashField,
  setHashFields,
  pushToList,
  popFromList,
  getListRange,
  getListLength,
} from '../controllers/RedisController.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Health check (cached for 30 seconds)
router.get('/health', cacheMiddleware({ ttl: 30 }), getHealth);

// Get connection status (cached for 30 seconds)
router.get('/status', cacheMiddleware({ ttl: 30 }), getConnectionStatus);

// Set a key-value pair
router.post('/keys/:key', setKey);

// Get a value by key
router.get('/keys/:key', getKey);

// Delete a key
router.delete('/keys/:key', deleteKey);

// Check if key exists
router.get('/keys/:key/exists', keyExists);

// Get key TTL
router.get('/keys/:key/ttl', getKeyTTL);

// Set key expiration
router.post('/keys/:key/expiry', setKeyExpiry);

// Get all keys matching pattern
router.get('/keys', getKeys);

// Get Redis info (cached for 1 minute)
router.get('/info', cacheMiddleware({ ttl: 60 }), getInfo);

// Get memory usage (cached for 1 minute)
router.get('/memory', cacheMiddleware({ ttl: 60 }), getMemoryUsage);

// Set hash field
router.post('/hash/:key/:field', setHashField);

// Get hash field
router.get('/hash/:key/:field', getHashField);

// Get all hash fields
router.get('/hash/:key', getHashFields);

// Delete hash field
router.delete('/hash/:key/:field', deleteHashField);

// Set multiple hash fields
router.post('/hash/:key', setHashFields);

// Push to list
router.post('/list/:key', pushToList);

// Pop from list
router.get('/list/:key/pop', popFromList);

// Get list range
router.get('/list/:key/range', getListRange);

// Get list length
router.get('/list/:key/length', getListLength);

export default router;
