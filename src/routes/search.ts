import express from 'express';
import ElasticsearchController from '../controllers/ElasticsearchController.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Health check (cached for 30 seconds)
router.get(
  '/health',
  cacheMiddleware({ ttl: 30 }),
  ElasticsearchController.getHealth
);

// Get connection status (cached for 30 seconds)
router.get(
  '/status',
  cacheMiddleware({ ttl: 30 }),
  ElasticsearchController.getConnectionStatus
);

// Get all indices (cached for 1 minute)
router.get(
  '/indices',
  cacheMiddleware({ ttl: 60 }),
  ElasticsearchController.getIndices
);

// Create an index
router.post('/indices/:indexName', ElasticsearchController.createIndex);

// Delete an index
router.delete('/indices/:indexName', ElasticsearchController.deleteIndex);

// Get index statistics (cached for 2 minutes)
router.get(
  '/indices/:indexName/stats',
  cacheMiddleware({ ttl: 120 }),
  ElasticsearchController.getIndexStats
);

// Index a document
router.post(
  '/indices/:indexName/documents',
  ElasticsearchController.indexDocument
);

// Get a document by ID (cached for 2 minutes)
router.get(
  '/indices/:indexName/documents/:documentId',
  cacheMiddleware({ ttl: 120 }),
  ElasticsearchController.getDocument
);

// Update a document
router.put(
  '/indices/:indexName/documents/:documentId',
  ElasticsearchController.updateDocument
);

// Delete a document
router.delete(
  '/indices/:indexName/documents/:documentId',
  ElasticsearchController.deleteDocument
);

// Search documents (cached for 1 minute)
router.post(
  '/indices/:indexName/search',
  cacheMiddleware({ ttl: 60 }),
  ElasticsearchController.searchDocuments
);

// Bulk index documents
router.post('/indices/:indexName/bulk', ElasticsearchController.bulkIndex);

export default router;
