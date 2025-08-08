export const analyticsPaths = {
  '/api/v1/analytics/summary': {
    get: {
      tags: ['Analytics'],
      summary: 'Get analytics summary',
      description: 'Returns aggregated analytics counters from Redis',
      responses: {
        200: {
          description: 'Summary retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  searchTotal: { type: 'integer' },
                  topQueries: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        query: { type: 'string' },
                        count: { type: 'integer' },
                      },
                    },
                  },
                  productEventCounts: {
                    type: 'object',
                    additionalProperties: { type: 'integer' },
                  },
                  productViewsTop: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        productId: { type: 'string' },
                        views: { type: 'integer' },
                      },
                    },
                  },
                  systemEventCounts: {
                    type: 'object',
                    additionalProperties: { type: 'integer' },
                  },
                  performanceCounts: {
                    type: 'object',
                    additionalProperties: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/analytics/recent': {
    get: {
      tags: ['Analytics'],
      summary: 'Get recent events',
      description: 'Returns recent events captured by the Event Processor',
      parameters: [
        {
          in: 'query',
          name: 'limit',
          required: false,
          schema: { type: 'integer', default: 100, maximum: 1000 },
          description: 'Max number of events to return',
        },
      ],
      responses: {
        200: {
          description: 'Recent events retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  limit: { type: 'integer' },
                  events: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        topic: { type: 'string' },
                        id: { type: 'string' },
                        type: { type: 'string' },
                        timestamp: { type: 'string' },
                        data: { type: 'object' },
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
  '/api/v1/analytics/dashboard': {
    get: {
      tags: ['Analytics'],
      summary: 'Analytics dashboard (HTML)',
      description: 'Returns a simple HTML dashboard for quick visibility',
      responses: {
        200: {
          description: 'HTML dashboard',
          content: {
            'text/html': {
              schema: { type: 'string' },
            },
          },
        },
      },
    },
  },
};
