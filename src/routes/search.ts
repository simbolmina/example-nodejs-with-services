import express from 'express';
import ElasticsearchController from '../controllers/ElasticsearchController.js';

const router = express.Router();

// Health check
router.get('/health', ElasticsearchController.getHealth);

// Connection status
router.get('/status', ElasticsearchController.getConnectionStatus);

// Get all indices
router.get('/indices', ElasticsearchController.getIndices);

// Create index
router.post('/indices/:indexName', ElasticsearchController.createIndex);

// Delete index
router.delete('/indices/:indexName', ElasticsearchController.deleteIndex);

// Get index statistics
router.get('/indices/:indexName/stats', ElasticsearchController.getIndexStats);

// Index a document
router.post(
  '/indices/:indexName/documents',
  ElasticsearchController.indexDocument
);

// Get a document by ID
router.get(
  '/indices/:indexName/documents/:documentId',
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

// Search documents
router.post(
  '/indices/:indexName/search',
  ElasticsearchController.searchDocuments
);

// Bulk index documents
router.post('/indices/:indexName/bulk', ElasticsearchController.bulkIndex);

export default router;
