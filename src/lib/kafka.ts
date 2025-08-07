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

class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private connected: boolean = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'ecommerce-api-gateway',
      brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    // Use legacy partitioner to avoid warning and maintain consistent behavior
    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
    this.consumer = this.kafka.consumer({ groupId: 'api-gateway-consumer' });
  }

  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      await this.consumer.connect();
      this.connected = true;
      console.log('✅ Connected to Kafka');
    } catch (error) {
      console.error('❌ Failed to connect to Kafka:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.connected = false;
      console.log('✅ Disconnected from Kafka');
    } catch (error) {
      console.error('❌ Error disconnecting from Kafka:', error);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Business Logic Methods

  /**
   * Publish product created event
   */
  async publishProductCreated(product: any): Promise<void> {
    const event: EventSchema = {
      id: this.generateEventId(),
      type: EventType.PRODUCT_CREATED,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      source: 'api-gateway',
      data: {
        productId: product.id,
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        inventoryCount: product.inventoryCount,
        sku: product.sku,
      },
    };

    await this.publishEvent('product-events', event);
  }

  /**
   * Publish product updated event
   */
  async publishProductUpdated(product: any, changes: any): Promise<void> {
    const event: EventSchema = {
      id: this.generateEventId(),
      type: EventType.PRODUCT_UPDATED,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      source: 'api-gateway',
      data: {
        productId: product.id,
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        inventoryCount: product.inventoryCount,
        sku: product.sku,
        changes: changes, // What fields were updated
      },
    };

    await this.publishEvent('product-events', event);
  }

  /**
   * Publish product deleted event
   */
  async publishProductDeleted(productId: string): Promise<void> {
    const event: EventSchema = {
      id: this.generateEventId(),
      type: EventType.PRODUCT_DELETED,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      source: 'api-gateway',
      data: {
        productId: productId,
      },
    };

    await this.publishEvent('product-events', event);
  }

  /**
   * Publish low stock alert
   */
  async publishLowStockAlert(
    product: any,
    threshold: number = 10
  ): Promise<void> {
    if (product.inventoryCount <= threshold) {
      const event: EventSchema = {
        id: this.generateEventId(),
        type: EventType.PRODUCT_LOW_STOCK,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        source: 'api-gateway',
        data: {
          productId: product.id,
          name: product.name,
          currentStock: product.inventoryCount,
          threshold: threshold,
          sku: product.sku,
        },
      };

      await this.publishEvent('inventory-alerts', event);
    }
  }

  /**
   * Publish search analytics
   */
  async publishSearchAnalytics(
    query: string,
    results: any[],
    filters: any = {}
  ): Promise<void> {
    const event: EventSchema = {
      id: this.generateEventId(),
      type: EventType.SEARCH_ANALYTICS,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      source: 'api-gateway',
      data: {
        query: query,
        resultCount: results.length,
        filters: filters,
        topResults: results.slice(0, 5).map((r) => ({
          id: r.id,
          name: r.name,
          score: r.score,
        })),
      },
    };

    await this.publishEvent('search-analytics', event);
  }

  /**
   * Publish product view event
   */
  async publishProductViewed(productId: string, metadata?: any): Promise<void> {
    const event: EventSchema = {
      id: this.generateEventId(),
      type: EventType.PRODUCT_VIEWED,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      source: 'api-gateway',
      data: {
        productId: productId,
      },
      metadata: metadata,
    };

    await this.publishEvent('user-behavior', event);
  }

  /**
   * Publish system health event
   */
  async publishSystemHealth(healthData: any): Promise<void> {
    const event: EventSchema = {
      id: this.generateEventId(),
      type: EventType.SYSTEM_HEALTH,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      source: 'api-gateway',
      data: healthData,
    };

    await this.publishEvent('system-metrics', event);
  }

  /**
   * Publish performance metric
   */
  async publishPerformanceMetric(
    metric: string,
    value: number,
    tags: any = {}
  ): Promise<void> {
    const event: EventSchema = {
      id: this.generateEventId(),
      type: EventType.PERFORMANCE_METRIC,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      source: 'api-gateway',
      data: {
        metric: metric,
        value: value,
        tags: tags,
      },
    };

    await this.publishEvent('performance-metrics', event);
  }

  // Generic event publishing with improved error handling
  async publishEvent(topic: string, event: EventSchema): Promise<void> {
    try {
      await this.producer.send({
        topic: topic,
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

      console.log(`📤 Published ${event.type} event to ${topic}`);
      console.log(`📋 Event Details:`, {
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
        data: event.data,
        metadata: event.metadata,
      });
    } catch (error) {
      // Handle leadership election errors gracefully
      if (
        error instanceof Error &&
        error.message.includes('leadership election')
      ) {
        console.warn(
          `⚠️ Kafka leadership election in progress for topic ${topic}, retrying...`
        );
        // Could implement retry logic here if needed
        return;
      }

      console.error(`❌ Failed to publish ${event.type} event:`, error);
      // Don't throw error to prevent API failures - just log it
      // throw error;
    }
  }

  // Event consumption
  async subscribeToTopic(
    topic: string,
    handler: (message: KafkaMessage) => void
  ): Promise<void> {
    try {
      await this.consumer.subscribe({ topic: topic, fromBeginning: false });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            console.log(
              `📥 Received message from ${topic}:`,
              message.value?.toString()
            );
            handler(message);
          } catch (error) {
            console.error('❌ Error processing message:', error);
          }
        },
      });

      console.log(`✅ Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`❌ Failed to subscribe to ${topic}:`, error);
      throw error;
    }
  }

  // Utility methods
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Health check with improved error handling
  async healthCheck(): Promise<any> {
    try {
      const metadata = await this.kafka.admin().fetchTopicMetadata();
      return {
        status: 'connected',
        topics: Object.keys(metadata.topics),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export default new KafkaService();
