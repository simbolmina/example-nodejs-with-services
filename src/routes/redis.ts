import express from 'express';
import RedisController from '../controllers/RedisController.js';

const router = express.Router();

// Health check
router.get('/health', RedisController.getHealth);

// Connection status
router.get('/status', RedisController.getConnectionStatus);

// Get Redis info
router.get('/info', RedisController.getInfo);

// Get memory usage
router.get('/memory', RedisController.getMemoryUsage);

// Get all keys
router.get('/keys', RedisController.getKeys);

// Set a key
router.post('/keys/:key', RedisController.setKey);

// Get a key
router.get('/keys/:key', RedisController.getKey);

// Delete a key
router.delete('/keys/:key', RedisController.deleteKey);

// Check if key exists
router.get('/keys/:key/exists', RedisController.keyExists);

// Get key TTL
router.get('/keys/:key/ttl', RedisController.getKeyTTL);

// Set key expiry
router.post('/keys/:key/expiry', RedisController.setKeyExpiry);

// Hash operations
router.post('/keys/:key/hash/:field', RedisController.setHashField);
router.get('/keys/:key/hash/:field', RedisController.getHashField);
router.delete('/keys/:key/hash/:field', RedisController.deleteHashField);
router.get('/keys/:key/hash', RedisController.getHashFields);
router.post('/keys/:key/hash', RedisController.setHashFields);

// List operations
router.post('/keys/:key/list', RedisController.pushToList);
router.get('/keys/:key/list/pop', RedisController.popFromList);
router.get('/keys/:key/list/range', RedisController.getListRange);
router.get('/keys/:key/list/length', RedisController.getListLength);

export default router;
