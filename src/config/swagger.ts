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
