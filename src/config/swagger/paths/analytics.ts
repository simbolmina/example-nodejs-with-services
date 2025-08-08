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
  '/api/v1/analytics/performance': {
    get: {
      tags: ['Analytics'],
      summary: 'Get performance metrics',
      description:
        'Returns detailed performance metrics including response times, error rates, and system usage',
      responses: {
        200: {
          description: 'Performance metrics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  averageResponseTime: { type: 'number' },
                  totalRequests: { type: 'number' },
                  errorRate: { type: 'number' },
                  throughput: { type: 'number' },
                  memoryUsage: { type: 'number' },
                  cpuUsage: { type: 'number' },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/v1/analytics/user-behavior': {
    get: {
      tags: ['Analytics'],
      summary: 'Get user behavior metrics',
      description:
        'Returns user behavior analytics including active users, session duration, and conversion rates',
      responses: {
        200: {
          description: 'User behavior metrics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  activeUsers: { type: 'number' },
                  sessionDuration: { type: 'number' },
                  bounceRate: { type: 'number' },
                  conversionRate: { type: 'number' },
                  topUserActions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        action: { type: 'string' },
                        count: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/v1/analytics/trends': {
    get: {
      tags: ['Analytics'],
      summary: 'Get trend data',
      description:
        'Returns trend analysis for search, product views, and errors over time',
      parameters: [
        {
          in: 'query',
          name: 'days',
          required: false,
          schema: { type: 'integer', default: 7, maximum: 30 },
          description: 'Number of days to analyze',
        },
      ],
      responses: {
        200: {
          description: 'Trend data retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  period: { type: 'string' },
                  searchTrends: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        date: { type: 'string' },
                        count: { type: 'number' },
                      },
                    },
                  },
                  productViewTrends: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        date: { type: 'string' },
                        count: { type: 'number' },
                      },
                    },
                  },
                  errorTrends: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        date: { type: 'string' },
                        count: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/v1/analytics/complex': {
    get: {
      tags: ['Analytics'],
      summary: 'Get complex analytics',
      description: 'Returns complex analytics with filtering capabilities',
      parameters: [
        {
          in: 'query',
          name: 'dateRange',
          required: false,
          schema: { type: 'string' },
          description: 'JSON string with start and end dates',
        },
        {
          in: 'query',
          name: 'eventType',
          required: false,
          schema: { type: 'string' },
          description: 'Filter by event type',
        },
        {
          in: 'query',
          name: 'productId',
          required: false,
          schema: { type: 'string' },
          description: 'Filter by product ID',
        },
      ],
      responses: {
        200: {
          description: 'Complex analytics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  totalEvents: { type: 'number' },
                  uniqueSessions: { type: 'number' },
                  eventBreakdown: {
                    type: 'object',
                    additionalProperties: { type: 'number' },
                  },
                  topProducts: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        productId: { type: 'string' },
                        count: { type: 'number' },
                      },
                    },
                  },
                  averageEventsPerSession: { type: 'number' },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
};
