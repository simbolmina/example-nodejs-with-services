import express from 'express';
import {
  getHealth,
  getConnectionStatus,
  getIndices,
  createIndex,
  deleteIndex,
  getIndexStats,
  indexDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  searchDocuments,
  bulkIndex,
} from '../controllers/ElasticsearchController.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Health check (cached for 30 seconds)
router.get('/health', cacheMiddleware({ ttl: 30 }), getHealth);

// Get connection status (cached for 30 seconds)
router.get('/status', cacheMiddleware({ ttl: 30 }), getConnectionStatus);

// Get all indices (cached for 1 minute)
router.get('/indices', cacheMiddleware({ ttl: 60 }), getIndices);

// Create an index
router.post('/indices/:indexName', createIndex);

// Delete an index
router.delete('/indices/:indexName', deleteIndex);

// Get index statistics (cached for 2 minutes)
router.get(
  '/indices/:indexName/stats',
  cacheMiddleware({ ttl: 120 }),
  getIndexStats
);

// Index a document
router.post('/indices/:indexName/documents', indexDocument);

// Get a document by ID (cached for 2 minutes)
router.get(
  '/indices/:indexName/documents/:documentId',
  cacheMiddleware({ ttl: 120 }),
  getDocument
);

// Update a document
router.put('/indices/:indexName/documents/:documentId', updateDocument);

// Delete a document
router.delete('/indices/:indexName/documents/:documentId', deleteDocument);

// Search documents (cached for 1 minute)
router.post(
  '/indices/:indexName/search',
  cacheMiddleware({ ttl: 60 }),
  searchDocuments
);

// Bulk index documents
router.post('/indices/:indexName/bulk', bulkIndex);

export default router;
