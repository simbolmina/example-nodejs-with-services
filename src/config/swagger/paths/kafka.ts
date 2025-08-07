export const kafkaPaths = {
  '/api/v1/kafka/health': {
    get: {
      tags: ['Kafka'],
      summary: 'Get Kafka health status',
      description: 'Check the health and status of the Kafka cluster',
      responses: {
        200: {
          description: 'Kafka health check completed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      status: {
                        type: 'string',
                        enum: ['connected', 'disconnected'],
                      },
                      topics: { type: 'array', items: { type: 'string' } },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to check Kafka health',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/kafka/status': {
    get: {
      tags: ['Kafka'],
      summary: 'Get Kafka connection status',
      description: 'Check if Kafka is connected',
      responses: {
        200: {
          description: 'Kafka connection status retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      connected: { type: 'boolean' },
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
  },
  '/api/v1/kafka/publish': {
    post: {
      tags: ['Kafka'],
      summary: 'Publish a custom event',
      description: 'Publish a custom event to a Kafka topic',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['topic', 'eventType', 'data'],
              properties: {
                topic: { type: 'string', description: 'Kafka topic name' },
                eventType: { type: 'string', description: 'Type of event' },
                data: { type: 'object', description: 'Event data' },
                metadata: { type: 'object', description: 'Optional metadata' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Event published successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      eventId: { type: 'string' },
                      topic: { type: 'string' },
                      eventType: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Missing required fields',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to publish event',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/kafka/events/product-created': {
    post: {
      tags: ['Kafka Events'],
      summary: 'Publish product created event',
      description: 'Publish a product created event to Kafka',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['product'],
              properties: {
                product: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    price: { type: 'string' },
                    categoryId: { type: 'string' },
                    inventoryCount: { type: 'integer' },
                    sku: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Product created event published successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      productId: { type: 'string' },
                      productName: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Product data is required',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to publish product created event',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/kafka/events/product-updated': {
    post: {
      tags: ['Kafka Events'],
      summary: 'Publish product updated event',
      description: 'Publish a product updated event to Kafka',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['product'],
              properties: {
                product: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    price: { type: 'string' },
                    categoryId: { type: 'string' },
                    inventoryCount: { type: 'integer' },
                    sku: { type: 'string' },
                  },
                },
                changes: {
                  type: 'object',
                  description:
                    'Object containing the changes made to the product',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Product updated event published successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      productId: { type: 'string' },
                      productName: { type: 'string' },
                      changes: { type: 'object' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Product data is required',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to publish product updated event',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/kafka/events/product-deleted': {
    post: {
      tags: ['Kafka Events'],
      summary: 'Publish product deleted event',
      description: 'Publish a product deleted event to Kafka',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['productId'],
              properties: {
                productId: {
                  type: 'string',
                  description: 'ID of the deleted product',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Product deleted event published successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      productId: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Product ID is required',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to publish product deleted event',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/kafka/events/search-analytics': {
    post: {
      tags: ['Kafka Events'],
      summary: 'Publish search analytics event',
      description: 'Publish search analytics data to Kafka',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['query'],
              properties: {
                query: { type: 'string', description: 'Search query' },
                results: {
                  type: 'array',
                  items: { type: 'object' },
                  description: 'Search results',
                },
                filters: {
                  type: 'object',
                  description: 'Search filters applied',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Search analytics event published successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      query: { type: 'string' },
                      resultCount: { type: 'integer' },
                      filters: { type: 'object' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Search query is required',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to publish search analytics event',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/kafka/events/system-health': {
    post: {
      tags: ['Kafka Events'],
      summary: 'Publish system health event',
      description: 'Publish system health data to Kafka',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                healthData: {
                  type: 'object',
                  description: 'System health data',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'System health event published successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to publish system health event',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/v1/kafka/events/performance-metric': {
    post: {
      tags: ['Kafka Events'],
      summary: 'Publish performance metric event',
      description: 'Publish performance metric data to Kafka',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['metric', 'value'],
              properties: {
                metric: { type: 'string', description: 'Metric name' },
                value: { type: 'number', description: 'Metric value' },
                tags: {
                  type: 'object',
                  description: 'Optional tags for the metric',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Performance metric event published successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      metric: { type: 'string' },
                      value: { type: 'number' },
                      tags: { type: 'object' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Metric name and value are required',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to publish performance metric event',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
};
