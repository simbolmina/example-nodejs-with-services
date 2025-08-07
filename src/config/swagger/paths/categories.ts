export const categoryPaths = {
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
};
