import * as amqp from 'amqplib';

export interface NotificationMessage {
  type: 'email' | 'sms' | 'webhook';
  recipient: string;
  subject: string;
  template: string;
  data: any;
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: string;
}

export interface AlertMessage {
  type: string;
  severity: 'low' | 'normal' | 'high' | 'critical';
  message: string;
  data: any;
  source: string;
  timestamp: string;
}

let connection: any = null;
let channel: any = null;
let connected: boolean = false;

const RABBITMQ_URL =
  process.env.RABBITMQ_URL || 'amqp://admin:password@rabbitmq:5672';
const NOTIFICATION_QUEUE = 'notifications';
const ALERT_QUEUE = 'alerts';
const EMAIL_QUEUE = 'email-notifications';

export const initialize = async () => {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Ensure queues exist
    await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });
    await channel.assertQueue(ALERT_QUEUE, { durable: true });
    await channel.assertQueue(EMAIL_QUEUE, { durable: true });

    connected = true;
    console.log('✅ Connected to RabbitMQ');
  } catch (error) {
    console.error('❌ Failed to connect to RabbitMQ:', error);
    throw error;
  }
};

export const connect = async (): Promise<void> => {
  if (!connected) {
    await initialize();
  }
};

export const disconnect = async (): Promise<void> => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    connected = false;
    console.log('✅ Disconnected from RabbitMQ');
  } catch (error) {
    console.error('❌ Error disconnecting from RabbitMQ:', error);
  }
};

export const isConnected = (): boolean => {
  return connected;
};

export const publishNotification = async (
  notification: NotificationMessage
): Promise<void> => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not available');
    }

    const message = JSON.stringify(notification);
    channel.sendToQueue(NOTIFICATION_QUEUE, Buffer.from(message), {
      persistent: true,
      priority: getPriority(notification.priority),
    });

    console.log('✅ Published notification to queue:', notification.type);
  } catch (error) {
    console.error('❌ Error publishing notification:', error);
    throw error;
  }
};

export const publishAlert = async (alert: AlertMessage): Promise<void> => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not available');
    }

    const message = JSON.stringify(alert);
    channel.sendToQueue(ALERT_QUEUE, Buffer.from(message), {
      persistent: true,
      priority: getPriority(alert.severity),
    });

    console.log('✅ Published alert to queue:', alert.type);
  } catch (error) {
    console.error('❌ Error publishing alert:', error);
    throw error;
  }
};

export const publishEmailNotification = async (
  notification: NotificationMessage
): Promise<void> => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel not available');
    }

    const message = JSON.stringify(notification);
    channel.sendToQueue(EMAIL_QUEUE, Buffer.from(message), {
      persistent: true,
      priority: getPriority(notification.priority),
    });

    console.log('✅ Published email notification to queue');
  } catch (error) {
    console.error('❌ Error publishing email notification:', error);
    throw error;
  }
};

// Business rule engine functions
export const checkLowStockAlert = async (
  product: any,
  threshold: number = 10
): Promise<void> => {
  if (product.inventoryCount <= threshold) {
    const alert: AlertMessage = {
      type: 'low_stock',
      severity: product.inventoryCount === 0 ? 'critical' : 'high',
      message: `Product ${product.name} is running low on stock`,
      data: {
        productId: product.id,
        productName: product.name,
        currentStock: product.inventoryCount,
        threshold,
      },
      source: 'inventory-service',
      timestamp: new Date().toISOString(),
    };

    await publishAlert(alert);

    // Also send email notification
    const notification: NotificationMessage = {
      type: 'email',
      recipient: 'admin@example.com',
      subject: 'Low Stock Alert',
      template: 'low-stock-alert',
      data: {
        productName: product.name,
        currentStock: product.inventoryCount,
        threshold,
        productId: product.id,
      },
      priority: 'high',
    };

    await publishNotification(notification);
  }
};

