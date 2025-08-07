import { Request, Response } from 'express';
import ElasticsearchAdminService, {
  CreateIndexData,
  IndexDocumentData,
  UpdateDocumentData,
  SearchData,
} from '../services/ElasticsearchService.js';

class ElasticsearchController {
  /**
   * Get Elasticsearch health status
   */
  async getHealth(req: Request, res: Response) {
    try {
      const health = await ElasticsearchAdminService.getHealth();
      res.json(health);
    } catch (error) {
      console.error('❌ Error checking Elasticsearch health:', error);
      res.status(500).json({ error: 'Failed to check Elasticsearch health' });
    }
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(req: Request, res: Response) {
    try {
      const status = await ElasticsearchAdminService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      console.error('❌ Error checking Elasticsearch connection:', error);
      res
        .status(500)
        .json({ error: 'Failed to check Elasticsearch connection' });
    }
  }

  /**
   * Create an index
   */
  async createIndex(req: Request, res: Response) {
    try {
      const { indexName } = req.params;
      const data: CreateIndexData = req.body;

      if (!indexName) {
        return res.status(400).json({ error: 'Index name is required' });
      }

      const result = await ElasticsearchAdminService.createIndex(
        indexName,
        data
      );
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Error creating Elasticsearch index:', error);
      res.status(500).json({ error: 'Failed to create Elasticsearch index' });
    }
  }

  /**
   * Delete an index
   */
  async deleteIndex(req: Request, res: Response) {
    try {
      const { indexName } = req.params;

      if (!indexName) {
        return res.status(400).json({ error: 'Index name is required' });
      }

      const result = await ElasticsearchAdminService.deleteIndex(indexName);
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting Elasticsearch index:', error);
      res.status(500).json({ error: 'Failed to delete Elasticsearch index' });
    }
  }

  /**
   * Get all indices
   */
  async getIndices(req: Request, res: Response) {
    try {
      const result = await ElasticsearchAdminService.getIndices();
      res.json(result);
    } catch (error) {
      console.error('❌ Error fetching Elasticsearch indices:', error);
      res.status(500).json({ error: 'Failed to fetch Elasticsearch indices' });
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(req: Request, res: Response) {
    try {
      const { indexName } = req.params;

      if (!indexName) {
        return res.status(400).json({ error: 'Index name is required' });
      }

      const result = await ElasticsearchAdminService.getIndexStats(indexName);
      res.json(result);
    } catch (error) {
      console.error('❌ Error fetching Elasticsearch index stats:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch Elasticsearch index stats' });
    }
  }

  /**
   * Index a document
   */
  async indexDocument(req: Request, res: Response) {
    try {
      const { indexName } = req.params;
      const data: IndexDocumentData = req.body;

      if (!indexName) {
        return res.status(400).json({ error: 'Index name is required' });
      }

      if (!data.document) {
        return res.status(400).json({ error: 'Document data is required' });
      }

      const result = await ElasticsearchAdminService.indexDocument(
        indexName,
        data
      );
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Error indexing document:', error);
      res.status(500).json({ error: 'Failed to index document' });
    }
  }

  /**
   * Get a document by ID
   */
  async getDocument(req: Request, res: Response) {
    try {
      const { indexName, documentId } = req.params;

      if (!indexName) {
        return res.status(400).json({ error: 'Index name is required' });
      }

      if (!documentId) {
        return res.status(400).json({ error: 'Document ID is required' });
      }

      const result = await ElasticsearchAdminService.getDocument(
        indexName,
        documentId
      );
      res.json(result);
    } catch (error) {
      console.error('❌ Error fetching document:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to fetch document' });
    }
  }

  /**
   * Update a document
   */
  async updateDocument(req: Request, res: Response) {
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

      const result = await ElasticsearchAdminService.updateDocument(
        indexName,
        documentId,
        data
      );
      res.json(result);
    } catch (error) {
      console.error('❌ Error updating document:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(req: Request, res: Response) {
    try {
      const { indexName, documentId } = req.params;

      if (!indexName) {
        return res.status(400).json({ error: 'Index name is required' });
      }

      if (!documentId) {
        return res.status(400).json({ error: 'Document ID is required' });
      }

      const result = await ElasticsearchAdminService.deleteDocument(
        indexName,
        documentId
      );
      res.json(result);
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  }

  /**
   * Search documents
   */
  async searchDocuments(req: Request, res: Response) {
    try {
      const { indexName } = req.params;
      const data: SearchData = req.body;

      if (!indexName) {
        return res.status(400).json({ error: 'Index name is required' });
      }

      if (!data.query) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const result = await ElasticsearchAdminService.searchDocuments(
        indexName,
        data
      );
      res.json(result);
    } catch (error) {
      console.error('❌ Error searching documents:', error);
      res.status(500).json({ error: 'Failed to search documents' });
    }
  }

  /**
   * Bulk index documents
   */
  async bulkIndex(req: Request, res: Response) {
    try {
      const { indexName } = req.params;
      const { documents } = req.body;

      if (!indexName) {
        return res.status(400).json({ error: 'Index name is required' });
      }

      if (!documents || !Array.isArray(documents)) {
        return res.status(400).json({ error: 'Documents array is required' });
      }

      const result = await ElasticsearchAdminService.bulkIndex(
        indexName,
        documents
      );
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ Error bulk indexing documents:', error);
      res.status(500).json({ error: 'Failed to bulk index documents' });
    }
  }
}

export default new ElasticsearchController();
