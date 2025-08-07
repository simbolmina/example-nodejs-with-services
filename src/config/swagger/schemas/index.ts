export const schemas = {
  Product: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      description: { type: 'string' },
      price: { type: 'number' },
      weight: { type: 'number' },
      inventoryCount: { type: 'integer' },
      sku: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
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
};
