import kafkaService from '../lib/kafka.js';

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

class KafkaAdminService {
  /**
   * Get Kafka health status
   */
  async getHealth() {
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
  }

  /**
   * Get connection status
   */
  async getConnectionStatus() {
    const isConnected = kafkaService.isConnected();
    return {
      connected: isConnected,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Publish a custom event
   */
  async publishCustomEvent(data: PublishEventData) {
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

    await kafkaService.publishEvent(topic, event);

    return {
      message: 'Event published successfully',
      eventId: event.id,
      topic,
      eventType,
      timestamp: event.timestamp,
    };
  }

  /**
   * Publish product created event
   */
  async publishProductCreatedEvent(data: ProductEventData) {
    const { product } = data;

    await kafkaService.publishProductCreated(product);

    return {
      message: 'Product created event published successfully',
      productId: product.id,
      productName: product.name,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Publish product updated event
   */
  async publishProductUpdatedEvent(data: ProductEventData) {
    const { product, changes } = data;

    await kafkaService.publishProductUpdated(product, changes || {});

    return {
      message: 'Product updated event published successfully',
      productId: product.id,
      productName: product.name,
      changes,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Publish product deleted event
   */
  async publishProductDeletedEvent(productId: string) {
    await kafkaService.publishProductDeleted(productId);

    return {
      message: 'Product deleted event published successfully',
      productId,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Publish search analytics event
   */
  async publishSearchAnalyticsEvent(data: SearchAnalyticsData) {
    const { query, results = [], filters = {} } = data;

    await kafkaService.publishSearchAnalytics(query, results, filters);

    return {
      message: 'Search analytics event published successfully',
      query,
      resultCount: results.length,
      filters,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Publish system health event
   */
  async publishSystemHealthEvent(data: SystemHealthData) {
    const { healthData = {} } = data;

    await kafkaService.publishSystemHealth(healthData);

    return {
      message: 'System health event published successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Publish performance metric event
   */
  async publishPerformanceMetricEvent(data: PerformanceMetricData) {
    const { metric, value, tags = {} } = data;

    await kafkaService.publishPerformanceMetric(metric, value, tags);

    return {
      message: 'Performance metric event published successfully',
      metric,
      value,
      tags,
      timestamp: new Date().toISOString(),
    };
  }
}

export default new KafkaAdminService();