export const checkHighDemandAlert = async (
  product: any,
  views24h: number,
  searches24h: number
): Promise<void> => {
  const highDemandThreshold = 50; // Views in 24h
  const highSearchThreshold = 20; // Searches in 24h

  if (views24h >= highDemandThreshold || searches24h >= highSearchThreshold) {
    const alert: AlertMessage = {
      type: 'high_demand',
      severity: 'normal',
      message: `Product ${product.name} is experiencing high demand`,
      data: {
        productId: product.id,
        productName: product.name,
        views24h,
        searches24h,
        currentStock: product.inventoryCount,
      },
      source: 'analytics-service',
      timestamp: new Date().toISOString(),
    };

    await publishAlert(alert);

    // Send email notification
    const notification: NotificationMessage = {
      type: 'email',
      recipient: 'marketing@example.com',
      subject: 'High Demand Alert',
      template: 'high-demand-alert',
      data: {
        productName: product.name,
        views24h,
        searches24h,
        currentStock: product.inventoryCount,
      },
      priority: 'normal',
    };

    await publishNotification(notification);
  }
};

export const checkPriceChangeAlert = async (
  product: any,
  oldPrice: number,
  newPrice: number
): Promise<void> => {
  const priceChangeThreshold = 0.1; // 10% change
  const changePercent = Math.abs((newPrice - oldPrice) / oldPrice);

  if (changePercent >= priceChangeThreshold) {
    const alert: AlertMessage = {
      type: 'price_change',
      severity: changePercent >= 0.25 ? 'high' : 'normal',
      message: `Product ${product.name} price has changed significantly`,
      data: {
        productId: product.id,
        productName: product.name,
        oldPrice,
        newPrice,
        changePercent: (changePercent * 100).toFixed(2),
      },
      source: 'product-service',
      timestamp: new Date().toISOString(),
    };

    await publishAlert(alert);

    // Send email notification
    const notification: NotificationMessage = {
      type: 'email',
      recipient: 'admin@example.com',
      subject: 'Price Change Alert',
      template: 'price-change-alert',
      data: {
        productName: product.name,
        oldPrice: oldPrice.toFixed(2),
        newPrice: newPrice.toFixed(2),
        changePercent: (changePercent * 100).toFixed(2),
      },
      priority: 'normal',
    };

    await publishNotification(notification);
  }
};

// Helper function to convert priority to RabbitMQ priority
const getPriority = (priority?: string): number => {
  switch (priority) {
    case 'high':
    case 'critical':
      return 8;
    case 'normal':
      return 4;
    case 'low':
      return 1;
    default:
      return 4;
  }
};

export const healthCheck = async (): Promise<any> => {
  try {
    if (!connected) {
      return {
        status: 'disconnected',
        message: 'Not connected to RabbitMQ',
      };
    }

    if (!channel) {
      return {
        status: 'error',
        message: 'Channel not available',
      };
    }

    // Check queue status
    const notificationQueue = await channel.checkQueue(NOTIFICATION_QUEUE);
    const alertQueue = await channel.checkQueue(ALERT_QUEUE);
    const emailQueue = await channel.checkQueue(EMAIL_QUEUE);

    return {
      status: 'healthy',
      connection: 'connected',
      queues: {
        notifications: {
          name: NOTIFICATION_QUEUE,
          messageCount: notificationQueue.messageCount,
          consumerCount: notificationQueue.consumerCount,
        },
        alerts: {
          name: ALERT_QUEUE,
          messageCount: alertQueue.messageCount,
          consumerCount: alertQueue.consumerCount,
        },
        emailNotifications: {
          name: EMAIL_QUEUE,
          messageCount: emailQueue.messageCount,
          consumerCount: emailQueue.consumerCount,
        },
      },
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      error,
    };
  }
};

export default {
  connect,
  disconnect,
  isConnected,
  publishNotification,
  publishAlert,
  publishEmailNotification,
  checkLowStockAlert,
  checkHighDemandAlert,
  checkPriceChangeAlert,
  healthCheck,
};
