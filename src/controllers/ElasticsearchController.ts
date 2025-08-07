import { Request, Response } from 'express';
import {
  getHealth as getHealthService,
  getConnectionStatus as getConnectionStatusService,
  createIndex as createIndexService,
  deleteIndex as deleteIndexService,
  getIndices as getIndicesService,
  getIndexStats as getIndexStatsService,
  indexDocument as indexDocumentService,
  getDocument as getDocumentService,
  updateDocument as updateDocumentService,
  deleteDocument as deleteDocumentService,
  searchDocuments as searchDocumentsService,
  bulkIndex as bulkIndexService,
  CreateIndexData,
  IndexDocumentData,
  UpdateDocumentData,
  SearchData,
} from '../services/ElasticsearchService.js';

/**
 * Get Elasticsearch health status
 */
export const getHealth = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const health = await getHealthService();
    return res.json(health);
  } catch (error) {
    console.error('❌ Error checking Elasticsearch health:', error);
    return res
      .status(500)
      .json({ error: 'Failed to check Elasticsearch health' });
  }
};

/**
 * Get connection status
 */
export const getConnectionStatus = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const status = await getConnectionStatusService();
    return res.json(status);
  } catch (error) {
    console.error('❌ Error checking Elasticsearch connection:', error);
    return res
      .status(500)
      .json({ error: 'Failed to check Elasticsearch connection' });
  }
};

/**
 * Create an index
 */
export const createIndex = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { indexName } = req.params;
    const data: CreateIndexData = req.body;

    if (!indexName) {
      return res.status(400).json({ error: 'Index name is required' });
    }

    const result = await createIndexService(indexName, data);
    return res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error creating Elasticsearch index:', error);
    return res
      .status(500)
      .json({ error: 'Failed to create Elasticsearch index' });
  }
};

/**
 * Delete an index
 */
export const deleteIndex = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { indexName } = req.params;

    if (!indexName) {
      return res.status(400).json({ error: 'Index name is required' });
    }

    const result = await deleteIndexService(indexName);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error deleting Elasticsearch index:', error);
    return res
      .status(500)
      .json({ error: 'Failed to delete Elasticsearch index' });
  }
};

/**
 * Get all indices
 */
export const getIndices = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await getIndicesService();
    return res.json(result);
  } catch (error) {
    console.error('❌ Error fetching Elasticsearch indices:', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch Elasticsearch indices' });
  }
};

/**
 * Get index statistics
 */
export const getIndexStats = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { indexName } = req.params;

    if (!indexName) {
      return res.status(400).json({ error: 'Index name is required' });
    }

    const result = await getIndexStatsService(indexName);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error fetching Elasticsearch index stats:', error);
    return res
      .status(500)
      .json({ error: 'Failed to fetch Elasticsearch index stats' });
  }
};

/**
 * Index a document
 */
export const indexDocument = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { indexName } = req.params;
    const data: IndexDocumentData = req.body;

    if (!indexName) {
      return res.status(400).json({ error: 'Index name is required' });
    }

    if (!data.document) {
      return res.status(400).json({ error: 'Document data is required' });
    }

    const result = await indexDocumentService(indexName, data);
    return res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error indexing Elasticsearch document:', error);
    return res
      .status(500)
      .json({ error: 'Failed to index Elasticsearch document' });
  }
};

/**
 * Get a document
 */
export const getDocument = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { indexName, documentId } = req.params;

    if (!indexName) {
      return res.status(400).json({ error: 'Index name is required' });
    }

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const result = await getDocumentService(indexName, documentId);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error fetching Elasticsearch document:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Document not found' });
    }
    return res
      .status(500)
      .json({ error: 'Failed to fetch Elasticsearch document' });
  }
};

/**
 * Update a document
 */
export const updateDocument = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { indexName, documentId } = req.params;
    const data: UpdateDocumentData = req.body;

    if (!indexName) {
      return res.status(400).json({ error: 'Index name is required' });
    }

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    if (!data.document) {
      return res.status(400).json({ error: 'Document data is required' });
    }

    const result = await updateDocumentService(indexName, documentId, data);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error updating Elasticsearch document:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Document not found' });
    }
    return res
      .status(500)
      .json({ error: 'Failed to update Elasticsearch document' });
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { indexName, documentId } = req.params;

    if (!indexName) {
      return res.status(400).json({ error: 'Index name is required' });
    }

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    const result = await deleteDocumentService(indexName, documentId);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error deleting Elasticsearch document:', error);
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({ error: 'Document not found' });
    }
    return res
      .status(500)
      .json({ error: 'Failed to delete Elasticsearch document' });
  }
};

/**
 * Search documents
 */
export const searchDocuments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { indexName } = req.params;
    const data: SearchData = req.body;

    if (!indexName) {
      return res.status(400).json({ error: 'Index name is required' });
    }

    if (!data.query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const result = await searchDocumentsService(indexName, data);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error searching Elasticsearch documents:', error);
    return res
      .status(500)
      .json({ error: 'Failed to search Elasticsearch documents' });
  }
};

/**
 * Bulk index documents
 */
export const bulkIndex = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { indexName } = req.params;
    const { documents } = req.body;

    if (!indexName) {
      return res.status(400).json({ error: 'Index name is required' });
    }

    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents array is required' });
    }

    const result = await bulkIndexService(indexName, documents);
    return res.status(201).json(result);
  } catch (error) {
    console.error('❌ Error bulk indexing Elasticsearch documents:', error);
    return res
      .status(500)
      .json({ error: 'Failed to bulk index Elasticsearch documents' });
  }
};
