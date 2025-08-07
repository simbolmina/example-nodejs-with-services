export const productPaths = {
  '/api/v1/products': {
    get: {
      summary: 'List Products',
      description: 'Get all products with pagination',
      tags: ['Products'],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: { type: 'integer', default: 1 },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Items per page',
          schema: { type: 'integer', default: 10 },
        },
        {
          name: 'categoryId',
          in: 'query',
          description: 'Filter by category ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'List of products',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  products: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Product',
                    },
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      page: { type: 'integer' },
                      limit: { type: 'integer' },
                      total: { type: 'integer' },
                      pages: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    post: {
      summary: 'Create Product',
      description:
        'Create a new product (automatically indexed in Elasticsearch)',
      tags: ['Products'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'price', 'categoryId'],
              properties: {
                name: { type: 'string', example: 'iPhone 15 Pro' },
                description: {
                  type: 'string',
                  example: 'Latest iPhone model',
                },
                price: { type: 'number', example: 999.99 },
                weight: { type: 'number', example: 0.187 },
                categoryId: { type: 'string', example: 'cat-123' },
                inventoryCount: { type: 'integer', example: 50 },
                sku: { type: 'string', example: 'IPHONE15PRO' },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['smartphone', 'apple', '5g'],
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Product created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Product',
              },
            },
          },
        },
        '400': {
          description: 'Invalid input data',
        },
      },
    },
  },
  '/api/v1/products/search': {
    get: {
      summary: 'Search Products',
      description:
        'Search products using Elasticsearch with fuzzy matching and aggregations',
      tags: ['Products'],
      parameters: [
        {
          name: 'q',
          in: 'query',
          required: true,
          description: 'Search query',
          schema: { type: 'string', example: 'javascript' },
        },
        {
          name: 'category',
          in: 'query',
          description: 'Filter by category name',
          schema: { type: 'string', example: 'Electronics' },
        },
        {
          name: 'minPrice',
          in: 'query',
          description: 'Minimum price filter',
          schema: { type: 'number', example: 10.0 },
        },
        {
          name: 'maxPrice',
          in: 'query',
          description: 'Maximum price filter',
          schema: { type: 'number', example: 1000.0 },
        },
        {
          name: 'inStock',
          in: 'query',
          description: 'Filter by stock availability',
          schema: { type: 'boolean', example: true },
        },
        {
          name: 'sortBy',
          in: 'query',
          description: 'Sort field (name, price, createdAt)',
          schema: { type: 'string', example: 'price' },
        },
        {
          name: 'sortOrder',
          in: 'query',
          description: 'Sort order (asc, desc)',
          schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
        },
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: { type: 'integer', default: 1 },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Items per page',
          schema: { type: 'integer', default: 10 },
        },
      ],
      responses: {
        '200': {
          description: 'Search results with aggregations',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  products: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        price: { type: 'number' },
                        categoryName: { type: 'string' },
                        inventoryCount: { type: 'integer' },
                        sku: { type: 'string' },
                        tags: { type: 'array', items: { type: 'string' } },
                        isActive: { type: 'boolean' },
                        score: { type: 'number' },
                      },
                    },
                  },
                  total: { type: 'integer' },
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  aggregations: {
                    type: 'object',
                    properties: {
                      categories: {
                        type: 'object',
                        properties: {
                          buckets: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                key: { type: 'string' },
                                doc_count: { type: 'integer' },
                              },
                            },
                          },
                        },
                      },
                      inventory_status: {
                        type: 'object',
                        properties: {
                          buckets: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                key: { type: 'integer' },
                                doc_count: { type: 'integer' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid search parameters',
        },
      },
    },
  },
  '/api/v1/products/{id}': {
    get: {
      summary: 'Get Product by ID',
      description: 'Get a specific product by its ID from PostgreSQL',
      tags: ['Products'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Product ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Product details',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Product',
              },
            },
          },
        },
        '404': {
          description: 'Product not found',
        },
      },
    },
    put: {
      summary: 'Update Product',
      description:
        'Update an existing product (automatically re-indexed in Elasticsearch)',
      tags: ['Products'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Product ID',
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                price: { type: 'number' },
                weight: { type: 'number' },
                categoryId: { type: 'string' },
                inventoryCount: { type: 'integer' },
                sku: { type: 'string' },
                tags: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Product updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Product',
              },
            },
          },
        },
        '404': {
          description: 'Product not found',
        },
      },
    },
    delete: {
      summary: 'Delete Product',
      description:
        'Soft delete a product (automatically removed from Elasticsearch)',
      tags: ['Products'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Product ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Product deleted successfully',
        },
        '404': {
          description: 'Product not found',
        },
      },
    },
  },
  '/api/v1/products/{id}/details': {
    get: {
      summary: 'Get Product Details from Elasticsearch',
      description: 'Get product details directly from Elasticsearch index',
      tags: ['Products'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Product ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Product details from Elasticsearch',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  product: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      description: { type: 'string' },
                      price: { type: 'number' },
                      categoryName: { type: 'string' },
                      inventoryCount: { type: 'integer' },
                      sku: { type: 'string' },
                      tags: { type: 'array', items: { type: 'string' } },
                      isActive: { type: 'boolean' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
        '404': {
          description: 'Product not found in Elasticsearch',
        },
      },
    },
  },
};
