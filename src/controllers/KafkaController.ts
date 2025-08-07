import { Request, Response } from 'express';
import {
  getHealth as getHealthService,
  getConnectionStatus as getConnectionStatusService,
  publishCustomEvent as publishCustomEventService,
  publishProductCreatedEvent as publishProductCreatedEventService,
  publishProductUpdatedEvent as publishProductUpdatedEventService,
  publishProductDeletedEvent as publishProductDeletedEventService,
  publishSearchAnalyticsEvent as publishSearchAnalyticsEventService,
  publishSystemHealthEvent as publishSystemHealthEventService,
  publishPerformanceMetricEvent as publishPerformanceMetricEventService,
  PublishEventData,
  ProductEventData,
  SearchAnalyticsData,
  SystemHealthData,
  PerformanceMetricData,
} from '../services/KafkaService.js';

/**
 * Get Kafka health status
 */
export const getHealth = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const health = await getHealthService();
    return res.json(health);
  } catch (error) {
    console.error('❌ Error checking Kafka health:', error);
    return res.status(500).json({ error: 'Failed to check Kafka health' });
  }
};

/**
 * Get connection status
 */
export const getConnectionStatus = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const status = await getConnectionStatusService();
    return res.json(status);
  } catch (error) {
    console.error('❌ Error checking Kafka connection:', error);
    return res.status(500).json({ error: 'Failed to check Kafka connection' });
  }
};

/**
 * Publish a custom event
 */
export const publishCustomEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
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

    const result = await publishCustomEventService(publishData);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error publishing custom event:', error);
    return res.status(500).json({ error: 'Failed to publish custom event' });
  }
};

/**
 * Publish product created event
 */
export const publishProductCreatedEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { product } = req.body;

    if (!product) {
      return res.status(400).json({
        error: 'Product data is required',
      });
    }

    const eventData: ProductEventData = { product };
    const result = await publishProductCreatedEventService(eventData);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error publishing product created event:', error);
    return res
      .status(500)
      .json({ error: 'Failed to publish product created event' });
  }
};

/**
 * Publish product updated event
 */
export const publishProductUpdatedEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { product, changes } = req.body;

    if (!product) {
      return res.status(400).json({
        error: 'Product data is required',
      });
    }

    const eventData: ProductEventData = { product, changes };
    const result = await publishProductUpdatedEventService(eventData);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error publishing product updated event:', error);
    return res
      .status(500)
      .json({ error: 'Failed to publish product updated event' });
  }
};

/**
 * Publish product deleted event
 */
export const publishProductDeletedEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        error: 'Product ID is required',
      });
    }

    const result = await publishProductDeletedEventService(productId);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error publishing product deleted event:', error);
    return res
      .status(500)
      .json({ error: 'Failed to publish product deleted event' });
  }
};

/**
 * Publish search analytics event
 */
export const publishSearchAnalyticsEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { query, filters, results } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Search query is required',
      });
    }

    const eventData: SearchAnalyticsData = {
      query,
      filters,
      results,
    };

    const result = await publishSearchAnalyticsEventService(eventData);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error publishing search analytics event:', error);
    return res
      .status(500)
      .json({ error: 'Failed to publish search analytics event' });
  }
};

/**
 * Publish system health event
 */
export const publishSystemHealthEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { healthData } = req.body;

    const eventData: SystemHealthData = { healthData };
    const result = await publishSystemHealthEventService(eventData);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error publishing system health event:', error);
    return res
      .status(500)
      .json({ error: 'Failed to publish system health event' });
  }
};

/**
 * Publish performance metric event
 */
export const publishPerformanceMetricEvent = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { metric, value, tags } = req.body;

    if (!metric || value === undefined) {
      return res.status(400).json({
        error: 'Metric name and value are required',
      });
    }

    const eventData: PerformanceMetricData = {
      metric,
      value,
      tags,
    };

    const result = await publishPerformanceMetricEventService(eventData);
    return res.json(result);
  } catch (error) {
    console.error('❌ Error publishing performance metric event:', error);
    return res
      .status(500)
      .json({ error: 'Failed to publish performance metric event' });
  }
};
