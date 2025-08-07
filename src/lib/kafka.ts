import { Kafka, Producer, Consumer, KafkaMessage, Partitioners } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

// Event types for business logic
export enum EventType {
  // Product Events
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  PRODUCT_LOW_STOCK = 'product.low_stock',
  PRODUCT_OUT_OF_STOCK = 'product.out_of_stock',

  // Search Events
  SEARCH_PERFORMED = 'search.performed',
  SEARCH_ANALYTICS = 'search.analytics',

  // User Events
  PRODUCT_VIEWED = 'product.viewed',
  CART_ITEM_ADDED = 'cart.item_added',
  CART_ITEM_REMOVED = 'cart.item_removed',

  // System Events
  SYSTEM_HEALTH = 'system.health',
  PERFORMANCE_METRIC = 'performance.metric',
}

// Event schema interface
export interface EventSchema {
  id: string;
  type: EventType;
  version: string;
  timestamp: string;
  source: string;
  correlationId?: string;
  data: any;
  metadata?: {
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
  };
}

let kafka: Kafka;
let producer: Producer;
let consumer: Consumer;
let connected: boolean = false;

export const initialize = () => {
  kafka = new Kafka({
    clientId: 'ecommerce-api-gateway',
    brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
    retry: {
      initialRetryTime: 100,
      retries: 8,
    },
  });

  // Use legacy partitioner to avoid warning and maintain consistent behavior
  producer = kafka.producer({
    createPartitioner: Partitioners.LegacyPartitioner,
  });
  consumer = kafka.consumer({ groupId: 'api-gateway-consumer' });
};

export const connect = async (): Promise<void> => {
  try {
    if (!producer || !consumer) {
      initialize();
    }
    await producer.connect();
    await consumer.connect();
    connected = true;
    console.log('✅ Connected to Kafka');
  } catch (error) {
    console.error('❌ Failed to connect to Kafka:', error);
    throw error;
  }
};

export const disconnect = async (): Promise<void> => {
  try {
    await producer.disconnect();
    await consumer.disconnect();
    connected = false;
    console.log('✅ Disconnected from Kafka');
  } catch (error) {
    console.error('❌ Error disconnecting from Kafka:', error);
  }
};

export const isConnected = (): boolean => {
  return connected;
};

// Business Logic Methods

/**
 * Publish product created event
 */
export const publishProductCreated = async (product: any): Promise<void> => {
  const event: EventSchema = {
    id: generateEventId(),
    type: EventType.PRODUCT_CREATED,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'api-gateway',
    data: {
      productId: product.id,
      productName: product.name,
      category: product.category?.name,
      price: product.price,
      inventoryCount: product.inventoryCount,
      sku: product.sku,
    },
  };

  await publishEvent('product-events', event);
};

/**
 * Publish product updated event
 */
export const publishProductUpdated = async (
  product: any,
  changes: any
): Promise<void> => {
  const event: EventSchema = {
    id: generateEventId(),
    type: EventType.PRODUCT_UPDATED,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'api-gateway',
    data: {
      productId: product.id,
      productName: product.name,
      category: product.category?.name,
      price: product.price,
      inventoryCount: product.inventoryCount,
      sku: product.sku,
      changes,
    },
  };

  await publishEvent('product-events', event);
};

/**
 * Publish product deleted event
 */
export const publishProductDeleted = async (
  productId: string
): Promise<void> => {
  const event: EventSchema = {
    id: generateEventId(),
    type: EventType.PRODUCT_DELETED,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'api-gateway',
    data: {
      productId,
    },
  };

  await publishEvent('product-events', event);
};

/**
 * Publish low stock alert
 */
export const publishLowStockAlert = async (
  product: any,
  threshold: number = 10
): Promise<void> => {
  if (product.inventoryCount > threshold) {
    return; // Don't publish if inventory is above threshold
  }

  const event: EventSchema = {
    id: generateEventId(),
    type: EventType.PRODUCT_LOW_STOCK,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'api-gateway',
    data: {
      productId: product.id,
      productName: product.name,
      currentInventory: product.inventoryCount,
      threshold,
      alertLevel: product.inventoryCount === 0 ? 'out_of_stock' : 'low_stock',
    },
  };

  await publishEvent('inventory-alerts', event);
};

