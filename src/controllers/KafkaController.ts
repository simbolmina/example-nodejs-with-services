import { Request, Response } from 'express';
import KafkaAdminService, {
  PublishEventData,
  ProductEventData,
  SearchAnalyticsData,
  SystemHealthData,
  PerformanceMetricData,
} from '../services/KafkaService.js';

class KafkaController {
  /**
   * Get Kafka health status
   */
  async getHealth(req: Request, res: Response) {
    try {
      const health = await KafkaAdminService.getHealth();
      res.json(health);
    } catch (error) {
      console.error('❌ Error checking Kafka health:', error);
      res.status(500).json({ error: 'Failed to check Kafka health' });
    }
  }

  /**
   * Get connection status
   */
  async getConnectionStatus(req: Request, res: Response) {
    try {
      const status = await KafkaAdminService.getConnectionStatus();
      res.json(status);
    } catch (error) {
      console.error('❌ Error checking Kafka connection:', error);
      res.status(500).json({ error: 'Failed to check Kafka connection' });
    }
  }

  /**
   * Publish a custom event
   */
  async publishCustomEvent(req: Request, res: Response) {
    try {
      const { topic, eventType, data, metadata } = req.body;

      if (!topic || !eventType || !data) {
        return res.status(400).json({
          error: 'Missing required fields: topic, eventType, data',
        });
      }

      const publishData: PublishEventData = {
        topic,
        eventType,
        data,
        metadata,
      };

      const result = await KafkaAdminService.publishCustomEvent(publishData);
      res.json(result);
    } catch (error) {
      console.error('❌ Error publishing custom event:', error);
      res.status(500).json({ error: 'Failed to publish custom event' });
    }
  }

  /**
   * Publish product created event
   */
  async publishProductCreatedEvent(req: Request, res: Response) {
    try {
      const { product } = req.body;

      if (!product) {
        return res.status(400).json({
          error: 'Product data is required',
        });
      }

      const eventData: ProductEventData = { product };
      const result =
        await KafkaAdminService.publishProductCreatedEvent(eventData);
      res.json(result);
    } catch (error) {
      console.error('❌ Error publishing product created event:', error);
      res
        .status(500)
        .json({ error: 'Failed to publish product created event' });
    }
  }

  /**
   * Publish product updated event
   */
  async publishProductUpdatedEvent(req: Request, res: Response) {
    try {
      const { product, changes } = req.body;

      if (!product) {
        return res.status(400).json({
          error: 'Product data is required',
        });
      }

      const eventData: ProductEventData = { product, changes };
      const result =
        await KafkaAdminService.publishProductUpdatedEvent(eventData);
      res.json(result);
    } catch (error) {
      console.error('❌ Error publishing product updated event:', error);
      res
        .status(500)
        .json({ error: 'Failed to publish product updated event' });
    }
  }

  /**
   * Publish product deleted event
   */
  async publishProductDeletedEvent(req: Request, res: Response) {
    try {
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({
          error: 'Product ID is required',
        });
      }

      const result =
        await KafkaAdminService.publishProductDeletedEvent(productId);
      res.json(result);
    } catch (error) {
      console.error('❌ Error publishing product deleted event:', error);
      res
        .status(500)
        .json({ error: 'Failed to publish product deleted event' });
    }
  }

  /**
   * Publish search analytics event
   */
  async publishSearchAnalyticsEvent(req: Request, res: Response) {
    try {
      const { query, results, filters } = req.body;

      if (!query) {
        return res.status(400).json({
          error: 'Search query is required',
        });
      }

      const analyticsData: SearchAnalyticsData = {
        query,
        results,
        filters,
      };

      const result =
        await KafkaAdminService.publishSearchAnalyticsEvent(analyticsData);
      res.json(result);
    } catch (error) {
      console.error('❌ Error publishing search analytics event:', error);
      res
        .status(500)
        .json({ error: 'Failed to publish search analytics event' });
    }
  }

  /**
   * Publish system health event
   */
  async publishSystemHealthEvent(req: Request, res: Response) {
    try {
      const { healthData } = req.body;

      const healthDataObj: SystemHealthData = { healthData };
      const result =
        await KafkaAdminService.publishSystemHealthEvent(healthDataObj);
      res.json(result);
    } catch (error) {
      console.error('❌ Error publishing system health event:', error);
      res.status(500).json({ error: 'Failed to publish system health event' });
    }
  }

  /**
   * Publish performance metric event
   */
  async publishPerformanceMetricEvent(req: Request, res: Response) {
    try {
      const { metric, value, tags } = req.body;

      if (!metric || value === undefined) {
        return res.status(400).json({
          error: 'Metric name and value are required',
        });
      }

      const metricData: PerformanceMetricData = {
        metric,
        value,
        tags,
      };

      const result =
        await KafkaAdminService.publishPerformanceMetricEvent(metricData);
      res.json(result);
    } catch (error) {
      console.error('❌ Error publishing performance metric event:', error);
      res
        .status(500)
        .json({ error: 'Failed to publish performance metric event' });
    }
  }
}

export default new KafkaController();
