export const redisPaths = {
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
};
