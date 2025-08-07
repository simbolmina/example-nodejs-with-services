import kafkaService, { EventSchema } from '../lib/kafka.js';

export interface PublishEventData {
  topic: string;
  eventType: string;
  data: any;
  metadata?: any;
}

export interface ProductEventData {
  product: any;
  changes?: any;
}

export interface SearchAnalyticsData {
  query: string;
  results?: any[];
  filters?: any;
}

export interface SystemHealthData {
  healthData?: any;
}

export interface PerformanceMetricData {
  metric: string;
  value: number;
  tags?: any;
}

/**
 * Get Kafka health status
 */
export const getHealth = async () => {
  try {
    const health = await kafkaService.healthCheck();
    return {
      status: 'healthy',
      connected: kafkaService.isConnected(),
      health,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: kafkaService.isConnected(),
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get connection status
 */
export const getConnectionStatus = async () => {
  const isConnected = kafkaService.isConnected();
  return {
    connected: isConnected,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Publish a custom event
 */
export const publishCustomEvent = async (data: PublishEventData) => {
  const { topic, eventType, data: eventData, metadata } = data;

  const event = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: eventType,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'api-gateway',
    data: eventData,
    metadata: metadata || {},
  };

  await kafkaService.publishEvent(topic, event as EventSchema);

  return {
    message: 'Event published successfully',
    eventId: event.id,
    topic,
    eventType,
    timestamp: event.timestamp,
  };
};

/**
 * Publish product created event
 */
export const publishProductCreatedEvent = async (data: ProductEventData) => {
  const { product } = data;

  await kafkaService.publishProductCreated(product);

  return {
    message: 'Product created event published successfully',
    productId: product.id,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Publish product updated event
 */
export const publishProductUpdatedEvent = async (data: ProductEventData) => {
  const { product, changes } = data;

  await kafkaService.publishProductUpdated(product, changes);

  return {
    message: 'Product updated event published successfully',
    productId: product.id,
    changes,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Publish product deleted event
 */
export const publishProductDeletedEvent = async (productId: string) => {
  await kafkaService.publishProductDeleted(productId);

  return {
    message: 'Product deleted event published successfully',
    productId,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Publish search analytics event
 */
export const publishSearchAnalyticsEvent = async (
  data: SearchAnalyticsData
) => {
  const { query, results, filters } = data;

  await kafkaService.publishSearchAnalytics(query, results || [], filters);

  return {
    message: 'Search analytics event published successfully',
    query,
    resultsCount: results?.length || 0,
    filters,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Publish system health event
 */
export const publishSystemHealthEvent = async (data: SystemHealthData) => {
  const { healthData } = data;

  await kafkaService.publishSystemHealth(healthData);

  return {
    message: 'System health event published successfully',
    healthData,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Publish performance metric event
 */
export const publishPerformanceMetricEvent = async (
  data: PerformanceMetricData
) => {
  const { metric, value, tags } = data;

  await kafkaService.publishPerformanceMetric(metric, value, tags);

  return {
    message: 'Performance metric event published successfully',
    metric,
    value,
    tags,
    timestamp: new Date().toISOString(),
  };
};
