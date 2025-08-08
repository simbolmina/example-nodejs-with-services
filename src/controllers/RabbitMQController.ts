import { Request, Response } from 'express';
import rabbitmqService from '../services/RabbitMQService.js';
import { NotificationMessage, AlertMessage } from '../lib/rabbitmq.js';

export const getRabbitMQHealth = async (_req: Request, res: Response) => {
  try {
    // Ensure connection is established
    await rabbitmqService.connectRabbitMQ();
    const health = await rabbitmqService.getRabbitMQHealthService();
    return res.json(health);
  } catch (error) {
    console.error('❌ RabbitMQ health check failed:', error);
    return res.status(500).json({
      error: 'RabbitMQ health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const publishNotification = async (req: Request, res: Response) => {
  try {
    const notification: NotificationMessage = req.body;

    // Validate required fields
    if (
      !notification.type ||
      !notification.recipient ||
      !notification.subject ||
      !notification.template
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['type', 'recipient', 'subject', 'template'],
      });
    }

    // Ensure connection is established
    await rabbitmqService.connectRabbitMQ();
    await rabbitmqService.publishNotificationService(notification);

    return res.json({
      success: true,
      message: 'Notification published successfully',
      notification: {
        type: notification.type,
        recipient: notification.recipient,
        template: notification.template,
      },
    });
  } catch (error) {
    console.error('❌ Error publishing notification:', error);
    return res.status(500).json({
      error: 'Failed to publish notification',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const publishAlert = async (req: Request, res: Response) => {
  try {
    const alert: AlertMessage = req.body;

    // Validate required fields
    if (!alert.type || !alert.message || !alert.source) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['type', 'message', 'source'],
      });
    }

    await rabbitmqService.publishAlertService(alert);

    return res.json({
      success: true,
      message: 'Alert published successfully',
      alert: {
        type: alert.type,
        severity: alert.severity,
        source: alert.source,
      },
    });
  } catch (error) {
    console.error('❌ Error publishing alert:', error);
    return res.status(500).json({
      error: 'Failed to publish alert',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const publishEmailNotification = async (req: Request, res: Response) => {
  try {
    const notification: NotificationMessage = req.body;

    // Validate required fields
    if (
      !notification.recipient ||
      !notification.subject ||
      !notification.template
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['recipient', 'subject', 'template'],
      });
    }

    // Set type to email
    notification.type = 'email';

    await rabbitmqService.publishEmailNotificationService(notification);

    return res.json({
      success: true,
      message: 'Email notification published successfully',
      notification: {
        recipient: notification.recipient,
        subject: notification.subject,
        template: notification.template,
      },
    });
  } catch (error) {
    console.error('❌ Error publishing email notification:', error);
    return res.status(500).json({
      error: 'Failed to publish email notification',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const testLowStockAlert = async (req: Request, res: Response) => {
  try {
    const { product, threshold = 10 } = req.body;

    if (
      !product ||
      !product.id ||
      !product.name ||
      product.inventoryCount === undefined
    ) {
      return res.status(400).json({
        error: 'Missing required product fields',
        required: ['product.id', 'product.name', 'product.inventoryCount'],
      });
    }

    // Ensure connection is established
    await rabbitmqService.connectRabbitMQ();
    await rabbitmqService.checkLowStockAlertService(product, threshold);

    return res.json({
      success: true,
      message: 'Low stock alert check completed',
      product: {
        id: product.id,
        name: product.name,
        inventoryCount: product.inventoryCount,
        threshold,
      },
    });
  } catch (error) {
    console.error('❌ Error testing low stock alert:', error);
    return res.status(500).json({
      error: 'Failed to test low stock alert',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const testHighDemandAlert = async (req: Request, res: Response) => {
  try {
    const { product, views24h, searches24h } = req.body;

    if (
      !product ||
      !product.id ||
      !product.name ||
      views24h === undefined ||
      searches24h === undefined
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['product.id', 'product.name', 'views24h', 'searches24h'],
      });
    }

    await rabbitmqService.checkHighDemandAlertService(
      product,
      views24h,
      searches24h
    );

    return res.json({
      success: true,
      message: 'High demand alert check completed',
      data: {
        product: {
          id: product.id,
          name: product.name,
          inventoryCount: product.inventoryCount,
        },
        views24h,
        searches24h,
      },
    });
  } catch (error) {
    console.error('❌ Error testing high demand alert:', error);
    return res.status(500).json({
      error: 'Failed to test high demand alert',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const testPriceChangeAlert = async (req: Request, res: Response) => {
  try {
    const { product, oldPrice, newPrice } = req.body;

    if (
      !product ||
      !product.id ||
      !product.name ||
      oldPrice === undefined ||
      newPrice === undefined
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['product.id', 'product.name', 'oldPrice', 'newPrice'],
      });
    }

    await rabbitmqService.checkPriceChangeAlertService(
      product,
      oldPrice,
      newPrice
    );

    return res.json({
      success: true,
      message: 'Price change alert check completed',
      data: {
        product: {
          id: product.id,
          name: product.name,
        },
        oldPrice,
        newPrice,
        changePercent: (
          (Math.abs(newPrice - oldPrice) / oldPrice) *
          100
        ).toFixed(2),
      },
    });
  } catch (error) {
    console.error('❌ Error testing price change alert:', error);
    return res.status(500).json({
      error: 'Failed to test price change alert',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
