export const elasticsearchPaths = {
  '/api/v1/elasticsearch/health': {
    get: {
      summary: 'Elasticsearch Health Check',
      description: 'Check Elasticsearch cluster health and connection status',
      tags: ['Elasticsearch'],
      responses: {
        '200': {
          description: 'Elasticsearch is healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'connected' },
                  cluster_name: { type: 'string', example: 'docker-cluster' },
                  version: { type: 'object' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '503': {
          description: 'Elasticsearch is not available',
        },
      },
    },
  },
  '/api/v1/elasticsearch/indices': {
    get: {
      summary: 'List Elasticsearch Indices',
      description: 'Get all Elasticsearch indices with their statistics',
      tags: ['Elasticsearch'],
      responses: {
        '200': {
          description: 'List of indices',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  indices: { type: 'object' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/elasticsearch/indices/{indexName}': {
    post: {
      summary: 'Create Elasticsearch Index',
      description: 'Create a new Elasticsearch index with mappings',
      tags: ['Elasticsearch'],
      parameters: [
        {
          name: 'indexName',
          in: 'path',
          required: true,
          description: 'Index name',
          schema: { type: 'string', example: 'products' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                mappings: {
                  type: 'object',
                  example: {
                    properties: {
                      name: { type: 'text' },
                      price: { type: 'float' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Index created successfully',
        },
        '400': {
          description: 'Invalid index configuration',
        },
        '409': {
          description: 'Index already exists',
        },
      },
    },
    delete: {
      summary: 'Delete Elasticsearch Index',
      description: 'Delete an Elasticsearch index',
      tags: ['Elasticsearch'],
      parameters: [
        {
          name: 'indexName',
          in: 'path',
          required: true,
          description: 'Index name',
          schema: { type: 'string', example: 'products' },
        },
      ],
      responses: {
        '200': {
          description: 'Index deleted successfully',
        },
        '404': {
          description: 'Index not found',
        },
      },
    },
  },
  '/api/v1/elasticsearch/indices/{indexName}/stats': {
    get: {
      summary: 'Get Index Statistics',
      description: 'Get detailed statistics for an Elasticsearch index',
      tags: ['Elasticsearch'],
      parameters: [
        {
          name: 'indexName',
          in: 'path',
          required: true,
          description: 'Index name',
          schema: { type: 'string', example: 'products' },
        },
      ],
      responses: {
        '200': {
          description: 'Index statistics',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  stats: { type: 'object' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '404': {
          description: 'Index not found',
        },
      },
    },
  },
  '/api/v1/elasticsearch/indices/{indexName}/documents': {
    post: {
      summary: 'Index Document',
      description: 'Index a document in Elasticsearch',
      tags: ['Elasticsearch'],
      parameters: [
        {
          name: 'indexName',
          in: 'path',
          required: true,
          description: 'Index name',
          schema: { type: 'string', example: 'products' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                document: {
                  type: 'object',
                  example: {
                    id: '123',
                    name: 'Test Product',
                    price: 99.99,
                  },
                },
                id: {
                  type: 'string',
                  description: 'Document ID (optional)',
                  example: 'doc-123',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Document indexed successfully',
        },
        '400': {
          description: 'Invalid document data',
        },
      },
    },
  },
  '/api/v1/elasticsearch/indices/{indexName}/documents/{id}': {
    get: {
      summary: 'Get Document',
      description: 'Get a document by ID from Elasticsearch',
      tags: ['Elasticsearch'],
      parameters: [
        {
          name: 'indexName',
          in: 'path',
          required: true,
          description: 'Index name',
          schema: { type: 'string', example: 'products' },
        },
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Document ID',
          schema: { type: 'string', example: 'doc-123' },
        },
      ],
      responses: {
        '200': {
          description: 'Document retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  document: { type: 'object' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '404': {
          description: 'Document not found',
        },
      },
    },
    put: {
      summary: 'Update Document',
      description: 'Update a document in Elasticsearch',
      tags: ['Elasticsearch'],
      parameters: [
        {
          name: 'indexName',
          in: 'path',
          required: true,
          description: 'Index name',
          schema: { type: 'string', example: 'products' },
        },
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Document ID',
          schema: { type: 'string', example: 'doc-123' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                document: {
                  type: 'object',
                  example: {
                    name: 'Updated Product',
                    price: 149.99,
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Document updated successfully',
        },
        '400': {
          description: 'Invalid document data',
        },
        '404': {
          description: 'Document not found',
        },
      },
    },
    delete: {
      summary: 'Delete Document',
      description: 'Delete a document from Elasticsearch',
      tags: ['Elasticsearch'],
      parameters: [
        {
          name: 'indexName',
          in: 'path',
          required: true,
          description: 'Index name',
          schema: { type: 'string', example: 'products' },
        },
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Document ID',
          schema: { type: 'string', example: 'doc-123' },
        },
      ],
      responses: {
        '200': {
          description: 'Document deleted successfully',
        },
        '404': {
          description: 'Document not found',
        },
      },
    },
  },
  '/api/v1/elasticsearch/indices/{indexName}/search': {
    post: {
      summary: 'Search Documents',
      description: 'Search documents in Elasticsearch index',
      tags: ['Elasticsearch'],
      parameters: [
        {
          name: 'indexName',
          in: 'path',
          required: true,
          description: 'Index name',
          schema: { type: 'string', example: 'products' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                query: {
                  type: 'object',
                  example: {
                    match: { name: 'test' },
                  },
                },
                size: {
                  type: 'integer',
                  description: 'Number of results to return',
                  example: 10,
                },
                from: {
                  type: 'integer',
                  description: 'Starting offset',
                  example: 0,
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Search results',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  hits: {
                    type: 'object',
                    properties: {
                      total: { type: 'object' },
                      hits: { type: 'array' },
                    },
                  },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid search query',
        },
      },
    },
  },
};
