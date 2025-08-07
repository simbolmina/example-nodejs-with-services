import express, { Request, Response } from 'express';
import elasticsearchService from '../lib/elasticsearch.js';

const router = express.Router();

// Health check for Elasticsearch
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const health = await elasticsearchService.healthCheck();
    return res.json({
      success: true,
      message: 'Elasticsearch is healthy',
      data: health,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Elasticsearch health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all indices
router.get('/indices', async (_req: Request, res: Response) => {
  try {
    const indices = await elasticsearchService.getIndices();
    return res.json({
      success: true,
      message: 'Indices retrieved successfully',
      data: indices,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get indices',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get index stats
router.get('/indices/:indexName/stats', async (req: Request, res: Response) => {
  try {
    const { indexName } = req.params;

    if (!indexName) {
      return res.status(400).json({
        success: false,
        message: 'Index name is required',
      });
    }

    const stats = await elasticsearchService.getIndexStats(indexName);
    return res.json({
      success: true,
      message: `Stats for index ${indexName} retrieved successfully`,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get index stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create index
router.post('/indices/:indexName', async (req: Request, res: Response) => {
  try {
    const { indexName } = req.params;
    const { mappings } = req.body;

    if (!indexName) {
      return res.status(400).json({
        success: false,
        message: 'Index name is required',
      });
    }

    await elasticsearchService.createIndex(indexName, mappings);
    return res.json({
      success: true,
      message: `Index ${indexName} created successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create index',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete index
router.delete('/indices/:indexName', async (req: Request, res: Response) => {
  try {
    const { indexName } = req.params;

    if (!indexName) {
      return res.status(400).json({
        success: false,
        message: 'Index name is required',
      });
    }

    await elasticsearchService.deleteIndex(indexName);
    return res.json({
      success: true,
      message: `Index ${indexName} deleted successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete index',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Index a document
router.post(
  '/indices/:indexName/documents',
  async (req: Request, res: Response) => {
    try {
      const { indexName } = req.params;
      const { document, id } = req.body;

      if (!indexName) {
        return res.status(400).json({
          success: false,
          message: 'Index name is required',
        });
      }

      const result = await elasticsearchService.indexDocument(
        indexName,
        document,
        id
      );
      return res.json({
        success: true,
        message: 'Document indexed successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to index document',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Update a document
router.put(
  '/indices/:indexName/documents/:id',
  async (req: Request, res: Response) => {
    try {
      const { indexName, id } = req.params;
      const { document } = req.body;

      if (!indexName || !id) {
        return res.status(400).json({
          success: false,
          message: 'Index name and document ID are required',
        });
      }

      const result = await elasticsearchService.updateDocument(
        indexName,
        id,
        document
      );
      return res.json({
        success: true,
        message: 'Document updated successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update document',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Delete a document
router.delete(
  '/indices/:indexName/documents/:id',
  async (req: Request, res: Response) => {
    try {
      const { indexName, id } = req.params;

      if (!indexName || !id) {
        return res.status(400).json({
          success: false,
          message: 'Index name and document ID are required',
        });
      }

      const result = await elasticsearchService.deleteDocument(indexName, id);
      return res.json({
        success: true,
        message: 'Document deleted successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete document',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Get a document
router.get(
  '/indices/:indexName/documents/:id',
  async (req: Request, res: Response) => {
    try {
      const { indexName, id } = req.params;

      if (!indexName || !id) {
        return res.status(400).json({
          success: false,
          message: 'Index name and document ID are required',
        });
      }

      const document = await elasticsearchService.getDocument(indexName, id);
      return res.json({
        success: true,
        message: 'Document retrieved successfully',
        data: document,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get document',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Bulk index documents
router.post('/indices/:indexName/bulk', async (req: Request, res: Response) => {
  try {
    const { indexName } = req.params;
    const { documents } = req.body;

    if (!indexName) {
      return res.status(400).json({
        success: false,
        message: 'Index name is required',
      });
    }

    const result = await elasticsearchService.bulkIndex(indexName, documents);
    return res.json({
      success: true,
      message: 'Documents bulk indexed successfully',
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to bulk index documents',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Search documents
router.post(
  '/indices/:indexName/search',
  async (req: Request, res: Response) => {
    try {
      const { indexName } = req.params;
      const { query, options } = req.body;

      if (!indexName) {
        return res.status(400).json({
          success: false,
          message: 'Index name is required',
        });
      }

      const result = await elasticsearchService.search(
        indexName,
        query,
        options
      );
      return res.json({
        success: true,
        message: 'Search completed successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Search failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Simple text search
router.get(
  '/indices/:indexName/search',
  async (req: Request, res: Response) => {
    try {
      const { indexName } = req.params;
      const { q, field, size = 10, from = 0 } = req.query;

      if (!indexName) {
        return res.status(400).json({
          success: false,
          message: 'Index name is required',
        });
      }

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter "q" is required',
        });
      }

      const query = {
        match: {
          [(field as string) || '_all']: q,
        },
      };

      const options = {
        size: parseInt(size as string),
        from: parseInt(from as string),
      };

      const result = await elasticsearchService.search(
        indexName,
        query,
        options
      );
      return res.json({
        success: true,
        message: 'Search completed successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Search failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Advanced search with filters
router.post(
  '/indices/:indexName/advanced-search',
  async (req: Request, res: Response) => {
    try {
      const { indexName } = req.params;

      if (!indexName) {
        return res.status(400).json({
          success: false,
          message: 'Index name is required',
        });
      }
      const {
        query,
        filters,
        sort,
        size = 10,
        from = 0,
        aggregations,
      } = req.body;

      const searchBody: any = {
        query: query || { match_all: {} },
        size: parseInt(size),
        from: parseInt(from),
      };

      // Add filters if provided
      if (filters && filters.length > 0) {
        searchBody.query = {
          bool: {
            must: searchBody.query,
            filter: filters,
          },
        };
      }

      // Add sorting if provided
      if (sort) {
        searchBody.sort = sort;
      }

      // Add aggregations if provided
      if (aggregations) {
        searchBody.aggs = aggregations;
      }

      const result = await elasticsearchService.search(
        indexName,
        searchBody.query,
        searchBody
      );
      return res.json({
        success: true,
        message: 'Advanced search completed successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Advanced search failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Auto-complete suggestions
router.get(
  '/indices/:indexName/suggest',
  async (req: Request, res: Response) => {
    try {
      const { indexName } = req.params;
      const { q, field = 'name', size = 5 } = req.query;

      if (!indexName) {
        return res.status(400).json({
          success: false,
          message: 'Index name is required',
        });
      }

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter "q" is required',
        });
      }

      const query = {
        suggest: {
          suggestions: {
            prefix: q,
            completion: {
              field: field as string,
              size: parseInt(size as string),
              skip_duplicates: true,
            },
          },
        },
      };

      const result = await elasticsearchService.search(indexName, query);
      return res.json({
        success: true,
        message: 'Suggestions retrieved successfully',
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get suggestions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