/**
 * Publish search analytics
 */
export const publishSearchAnalytics = async (
  query: string,
  results: any[],
  filters: any = {}
): Promise<void> => {
  const event: EventSchema = {
    id: generateEventId(),
    type: EventType.SEARCH_ANALYTICS,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'api-gateway',
    data: {
      query,
      resultCount: results.length,
      filters,
      searchMetrics: {
        responseTime: Date.now(), // This would be calculated in real implementation
        relevanceScore: 0.85, // This would be calculated in real implementation
      },
    },
  };

  await publishEvent('search-analytics', event);
};

/**
 * Publish product viewed event
 */
export const publishProductViewed = async (
  productId: string,
  metadata?: any
): Promise<void> => {
  const event: EventSchema = {
    id: generateEventId(),
    type: EventType.PRODUCT_VIEWED,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'api-gateway',
    data: {
      productId,
      viewTimestamp: new Date().toISOString(),
    },
    metadata,
  };

  await publishEvent('user-activity', event);
};

/**
 * Publish system health event
 */
export const publishSystemHealth = async (healthData: any): Promise<void> => {
  const event: EventSchema = {
    id: generateEventId(),
    type: EventType.SYSTEM_HEALTH,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'api-gateway',
    data: {
      ...healthData,
      timestamp: new Date().toISOString(),
    },
  };

  await publishEvent('system-events', event);
};

/**
 * Publish performance metric event
 */
export const publishPerformanceMetric = async (
  metric: string,
  value: number,
  tags: any = {}
): Promise<void> => {
  const event: EventSchema = {
    id: generateEventId(),
    type: EventType.PERFORMANCE_METRIC,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    source: 'api-gateway',
    data: {
      metric,
      value,
      tags,
      timestamp: new Date().toISOString(),
    },
  };

  await publishEvent('performance-metrics', event);
};

/**
 * Publish generic event
 */
export const publishEvent = async (
  topic: string,
  event: EventSchema
): Promise<void> => {
  if (!producer) {
    throw new Error('Kafka producer not initialized');
  }

  try {
    await producer.send({
      topic,
      messages: [
        {
          key: event.id,
          value: JSON.stringify(event),
          headers: {
            eventType: event.type,
            version: event.version,
            timestamp: event.timestamp,
          },
        },
      ],
    });

    console.log(`✅ Published event ${event.type} to topic ${topic}`);
  } catch (error) {
    console.error(
      `❌ Failed to publish event ${event.type} to topic ${topic}:`,
      error
    );
    throw error;
  }
};

/**
 * Subscribe to topic
 */
export const subscribeToTopic = async (
  topic: string,
  handler: (message: KafkaMessage) => void
): Promise<void> => {
  if (!consumer) {
    throw new Error('Kafka consumer not initialized');
  }

  try {
    await consumer.subscribe({ topic, fromBeginning: false });
    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          console.log(`📨 Received message from topic ${topic}`);
          handler(message);
        } catch (error) {
          console.error(
            `❌ Error processing message from topic ${topic}:`,
            error
          );
        }
      },
    });

    console.log(`✅ Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error(`❌ Failed to subscribe to topic ${topic}:`, error);
    throw error;
  }
};

/**
 * Generate unique event ID
 */
const generateEventId = (): string => {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Health check
 */
export const healthCheck = async (): Promise<any> => {
  try {
    const admin = kafka.admin();
    await admin.connect();

    const metadata = await admin.fetchTopicMetadata();
    await admin.disconnect();

    return {
      status: 'healthy',
      topics: metadata.topics.length,
      connected: connected,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      connected: connected,
      timestamp: new Date().toISOString(),
    };
  }
};

// Default export for backward compatibility
const kafkaService = {
  initialize,
  connect,
  disconnect,
  isConnected,
  publishProductCreated,
  publishProductUpdated,
  publishProductDeleted,
  publishLowStockAlert,
  publishSearchAnalytics,
  publishProductViewed,
  publishSystemHealth,
  publishPerformanceMetric,
  publishEvent,
  subscribeToTopic,
  healthCheck,
};

export default kafkaService;
