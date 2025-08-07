import express, { Request, Response } from 'express';
import kafkaService from '../lib/kafka.js';

const router = express.Router();

// Get Kafka health status
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const health = await kafkaService.healthCheck();
    res.json({
      success: true,
      message: 'Kafka health check completed',
      data: health,
    });
  } catch (error) {
    console.error('❌ Error checking Kafka health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check Kafka health',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get Kafka connection status
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Kafka connection status',
    data: {
      connected: kafkaService.isConnected(),
      timestamp: new Date().toISOString(),
    },
  });
});

// Publish a custom event
router.post('/publish', async (req: Request, res: Response) => {
  try {
    const { topic, eventType, data, metadata } = req.body;

    if (!topic || !eventType || !data) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: topic, eventType, data',
      });
    }

    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      source: 'api-gateway',
      data: data,
      metadata: metadata || {},
    };

    await kafkaService.publishEvent(topic, event);

    res.json({
      success: true,
      message: 'Event published successfully',
      data: {
        eventId: event.id,
        topic: topic,
        eventType: eventType,
        timestamp: event.timestamp,
      },
    });
  } catch (error) {
    console.error('❌ Error publishing event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Publish product created event
router.post('/events/product-created', async (req: Request, res: Response) => {
  try {
    const { product } = req.body;

    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product data is required',
      });
    }

    await kafkaService.publishProductCreated(product);

    res.json({
      success: true,
      message: 'Product created event published successfully',
      data: {
        productId: product.id,
        productName: product.name,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error publishing product created event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish product created event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Publish product updated event
router.post('/events/product-updated', async (req: Request, res: Response) => {
  try {
    const { product, changes } = req.body;

    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product data is required',
      });
    }

    await kafkaService.publishProductUpdated(product, changes || {});

    res.json({
      success: true,
      message: 'Product updated event published successfully',
      data: {
        productId: product.id,
        productName: product.name,
        changes: changes,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error publishing product updated event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish product updated event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Publish product deleted event
router.post('/events/product-deleted', async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    await kafkaService.publishProductDeleted(productId);

    res.json({
      success: true,
      message: 'Product deleted event published successfully',
      data: {
        productId: productId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error publishing product deleted event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish product deleted event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Publish search analytics event
router.post('/events/search-analytics', async (req: Request, res: Response) => {
  try {
    const { query, results, filters } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    await kafkaService.publishSearchAnalytics(
      query,
      results || [],
      filters || {}
    );

    res.json({
      success: true,
      message: 'Search analytics event published successfully',
      data: {
        query: query,
        resultCount: results?.length || 0,
        filters: filters,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error publishing search analytics event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish search analytics event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Publish system health event
router.post('/events/system-health', async (req: Request, res: Response) => {
  try {
    const { healthData } = req.body;

    await kafkaService.publishSystemHealth(healthData || {});

    res.json({
      success: true,
      message: 'System health event published successfully',
      data: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Error publishing system health event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish system health event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Publish performance metric event
router.post(
  '/events/performance-metric',
  async (req: Request, res: Response) => {
    try {
      const { metric, value, tags } = req.body;

      if (!metric || value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Metric name and value are required',
        });
      }

      await kafkaService.publishPerformanceMetric(metric, value, tags || {});

      res.json({
        success: true,
        message: 'Performance metric event published successfully',
        data: {
          metric: metric,
          value: value,
          tags: tags,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('❌ Error publishing performance metric event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to publish performance metric event',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;
