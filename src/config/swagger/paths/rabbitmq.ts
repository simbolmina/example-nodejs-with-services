export const rabbitmqPaths = {
  '/api/v1/rabbitmq/health': {
    get: {
      tags: ['RabbitMQ'],
      summary: 'Get RabbitMQ health status',
      description: 'Check the health and connection status of RabbitMQ',
      responses: {
        200: {
          description: 'RabbitMQ health status',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'healthy'
                  },
                  connection: {
                    type: 'string',
                    example: 'connected'
                  },
                  queues: {
                    type: 'object',
                    properties: {
                      notifications: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          messageCount: { type: 'number' },
                          consumerCount: { type: 'number' }
                        }
                      },
                      alerts: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          messageCount: { type: 'number' },
                          consumerCount: { type: 'number' }
                        }
                      },
                      emailNotifications: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          messageCount: { type: 'number' },
                          consumerCount: { type: 'number' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'RabbitMQ health check failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  details: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/v1/rabbitmq/notifications': {
    post: {
      tags: ['RabbitMQ'],
      summary: 'Publish notification',
      description: 'Publish a notification to the RabbitMQ queue',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['type', 'recipient', 'subject', 'template'],
              properties: {
                type: {
                  type: 'string',
                  enum: ['email', 'sms', 'webhook'],
                  description: 'Type of notification'
                },
                recipient: {
                  type: 'string',
                  description: 'Recipient address (email, phone, webhook URL)'
                },
                subject: {
                  type: 'string',
                  description: 'Notification subject'
                },
                template: {
                  type: 'string',
                  description: 'Template name to use'
                },
                data: {
                  type: 'object',
                  description: 'Template data variables'
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'normal', 'high'],
                  default: 'normal',
                  description: 'Notification priority'
                },
                scheduledAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Scheduled delivery time (optional)'
                }
              }
            },
            example: {
              type: 'email',
              recipient: 'admin@example.com',
              subject: 'Low Stock Alert',
              template: 'low-stock-alert',
              data: {
                productName: 'Sample Product',
                currentStock: 5,
                threshold: 10,
                productId: '123'
              },
              priority: 'high'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Notification published successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  notification: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      recipient: { type: 'string' },
                      template: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Missing required fields',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  required: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Failed to publish notification',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  details: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/v1/rabbitmq/alerts': {
    post: {
      tags: ['RabbitMQ'],
      summary: 'Publish alert',
      description: 'Publish an alert to the RabbitMQ queue',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['type', 'message', 'source'],
              properties: {
                type: {
                  type: 'string',
                  description: 'Alert type'
                },
                severity: {
                  type: 'string',
                  enum: ['low', 'normal', 'high', 'critical'],
                  default: 'normal',
                  description: 'Alert severity'
                },
                message: {
                  type: 'string',
                  description: 'Alert message'
                },
                data: {
                  type: 'object',
                  description: 'Alert data'
                },
                source: {
                  type: 'string',
                  description: 'Source service'
                },
                timestamp: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Alert timestamp'
                }
              }
            },
            example: {
              type: 'low_stock',
              severity: 'high',
              message: 'Product Sample Product is running low on stock',
              data: {
                productId: '123',
                productName: 'Sample Product',
                currentStock: 5,
                threshold: 10
              },
              source: 'inventory-service',
              timestamp: '2024-01-01T00:00:00.000Z'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Alert published successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  alert: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      severity: { type: 'string' },
                      source: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Missing required fields',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  required: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Failed to publish alert',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  details: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/v1/rabbitmq/email': {
    post: {
      tags: ['RabbitMQ'],
      summary: 'Publish email notification',
      description: 'Publish an email notification to the RabbitMQ queue',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['recipient', 'subject', 'template'],
              properties: {
                recipient: {
                  type: 'string',
                  description: 'Email recipient'
                },
                subject: {
                  type: 'string',
                  description: 'Email subject'
                },
                template: {
                  type: 'string',
                  description: 'Email template name'
                },
                data: {
                  type: 'object',
                  description: 'Template data variables'
                },
                priority: {
                  type: 'string',
                  enum: ['low', 'normal', 'high'],
                  default: 'normal',
                  description: 'Email priority'
                }
              }
            },
            example: {
              recipient: 'admin@example.com',
              subject: 'Low Stock Alert',
              template: 'low-stock-alert',
              data: {
                productName: 'Sample Product',
                currentStock: 5,
                threshold: 10,
                productId: '123'
              },
              priority: 'high'
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Email notification published successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  notification: {
                    type: 'object',
                    properties: {
                      recipient: { type: 'string' },
                      subject: { type: 'string' },
                      template: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Missing required fields',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  required: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Failed to publish email notification',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  details: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/v1/rabbitmq/test/low-stock': {
    post: {
      tags: ['RabbitMQ'],
      summary: 'Test low stock alert',
      description: 'Test the low stock alert business rule',
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
                  required: ['id', 'name', 'inventoryCount'],
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    inventoryCount: { type: 'number' }
                  }
                },
                threshold: {
                  type: 'number',
                  default: 10,
                  description: 'Low stock threshold'
                }
              }
            },
            example: {
              product: {
                id: '123',
                name: 'Sample Product',
                inventoryCount: 5
              },
              threshold: 10
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Low stock alert test completed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  product: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      inventoryCount: { type: 'number' },
                      threshold: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Missing required product fields',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  required: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Failed to test low stock alert',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  details: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/v1/rabbitmq/test/high-demand': {
    post: {
      tags: ['RabbitMQ'],
      summary: 'Test high demand alert',
      description: 'Test the high demand alert business rule',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['product', 'views24h', 'searches24h'],
              properties: {
                product: {
                  type: 'object',
                  required: ['id', 'name'],
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    inventoryCount: { type: 'number' }
                  }
                },
                views24h: {
                  type: 'number',
                  description: 'Product views in last 24 hours'
                },
                searches24h: {
                  type: 'number',
                  description: 'Product searches in last 24 hours'
                }
              }
            },
            example: {
              product: {
                id: '123',
                name: 'Sample Product',
                inventoryCount: 50
              },
              views24h: 75,
              searches24h: 25
            }
          }
        }
      },
      responses: {
        200: {
          description: 'High demand alert test completed',
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
                      product: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          inventoryCount: { type: 'number' }
                        }
                      },
                      views24h: { type: 'number' },
                      searches24h: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Missing required fields',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  required: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Failed to test high demand alert',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  details: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  '/api/v1/rabbitmq/test/price-change': {
    post: {
      tags: ['RabbitMQ'],
      summary: 'Test price change alert',
      description: 'Test the price change alert business rule',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['product', 'oldPrice', 'newPrice'],
              properties: {
                product: {
                  type: 'object',
                  required: ['id', 'name'],
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' }
                  }
                },
                oldPrice: {
                  type: 'number',
                  description: 'Previous price'
                },
                newPrice: {
                  type: 'number',
                  description: 'New price'
                }
              }
            },
            example: {
              product: {
                id: '123',
                name: 'Sample Product'
              },
              oldPrice: 100.00,
              newPrice: 120.00
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Price change alert test completed',
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
                      product: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' }
                        }
                      },
                      oldPrice: { type: 'number' },
                      newPrice: { type: 'number' },
                      changePercent: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Missing required fields',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  required: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Failed to test price change alert',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  details: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }
};
