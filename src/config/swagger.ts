import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'E-commerce Analytics Hub API',
    version: '1.0.0',
    description: 'Real-time e-commerce analytics and notification system API',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health Check',
        description: 'Check if the service is running',
        tags: ['System'],
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/status': {
      get: {
        summary: 'System Status',
        description: 'Get detailed system status and metrics',
        tags: ['System'],
        responses: {
          '200': {
            description: 'System status information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'connected' },
                    database: { type: 'string', example: 'connected' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
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
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          description: { type: 'string' },
                          price: { type: 'number' },
                          category: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                            },
                          },
                        },
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
        description: 'Create a new product',
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
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    price: { type: 'number' },
                    category: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                  },
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
    '/api/v1/products/{id}': {
      get: {
        summary: 'Get Product by ID',
        description: 'Get a specific product by its ID',
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
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number' },
                    category: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                      },
                    },
                  },
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
        description: 'Update an existing product',
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
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Product updated successfully',
          },
          '404': {
            description: 'Product not found',
          },
        },
      },
      delete: {
        summary: 'Delete Product',
        description: 'Soft delete a product',
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
    '/api/v1/categories': {
      get: {
        summary: 'List Categories',
        description: 'Get all categories with product counts',
        tags: ['Categories'],
        responses: {
          '200': {
            description: 'List of categories',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      description: { type: 'string' },
                      productCount: { type: 'integer' },
                      parent: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
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
      post: {
        summary: 'Create Category',
        description: 'Create a new category',
        tags: ['Categories'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Electronics' },
                  description: {
                    type: 'string',
                    example: 'Electronic devices and gadgets',
                  },
                  parentId: { type: 'string', example: 'cat-123' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Category created successfully',
          },
          '400': {
            description: 'Invalid input data',
          },
        },
      },
    },
    '/api/v1/categories/{id}': {
      get: {
        summary: 'Get Category by ID',
        description: 'Get a specific category by its ID',
        tags: ['Categories'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Category ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Category details',
          },
          '404': {
            description: 'Category not found',
          },
        },
      },
      put: {
        summary: 'Update Category',
        description: 'Update an existing category',
        tags: ['Categories'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Category ID',
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
                  parentId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Category updated successfully',
          },
          '404': {
            description: 'Category not found',
          },
        },
      },
      delete: {
        summary: 'Delete Category',
        description: 'Delete a category (only if no active products)',
        tags: ['Categories'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Category ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Category deleted successfully',
          },
          '400': {
            description: 'Cannot delete category with active products',
          },
          '404': {
            description: 'Category not found',
          },
        },
      },
    },
    '/api/v1/redis/health': {
      get: {
        summary: 'Redis Health Check',
        description: 'Check Redis connection status and ping',
        tags: ['Redis'],
        responses: {
          '200': {
            description: 'Redis is connected',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'connected' },
                    ping: { type: 'string', example: 'PONG' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '503': {
            description: 'Redis is disconnected',
          },
        },
      },
    },
    '/api/v1/redis/info': {
      get: {
        summary: 'Redis Server Info',
        description: 'Get detailed Redis server information',
        tags: ['Redis'],
        responses: {
          '200': {
            description: 'Redis server information',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    info: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '503': {
            description: 'Redis is disconnected',
          },
        },
      },
    },
    '/api/v1/redis/set': {
      post: {
        summary: 'Set Redis Key-Value',
        description: 'Set a key-value pair in Redis with optional TTL',
        tags: ['Redis'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['key', 'value'],
                properties: {
                  key: { type: 'string', example: 'user:123' },
                  value: { type: 'string', example: 'John Doe' },
                  ttl: {
                    type: 'integer',
                    description: 'Time to live in seconds',
                    example: 3600,
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Value set successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    key: { type: 'string' },
                    value: { type: 'string' },
                    ttl: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
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
    '/api/v1/redis/get/{key}': {
      get: {
        summary: 'Get Redis Value',
        description: 'Get a value by key from Redis',
        tags: ['Redis'],
        parameters: [
          {
            name: 'key',
            in: 'path',
            required: true,
            description: 'Redis key',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Value retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    key: { type: 'string' },
                    value: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Key parameter is required',
          },
          '404': {
            description: 'Key not found',
          },
        },
      },
    },
    '/api/v1/redis/del/{key}': {
      delete: {
        summary: 'Delete Redis Key',
        description: 'Delete a key from Redis',
        tags: ['Redis'],
        parameters: [
          {
            name: 'key',
            in: 'path',
            required: true,
            description: 'Redis key to delete',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Key deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    key: { type: 'string' },
                    deleted: { type: 'integer' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Key parameter is required',
          },
        },
      },
    },
    '/api/v1/redis/exists/{key}': {
      get: {
        summary: 'Check Key Exists',
        description: 'Check if a key exists in Redis',
        tags: ['Redis'],
        parameters: [
          {
            name: 'key',
            in: 'path',
            required: true,
            description: 'Redis key to check',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Key existence check result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    key: { type: 'string' },
                    exists: { type: 'boolean' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Key parameter is required',
          },
        },
      },
    },
    '/api/v1/redis/hset': {
      post: {
        summary: 'Set Hash Field',
        description: 'Set a field in a Redis hash',
        tags: ['Redis'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['key', 'field', 'value'],
                properties: {
                  key: { type: 'string', example: 'user:123' },
                  field: { type: 'string', example: 'name' },
                  value: { type: 'string', example: 'John Doe' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Hash field set successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    key: { type: 'string' },
                    field: { type: 'string' },
                    value: { type: 'string' },
                    result: { type: 'integer' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
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
    '/api/v1/redis/hget/{key}/{field}': {
      get: {
        summary: 'Get Hash Field',
        description: 'Get a field value from a Redis hash',
        tags: ['Redis'],
        parameters: [
          {
            name: 'key',
            in: 'path',
            required: true,
            description: 'Redis hash key',
            schema: { type: 'string' },
          },
          {
            name: 'field',
            in: 'path',
            required: true,
            description: 'Hash field name',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Hash field value retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    key: { type: 'string' },
                    field: { type: 'string' },
                    value: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Key and field parameters are required',
          },
          '404': {
            description: 'Hash field not found',
          },
        },
      },
    },
    '/api/v1/redis/hgetall/{key}': {
      get: {
        summary: 'Get All Hash Fields',
        description: 'Get all fields and values from a Redis hash',
        tags: ['Redis'],
        parameters: [
          {
            name: 'key',
            in: 'path',
            required: true,
            description: 'Redis hash key',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'All hash fields retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    key: { type: 'string' },
                    hash: { type: 'object' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Key parameter is required',
          },
        },
      },
    },
    '/api/v1/redis/lpush': {
      post: {
        summary: 'Push to List (Left)',
        description: 'Push a value to the left side of a Redis list',
        tags: ['Redis'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['key', 'value'],
                properties: {
                  key: { type: 'string', example: 'queue:orders' },
                  value: { type: 'string', example: 'order:123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Value pushed to list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    key: { type: 'string' },
                    value: { type: 'string' },
                    result: { type: 'integer' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
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
    '/api/v1/redis/rpush': {
      post: {
        summary: 'Push to List (Right)',
        description: 'Push a value to the right side of a Redis list',
        tags: ['Redis'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['key', 'value'],
                properties: {
                  key: { type: 'string', example: 'queue:orders' },
                  value: { type: 'string', example: 'order:123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Value pushed to list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    key: { type: 'string' },
                    value: { type: 'string' },
                    result: { type: 'integer' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
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
    '/api/v1/redis/sadd': {
      post: {
        summary: 'Add to Set',
        description: 'Add a member to a Redis set',
        tags: ['Redis'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['key', 'member'],
                properties: {
                  key: { type: 'string', example: 'tags:electronics' },
                  member: { type: 'string', example: 'smartphone' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Member added to set',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    key: { type: 'string' },
                    member: { type: 'string' },
                    result: { type: 'integer' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
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
    '/api/v1/redis/smembers/{key}': {
      get: {
        summary: 'Get Set Members',
        description: 'Get all members of a Redis set',
        tags: ['Redis'],
        parameters: [
          {
            name: 'key',
            in: 'path',
            required: true,
            description: 'Redis set key',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Set members retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    key: { type: 'string' },
                    members: { type: 'array', items: { type: 'string' } },
                    count: { type: 'integer' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Key parameter is required',
          },
        },
      },
    },
    '/api/v1/redis/flushdb': {
      post: {
        summary: 'Clear Redis Database',
        description:
          'Clear all keys from the current Redis database (dangerous operation)',
        tags: ['Redis'],
        responses: {
          '200': {
            description: 'Database cleared successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    result: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          weight: { type: 'number' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          category: {
            $ref: '#/components/schemas/Category',
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          parentId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          parent: {
            $ref: '#/components/schemas/Category',
          },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/docs.json', (req, res) => {
    res.json(swaggerSpec);
  });
};
