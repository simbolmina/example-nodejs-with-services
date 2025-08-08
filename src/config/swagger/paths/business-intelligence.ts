export const businessIntelligencePaths = {
  '/api/v1/business-intelligence/alerts': {
    post: {
      tags: ['Business Intelligence'],
      summary: 'Create alert rule',
      description: 'Create a new automated alert rule',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['id', 'name', 'type', 'condition'],
              properties: {
                id: { type: 'string', description: 'Unique rule identifier' },
                name: { type: 'string', description: 'Rule name' },
                type: {
                  type: 'string',
                  enum: ['threshold', 'trend', 'anomaly'],
                  description: 'Alert type',
                },
                condition: { type: 'string', description: 'Metric to monitor' },
                threshold: { type: 'number', description: 'Threshold value' },
                enabled: { type: 'boolean', default: true },
                notificationType: {
                  type: 'string',
                  enum: ['email', 'webhook', 'slack'],
                  default: 'email',
                },
                recipients: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Email recipients',
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Alert rule created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        400: {
          description: 'Bad request - missing required fields',
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
    get: {
      tags: ['Business Intelligence'],
      summary: 'Get all alert rules',
      description: 'Retrieve all configured alert rules',
      responses: {
        200: {
          description: 'Alert rules retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    type: { type: 'string' },
                    condition: { type: 'string' },
                    threshold: { type: 'number' },
                    enabled: { type: 'boolean' },
                    notificationType: { type: 'string' },
                    recipients: {
                      type: 'array',
                      items: { type: 'string' },
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
  '/api/v1/business-intelligence/alerts/{id}': {
    put: {
      tags: ['Business Intelligence'],
      summary: 'Update alert rule',
      description: 'Update an existing alert rule',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'Alert rule ID',
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
                type: { type: 'string' },
                condition: { type: 'string' },
                threshold: { type: 'number' },
                enabled: { type: 'boolean' },
                notificationType: { type: 'string' },
                recipients: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Alert rule updated successfully',
        },
        404: {
          description: 'Alert rule not found',
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
    delete: {
      tags: ['Business Intelligence'],
      summary: 'Delete alert rule',
      description: 'Delete an alert rule',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'Alert rule ID',
        },
      ],
      responses: {
        200: {
          description: 'Alert rule deleted successfully',
        },
        404: {
          description: 'Alert rule not found',
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/v1/business-intelligence/trends/{metric}': {
    get: {
      tags: ['Business Intelligence'],
      summary: 'Analyze trends',
      description: 'Analyze trends for a specific metric',
      parameters: [
        {
          in: 'path',
          name: 'metric',
          required: true,
          schema: { type: 'string' },
          description: 'Metric to analyze',
        },
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
          description: 'Trend analysis completed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  metric: { type: 'string' },
                  trend: {
                    type: 'string',
                    enum: ['increasing', 'decreasing', 'stable'],
                  },
                  changePercent: { type: 'number' },
                  confidence: { type: 'number' },
                  recommendation: { type: 'string' },
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
  '/api/v1/business-intelligence/predictive/{metric}': {
    get: {
      tags: ['Business Intelligence'],
      summary: 'Get predictive insights',
      description: 'Generate predictive insights for a metric',
      parameters: [
        {
          in: 'path',
          name: 'metric',
          required: true,
          schema: { type: 'string' },
          description: 'Metric to predict',
        },
      ],
      responses: {
        200: {
          description: 'Predictive insights generated',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    metric: { type: 'string' },
                    prediction: { type: 'number' },
                    confidence: { type: 'number' },
                    timeframe: { type: 'string' },
                    factors: {
                      type: 'array',
                      items: { type: 'string' },
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
  '/api/v1/business-intelligence/reports': {
    post: {
      tags: ['Business Intelligence'],
      summary: 'Create custom report',
      description: 'Create a new custom report configuration',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['id', 'name', 'metrics'],
              properties: {
                id: { type: 'string', description: 'Report identifier' },
                name: { type: 'string', description: 'Report name' },
                description: {
                  type: 'string',
                  description: 'Report description',
                },
                metrics: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Metrics to include',
                },
                filters: {
                  type: 'object',
                  description: 'Report filters',
                },
                schedule: { type: 'string', description: 'Cron schedule' },
                recipients: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Report recipients',
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Custom report created successfully',
        },
        400: {
          description: 'Bad request - missing required fields',
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
    get: {
      tags: ['Business Intelligence'],
      summary: 'Get all custom reports',
      description: 'Retrieve all custom report configurations',
      responses: {
        200: {
          description: 'Custom reports retrieved successfully',
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
                    metrics: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                    filters: { type: 'object' },
                    schedule: { type: 'string' },
                    recipients: {
                      type: 'array',
                      items: { type: 'string' },
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
  '/api/v1/business-intelligence/reports/{reportId}/generate': {
    get: {
      tags: ['Business Intelligence'],
      summary: 'Generate custom report',
      description: 'Generate a custom report with current data',
      parameters: [
        {
          in: 'path',
          name: 'reportId',
          required: true,
          schema: { type: 'string' },
          description: 'Report ID to generate',
        },
      ],
      responses: {
        200: {
          description: 'Custom report generated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reportId: { type: 'string' },
                  reportName: { type: 'string' },
                  generatedAt: { type: 'string' },
                  data: { type: 'object' },
                  filters: { type: 'object' },
                },
              },
            },
          },
        },
        404: {
          description: 'Custom report not found',
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },
  '/api/v1/business-intelligence/process-alerts': {
    post: {
      tags: ['Business Intelligence'],
      summary: 'Process alerts',
      description: 'Manually trigger alert processing (admin only)',
      responses: {
        200: {
          description: 'Alerts processed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
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
