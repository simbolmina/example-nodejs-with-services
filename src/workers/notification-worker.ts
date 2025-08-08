import dotenv from 'dotenv';
import amqp from 'amqplib';
import emailService from '../services/EmailService.js';

dotenv.config();

// Initialize email service
await emailService.initializeEmailService();

interface NotificationMessage {
  type: 'email' | 'sms' | 'webhook';
  recipient: string;
  subject: string;
  template: string;
  data: any;
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

const RABBITMQ_URL =
  process.env.RABBITMQ_URL || 'amqp://admin:password@rabbitmq:5672';
const NOTIFICATION_QUEUE = 'notifications';
const ALERT_QUEUE = 'alerts';
const EMAIL_QUEUE = 'email-notifications';

// Email templates
const emailTemplates: Record<string, EmailTemplate> = {
  'low-stock-alert': {
    subject: 'Low Stock Alert - {productName}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d32f2f;">⚠️ Low Stock Alert</h2>
        <p>Product <strong>{productName}</strong> is running low on stock.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Current Stock:</strong> {currentStock}</p>
          <p><strong>Threshold:</strong> {threshold}</p>
          <p><strong>Product ID:</strong> {productId}</p>
        </div>
        <p>Please restock this item soon to avoid stockouts.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated alert from your e-commerce system.</p>
      </div>
    `,
    text: `
Low Stock Alert - {productName}

Product {productName} is running low on stock.

Current Stock: {currentStock}
Threshold: {threshold}
Product ID: {productId}

Please restock this item soon to avoid stockouts.

This is an automated alert from your e-commerce system.
    `,
  },
  'high-demand-alert': {
    subject: 'High Demand Alert - {productName}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">📈 High Demand Alert</h2>
        <p>Product <strong>{productName}</strong> is experiencing high demand.</p>
        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Views in last 24h:</strong> {views24h}</p>
          <p><strong>Searches in last 24h:</strong> {searches24h}</p>
          <p><strong>Current Stock:</strong> {currentStock}</p>
        </div>
        <p>Consider increasing stock or running a promotion.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated alert from your e-commerce system.</p>
      </div>
    `,
    text: `
High Demand Alert - {productName}

Product {productName} is experiencing high demand.

Views in last 24h: {views24h}
Searches in last 24h: {searches24h}
Current Stock: {currentStock}

Consider increasing stock or running a promotion.

This is an automated alert from your e-commerce system.
    `,
  },
  'price-change-alert': {
    subject: 'Price Change Alert - {productName}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f57c00;">💰 Price Change Alert</h2>
        <p>Product <strong>{productName}</strong> price has been updated.</p>
        <div style="background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Old Price:</strong> {oldPrice}</p>
          <p><strong>New Price:</strong> {newPrice}</p>
          <p><strong>Change:</strong> {changePercent}%</p>
        </div>
        <p>Price change has been applied to the product catalog.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated alert from your e-commerce system.</p>
      </div>
    `,
    text: `
Price Change Alert - {productName}

Product {productName} price has been updated.

Old Price: {oldPrice}
New Price: {newPrice}
Change: {changePercent}%

Price change has been applied to the product catalog.

This is an automated alert from your e-commerce system.
    `,
  },
};

async function start() {
  let retryCount = 0;
  const maxRetries = 10;
  const retryDelay = 5000; // 5 seconds

  while (retryCount < maxRetries) {
    try {
      console.log(
        `🔄 Attempting to start Notification Worker (attempt ${retryCount + 1}/${maxRetries})`
      );

      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      // Ensure queues exist
      await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });
      await channel.assertQueue(ALERT_QUEUE, { durable: true });
      await channel.assertQueue(EMAIL_QUEUE, { durable: true });

      console.log('✅ Connected to RabbitMQ');
      console.log('✅ Notification queues created');

      // Process notifications
      await channel.consume(NOTIFICATION_QUEUE, async (msg) => {
        if (!msg) return;

        try {
          const notification: NotificationMessage = JSON.parse(
            msg.content.toString()
          );
          console.log('📨 Processing notification:', notification.type);

          await processNotification(notification);

          channel.ack(msg);
          console.log('✅ Notification processed successfully');
        } catch (error) {
          console.error('❌ Error processing notification:', error);
          // Reject and requeue for retry
          channel.nack(msg, false, true);
        }
      });

      // Process alerts
      await channel.consume(ALERT_QUEUE, async (msg) => {
        if (!msg) return;

        try {
          const alert = JSON.parse(msg.content.toString());
          console.log('🚨 Processing alert:', alert.type);

          await processAlert(alert);

          channel.ack(msg);
          console.log('✅ Alert processed successfully');
        } catch (error) {
          console.error('❌ Error processing alert:', error);
          channel.nack(msg, false, true);
        }
      });

      console.log(
        '🚀 Notification Worker running. Listening for notifications and alerts...'
      );

      // Graceful shutdown
      const shutdown = async () => {
        console.log('🔄 Notification Worker shutting down...');
        try {
          await channel.close();
          await connection.close();
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
        }
        process.exit(0);
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);

      return; // Success, exit the retry loop
    } catch (error) {
      retryCount++;
      console.error(
        `❌ Notification Worker startup failed (attempt ${retryCount}/${maxRetries}):`,
        error
      );

      if (retryCount >= maxRetries) {
        console.error(
          '❌ Max retries reached. Notification Worker startup failed.'
        );
        process.exit(1);
      }

      console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

async function processNotification(notification: NotificationMessage) {
  switch (notification.type) {
    case 'email':
      await sendEmail(notification);
      break;
    case 'sms':
      await sendSMS(notification);
      break;
    case 'webhook':
      await sendWebhook(notification);
      break;
    default:
      console.warn('⚠️ Unknown notification type:', notification.type);
  }
}

async function processAlert(alert: any) {
  // Store alert in analytics
  const alertData = {
    type: alert.type,
    severity: alert.severity || 'normal',
    message: alert.message,
    data: alert.data,
    timestamp: new Date().toISOString(),
  };

  console.log('📊 Storing alert analytics:', alertData);

  // In a real application, you would store this in a database
  // For now, we'll just log it
  console.log('🚨 Alert:', alertData);
}

async function sendEmail(notification: NotificationMessage) {
  try {
    console.log('📧 Sending email:');
    console.log('  To:', notification.recipient);
    console.log('  Template:', notification.template);
    console.log('  Data:', notification.data);

    let success = false;

    // Use the real email service based on template type
    switch (notification.template) {
      case 'low-stock-alert':
        success = await emailService.sendLowStockAlert(
          notification.recipient,
          notification.data.productName,
          notification.data.currentStock,
          notification.data.threshold,
          notification.data.productId
        );
        break;
      
      case 'high-demand-alert':
        success = await emailService.sendHighDemandAlert(
          notification.recipient,
          notification.data.productName,
          notification.data.views24h,
          notification.data.searches24h,
          notification.data.currentStock
        );
        break;
      
      case 'price-change-alert':
        success = await emailService.sendPriceChangeAlert(
          notification.recipient,
          notification.data.productName,
          notification.data.oldPrice,
          notification.data.newPrice
        );
        break;
      
      default:
        // For other templates, use custom email
        const template = emailTemplates[notification.template];
        if (!template) {
          console.error('❌ Email template not found:', notification.template);
          return;
        }

        // Replace template variables
        let subject = template.subject;
        let html = template.html;
        let text = template.text;

        Object.entries(notification.data).forEach(([key, value]) => {
          const placeholder = `{${key}}`;
          subject = subject.replace(placeholder, String(value));
          html = html.replace(placeholder, String(value));
          text = text.replace(placeholder, String(value));
        });

        success = await emailService.sendCustomEmail(
          notification.recipient,
          subject,
          html,
          text
        );
        break;
    }

    if (success) {
      console.log('✅ Email sent successfully');
    } else {
      console.error('❌ Failed to send email');
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

async function sendSMS(notification: NotificationMessage) {
  // In a real application, you would use a service like Twilio, AWS SNS, etc.
  console.log('📱 Sending SMS:');
  console.log('  To:', notification.recipient);
  console.log('  Message:', notification.data.message);

  // Simulate SMS sending
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log('✅ SMS sent successfully');
}

async function sendWebhook(notification: NotificationMessage) {
  // In a real application, you would make an HTTP request to the webhook URL
  console.log('🔗 Sending webhook:');
  console.log('  URL:', notification.data.url);
  console.log('  Payload:', notification.data.payload);

  // Simulate webhook sending
  await new Promise((resolve) => setTimeout(resolve, 800));
  console.log('✅ Webhook sent successfully');
}

start().catch(console.error);
