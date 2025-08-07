export const systemPaths = {
  '/': {
    get: {
      summary: 'API Gateway Root',
      description: 'Welcome endpoint with API information',
      tags: ['System'],
      responses: {
        '200': {
          description: 'Welcome message and API information',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Welcome to E-commerce Analytics Hub API Gateway',
                  },
                  version: { type: 'string', example: '1.0.0' },
                  documentation: { type: 'string', example: '/docs' },
                  health: { type: 'string', example: '/health' },
                },
              },
            },
          },
        },
      },
    },
  },
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
};
